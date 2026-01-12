import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import UniversitySelectionScreen from '../screens/UniversitySelectionScreen';
import CourseSelectionScreen from '../screens/CourseSelectionScreen';
import LearningStyleQuizScreen from '../screens/LearningStyleQuizScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChatScreen from '../screens/ChatScreen';
import { useUser } from '../context/UserContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { userData, loading } = useUser();

    // Show a loading screen while checking user state
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={userData.onboarded ? 'Dashboard' : 'Welcome'}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="UniversitySelection" component={UniversitySelectionScreen} />
                <Stack.Screen name="CourseSelection" component={CourseSelectionScreen} />
                <Stack.Screen name="LearningStyleQuiz" component={LearningStyleQuizScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

