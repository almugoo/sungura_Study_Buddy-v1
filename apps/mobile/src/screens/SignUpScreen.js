import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../supabaseClient';

const SignUpScreen = ({ navigation }) => {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Sign up user with Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data?.user) {
                // 2. Create initial profile entry
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            full_name: name,
                        }
                    ]);

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // We don't throw here to allow navigation even if profile insert fails 
                    // (User is still authenticated)
                }

                Alert.alert("Success", "Account created successfully! Please check your email for verification.");

                // Navigate to next step (University Selection)
                navigation.navigate('UniversitySelection');
            }
        } catch (err) {
            console.error('Sign up error:', err.message);
            setError(err.message || "An error occurred during sign up.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>Join your study buddy today</Text>
                </View>

                <View style={styles.form}>
                    {/* Show Error Message if exists */}
                    {error ? (
                        <HelperText type="error" visible={true} style={{ marginBottom: 10, fontSize: 14 }}>
                            {error}
                        </HelperText>
                    ) : null}

                    <TextInput
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="account" />}
                    />

                    <TextInput
                        label="Email Address"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setError('');
                        }}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setError('');
                        }}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSignUp}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Sign Up
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Text variant="bodyMedium">Already have an account? </Text>
                    <TouchableOpacity onPress={() => console.log('Navigate to Login')}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            Log In
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        opacity: 0.7,
    },
    form: {
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    button: {
        borderRadius: 30,
        marginTop: 8,
    },
    buttonContent: {
        height: 50,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
});

export default SignUpScreen;
