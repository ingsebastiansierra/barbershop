/**
 * BarberNavigator
 * Navigation structure for barber users with tabs and stack
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BarberTabParamList, BarberStackParamList } from '../types/navigation';
import { useThemeStore } from '../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

// Tab Screens
import { BarberScheduleScreen } from '../screens/barber/BarberScheduleScreen';
import { BarberAppointmentsScreen } from '../screens/barber/BarberAppointmentsScreen';
import { BarberHistoryScreen } from '../screens/barber/BarberHistoryScreen';
import { BarberProfileScreen } from '../screens/barber/BarberProfileScreen';

// Stack Screens
import { BarberAppointmentDetailScreen } from '../screens/barber/BarberAppointmentDetailScreen';
import { ClientProfileScreen } from '../screens/barber/ClientProfileScreen';
import { BarberNotificationsScreen } from '../screens/barber/BarberNotificationsScreen';

const Tab = createBottomTabNavigator<BarberTabParamList>();
const Stack = createNativeStackNavigator<BarberStackParamList>();

/**
 * Tab Navigator for Barber
 */
const BarberTabs: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Schedule"
        component={BarberScheduleScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={BarberAppointmentsScreen}
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={BarberHistoryScreen}
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={BarberProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main Barber Navigator with Stack
 */
export const BarberNavigator: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="BarberTabs"
        component={BarberTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={BarberAppointmentDetailScreen}
        options={{
          title: 'Detalles de Cita',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="ClientProfile"
        component={ClientProfileScreen}
        options={{
          title: 'Perfil del Cliente',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={BarberNotificationsScreen}
        options={{
          title: 'Notificaciones',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};
