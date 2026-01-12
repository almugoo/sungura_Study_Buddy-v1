import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, IconButton, Avatar, useTheme, Surface, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import MermaidRenderer from '../components/MermaidRenderer';

// Target Local API in Dev, Relative Path in Prod (Netlify)
const API_URL = __DEV__ ? 'http://localhost:3000' : '/api';

const ChatScreen = ({ route, navigation }) => {
    const theme = useTheme();
    const { userData } = useUser();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Habari! I'm Sungura, your AI study buddy. Ready to dive into **${route.params?.courseName || 'your studies'}**?`,
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef();

    // Mastery Indicator Logic (Mocked for Phase 1)
    const mastery = route.params?.mastery || 'Yellow'; // Red, Yellow, Green
    const masteryColor = {
        Red: '#FF5252',
        Yellow: '#FFD740',
        Green: '#4CAF50'
    }[mastery];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() && !selectedImage) return;

        const currentText = inputText;
        const currentImage = selectedImage;

        const userMessage = {
            id: Date.now(),
            text: currentText || (currentImage ? "Look at this image..." : ""),
            sender: 'user',
            image: currentImage?.uri,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setSelectedImage(null);
        setIsTyping(true);

        try {
            const response = await axios.post(`${API_URL}/chat`, {
                message: currentText,
                image: currentImage?.base64,
                courseContext: route.params?.courseName || 'General',
                learningStyle: userData.learningStyle || 'Standard'
            });

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Pole sana! I'm having trouble connecting right now. Please check your data or try again.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    // Custom Markdown rules to handle Mermaid
    const markdownRules = {
        fence: (node, children, parent, styles) => {
            const { content, lang } = node;
            if (lang === 'mermaid') {
                return (
                    <MermaidRenderer key={node.key} definition={content} />
                );
            }
            // Fallback for other code blocks
            return (
                <View key={node.key} style={styles.code_block}>
                    <Text style={styles.code_inline}>{content}</Text>
                </View>
            );
        },
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Custom Header with Mastery Indicator */}
            <Surface style={styles.header} elevation={1}>
                <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
                <View style={styles.headerTitle}>
                    <Text variant="titleMedium">{route.params?.courseName || 'Study Session'}</Text>
                    <View style={styles.masteryContainer}>
                        <View style={[styles.masteryDot, { backgroundColor: masteryColor }]} />
                        <Text variant="labelSmall" style={{ color: masteryColor }}>{mastery} Mastery</Text>
                    </View>
                </View>
                <Avatar.Image size={36} source={{ uri: 'https://i.pravatar.cc/150?u=sungura' }} style={styles.headerAvatar} />
            </Surface>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                >
                    {messages.map((item) => (
                        <View
                            key={item.id}
                            style={[
                                styles.messageWrapper,
                                item.sender === 'user' ? styles.userWrapper : styles.aiWrapper
                            ]}
                        >
                            {item.sender === 'ai' && (
                                <Avatar.Icon size={32} icon="rabbit" style={styles.messageAvatar} />
                            )}
                            <Surface
                                style={[
                                    styles.messageBubble,
                                    item.sender === 'user' ? styles.userBubble : styles.aiBubble,
                                    item.sender === 'user' ? { backgroundColor: theme.colors.primary } : { backgroundColor: 'white' }
                                ]}
                                elevation={item.sender === 'ai' ? 1 : 0}
                            >
                                {item.image && (
                                    <Image source={{ uri: item.image }} style={styles.messageImage} />
                                )}
                                <Markdown
                                    rules={markdownRules}
                                    style={item.sender === 'user' ? userMarkdownStyles : aiMarkdownStyles}
                                >
                                    {item.text}
                                </Markdown>
                                <Text style={[
                                    styles.timestamp,
                                    { color: item.sender === 'user' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)' }
                                ]}>
                                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </Surface>
                        </View>
                    ))}

                    {isTyping && (
                        <View style={[styles.messageWrapper, styles.aiWrapper]}>
                            <Avatar.Icon size={32} icon="rabbit" style={styles.messageAvatar} />
                            <Surface style={[styles.messageBubble, styles.aiBubble]} elevation={1}>
                                <View style={styles.typingContainer}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                    <Text variant="bodySmall" style={styles.typingText}>Sungura anafikiria...</Text>
                                </View>
                            </Surface>
                        </View>
                    )}
                </ScrollView>

                {selectedImage && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                        <IconButton
                            icon="close-circle"
                            size={20}
                            style={styles.closePreview}
                            onPress={() => setSelectedImage(null)}
                        />
                    </View>
                )}

                <Surface style={styles.inputContainer} elevation={4}>
                    <View style={styles.inputRow}>
                        <IconButton icon="image" onPress={pickImage} style={styles.actionButton} />
                        <TextInput
                            mode="flat"
                            placeholder="Ask me anything..."
                            value={inputText}
                            onChangeText={setInputText}
                            style={styles.input}
                            right={<TextInput.Icon icon="send" onPress={sendMessage} disabled={!inputText.trim() && !selectedImage} />}
                            underlineColor="transparent"
                            activeUnderlineColor="transparent"
                            multiline
                        />
                    </View>
                </Surface>
            </KeyboardAvoidingView>
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
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'white',
    },
    headerTitle: {
        flex: 1,
        marginLeft: 8,
    },
    masteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    masteryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    headerAvatar: {
        marginRight: 8,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    aiWrapper: {
        alignSelf: 'flex-start',
    },
    messageAvatar: {
        backgroundColor: '#E1BEE7',
        alignSelf: 'flex-end',
        marginRight: 8,
    },
    messageBubble: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typingText: {
        opacity: 0.6,
        fontStyle: 'italic',
    },
    previewContainer: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    closePreview: {
        position: 'absolute',
        top: -10,
        left: 50,
    },
    inputContainer: {
        padding: 12,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        margin: 0,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        maxHeight: 120,
    },
    code_block: {
        backgroundColor: '#272822',
        padding: 10,
        borderRadius: 4,
        marginVertical: 5,
    },
    code_inline: {
        color: '#f8f8f2',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    }
});

const userMarkdownStyles = StyleSheet.create({
    body: { color: 'white' },
    paragraph: { marginBottom: 0 },
});

const aiMarkdownStyles = StyleSheet.create({
    body: { color: '#1a1a1a', fontSize: 15, lineHeight: 22 },
    paragraph: { marginBottom: 12, marginTop: 0 },
    strong: { fontWeight: 'bold', color: '#000' },
    em: { fontStyle: 'italic' },
    // Headers
    heading1: { fontSize: 22, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#6B4EFF' },
    heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 14, marginBottom: 6, color: '#6B4EFF' },
    heading3: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 6, color: '#333' },
    heading4: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 4, color: '#444' },
    // Lists
    bullet_list: { marginVertical: 8 },
    ordered_list: { marginVertical: 8 },
    list_item: { marginBottom: 6, flexDirection: 'row' },
    bullet_list_icon: { marginRight: 8, color: '#6B4EFF' },
    ordered_list_icon: { marginRight: 8, color: '#6B4EFF', fontWeight: 'bold' },
    // Code
    code_inline: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 13,
        color: '#d63384'
    },
    code_block: {
        backgroundColor: '#1e1e1e',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
        overflow: 'hidden'
    },
    fence: {
        backgroundColor: '#1e1e1e',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10
    },
    // Table
    table: { borderWidth: 1, borderColor: '#ddd', marginVertical: 12, borderRadius: 8, overflow: 'hidden' },
    thead: { backgroundColor: '#f5f5f5' },
    th: { padding: 8, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#ddd' },
    tr: { borderBottomWidth: 1, borderColor: '#eee' },
    td: { padding: 8 },
    // Blockquote  
    blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: '#6B4EFF',
        paddingLeft: 12,
        marginVertical: 8,
        backgroundColor: '#f9f9ff',
        paddingVertical: 8,
        borderRadius: 4
    },
    // HR
    hr: { backgroundColor: '#ddd', height: 1, marginVertical: 16 },
    // Link
    link: { color: '#6B4EFF', textDecorationLine: 'underline' },
});

export default ChatScreen;
