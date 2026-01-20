import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, IconButton, useTheme, Surface, List, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '../context/UserContext';

const DashboardScreen = ({ navigation }) => {
    const theme = useTheme();
    const { userData } = useUser();

    // Get courses from user context, default to empty array
    const userCourses = userData.courses || [];
    const currentCourse = userCourses[0] || 'General Study';

    // Empty state for no courses
    if (userCourses.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.emptyStateContainer}>
                    <Text variant="headlineSmall" style={styles.emptyStateTitle}>No Courses Yet!</Text>
                    <Text variant="bodyMedium" style={styles.emptyStateSubtitle}>
                        Let's add some courses to get started.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('CourseSelection')}
                        style={{ marginTop: 24, borderRadius: 20 }}
                    >
                        Add Courses
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text variant="headlineSmall" style={styles.welcomeText}>Habari, {userData.name || 'Mwanafunzi'}! 🎓</Text>
                        <Text variant="bodyMedium" style={styles.statusText}>Keep the momentum going.</Text>
                    </View>
                    <Avatar.Image size={48} source={{ uri: 'https://i.pravatar.cc/150?u=amina' }} />
                </View>

                {/* Focus Area: Resume Studying - Uses first course */}
                <Card style={styles.focusCard}>
                    <Card.Content>
                        <View style={styles.focusHeader}>
                            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>CURRENT SUBJECT</Text>
                            <View style={styles.focusBadge}>
                                <Text variant="labelSmall" style={{ color: 'white' }}>ACTIVE</Text>
                            </View>
                        </View>
                        <Text variant="headlineMedium" style={styles.focusTitle}>{currentCourse}</Text>
                        <Text variant="bodyMedium" style={styles.focusSubtitle}>Tap to continue studying</Text>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('Chat', { courseName: currentCourse, mastery: 'Yellow' })}
                            style={styles.practiceButton}
                            icon="play"
                        >
                            Practice Now
                        </Button>
                    </Card.Content>
                </Card>

                {/* Gamification Stats */}
                <View style={styles.statsRow}>
                    <Surface style={styles.statCard} elevation={1}>
                        <Text variant="displaySmall" style={[styles.statValue, { color: '#FF8C00' }]}>🔥 {userData.streak || 0}</Text>
                        <Text variant="labelLarge">DAY STREAK</Text>
                    </Surface>
                    <Surface style={styles.statCard} elevation={1}>
                        <Text variant="displaySmall" style={[styles.statValue, { color: theme.colors.primary }]}>✨ {userData.points || 0}</Text>
                        <Text variant="labelLarge">TOTAL POINTS</Text>
                    </Surface>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleLarge" style={styles.sectionTitle}>My Courses</Text>
                        <Button mode="text" labelStyle={{ fontSize: 14 }} onPress={() => navigation.navigate('AllCourses')}>See All</Button>
                    </View>
                    <View style={styles.courseGrid}>
                        {userCourses.map((code, index) => (
                            <Card key={index} style={styles.courseCard} onPress={() => navigation.navigate('Chat', { courseName: code, mastery: 'Green' })}>
                                <Card.Content style={styles.cardContent}>
                                    <Avatar.Icon size={40} icon="book-open-variant" style={{ backgroundColor: theme.colors.primary + '15' }} color={theme.colors.primary} />
                                    <Text variant="titleMedium" style={styles.courseCode}>{code}</Text>
                                    <View style={styles.progressRow}>
                                        <View style={styles.progressBg}>
                                            <View style={[styles.progressFill, { width: '70%', backgroundColor: theme.colors.primary }]} />
                                        </View>
                                        <Text variant="bodySmall">70%</Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
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
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        fontWeight: 'bold',
    },
    statusText: {
        opacity: 0.6,
    },
    focusCard: {
        backgroundColor: '#F3E5F5', // Soft purple
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
    },
    focusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    focusBadge: {
        backgroundColor: '#6B4EFF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    focusTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    focusSubtitle: {
        opacity: 0.7,
        marginBottom: 20,
    },
    practiceButton: {
        borderRadius: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    statValue: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
    },
    courseGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    courseCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    cardContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    courseCode: {
        marginTop: 12,
        fontWeight: 'bold',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
        width: '100%',
    },
    progressBg: {
        flex: 1,
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyStateTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        opacity: 0.7,
        textAlign: 'center',
    },
});

export default DashboardScreen;
