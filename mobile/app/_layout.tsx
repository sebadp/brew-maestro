import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe Details' }} />
        <Stack.Screen name="recipe/new" options={{ title: 'New Recipe' }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
