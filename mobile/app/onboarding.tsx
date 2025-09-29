import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StepWelcome } from '../components/onboarding/StepWelcome';
import { StepTracking } from '../components/onboarding/StepTracking';
import { StepMaster } from '../components/onboarding/StepMaster';

const ONBOARDING_KEY = '@brewmaestro:onboardingCompleted';

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

type ActionType = 'tutorial' | 'catalog' | 'brews' | 'skip';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPersisting, setIsPersisting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>('intermediate');

  const steps = useMemo(
    () => [
      'welcome',
      'tracking',
      'master',
    ],
    []
  );

  const handleComplete = useCallback(
    async (action: ActionType) => {
      try {
        setIsPersisting(true);
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      } finally {
        setIsPersisting(false);
      }
      // Optimistically update current index to avoid returning to the first slide
      setCurrentIndex(steps.length - 1);

      switch (action) {
        case 'tutorial':
          router.replace('/(tabs)/brew');
          return;
        case 'catalog':
          router.replace('/(tabs)/index');
          return;
        case 'brews':
          router.replace('/(tabs)/brews');
          return;
        case 'skip':
        default:
          router.replace('/(tabs)/home');
          return;
      }
    },
    [router]
  );

  const handleSkip = () => handleComplete('skip');

  const goToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete('brews');
    }
  };

  const currentStep = steps[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>

      <View style={styles.slideContainer}>
        {currentStep === 'welcome' && <StepWelcome onNext={goNext} />}
        {currentStep === 'tracking' && (
          <StepTracking
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            onNext={goNext}
          />
        )}
        {currentStep === 'master' && <StepMaster onPrimary={() => handleComplete('brews')} />}
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {isPersisting && (
        <View style={styles.overlay}>
          <ActivityIndicator color="#F6C101" size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  slideContainer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#F6C101',
    width: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
