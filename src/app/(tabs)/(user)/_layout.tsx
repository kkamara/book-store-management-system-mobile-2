import React from 'react';
import { Tabs, } from "expo-router";

export default function UserLayout() {
  return <Tabs backBehavior="history" screenOptions={{ tabBarStyle: { display: 'none', }, }}>
    <Tabs.Screen
      name="index"
      options={{
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="settings"
      options={{
        headerShown: false,
      }}
    />
  </Tabs>;
}
