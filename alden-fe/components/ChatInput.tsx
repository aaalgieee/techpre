import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadDocument?: () => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  onUploadDocument, 
  isDisabled = false,
  placeholder = "Ask Aida anything about your studies..."
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const handleUpload = () => {
    Alert.alert(
      'Upload Study Material',
      'What would you like to upload?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => handleUploadType('camera') },
        { text: 'Choose File', onPress: () => handleUploadType('file') },
      ]
    );
  };

  const handleUploadType = (type: 'camera' | 'file') => {
    // In a real app, this would open the camera or file picker
    Alert.alert(
      'Upload Simulation',
      `This would open the ${type === 'camera' ? 'camera' : 'file picker'} to upload study materials. In the full version, uploaded documents would be processed by Aida for personalized help.`,
      [{ text: 'OK' }]
    );
    
    if (onUploadDocument) {
      onUploadDocument();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View 
        className="flex-row items-center px-4 py-3 bg-white dark:bg-calm-800 border-t border-calm-200 dark:border-calm-700"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {/* Upload Button */}
        <TouchableOpacity
          onPress={handleUpload}
          className="w-10 h-10 bg-calm-100 dark:bg-calm-700 rounded-full items-center justify-center mr-3"
          disabled={isDisabled}
        >
          <Ionicons 
            name="attach" 
            size={20} 
            color={isDisabled ? "#94a3b8" : "#64748b"} 
          />
        </TouchableOpacity>

        {/* Message Input Container */}
        <View className="flex-1 bg-calm-50 dark:bg-calm-700 rounded-2xl px-4 py-2 mr-3 border border-calm-200 dark:border-calm-600 min-h-[40px] max-h-32">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="center"
            style={{
              color: '#1f2937', // text-calm-900
              fontSize: 16,
              lineHeight: 20,
              minHeight: 24,
              maxHeight: 80,
            }}
            className="dark:text-calm-100"
            editable={!isDisabled}
            onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSend}
            blurOnSubmit={false}
            returnKeyType="send"
            enablesReturnKeyAutomatically
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || isDisabled}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            message.trim() && !isDisabled
              ? 'bg-primary-500 shadow-sm'
              : 'bg-calm-200 dark:bg-calm-600'
          }`}
        >
          <Ionicons 
            name="send" 
            size={18} 
            color={message.trim() && !isDisabled ? "white" : "#94a3b8"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
} 