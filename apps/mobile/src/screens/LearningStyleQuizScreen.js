import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, ProgressBar, Button, Card, useTheme, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';

const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "When you're learning a new recipe, what do you prefer to do?",
        options: [
            { text: "Watch a video of someone cooking it", style: "Visual" },
            { text: "Listen to a podcast/someone explain it", style: "Auditory" },
            { text: "Read the written steps in a book", style: "Reading/Writing" },
            { text: "Just start cooking and adjust as you go", style: "Kinesthetic" },
        ]
    },
    {
        id: 2,
        question: "How do you best remember someone's name?",
        options: [
            { text: "Visualize their face and where you met", style: "Visual" },
            { text: "Say the name out loud to yourself", style: "Auditory" },
            { text: "Write it down on your phone or paper", style: "Reading/Writing" },
            { text: "Associate it with a handshake or gesture", style: "Kinesthetic" },
        ]
    },
    {
        id: 3,
        question: "When studying for an exam, you prefer:",
        options: [
            { text: "Using colorful diagrams and mind maps", style: "Visual" },
            { text: "Recording and listening to your notes", style: "Auditory" },
            { text: "Summarizing chapters in bullet points", style: "Reading/Writing" },
            { text: "Walking around while reciting concepts", style: "Kinesthetic" },
        ]
    },
];

import { supabase } from '../supabaseClient';

const LearningStyleQuizScreen = ({ navigation }) => {
    const theme = useTheme();
    const { updateUser } = useUser();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);

    const progress = (currentIndex + 1) / QUIZ_QUESTIONS.length;
    const currentQuestion = QUIZ_QUESTIONS[currentIndex];

    const handleNext = () => {
        const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
        setAnswers(newAnswers);
        setSelectedOption(null);

        if (currentIndex < QUIZ_QUESTIONS.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            calculateResults(newAnswers);
        }
    };

    const calculateResults = async (finalAnswers) => {
        setLoading(true);
        try {
            const counts = { Visual: 0, Auditory: 0, "Reading/Writing": 0, Kinesthetic: 0 };
            Object.values(finalAnswers).forEach(style => {
                counts[style]++;
            });

            const dominantStyle = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        learning_style: dominantStyle,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (error) throw error;
            }

            updateUser({ learningStyle: dominantStyle, onboarded: true });
            navigation.navigate('Dashboard');
        } catch (err) {
            console.error('Error updating learning style:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text variant="labelLarge" style={styles.progressText}>
                        Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
                    </Text>
                    <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text variant="headlineSmall" style={styles.questionText}>
                        {currentQuestion.question}
                    </Text>

                    <View style={styles.optionsContainer}>
                        {currentQuestion.options.map((option, index) => (
                            <Card
                                key={index}
                                style={[
                                    styles.optionCard,
                                    selectedOption === option.style && { borderColor: theme.colors.primary, borderWidth: 2 }
                                ]}
                                onPress={() => setSelectedOption(option.style)}
                            >
                                <Card.Content style={styles.optionContent}>
                                    <RadioButton
                                        value={option.style}
                                        status={selectedOption === option.style ? 'checked' : 'unchecked'}
                                        onPress={() => setSelectedOption(option.style)}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={styles.optionText}>{option.text}</Text>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>

                    {/* Fixed button layout for responsiveness */}
                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={handleNext}
                            loading={loading}
                            disabled={!selectedOption || loading}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            {currentIndex === QUIZ_QUESTIONS.length - 1 ? "Finish" : "Next"}
                        </Button>
                    </View>
                </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingBottom: 24,
    },
    header: {
        marginBottom: 24,
    },
    progressText: {
        marginBottom: 8,
        opacity: 0.6,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    questionText: {
        fontWeight: 'bold',
        marginBottom: 24,
        lineHeight: 32,
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    optionCard: {
        backgroundColor: 'white',
        elevation: 2,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // Increased padding
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
    },
    footer: {
        marginTop: 'auto', // Pushes button to bottom of scroll content if space permits
        paddingTop: 16,
    },
    button: {
        borderRadius: 30,
    },
    buttonContent: {
        height: 50,
    },
});

export default LearningStyleQuizScreen;
