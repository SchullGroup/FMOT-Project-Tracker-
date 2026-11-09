import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OutboxProvider } from '@/outbox/OutboxProvider';
import { SessionProvider, useSession } from '@/session/session';
import { colour } from '@/theme';

void SplashScreen.preventAutoHideAsync();

/*
 * The screens a person can reach depend on where they are: first run, signed out, locked (a session is stored but
 * not yet opened with the PIN or fingerprint), or open. Anything else sends them to index, which picks the right home.
 */
function Routes() {
  const { status } = useSession();
  const [fontsLoaded, fontError] = useFonts({ Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold });
  const ready = (fontsLoaded || !!fontError) && status !== 'starting';

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colour.page } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === 'welcome'}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="permissions" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="invite" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'locked'}>
        <Stack.Screen name="unlock" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'open'}>
        <Stack.Screen name="biometric" />
        <Stack.Screen name="home" />
        <Stack.Screen name="capture" options={{ contentStyle: { backgroundColor: '#000' } }} />
        <Stack.Screen name="outbox" />
        <Stack.Screen name="sent-back" />
        <Stack.Screen name="re-home" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="report" />
        <Stack.Screen name="milestones" />
        <Stack.Screen name="incident" />
        <Stack.Screen name="not-for-you" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <OutboxProvider>
          <StatusBar style="dark" />
          <Routes />
        </OutboxProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
