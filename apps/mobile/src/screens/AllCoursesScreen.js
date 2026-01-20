import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Avatar, IconButton, useTheme, FAB, Portal, Modal, TextInput, Button, Menu, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';

const AllCoursesScreen = ({ navigation }) => {
    const theme = useTheme();
    const { userData, updateUser } = useUser();
    const [modalVisible, setModalVisible] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [menuVisible, setMenuVisible] = useState(null); // Stores the course name for the visible menu

    const userCourses = userData.courses || [];

    const handleAddCourse = async () => {
        if (!newCourseName.trim()) {
            Alert.alert('Error', 'Please enter a course name.');
            return;
        }
        if (userCourses.includes(newCourseName.trim())) {
            Alert.alert('Error', 'This course already exists.');
            return;
        }

        const updatedCourses = [...userCourses, newCourseName.trim()];
        await updateUser({ courses: updatedCourses });
        setNewCourseName('');
        setModalVisible(false);
    };

    const handleDeleteCourse = async (courseName) => {
        Alert.alert(
            'Delete Course',
            `Are you sure you want to delete "${courseName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedCourses = userCourses.filter(c => c !== courseName);
                        await updateUser({ courses: updatedCourses });
                        setMenuVisible(null);
                    }
                }
            ]
        );
    };

    const handleUploadMaterial = async (courseName) => {
        setMenuVisible(null);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${userData.id}/${courseName}/${Date.now()}.${fileExt}`;

            // Read the file as a blob
            const response = await fetch(file.uri);
            const blob = await response.blob();

            const { error } = await supabase.storage
                .from('course-materials')
                .upload(filePath, blob, {
                    contentType: file.mimeType,
                    upsert: false,
                });

            if (error) throw error;

            Alert.alert('Success', `"${file.name}" uploaded to ${courseName}!`);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', error.message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
                <Text variant="headlineSmall" style={styles.title}>My Courses</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {userCourses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text variant="titleMedium">No courses yet!</Text>
                        <Text variant="bodyMedium" style={{ opacity: 0.6, marginTop: 8 }}>Tap the + button to add your first course.</Text>
                    </View>
                ) : (
                    userCourses.map((course, index) => (
                        <Card key={index} style={styles.courseCard} onPress={() => navigation.navigate('Chat', { courseName: course })}>
                            <Card.Title
                                title={course}
                                left={(props) => <Avatar.Icon {...props} icon="book-open-variant" style={{ backgroundColor: theme.colors.primary + '20' }} color={theme.colors.primary} />}
                                right={(props) => (
                                    <Menu
                                        visible={menuVisible === course}
                                        onDismiss={() => setMenuVisible(null)}
                                        anchor={<IconButton {...props} icon="dots-vertical" onPress={() => setMenuVisible(course)} />}
                                    >
                                        <Menu.Item onPress={() => handleUploadMaterial(course)} title="Upload Material" leadingIcon="upload" />
                                        <Divider />
                                        <Menu.Item onPress={() => handleDeleteCourse(course)} title="Delete" leadingIcon="delete" titleStyle={{ color: 'red' }} />
                                    </Menu>
                                )}
                            />
                        </Card>
                    ))
                )}
            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => setModalVisible(true)}
                color="white"
            />

            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
                    <Text variant="titleLarge" style={{ marginBottom: 16 }}>Add New Course</Text>
                    <TextInput
                        label="Course Name (e.g., CS101)"
                        value={newCourseName}
                        onChangeText={setNewCourseName}
                        mode="outlined"
                        style={{ marginBottom: 16 }}
                    />
                    <Button mode="contained" onPress={handleAddCourse} style={{ borderRadius: 20 }}>
                        Add Course
                    </Button>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    title: {
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    courseCard: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modal: {
        backgroundColor: 'white',
        padding: 24,
        margin: 20,
        borderRadius: 16,
    },
});

export default AllCoursesScreen;
