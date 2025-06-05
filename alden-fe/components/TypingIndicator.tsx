import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 500,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = animateDot(dot1, 0);
    const animation2 = animateDot(dot2, 200);
    const animation3 = animateDot(dot3, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  return (
    <View className="flex-row mb-4 justify-start">
      <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3 mt-1">
        <Ionicons name="sparkles" size={16} color="white" />
      </View>
      
      <View className="mr-12">
        <View className="bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700 rounded-2xl rounded-bl-md p-4">
          <View className="flex-row items-center">
            <Text className="text-calm-600 dark:text-calm-400 text-sm mr-2">
              Aida is thinking
            </Text>
            <View className="flex-row space-x-1">
              <Animated.View 
                className="w-2 h-2 bg-calm-400 rounded-full"
                style={{ opacity: dot1 }}
              />
              <Animated.View 
                className="w-2 h-2 bg-calm-400 rounded-full"
                style={{ opacity: dot2 }}
              />
              <Animated.View 
                className="w-2 h-2 bg-calm-400 rounded-full"
                style={{ opacity: dot3 }}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
} 