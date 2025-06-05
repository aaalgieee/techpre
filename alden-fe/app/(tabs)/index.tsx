import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { StudySessionCard } from '../../components/StudySessionCard';
import { MindfulMomentCard } from '../../components/MindfulMomentCard';

export default function HomeScreen() {
  const { 
    dailyGoal, 
    todayStudyTime, 
    currentStreak,
    totalMindfulTime,
    studySessions,
    mindfulSessions,
    activeSession
  } = useAppStore();

  const progressPercentage = Math.min((todayStudyTime / dailyGoal) * 100, 100);
  const recentSessions = studySessions.slice(-3).reverse();
  const featuredMindful = mindfulSessions.find(session => session.category === 'pre_study');

  const formatTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <SafeAreaView className="flex-1 bg-calm-50 dark:bg-calm-900" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
            {formatTime()}! 🌅
          </Text>
          <Text className="text-lg text-calm-600 dark:text-calm-400 mt-1">
            Ready to focus today?
          </Text>
        </View>

        {/* Daily Progress Card */}
        <View className="mx-6 mb-6">
          <View className="bg-white dark:bg-calm-800 rounded-2xl p-6 shadow-sm border border-calm-100 dark:border-calm-700">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100">
                Today's Focus Goal
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="flame" size={20} color="#f97316" />
                <Text className="text-primary-600 dark:text-primary-400 font-semibold ml-1">
                  {currentStreak} streak
                </Text>
              </View>
            </View>
            
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                  {formatDuration(todayStudyTime)}
                </Text>
                <Text className="text-sm text-calm-600 dark:text-calm-400">
                  of {formatDuration(dailyGoal)}
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View className="h-3 bg-calm-200 dark:bg-calm-700 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
              
              <Text className="text-xs text-calm-600 dark:text-calm-400 mt-2">
                {progressPercentage >= 100 ? 'Goal achieved! 🎉' : `${Math.round(progressPercentage)}% complete`}
              </Text>
            </View>

            {/* Active Session Alert */}
            {activeSession && (
              <View className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3 mb-4">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-primary-500 rounded-full mr-2" />
                  <Text className="text-primary-700 dark:text-primary-300 font-medium flex-1">
                    Study session in progress: {activeSession.subject}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/study')}
                    className="ml-2"
                  >
                    <Ionicons name="arrow-forward" size={16} color="#0ea5e9" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
            Quick Actions
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/study')}
                className="flex-1 bg-primary-500 rounded-xl p-4 items-center"
              >
                <Ionicons name="play" size={24} color="white" />
                <Text className="text-white font-semibold mt-2">Start Study</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/mindful')}
                className="flex-1 bg-mindful-500 rounded-xl p-4 items-center"
              >
                <Ionicons name="heart" size={24} color="white" />
                <Text className="text-white font-semibold mt-2">Mindful Moment</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/aida')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="sparkles" size={24} color="white" />
                <Text className="text-white font-semibold ml-2">Ask Aida AI</Text>
              </View>
              <Text className="text-white/80 text-sm mt-1">Get instant help with your studies</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Mindful Moment */}
        {featuredMindful && (
          <View className="mx-6 mb-6">
            <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
              Mindful Moment of the Day
            </Text>
            <MindfulMomentCard 
              session={featuredMindful}
              onPress={() => router.push('/(tabs)/mindful')}
            />
          </View>
        )}

        {/* Recent Activity */}
        <View className="mx-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100">
              Recent Activity
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/progress')}
              className="flex-row items-center"
            >
              <Text className="text-primary-600 dark:text-primary-400 text-sm">View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#0ea5e9" />
            </TouchableOpacity>
          </View>

          {recentSessions.length > 0 ? (
            <View>
              {recentSessions.map((session) => (
                <StudySessionCard 
                  key={session.id} 
                  session={session}
                  onPress={() => router.push('/(tabs)/progress')}
                />
              ))}
            </View>
          ) : (
            <View className="bg-white dark:bg-calm-800 rounded-xl p-6 items-center border border-calm-100 dark:border-calm-700">
              <Ionicons name="book-outline" size={48} color="#94a3b8" />
              <Text className="text-calm-600 dark:text-calm-400 text-center mt-3">
                No study sessions yet.{'\n'}Start your first session to see your progress here!
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/study')}
                className="bg-primary-500 px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-semibold">Start Studying</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Summary */}
        <View className="mx-6 mb-8">
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time" size={20} color="#0ea5e9" />
                <Text className="text-xs text-calm-600 dark:text-calm-400 ml-2 uppercase tracking-wide">
                  Total Study
                </Text>
              </View>
              <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                {formatDuration(studySessions.reduce((total, session) => total + session.duration, 0))}
              </Text>
            </View>
            
            <View className="flex-1 bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
              <View className="flex-row items-center mb-2">
                <Ionicons name="heart" size={20} color="#22c55e" />
                <Text className="text-xs text-calm-600 dark:text-calm-400 ml-2 uppercase tracking-wide">
                  Mindful
                </Text>
              </View>
              <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                {totalMindfulTime}m
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
