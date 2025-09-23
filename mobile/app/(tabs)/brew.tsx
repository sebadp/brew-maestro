import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createShadow } from '../../utils/shadows';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

const BREW_STEPS = [
  { id: 1, name: 'Prepare Equipment', duration: 15 },
  { id: 2, name: 'Heat Water', duration: 30 },
  { id: 3, name: 'Mash In', duration: 60 },
  { id: 4, name: 'Sparge', duration: 30 },
  { id: 5, name: 'Boil - Bittering Hops', duration: 45 },
  { id: 6, name: 'Boil - Flavor Hops', duration: 10 },
  { id: 7, name: 'Boil - Aroma Hops', duration: 5 },
  { id: 8, name: 'Cool Down', duration: 20 },
  { id: 9, name: 'Transfer to Fermenter', duration: 15 },
];

export default function BrewScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => {
          if (timer <= 1) {
            setIsTimerRunning(false);
            Alert.alert('Step Complete!', `${BREW_STEPS[currentStep]?.name} is done!`);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, currentStep]);

  const startSession = () => {
    setSessionActive(true);
    setCurrentStep(0);
    setTimer(BREW_STEPS[0].duration * 60);
  };

  const startTimer = () => {
    if (timer === 0) {
      setTimer(BREW_STEPS[currentStep].duration * 60);
    }
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const nextStep = () => {
    if (currentStep < BREW_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimer(BREW_STEPS[currentStep + 1].duration * 60);
      setIsTimerRunning(false);
    } else {
      setSessionActive(false);
      Alert.alert('Brew Day Complete!', 'Congratulations! Your beer is ready for fermentation.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionActive) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="fire" size={80} color={MAESTRO_GOLD} />
          <Text style={styles.emptyTitle}>Ready to Brew?</Text>
          <Text style={styles.emptySubtitle}>
            Start a brew session to track your progress and get step-by-step guidance.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startSession}>
            <Text style={styles.startButtonText}>Start Brew Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = (currentStep + 1) / BREW_STEPS.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {BREW_STEPS.length}
        </Text>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepName}>{BREW_STEPS[currentStep].name}</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
          <View style={styles.timerControls}>
            <TouchableOpacity
              style={[styles.timerButton, { backgroundColor: isTimerRunning ? '#E74C3C' : HOP_GREEN }]}
              onPress={isTimerRunning ? pauseTimer : startTimer}
            >
              <MaterialCommunityIcons
                name={isTimerRunning ? 'pause' : 'play'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
        <Text style={styles.nextButtonText}>
          {currentStep === BREW_STEPS.length - 1 ? 'Complete Session' : 'Next Step'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DEEP_BREW,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: MAESTRO_GOLD,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HOP_GREEN,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  stepCard: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...createShadow('#000', { width: 0, height: 2 }, 0.1, 4, 4),
  },
  stepName: {
    fontSize: 20,
    fontWeight: '600',
    color: DEEP_BREW,
    marginBottom: 24,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: MAESTRO_GOLD,
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  timerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    margin: 20,
    backgroundColor: HOP_GREEN,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});