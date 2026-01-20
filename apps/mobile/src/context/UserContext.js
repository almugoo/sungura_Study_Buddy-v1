import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({
        id: null,
        name: '',
        university: null,
        courses: [],
        learningStyle: 'Standard',
        onboarded: false,
        streak: 0,
        points: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Load & Auth Listener
        const fetchInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await syncProfile(session.user.id);
            } else {
                setLoading(false);
            }
        };

        fetchInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await syncProfile(session.user.id);
            } else {
                setUserData({ id: null, name: '', university: null, courses: [], learningStyle: 'Standard', onboarded: false });
                setLoading(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const syncProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setUserData({
                    id: userId,
                    name: data.full_name || '',
                    university: data.university,
                    courses: data.courses || [],
                    learningStyle: data.learning_style || 'Standard',
                    onboarded: !!(data.university && data.courses?.length >= 1 && data.learning_style),
                    streak: data.streak || 0,
                    points: data.points || 0,
                });

                // 2. Streak Logic
                const today = new Date().toISOString().split('T')[0];
                const lastDate = data.last_streak_date;
                let newStreak = data.streak || 0;

                if (!lastDate) {
                    // First time
                    newStreak = 1;
                    await supabase.from('profiles').update({ streak: 1, last_streak_date: today }).eq('id', userId);
                } else if (lastDate !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastDate === yesterdayStr) {
                        newStreak += 1;
                    } else {
                        newStreak = 1;
                    }
                    await supabase.from('profiles').update({ streak: newStreak, last_streak_date: today }).eq('id', userId);
                }

                if (newStreak !== data.streak) {
                    setUserData(prev => ({ ...prev, streak: newStreak }));
                }
            }
        } catch (error) {
            console.error('Error syncing profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (newData) => {
        try {
            // Optimistic update
            const updated = { ...userData, ...newData };
            setUserData(updated);

            if (userData.id) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: newData.name !== undefined ? newData.name : userData.name,
                        university: newData.university !== undefined ? newData.university : userData.university,
                        courses: newData.courses !== undefined ? newData.courses : userData.courses,
                        learning_style: newData.learningStyle !== undefined ? newData.learningStyle : userData.learningStyle,
                        streak: newData.streak !== undefined ? newData.streak : userData.streak,
                        points: newData.points !== undefined ? newData.points : userData.points,
                    })
                    .eq('id', userData.id);

                if (error) throw error;
            }
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    };

    const clearUser = async () => {
        try {
            await supabase.auth.signOut();
            setUserData({ id: null, name: '', university: null, courses: [], learningStyle: 'Standard', onboarded: false });
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <UserContext.Provider value={{ userData, updateUser, clearUser, loading, syncProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
