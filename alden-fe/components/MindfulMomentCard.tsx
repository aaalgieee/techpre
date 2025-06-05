import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MindfulSession } from '../store/useAppStore';

interface MindfulMomentCardProps {
  session: MindfulSession;
  onPress?: () => void;
  showPlayButton?: boolean;
}

export function MindfulMomentCard({ session, onPress, showPlayButton = true }: MindfulMomentCardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${remainingSeconds}s`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quick_relief':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-300',
          icon: 'flash-outline'
        };
      case 'pre_study':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          icon: 'rocket-outline'
        };
      case 'post_study':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300',
          icon: 'leaf-outline'
        };
      case 'exam_support':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-700 dark:text-purple-300',
          icon: 'shield-outline'
        };
      default:
        return {
          bg: 'bg-calm-50 dark:bg-calm-900/20',
          border: 'border-calm-200 dark:border-calm-800',
          text: 'text-calm-700 dark:text-calm-300',
          icon: 'heart-outline'
        };
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'quick_relief':
        return 'Quick Relief';
      case 'pre_study':
        return 'Pre-Study';
      case 'post_study':
        return 'Post-Study';
      case 'exam_support':
        return 'Exam Support';
      default:
        return 'Mindful Moment';
    }
  };

  const categoryStyle = getCategoryColor(session.category);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-xl p-4 mb-3 border ${categoryStyle.bg} ${categoryStyle.border}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Category Badge */}
          <View className="flex-row items-center mb-2">
            <Ionicons 
              name={categoryStyle.icon as any} 
              size={16} 
              color={categoryStyle.text.includes('red') ? '#b91c1c' : 
                     categoryStyle.text.includes('blue') ? '#1d4ed8' :
                     categoryStyle.text.includes('green') ? '#16a34a' :
                     categoryStyle.text.includes('purple') ? '#7c3aed' : '#475569'}
            />
            <Text className={`text-xs font-medium ml-1 ${categoryStyle.text}`}>
              {getCategoryLabel(session.category)}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-1">
            {session.title}
          </Text>

          {/* Description */}
          <Text className="text-sm text-calm-600 dark:text-calm-400 mb-3 leading-5">
            {session.description}
          </Text>

          {/* Duration and Completion Status */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text className="text-sm text-calm-600 dark:text-calm-400 ml-1">
                {formatDuration(session.duration)}
              </Text>
            </View>

            {session.completed && (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text className="text-xs text-mindful-600 dark:text-mindful-400 ml-1">
                  Completed
                </Text>
              </View>
            )}
          </View>

          {/* Rating if completed */}
          {session.completed && session.rating && (
            <View className="flex-row items-center mt-2">
              <Text className="text-xs text-calm-600 dark:text-calm-400 mr-2">
                Your rating:
              </Text>
              <View className="flex-row">
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < session.rating! ? "star" : "star-outline"}
                    size={12}
                    color={i < session.rating! ? "#fbbf24" : "#d1d5db"}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Play Button */}
        {showPlayButton && (
          <View className="ml-3">
            <View className="w-12 h-12 bg-mindful-500 rounded-full items-center justify-center shadow-sm">
              <Ionicons 
                name={session.completed ? "refresh" : "play"} 
                size={20} 
                color="white" 
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
} 