import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { palette } from '@/components/store/StoreUI';
import { useColorScheme } from '@/components/useColorScheme';
import AccountsProvider from '@/providers/AccountsProvider';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AccountsProvider>
       <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerTintColor: palette.ink, contentStyle: { backgroundColor: palette.paper } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="book/[slug]" options={{ title: 'Book details' }} />
          <Stack.Screen name="order/[referenceNumber]" options={{ title: 'Order details' }} />
          <Stack.Screen name="login" options={{ title: 'Welcome back' }} />
          <Stack.Screen name="register" options={{ title: 'Create account' }} />
          <Stack.Screen
            name="modal"
            options={{
              title: 'Modal',
              presentation: 'modal',
            }}
          />
        </Stack>
       </PaperProvider>
      </AccountsProvider>
    </ThemeProvider>
  );
}
