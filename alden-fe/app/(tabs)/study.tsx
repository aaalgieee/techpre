import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { Timer } from '../../components/Timer';

type StudyTechnique = 'pomodoro' | 'deep_work' | 'active_recall';

export default function StudyScreen() {
  const { 
    activeSession, 
    isTimerRunning, 
    isLoading,
    error,
    startStudySession, 
    endStudySession,
    setTimerRunning,
    setError 
  } = useAppStore();

  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [technique, setTechnique] = useState<StudyTechnique>('pomodoro');
  const [customDuration, setCustomDuration] = useState('25');

  const techniques = [
    {
      id: 'pomodoro' as StudyTechnique,
      name: 'Pomodoro',
      description: '25min focused work + 5min break',
      duration: 25,
      icon: 'timer-outline',
      color: 'bg-red-500',
    },
    {
      id: 'deep_work' as StudyTechnique,
      name: 'Deep Work',
      description: '90min intensive focus session',
      duration: 90,
      icon: 'flash-outline',
      color: 'bg-purple-500',
    },
    {
      id: 'active_recall' as StudyTechnique,
      name: 'Active Recall',
      description: '30min practice and review',
      duration: 30,
      icon: 'bulb-outline',
      color: 'bg-yellow-500',
    },
  ];

  const selectedTechnique = techniques.find(t => t.id === technique);
  const sessionDuration = parseInt(customDuration) || selectedTechnique?.duration || 25;

  const handleStartSession = async () => {
    if (!subject.trim()) {
      Alert.alert('Missing Subject', 'Please enter what you\'ll be studying.');
      return;
    }

    try {
      // Clear any previous errors
      setError(null);
      
      await startStudySession({
        subject: subject.trim(),
        goal: goal.trim() || 'Focus and learn',
        technique,
        duration: sessionDuration,
      });

      // Clear form after successful start
      setSubject('');
      setGoal('');
    } catch (error) {
      Alert.alert(
        'Failed to Start Session',
        'There was an error starting your study session. Please check your connection and try again.'
      );
    }
  };

  const handleTimerStart = () => {
    setTimerRunning(true);
  };

  const handleTimerPause = () => {
    setTimerRunning(false);
  };

  const handleTimerStop = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this study session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: () => {
            setTimerRunning(false);
            handleEndSession();
          }
        },
      ]
    );
  };

  const handleTimerComplete = () => {
    setTimerRunning(false);
    Alert.alert(
      'Session Complete! 🎉',
      'Great job! How would you rate your focus during this session?',
      [
        { text: 'Poor (1-3)', onPress: () => endSessionWithRating(2) },
        { text: 'Good (4-6)', onPress: () => endSessionWithRating(5) },
        { text: 'Excellent (7-10)', onPress: () => endSessionWithRating(8) },
      ]
    );
  };

  const endSessionWithRating = async (focusScore: number) => {
    try {
      await endStudySession(focusScore);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to end session. Please check your connection and try again.'
      );
    }
  };

  const handleEndSession = async () => {
    try {
      await endStudySession();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to end session. Please check your connection and try again.'
      );
    }
  };

  // Show error message if there's an error
  const ErrorBanner = () => {
    if (!error) return null;
    
    return (
      <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mx-6 mb-4">
        <View className="flex-row items-center">
          <Ionicons name="warning" size={16} color="#dc2626" />
          <Text className="text-red-700 dark:text-red-300 text-sm ml-2 flex-1">
            {error}
          </Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (activeSession) {
    return (
      <SafeAreaView className="flex-1 bg-calm-50 dark:bg-calm-900" edges={['top', 'left', 'right']}>
        <ErrorBanner />
        
        <View className="flex-1 justify-center items-center px-6">
          {/* Session Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-calm-900 dark:text-calm-100 text-center">
              {activeSession.subject}
            </Text>
            <Text className="text-lg text-calm-600 dark:text-calm-400 mt-2 text-center">
              {activeSession.goal}
            </Text>
            <View className="flex-row items-center mt-4 px-4 py-2 bg-primary-100 dark:bg-primary-900/20 rounded-full">
              <Ionicons 
                name={selectedTechnique?.icon as any} 
                size={16} 
                color="#0ea5e9" 
              />
              <Text className="text-primary-700 dark:text-primary-300 ml-2 font-medium capitalize">
                {activeSession.technique.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Timer */}
          <Timer
            duration={activeSession.duration}
            isRunning={isTimerRunning}
            onStart={handleTimerStart}
            onPause={handleTimerPause}
            onStop={handleTimerStop}
            onComplete={handleTimerComplete}
          />

          {/* Focus Tips */}
          <View className="mt-8 bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
            <Text className="text-sm font-medium text-calm-900 dark:text-calm-100 mb-2">
              💡 Focus Tip
            </Text>
            <Text className="text-sm text-calm-600 dark:text-calm-400">
              {activeSession.technique === 'pomodoro' && 'Focus on just one task. When the timer rings, take a 5-minute break.'}
              {activeSession.technique === 'deep_work' && 'Eliminate all distractions. This is your time for deep, concentrated work.'}
              {activeSession.technique === 'active_recall' && 'Test yourself regularly. Try to recall information without looking at your notes.'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-calm-50 dark:bg-calm-900" edges={['top', 'left', 'right']}>
      <ErrorBanner />
      
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-6 pb-4">
          <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
            New Study Session
          </Text>
          <Text className="text-lg text-calm-600 dark:text-calm-400 mt-1">
            Set up your focused learning time
          </Text>
        </View>

        {/* Study Details */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
            What will you study?
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Subject *
            </Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g., Mathematics, Physics, History..."
              className="bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700 rounded-lg px-4 py-3 text-calm-900 dark:text-calm-100"
              placeholderTextColor="#94a3b8"
              editable={!isLoading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Goal (Optional)
            </Text>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g., Complete Chapter 5, Review notes..."
              className="bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700 rounded-lg px-4 py-3 text-calm-900 dark:text-calm-100"
              placeholderTextColor="#94a3b8"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Study Technique */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
            Choose Your Technique
          </Text>
          
          {techniques.map((tech) => (
            <TouchableOpacity
              key={tech.id}
              onPress={() => setTechnique(tech.id)}
              disabled={isLoading}
              className={`flex-row items-center p-4 rounded-xl mb-3 border ${
                technique === tech.id 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' 
                  : 'bg-white dark:bg-calm-800 border-calm-200 dark:border-calm-700'
              } ${isLoading ? 'opacity-60' : ''}`}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center ${tech.color}`}>
                <Ionicons name={tech.icon as any} size={24} color="white" />
              </View>
              
              <View className="flex-1 ml-4">
                <Text className={`text-lg font-semibold ${
                  technique === tech.id 
                    ? 'text-primary-900 dark:text-primary-100' 
                    : 'text-calm-900 dark:text-calm-100'
                }`}>
                  {tech.name}
                </Text>
                <Text className={`text-sm ${
                  technique === tech.id 
                    ? 'text-primary-700 dark:text-primary-300' 
                    : 'text-calm-600 dark:text-calm-400'
                }`}>
                  {tech.description}
                </Text>
              </View>
              
              {technique === tech.id && (
                <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
              )}
            </TouchableOpacity>
          ))}

          {/* Custom Duration */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Custom Duration (minutes)
            </Text>
            <TextInput
              value={customDuration}
              onChangeText={setCustomDuration}
              placeholder="25"
              keyboardType="numeric"
              className="bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700 rounded-lg px-4 py-3 text-calm-900 dark:text-calm-100 w-24"
              placeholderTextColor="#94a3b8"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Pre-Session Preparation */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
            Pre-Session Prep
          </Text>
          
          <View className="bg-mindful-50 dark:bg-mindful-900/20 border border-mindful-200 dark:border-mindful-800 rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="heart" size={20} color="#22c55e" />
              <Text className="text-mindful-700 dark:text-mindful-300 font-medium ml-2">
                Recommended: Take a mindful moment
              </Text>
            </View>
            <Text className="text-sm text-mindful-600 dark:text-mindful-400 mb-3">
              A 2-3 minute breathing exercise can help you focus better during your study session.
            </Text>
            <TouchableOpacity 
              className="bg-mindful-500 px-4 py-2 rounded-lg self-start"
              disabled={isLoading}
            >
              <Text className="text-white font-medium text-sm">Start Focus Boost (4min)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={handleStartSession}
          className={`bg-primary-500 rounded-xl py-4 mb-8 shadow-sm ${
            (!subject.trim() || isLoading) ? 'opacity-60' : ''
          }`}
          disabled={!subject.trim() || isLoading}
        >
          <View className="flex-row items-center justify-center">
            {isLoading && (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            )}
            <Text className="text-white text-lg font-semibold">
              {isLoading ? 'Starting Session...' : 'Start Study Session'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 