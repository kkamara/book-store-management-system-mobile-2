import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ColorValue,
  Pressable,
  StyleSheet,
} from 'react-native';

import Loading from "@/components/Loading";
import { View } from "@/components/Themed";
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAccounts } from '@/providers/AccountsProvider';
import { isCustomErrorResponse } from "@/typeHandlers";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: ColorValue;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = 'dark' === colorScheme ? 'dark' : 'light';

  const {
    logout,
    isAuth,
    setIsAuth,
    authorise,
  } = useAccounts();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getAuthStatus() {
      setLoading(true);
      try {
        const authoriseRes = await authorise();
        if (true === isCustomErrorResponse(authoriseRes)) {
          await logout();
          setIsAuth(false);
        } else {
          setIsAuth(true);
        }
      } finally {
        setLoading(false);
      }
    }
    getAuthStatus();
  }, [isAuth]);

  if (loading) {
    return <View style={styles.container}>
      <Loading/>
    </View>;
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[theme].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="(auth)"
        options={{
          title: 'Sign In',
          href: false === isAuth ? '/(tabs)/(auth)/authButtons' : null,
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="sign-in" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(user)"
        options={{
          title: 'User',
          href: true === isAuth ? '/(tabs)/(user)' : null,
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
