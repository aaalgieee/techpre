import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudySession } from '../store/useAppStore';

interface StudySessionCardProps {
  session: StudySession;
  onPress?: () => void;
  showDetails?: boolean;
}

export function StudySessionCard({ session, onPress, showDetails = false }: StudySessionCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTechniqueIcon = (technique: string) => {
    switch (technique) {
      case 'pomodoro':
        return 'timer-outline';
      case 'deep_work':
        return 'flash-outline';
      case 'active_recall':
        return 'bulb-outline';
      default:
        return 'book-outline';
    }
  };

  const getTechniqueColor = (technique: string) => {
    switch (technique) {
      case 'pomodoro':
        return 'text-red-600';
      case 'deep_work':
        return 'text-purple-600';
      case 'active_recall':
        return 'text-yellow-600';
      default:
        return 'text-primary-600';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-calm-800 rounded-xl p-4 mb-3 shadow-sm border border-calm-100 dark:border-calm-700"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Subject and Status */}
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-semibold text-calm-900 dark:text-calm-100 flex-1">
              {session.subject}
            </Text>
            {session.completed && (
              <View className="bg-mindful-100 dark:bg-mindful-800 px-2 py-1 rounded-full">
                <Text className="text-xs text-mindful-700 dark:text-mindful-300 font-medium">
                  Completed
                </Text>
              </View>
            )}
          </View>

          {/* Goal */}
          {session.goal && (
            <Text className="text-sm text-calm-600 dark:text-calm-400 mb-2">
              Goal: {session.goal}
            </Text>
          )}

          {/* Technique and Duration */}
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Ionicons 
                name={getTechniqueIcon(session.technique) as any} 
                size={16} 
                className={getTechniqueColor(session.technique)}
              />
              <Text className={`text-sm ml-1 capitalize ${getTechniqueColor(session.technique)}`}>
                {session.technique.replace('_', ' ')}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text className="text-sm text-calm-600 dark:text-calm-400 ml-1">
                {formatDuration(session.duration)}
              </Text>
            </View>
          </View>

          {/* Additional Details */}
          {showDetails && session.completed && (
            <View className="mt-3 pt-3 border-t border-calm-100 dark:border-calm-700">
              <View className="flex-row justify-between">
                <Text className="text-xs text-calm-500 dark:text-calm-500">
                  Started: {formatTime(session.startTime)}
                </Text>
                {session.endTime && (
                  <Text className="text-xs text-calm-500 dark:text-calm-500">
                    Ended: {formatTime(session.endTime)}
                  </Text>
                )}
              </View>
              
              {session.focusScore && (
                <View className="flex-row items-center mt-2">
                  <Text className="text-xs text-calm-600 dark:text-calm-400 mr-2">
                    Focus Score:
                  </Text>
                  <View className="flex-row">
                    {[...Array(10)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < session.focusScore! ? "star" : "star-outline"}
                        size={12}
                        color={i < session.focusScore! ? "#fbbf24" : "#d1d5db"}
                      />
                    ))}
                  </View>
                  <Text className="text-xs text-calm-600 dark:text-calm-400 ml-2">
                    {session.focusScore}/10
                  </Text>
                </View>
              )}

              {session.notes && (
                <Text className="text-xs text-calm-600 dark:text-calm-400 mt-2">
                  Notes: {session.notes}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Session Icon */}
        <View className="ml-3">
          {session.completed ? (
            <View className="w-10 h-10 bg-mindful-500 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
          ) : (
            <View className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full items-center justify-center">
              <Ionicons name="play" size={20} color="#0ea5e9" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
} 