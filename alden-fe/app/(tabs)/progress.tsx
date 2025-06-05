import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { StudySessionCard } from '../../components/StudySessionCard';

type TimeFilter = 'week' | 'month' | 'all';

export default function ProgressScreen() {
  const { 
    studySessions, 
    mindfulSessions,
    dailyGoal,
    todayStudyTime,
    currentStreak,
    totalStudyTime,
    totalMindfulTime
  } = useAppStore();
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getFilteredSessions = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        return studySessions;
    }
    
    return studySessions.filter(session => 
      new Date(session.startTime) >= filterDate
    );
  };

  const filteredSessions = getFilteredSessions();
  const completedSessions = filteredSessions.filter(s => s.completed);
  const totalFilteredTime = completedSessions.reduce((total, session) => total + session.duration, 0);
  const completedMindfulSessions = mindfulSessions.filter(s => s.completed);
  
  const getAverageFocusScore = () => {
    const sessionsWithScores = completedSessions.filter(s => s.focusScore);
    if (sessionsWithScores.length === 0) return 0;
    
    const total = sessionsWithScores.reduce((sum, s) => sum + (s.focusScore || 0), 0);
    return Math.round(total / sessionsWithScores.length);
  };

  const getTechniqueBreakdown = () => {
    const breakdown = completedSessions.reduce((acc, session) => {
      acc[session.technique] = (acc[session.technique] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(breakdown).map(([technique, count]) => ({
      technique,
      count,
      percentage: Math.round((count / completedSessions.length) * 100) || 0
    }));
  };

  const getStreakInfo = () => {
    // Simple streak calculation - in a real app, this would be more sophisticated
    const today = new Date().toDateString();
    const todaySession = studySessions.find(s => 
      new Date(s.startTime).toDateString() === today && s.completed
    );
    
    return {
      current: currentStreak,
      todayComplete: !!todaySession || todayStudyTime >= dailyGoal
    };
  };

  const streakInfo = getStreakInfo();
  const averageFocusScore = getAverageFocusScore();
  const techniqueBreakdown = getTechniqueBreakdown();

  return (
    <SafeAreaView className="flex-1 bg-calm-50 dark:bg-calm-900" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
            Your Progress
          </Text>
          <Text className="text-lg text-calm-600 dark:text-calm-400 mt-1">
            Track your learning journey
          </Text>
        </View>

        {/* Time Filter */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-white dark:bg-calm-800 rounded-xl p-1 border border-calm-200 dark:border-calm-700">
            {(['week', 'month', 'all'] as TimeFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setTimeFilter(filter)}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  timeFilter === filter 
                    ? 'bg-primary-500' 
                    : 'bg-transparent'
                }`}
              >
                <Text className={`text-center font-medium ${
                  timeFilter === filter 
                    ? 'text-white' 
                    : 'text-calm-600 dark:text-calm-400'
                }`}>
                  {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Time'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View className="px-6 mb-6">
          <View className="grid grid-cols-2 gap-3">
            {/* Total Study Time */}
            <View className="bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time" size={20} color="#0ea5e9" />
                <Text className="text-xs text-calm-600 dark:text-calm-400 ml-2 uppercase tracking-wide">
                  Study Time
                </Text>
              </View>
              <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                {formatDuration(totalFilteredTime)}
              </Text>
              <Text className="text-xs text-calm-500 dark:text-calm-500 mt-1">
                {completedSessions.length} sessions
              </Text>
            </View>

            {/* Current Streak */}
            <View className="bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
              <View className="flex-row items-center mb-2">
                <Ionicons name="flame" size={20} color="#f97316" />
                <Text className="text-xs text-calm-600 dark:text-calm-400 ml-2 uppercase tracking-wide">
                  Streak
                </Text>
              </View>
              <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                {streakInfo.current}
              </Text>
              <Text className="text-xs text-calm-500 dark:text-calm-500 mt-1">
                {streakInfo.todayComplete ? '🔥 Today complete!' : 'Keep going!'}
              </Text>
            </View>

            {/* Mindful Minutes */}
            <View className="bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
              <View className="flex-row items-center mb-2">
                <Ionicons name="heart" size={20} color="#22c55e" />
                <Text className="text-xs text-calm-600 dark:text-calm-400 ml-2 uppercase tracking-wide">
                  Mindful
                </Text>
              </View>
              <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                {totalMindfulTime}m
              </Text>
              <Text className="text-xs text-calm-500 dark:text-calm-500 mt-1">
                {completedMindfulSessions.length} sessions
              </Text>
            </View>

            {/* Average Focus */}
            <View className="bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
              <View className="flex-row items-center mb-2">
                <Ionicons name="star" size={20} color="#fbbf24" />
                <Text className="text-xs text-calm-600 dark:text-calm-400 ml-2 uppercase tracking-wide">
                  Focus Score
                </Text>
              </View>
              <Text className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                {averageFocusScore}/10
              </Text>
              <Text className="text-xs text-calm-500 dark:text-calm-500 mt-1">
                Average rating
              </Text>
            </View>
          </View>
        </View>

        {/* Study Techniques Breakdown */}
        {techniqueBreakdown.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
              Study Techniques
            </Text>
            <View className="bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
              {techniqueBreakdown.map(({ technique, count, percentage }) => (
                <View key={technique} className="flex-row items-center justify-between mb-3 last:mb-0">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-3 h-3 rounded-full mr-3 ${
                      technique === 'pomodoro' ? 'bg-red-500' :
                      technique === 'deep_work' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`} />
                    <Text className="text-calm-700 dark:text-calm-300 capitalize flex-1">
                      {technique.replace('_', ' ')}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-calm-900 dark:text-calm-100 font-semibold mr-2">
                      {count}
                    </Text>
                    <Text className="text-calm-500 dark:text-calm-500 text-sm">
                      ({percentage}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Achievements */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
            Achievements
          </Text>
          <View className="bg-white dark:bg-calm-800 rounded-xl p-4 border border-calm-100 dark:border-calm-700">
            <View className="space-y-3">
              {/* First Session */}
              <View className={`flex-row items-center p-3 rounded-lg ${
                completedSessions.length > 0 
                  ? 'bg-mindful-50 dark:bg-mindful-900/20' 
                  : 'bg-calm-50 dark:bg-calm-700'
              }`}>
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  completedSessions.length > 0 ? 'bg-mindful-500' : 'bg-calm-300 dark:bg-calm-600'
                }`}>
                  <Ionicons 
                    name={completedSessions.length > 0 ? "checkmark" : "lock-closed"} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-calm-900 dark:text-calm-100">
                    First Steps
                  </Text>
                  <Text className="text-sm text-calm-600 dark:text-calm-400">
                    Complete your first study session
                  </Text>
                </View>
              </View>

              {/* 5 Sessions */}
              <View className={`flex-row items-center p-3 rounded-lg ${
                completedSessions.length >= 5 
                  ? 'bg-mindful-50 dark:bg-mindful-900/20' 
                  : 'bg-calm-50 dark:bg-calm-700'
              }`}>
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  completedSessions.length >= 5 ? 'bg-mindful-500' : 'bg-calm-300 dark:bg-calm-600'
                }`}>
                  <Ionicons 
                    name={completedSessions.length >= 5 ? "checkmark" : "lock-closed"} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-calm-900 dark:text-calm-100">
                    Building Momentum
                  </Text>
                  <Text className="text-sm text-calm-600 dark:text-calm-400">
                    Complete 5 study sessions ({completedSessions.length}/5)
                  </Text>
                </View>
              </View>

              {/* Mindful Moments */}
              <View className={`flex-row items-center p-3 rounded-lg ${
                completedMindfulSessions.length > 0 
                  ? 'bg-mindful-50 dark:bg-mindful-900/20' 
                  : 'bg-calm-50 dark:bg-calm-700'
              }`}>
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  completedMindfulSessions.length > 0 ? 'bg-mindful-500' : 'bg-calm-300 dark:bg-calm-600'
                }`}>
                  <Ionicons 
                    name={completedMindfulSessions.length > 0 ? "checkmark" : "lock-closed"} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-calm-900 dark:text-calm-100">
                    Mindful Student
                  </Text>
                  <Text className="text-sm text-calm-600 dark:text-calm-400">
                    Complete your first mindful moment
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Sessions */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
            Recent Sessions
          </Text>
          
          {filteredSessions.length > 0 ? (
            <View>
              {filteredSessions.slice(0, 5).reverse().map((session) => (
                <StudySessionCard 
                  key={session.id} 
                  session={session}
                  showDetails={true}
                />
              ))}
              
              {filteredSessions.length > 5 && (
                <TouchableOpacity className="bg-primary-500 rounded-xl py-3 mt-3">
                  <Text className="text-white font-semibold text-center">
                    View All Sessions ({filteredSessions.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="bg-white dark:bg-calm-800 rounded-xl p-6 items-center border border-calm-100 dark:border-calm-700">
              <Ionicons name="bar-chart-outline" size={48} color="#94a3b8" />
              <Text className="text-calm-600 dark:text-calm-400 text-center mt-3">
                No sessions in this time period.{'\n'}Start studying to see your progress here!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 