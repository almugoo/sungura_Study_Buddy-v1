import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Searchbar, Chip, Button, useTheme, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';

const COMMON_COURSES = [
    { id: '1', code: 'MATH 101', name: 'Calculus I' },
    { id: '2', code: 'PHYS 101', name: 'Introductory Physics' },
    { id: '3', code: 'CS 102', name: 'Data Structures & Algorithms' },
    { id: '4', code: 'ECON 201', name: 'Microeconomics' },
    { id: '5', code: 'ENG 105', name: 'Circuit Analysis' },
    { id: '6', code: 'BIO 101', name: 'General Biology' },
];

const CourseSelectionScreen = ({ navigation }) => {
    const theme = useTheme();
    const { updateUser } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourses, setSelectedCourses] = useState([]);

    const toggleCourse = (course) => {
        if (selectedCourses.find(c => c.id === course.id)) {
            setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
        } else {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    const handleContinue = () => {
        if (selectedCourses.length >= 3) {
            updateUser({ courses: selectedCourses.map(c => c.code) });
            navigation.navigate('LearningStyleQuiz');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>Add Your Courses</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Select at least 3 courses you are currently taking.
                    </Text>
                </View>

                <Searchbar
                    placeholder="Search course code or name"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />

                {selectedCourses.length > 0 && (
                    <View style={styles.selectedContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedCourses.map(course => (
                                <Chip
                                    key={course.id}
                                    onClose={() => toggleCourse(course)}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    {course.code}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <FlatList
                    data={COMMON_COURSES.filter(c =>
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.code.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const isSelected = selectedCourses.find(c => c.id === item.id);
                        return (
                            <Card
                                style={[styles.card, isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }]}
                                onPress={() => toggleCourse(item)}
                            >
                                <Card.Title
                                    title={item.name}
                                    subtitle={item.code}
                                    left={(props) => <Avatar.Icon {...props} icon="book-open-variant" />}
                                    right={(props) =>
                                        isSelected ? (
                                            <Button icon="check-circle" textColor={theme.colors.primary}>Added</Button>
                                        ) : (
                                            <Button icon="plus">Add</Button>
                                        )
                                    }
                                />
                            </Card>
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                />

                <View style={styles.footer}>
                    <Text style={styles.countText}>
                        {selectedCourses.length} of 3 minimum selected
                    </Text>
                    <Button
                        mode="contained"
                        onPress={handleContinue}
                        disabled={selectedCourses.length < 3}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Continue
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
        padding: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        opacity: 0.7,
    },
    searchbar: {
        marginBottom: 16,
        elevation: 0,
        backgroundColor: '#f5f5f5',
    },
    selectedContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        height: 40,
    },
    chip: {
        marginRight: 8,
        backgroundColor: '#FF8C0020',
    },
    chipText: {
        color: '#FF8C00',
    },
    card: {
        marginBottom: 12,
        elevation: 2,
        backgroundColor: 'white',
    },
    listContent: {
        paddingBottom: 100,
    },
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 16,
        borderRadius: 16,
        elevation: 4,
    },
    countText: {
        textAlign: 'center',
        marginBottom: 8,
        opacity: 0.6,
    },
    button: {
        borderRadius: 30,
    },
    buttonContent: {
        height: 50,
    },
});

export default CourseSelectionScreen;
