import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe Details' }} />
        <Stack.Screen name="recipe/new" options={{ title: 'New Recipe' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}