import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

let isPlaying = false;
let vibrationInterval: NodeJS.Timeout | null = null;
let beepInterval: NodeJS.Timeout | null = null;

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

    // Start continuous strong vibration pattern
    startVibrationPattern();

    // Start beep sound pattern
    startBeepPattern();

  } catch (error) {
    console.log('Error starting alarm:', error);
    isPlaying = true;
  }
};

export const stopAlarm = async () => {
  if (!isPlaying) return;

  try {
    // Stop vibration
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      vibrationInterval = null;
    }

    // Stop beep pattern
    if (beepInterval) {
      clearInterval(beepInterval);
      beepInterval = null;
    }

    isPlaying = false;
  } catch (error) {
    console.log('Error stopping alarm:', error);
    isPlaying = false;
  }
};

const startVibrationPattern = () => {
  if (vibrationInterval) return;

  // Immediate strong vibration
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  // Aggressive vibration pattern: vibrate every 300ms for urgent alarm
  vibrationInterval = setInterval(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 300);
};

const startBeepPattern = () => {
  if (beepInterval) return;

  // Play system notification sound repeatedly
  const playBeep = async () => {
    try {
      // Use system notification sound - this is more reliable than custom audio
      const { sound } = await Audio.Sound.createAsync(
        // Use the platform's default notification sound
        { uri: 'system:notification' },
        { shouldPlay: true, volume: 1.0 }
      );

      // Clean up after playing
      setTimeout(async () => {
        try {
          await sound.unloadAsync();
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 1000);
    } catch (error) {
      // If system sound fails, just continue with vibration
    }
  };

  // Play initial beep
  playBeep();

  // Repeat beep every 1 second
  beepInterval = setInterval(playBeep, 1000);
};

export const isAlarmPlaying = () => isPlaying;