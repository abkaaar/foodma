import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarStyle: Platform.select({
        ios: {
        position: 'absolute',           
        backgroundColor: 'transparent',
        borderRadius: 15,
        height: 50,
        paddingBottom: 5,
        paddingTop: 5,
      },
        default: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        elevation: 4,
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        borderRadius: 15,
        height: 50,
        },
      }),
      }}>
      <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
      }}
      />

      <Tabs.Screen
      name="map"
      options={{
        title: 'Map',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="location.fill" color={color} />,
      }}
      />

    <Tabs.Screen
      name="media"
      options={{
        title: 'Media',
        tabBarIcon: ({ color }) => <IconSymbol size={38} name="plus.app.fill" color={color} />,
        tabBarLabel: () => null,
      
      }}
      />
      <Tabs.Screen
      name="messages"
      options={{
        title: 'Messages',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.badge.fill" color={color} />,
      }}
      />
      <Tabs.Screen
      name="profile"
      options={{
        title: 'Me',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
      }}
      />
    </Tabs>
    
  );
}
