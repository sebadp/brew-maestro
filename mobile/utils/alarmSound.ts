import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

let isPlaying = false;
let vibrationInterval: NodeJS.Timeout | null = null;
let sound: Audio.Sound | null = null;

export const startAlarm = async () => {
  if (isPlaying) return;

  try {
    // Configure audio to play even in silent mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    isPlaying = true;

    // Start alarm sound
    await startAlarmSound();

    // Start aggressive vibration pattern for urgent alarm
    startVibrationPattern();

  } catch (error) {
    console.log('Error starting alarm:', error);
    // If audio fails, at least start vibration
    startVibrationPattern();
    isPlaying = true;
  }
};

export const stopAlarm = async () => {
  if (!isPlaying) return;

  try {
    // Stop sound
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }

    // Stop vibration
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      vibrationInterval = null;
    }

    isPlaying = false;
  } catch (error) {
    console.log('Error stopping alarm:', error);
    isPlaying = false;
  }
};

const startAlarmSound = async () => {
  try {
    // Create alarm sound from data URI
    const alarmSoundUri = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+L0u2ccBDqO1/LNeSsFJHfH8N2QQAoUXrTp66hVFA==";

    const { sound: alarmSound } = await Audio.Sound.createAsync(
      { uri: alarmSoundUri },
      {
        shouldPlay: true,
        isLooping: true,
        volume: 1.0,
      }
    );

    sound = alarmSound;
  } catch (error) {
    console.log('Failed to load alarm sound, continuing with vibration only:', error);
  }
};

const startVibrationPattern = () => {
  if (vibrationInterval) return;

  // Create an urgent alarm pattern with different intensities
  const vibrationPattern = [
    Haptics.ImpactFeedbackStyle.Heavy,
    Haptics.ImpactFeedbackStyle.Heavy,
    Haptics.ImpactFeedbackStyle.Medium,
    Haptics.ImpactFeedbackStyle.Heavy,
    Haptics.ImpactFeedbackStyle.Heavy,
  ];

  let patternIndex = 0;

  // Immediate strong vibration
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  // Aggressive vibration pattern: cycle through different intensities
  vibrationInterval = setInterval(() => {
    Haptics.impactAsync(vibrationPattern[patternIndex]);
    patternIndex = (patternIndex + 1) % vibrationPattern.length;
  }, 250); // Very frequent vibrations for maximum urgency
};

export const isAlarmPlaying = () => isPlaying;