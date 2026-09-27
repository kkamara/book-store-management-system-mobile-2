import { Stack } from 'expo-router';
import { DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { palette } from '@/components/store/StoreUI';
import StorefrontProvider from '@/providers/StorefrontProvider';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

export { ErrorBoundary } from 'expo-router';

// Keep the native splash screen visible until the root layout mounts.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: palette.ink,
      secondary: palette.orange,
      background: palette.paper,
      surface: palette.white,
      onSurface: palette.ink,
    },
  };

  return (
    <ThemeProvider value={DefaultTheme}>
      <StorefrontProvider>
       <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerTintColor: palette.ink, contentStyle: { backgroundColor: palette.paper } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="book/[slug]" options={{ title: 'Book details' }} />
          <Stack.Screen name="order/[referenceNumber]" options={{ title: 'Order details' }} />
          <Stack.Screen name="login" options={{ title: 'Welcome back' }} />
          <Stack.Screen name="register" options={{ title: 'Create account' }} />
        </Stack>
       </PaperProvider>
      </StorefrontProvider>
    </ThemeProvider>
  );
}
