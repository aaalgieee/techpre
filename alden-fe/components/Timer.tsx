import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimerProps {
  duration: number; // in minutes
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onComplete: () => void;
}

export function Timer({ duration, isRunning, onStart, onPause, onStop, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [initialTime] = useState(duration * 60);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            onComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;

  return (
    <View className="items-center">
      {/* Circular Progress */}
      <View className="relative w-64 h-64 items-center justify-center">
        {/* Background Circle */}
        <View className="absolute w-64 h-64 rounded-full border-8 border-calm-200" />
        
        {/* Progress Circle */}
        <View 
          className="absolute w-64 h-64 rounded-full border-8 border-primary-500"
          style={{
            transform: [{ rotate: `${(progress * 3.6) - 90}deg` }],
            borderTopColor: 'transparent',
            borderRightColor: progress > 25 ? '#0ea5e9' : 'transparent',
            borderBottomColor: progress > 50 ? '#0ea5e9' : 'transparent',
            borderLeftColor: progress > 75 ? '#0ea5e9' : 'transparent',
          }}
        />
        
        {/* Timer Display */}
        <View className="items-center">
          <Text className="text-4xl font-bold text-calm-800 dark:text-calm-100">
            {formatTime(timeLeft)}
          </Text>
          <Text className="text-sm text-calm-600 dark:text-calm-400 mt-1">
            {timeLeft === 0 ? 'Time\'s up!' : 'remaining'}
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View className="flex-row items-center justify-center mt-8 space-x-4">
        {!isRunning ? (
          <TouchableOpacity
            onPress={onStart}
            className="bg-primary-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name="play" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onPause}
            className="bg-calm-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name="pause" size={24} color="white" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={onStop}
          className="bg-red-500 w-12 h-12 rounded-full items-center justify-center shadow-lg ml-4"
        >
          <Ionicons name="stop" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 