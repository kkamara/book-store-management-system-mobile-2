import { palette } from '@/components/store/StoreUI';
import { useAccounts } from '@/providers/StorefrontProvider';
import { isCustomErrorResponse } from '@/typeHandlers';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { authorise, setIsAuth } = useAccounts();

  useEffect(() => {
    let active = true;
    void authorise().then(result => {
      if (active) setIsAuth(!isCustomErrorResponse(result));
    });
    return () => { active = false; };
  }, []);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.paper }}>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.ink,
          tabBarInactiveTintColor: palette.muted,
          tabBarStyle: { backgroundColor: palette.white, borderTopColor: palette.line, height: 64, paddingTop: 6, paddingBottom: 8 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }
      }>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
