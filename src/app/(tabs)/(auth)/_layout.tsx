import React from 'react';
import { Tabs, } from "expo-router";

export default function AuthLayout() {
  return <Tabs backBehavior="history" screenOptions={{ tabBarStyle: { display: 'none', }, }}>
    <Tabs.Screen
      name="authButtons"
      options={{
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="login"
      options={{
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name="register"
      options={{
        headerShown: false,
      }}
    />
  </Tabs>;
}