import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { MindfulMomentCard } from '../../components/MindfulMomentCard';

type Category = 'all' | 'quick_relief' | 'pre_study' | 'post_study' | 'exam_support';

export default function MindfulScreen() {
  const { mindfulSessions, completeMindfulSession } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [playingSession, setPlayingSession] = useState<string | null>(null);

  const categories = [
    { id: 'all' as Category, name: 'All', icon: 'apps-outline' },
    { id: 'quick_relief' as Category, name: 'Quick Relief', icon: 'flash-outline' },
    { id: 'pre_study' as Category, name: 'Pre-Study', icon: 'rocket-outline' },
    { id: 'post_study' as Category, name: 'Post-Study', icon: 'leaf-outline' },
    { id: 'exam_support' as Category, name: 'Exam Support', icon: 'shield-outline' },
  ];

  const filteredSessions = activeCategory === 'all' 
    ? mindfulSessions 
    : mindfulSessions.filter(session => session.category === activeCategory);

  const handlePlaySession = (sessionId: string) => {
    const session = mindfulSessions.find(s => s.id === sessionId);
    if (!session) return;

    setPlayingSession(sessionId);
    
    // Simulate audio playback
    Alert.alert(
      '🧘‍♀️ Starting Meditation',
      `"${session.title}" will begin shortly. Find a comfortable position and close your eyes.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setPlayingSession(null)
        },
        {
          text: 'Start',
          onPress: () => simulateAudioPlayback(session.id, session.duration)
        }
      ]
    );
  };

  const simulateAudioPlayback = (sessionId: string, duration: number) => {
    // For the MVP, we'll simulate the audio playback with a timeout
    // In a real app, you'd use Expo AV here
    
    setTimeout(() => {
      setPlayingSession(null);
      Alert.alert(
        'Session Complete! 🌟',
        'How did that feel? Rate your experience:',
        [
          { text: 'Skip', onPress: () => completeMindfulSession(sessionId) },
          { text: '⭐⭐⭐', onPress: () => completeMindfulSession(sessionId, 3) },
          { text: '⭐⭐⭐⭐⭐', onPress: () => completeMindfulSession(sessionId, 5) },
        ]
      );
    }, Math.min(duration * 1000, 10000)); // Cap at 10 seconds for demo
  };

  const getCategoryStats = (category: Category) => {
    const sessions = category === 'all' ? mindfulSessions : mindfulSessions.filter(s => s.category === category);
    const completed = sessions.filter(s => s.completed).length;
    return { total: sessions.length, completed };
  };

  return (
    <SafeAreaView className="flex-1 bg-calm-50 dark:bg-calm-900" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
            Mindful Moments
          </Text>
          <Text className="text-lg text-calm-600 dark:text-calm-400 mt-1">
            Take a moment to center yourself
          </Text>
        </View>

        {/* Current Session Playing */}
        {playingSession && (
          <View className="mx-6 mb-6">
            <View className="bg-mindful-100 dark:bg-mindful-900/20 border border-mindful-200 dark:border-mindful-800 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-mindful-500 rounded-full mr-3 animate-pulse" />
                <Text className="text-mindful-700 dark:text-mindful-300 font-medium flex-1">
                  Meditation in progress...
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setPlayingSession(null);
                    Alert.alert('Session stopped');
                  }}
                >
                  <Ionicons name="stop-circle" size={24} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Category Filters */}
        <View className="px-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {categories.map((category) => {
                const stats = getCategoryStats(category.id);
                const isActive = activeCategory === category.id;
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setActiveCategory(category.id)}
                    className={`px-4 py-3 rounded-full border min-w-[100px] items-center ${
                      isActive
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white dark:bg-calm-800 border-calm-200 dark:border-calm-700'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={category.icon as any} 
                        size={16} 
                        color={isActive ? 'white' : '#64748b'} 
                      />
                      <Text className={`ml-2 font-medium ${
                        isActive 
                          ? 'text-white' 
                          : 'text-calm-700 dark:text-calm-300'
                      }`}>
                        {category.name}
                      </Text>
                    </View>
                    <Text className={`text-xs mt-1 ${
                      isActive 
                        ? 'text-primary-100' 
                        : 'text-calm-500 dark:text-calm-500'
                    }`}>
                      {stats.completed}/{stats.total}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Sessions List */}
        <View className="px-6">
          {filteredSessions.length > 0 ? (
            <View>
              {filteredSessions.map((session) => (
                <MindfulMomentCard
                  key={session.id}
                  session={session}
                  onPress={() => handlePlaySession(session.id)}
                  showPlayButton={playingSession !== session.id}
                />
              ))}
            </View>
          ) : (
            <View className="bg-white dark:bg-calm-800 rounded-xl p-6 items-center border border-calm-100 dark:border-calm-700">
              <Ionicons name="heart-outline" size={48} color="#94a3b8" />
              <Text className="text-calm-600 dark:text-calm-400 text-center mt-3">
                No sessions in this category yet.
              </Text>
            </View>
          )}
        </View>

        {/* Mindfulness Tips */}
        <View className="mx-6 my-8">
          <View className="bg-gradient-to-r from-mindful-50 to-blue-50 dark:from-mindful-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-mindful-100 dark:border-mindful-800">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={24} color="#22c55e" />
              <Text className="text-lg font-semibold text-mindful-800 dark:text-mindful-200 ml-2">
                Mindfulness Tips
              </Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <View className="w-2 h-2 bg-mindful-500 rounded-full mt-2 mr-3" />
                <Text className="text-sm text-mindful-700 dark:text-mindful-300 flex-1">
                  Start with shorter sessions (1-3 minutes) and gradually increase duration
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-2 h-2 bg-mindful-500 rounded-full mt-2 mr-3" />
                <Text className="text-sm text-mindful-700 dark:text-mindful-300 flex-1">
                  Find a quiet space where you won't be interrupted
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-2 h-2 bg-mindful-500 rounded-full mt-2 mr-3" />
                <Text className="text-sm text-mindful-700 dark:text-mindful-300 flex-1">
                  It's normal for your mind to wander - gently bring attention back to your breath
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Practice Encouragement */}
        <View className="mx-6 mb-8">
          <View className="bg-white dark:bg-calm-800 rounded-xl p-6 border border-calm-100 dark:border-calm-700">
            <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-2">
              Building Your Practice 🌱
            </Text>
            <Text className="text-sm text-calm-600 dark:text-calm-400 mb-4">
              Consistency is more important than duration. Even 1 minute of daily mindfulness can make a difference in your focus and stress levels.
            </Text>
            
            <View className="flex-row justify-between items-center bg-calm-50 dark:bg-calm-700 rounded-lg p-3">
              <Text className="text-sm font-medium text-calm-700 dark:text-calm-300">
                This week's mindful minutes:
              </Text>
              <Text className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {mindfulSessions.filter(s => s.completed).reduce((total, session) => 
                  total + Math.floor(session.duration / 60), 0
                )}m
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 