import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({
        university: null,
        courses: [],
        learningStyle: 'Standard',
        onboarded: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const savedData = await AsyncStorage.getItem('user_data');
            if (savedData) {
                setUserData(JSON.parse(savedData));
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (newData) => {
        try {
            const updated = { ...userData, ...newData };
            setUserData(updated);
            await AsyncStorage.setItem('user_data', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    };

    const clearUser = async () => {
        try {
            await AsyncStorage.removeItem('user_data');
            setUserData({
                university: null,
                courses: [],
                learningStyle: 'Standard',
                onboarded: false,
            });
        } catch (error) {
            console.error('Failed to clear user data:', error);
        }
    };

    return (
        <UserContext.Provider value={{ userData, updateUser, clearUser, loading }}>
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
