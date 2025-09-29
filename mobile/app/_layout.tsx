import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@brewmaestro:onboardingCompleted';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(stored === 'true');
      } catch (error) {
        setHasCompletedOnboarding(false);
      } finally {
        setIsReady(true);
      }
    };

    checkStatus();
  }, [segments]);

  useEffect(() => {
    if (!isReady || hasCompletedOnboarding === null) return;

    const segment = segments[0];
    const inOnboarding = segment === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    }

    if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)/home');
    }
  }, [isReady, hasCompletedOnboarding, segments, router]);

  useEffect(() => {
    if (!isReady) return;
    const timeout = setTimeout(() => setSplashVisible(false), 2500);
    return () => clearTimeout(timeout);
  }, [isReady]);

  return (
    <SafeAreaProvider>
      {splashVisible && (
        <View style={styles.splash}>
          <ActivityIndicator size="large" color="#F6C101" />
        </View>
      )}
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe Details' }} />
        <Stack.Screen name="recipe/new" options={{ title: 'New Recipe' }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 98,
  },
});
