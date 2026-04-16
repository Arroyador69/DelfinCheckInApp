import { Stack } from 'expo-router';

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="company" />
      <Stack.Screen name="mir" />
      <Stack.Screen name="properties" />
      <Stack.Screen name="country" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
