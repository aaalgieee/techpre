import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '../store/useAppStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initializeApp = useAppStore((state) => state.initializeApp);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize app data when the app starts
  useEffect(() => {
    if (loaded) {
      initializeApp();
    }
  }, [loaded, initializeApp]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
