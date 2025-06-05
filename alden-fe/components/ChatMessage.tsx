import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AidaMessage } from '../store/useAppStore';

interface ChatMessageProps {
  message: AidaMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3 mt-1">
          <Ionicons name="sparkles" size={16} color="white" />
        </View>
      )}
      
      <View className={`max-w-[80%] ${isUser ? 'ml-12' : 'mr-12'}`}>
        <View
          className={`p-3 rounded-2xl ${
            isUser
              ? 'bg-primary-500 rounded-br-md'
              : 'bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700 rounded-bl-md'
          }`}
        >
          <Text
            className={`text-sm leading-5 ${
              isUser ? 'text-white' : 'text-calm-900 dark:text-calm-100'
            }`}
          >
            {message.content}
          </Text>
        </View>
        
        <Text className="text-xs text-calm-500 dark:text-calm-500 mt-1 px-1">
          {formatTime(message.timestamp)}
        </Text>
      </View>
      
      {isUser && (
        <View className="w-8 h-8 bg-mindful-500 rounded-full items-center justify-center ml-3 mt-1">
          <Ionicons name="person" size={16} color="white" />
        </View>
      )}
    </View>
  );
} 