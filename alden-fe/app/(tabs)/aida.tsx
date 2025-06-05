import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { ChatMessage } from '../../components/ChatMessage';
import { ChatInput } from '../../components/ChatInput';
import { TypingIndicator } from '../../components/TypingIndicator';

export default function AidaScreen() {
  const { 
    aidaConversations,
    activeConversation,
    isAidaTyping,
    createConversation,
    sendMessage,
    setActiveConversation,
    deleteConversation,
    uploadDocument
  } = useAppStore();

  const scrollViewRef = useRef<ScrollView>(null);
  const currentConversation = aidaConversations.find(conv => conv.id === activeConversation);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentConversation?.messages.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation?.messages.length, isAidaTyping]);

  const handleSendMessage = (content: string) => {
    if (!activeConversation) {
      // Create new conversation if none exists
      const newConversationId = createConversation('Chat with Aida');
      sendMessage(newConversationId, content);
    } else {
      sendMessage(activeConversation, content);
    }
  };

  const handleNewConversation = () => {
    createConversation('New Chat');
  };

  const handleDeleteConversation = (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteConversation(conversationId)
        },
      ]
    );
  };

  const formatLastMessage = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const suggestedQuestions = [
    "Help me understand calculus derivatives",
    "Create flashcards for my biology notes",
    "Explain photosynthesis in simple terms",
    "Generate practice quiz questions",
    "How can I improve my study habits?",
    "Break down this complex topic for me"
  ];

  // If no conversation is active, show conversation list or welcome screen
  if (!currentConversation) {
    return (
      <SafeAreaView className="flex-1 bg-calm-50 dark:bg-calm-900" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4 bg-calm-50 dark:bg-calm-800 border-b border-calm-200 dark:border-calm-700">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                Aida AI Assistant
              </Text>
              <Text className="text-lg text-calm-600 dark:text-calm-400 mt-1">
                Your personal study companion
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleNewConversation}
              className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center"
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          {aidaConversations.length === 0 && (
            <View className="px-6 py-8">
              <View className="bg-gradient-to-r from-primary-50 to-mindful-50 dark:from-primary-900/20 dark:to-mindful-900/20 rounded-2xl p-6 mb-6">
                <View className="items-center mb-6">
                  <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center mb-4">
                    <Ionicons name="sparkles" size={32} color="white" />
                  </View>
                  <Text className="text-xl font-bold text-calm-900 dark:text-calm-100 text-center">
                    Meet Aida! 👋
                  </Text>
                  <Text className="text-calm-600 dark:text-calm-400 text-center mt-2 leading-6">
                    Your AI-powered study assistant is here to help you learn better, faster, and smarter.
                  </Text>
                </View>

                {/* Features */}
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center mr-3">
                      <Ionicons name="book" size={12} color="white" />
                    </View>
                    <Text className="text-calm-700 dark:text-calm-300 flex-1">
                      Explain complex concepts in simple terms
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-mindful-500 rounded-full items-center justify-center mr-3">
                      <Ionicons name="library" size={12} color="white" />
                    </View>
                    <Text className="text-calm-700 dark:text-calm-300 flex-1">
                      Create flashcards and practice quizzes
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-yellow-500 rounded-full items-center justify-center mr-3">
                      <Ionicons name="camera" size={12} color="white" />
                    </View>
                    <Text className="text-calm-700 dark:text-calm-300 flex-1">
                      Upload notes and get personalized help
                    </Text>
                  </View>
                </View>
              </View>

              {/* Suggested Questions */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
                  Try asking Aida:
                </Text>
                <View className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        const newConversationId = createConversation('Chat with Aida');
                        sendMessage(newConversationId, question);
                      }}
                      className="bg-calm-100 dark:bg-calm-800 border border-calm-200 dark:border-calm-700 rounded-lg p-4"
                    >
                      <Text className="text-calm-700 dark:text-calm-300">
                        "{question}"
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Previous Conversations */}
          {aidaConversations.length > 0 && (
            <View className="px-6 py-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100">
                  Recent Conversations
                </Text>
                <TouchableOpacity
                  onPress={handleNewConversation}
                  className="flex-row items-center bg-primary-500 px-4 py-2 rounded-lg"
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white font-medium ml-2">New Chat</Text>
                </TouchableOpacity>
              </View>
              
              {aidaConversations.map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  onPress={() => setActiveConversation(conversation.id)}
                  className="bg-calm-100 dark:bg-calm-800 rounded-xl p-4 mb-3 border border-calm-200 dark:border-calm-700"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-1">
                        {conversation.title}
                      </Text>
                      {conversation.subject && (
                        <Text className="text-sm text-primary-600 dark:text-primary-400 mb-2">
                          {conversation.subject}
                        </Text>
                      )}
                      {conversation.messages.length > 0 && (
                        <Text className="text-sm text-calm-600 dark:text-calm-400" numberOfLines={2}>
                          {conversation.messages[conversation.messages.length - 1].content}
                        </Text>
                      )}
                      <Text className="text-xs text-calm-500 dark:text-calm-500 mt-2">
                        {formatLastMessage(conversation.lastMessage)} • {conversation.messages.length} messages
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteConversation(conversation.id)}
                      className="ml-3 p-2"
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active conversation view
  return (
    <SafeAreaView className="flex-1 bg-calm-50 dark:bg-calm-900" edges={['top', 'left', 'right']}>
      {/* Chat Header */}
      <View className="px-6 pt-6 pb-4 bg-calm-50 dark:bg-calm-800 border-b border-calm-200 dark:border-calm-700">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setActiveConversation(null)}
            className="mr-3 p-1"
          >
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          
          <View className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center mr-3">
            <Ionicons name="sparkles" size={20} color="white" />
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100">
              {currentConversation.title}
            </Text>
            {currentConversation.subject && (
              <Text className="text-sm text-primary-600 dark:text-primary-400">
                {currentConversation.subject}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            onPress={() => handleDeleteConversation(currentConversation.id)}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {currentConversation.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isAidaTyping && <TypingIndicator />}
      </ScrollView>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onUploadDocument={() => {
          // Simulate document upload
          uploadDocument({
            name: 'sample_notes.pdf',
            type: 'pdf',
            uri: '/path/to/file',
            size: 1024 * 1024, // 1MB
          });
        }}
        isDisabled={isAidaTyping}
      />
    </SafeAreaView>
  );
} 