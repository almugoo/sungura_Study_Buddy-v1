import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, List, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';

const UNIVERSITIES = [
    { id: '1', name: 'University of Nairobi', country: 'Kenya' },
    { id: '2', name: 'Makerere University', country: 'Uganda' },
    { id: '3', name: 'University of Dar es Salaam', country: 'Tanzania' },
    { id: '4', name: 'Strathmore University', country: 'Kenya' },
    { id: '5', name: 'Kenyatta University', country: 'Kenya' },
    { id: '6', name: 'Kyambogo University', country: 'Uganda' },
    { id: '7', name: 'Mzumbe University', country: 'Tanzania' },
    { id: '8', name: 'United States International University Africa', country: 'Kenya' },
];

import { supabase } from '../supabaseClient';

const UniversitySelectionScreen = ({ navigation }) => {
    const theme = useTheme();
    const { updateUser } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUniv, setSelectedUniv] = useState(null);
    const [loading, setLoading] = useState(false);

    const filteredUniversities = UNIVERSITIES.filter(univ =>
        univ.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleContinue = async () => {
        if (selectedUniv) {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ university: selectedUniv.name })
                        .eq('id', user.id);

                    if (error) throw error;
                }

                updateUser({ university: selectedUniv.name });
                navigation.navigate('CourseSelection');
            } catch (err) {
                console.error('Error updating university:', err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>Select Your University</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        We'll customize Sungura to your curriculum.
                    </Text>
                </View>

                <Searchbar
                    placeholder="Search university"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />

                <FlatList
                    data={filteredUniversities}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.name}
                            description={item.country}
                            onPress={() => setSelectedUniv(item)}
                            left={props => <List.Icon {...props} icon="school" />}
                            right={props =>
                                selectedUniv?.id === item.id ? (
                                    <List.Icon {...props} icon="check-circle" color={theme.colors.primary} />
                                ) : null
                            }
                            style={[
                                styles.listItem,
                                selectedUniv?.id === item.id && { backgroundColor: theme.colors.primary + '10' }
                            ]}
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No universities found.</Text>
                    }
                />

                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleContinue}
                        loading={loading}
                        disabled={!selectedUniv || loading}
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
    listItem: {
        borderRadius: 8,
        marginVertical: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        opacity: 0.5,
    },
    footer: {
        paddingTop: 16,
    },
    button: {
        borderRadius: 30,
    },
    buttonContent: {
        height: 50,
    },
});

export default UniversitySelectionScreen;
