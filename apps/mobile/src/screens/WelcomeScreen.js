import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';

const WelcomeScreen = ({ navigation }) => {
    const theme = useTheme();
    const { userData, loading } = useUser();

    React.useEffect(() => {
        if (!loading && userData.onboarded) {
            navigation.replace('Dashboard');
        }
    }, [loading, userData.onboarded]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.content}>
                <View style={styles.brandingContainer}>
                    <View style={styles.logoWrapper}>
                        {/* The geometric rabbit mascot */}
                        <Text style={{ fontSize: 100 }}>🐰</Text>
                    </View>
                    <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
                        Sungura
                    </Text>
                    <Text variant="titleMedium" style={styles.subtitle}>
                        Study Smarter, Not Harder
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('SignUp')}
                        style={styles.primaryButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Get Started
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => console.log('Login Pressed')}
                        style={styles.secondaryButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
                    >
                        Log In
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
    },
    brandingContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    logoWrapper: {
        width: 160,
        height: 160,
        backgroundColor: '#F5F5F5',
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        opacity: 0.6,
        marginTop: 4,
    },
    footer: {
        gap: 16,
    },
    primaryButton: {
        borderRadius: 18,
        elevation: 0,
    },
    secondaryButton: {
        borderRadius: 18,
        borderWidth: 2,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
