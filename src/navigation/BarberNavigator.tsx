/**
 * BarberNavigator
 * Navigation structure for barber users with tabs and stack
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BarberTabParamList, BarberStackParamList } from '../types/navigation';
import { useThemeStore } from '../store/themeStore';
import { useBarberStatus } from '../hooks/useBarberStatus';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedTabBar } from '../components/common';

// Tab Screens
import { BarberScheduleScreen } from '../screens/barber/BarberScheduleScreen';
import { BarberAppointmentsScreen } from '../screens/barber/BarberAppointmentsScreen';
import { BarberSalesScreen } from '../screens/barber/BarberSalesScreen';
import { BarberHistoryScreen } from '../screens/barber/BarberHistoryScreen';
import { BarberProfileScreen } from '../screens/barber/BarberProfileScreen';

// Stack Screens
import { BarberAppointmentDetailScreen } from '../screens/barber/BarberAppointmentDetailScreen';
import { ClientProfileScreen } from '../screens/barber/ClientProfileScreen';
import { BarberNotificationsScreen } from '../screens/barber/BarberNotificationsScreen';
import { BarberPendingScreen } from '../screens/barber/BarberPendingScreen';
import { BarberShortsScreen } from '../screens/barber/BarberShortsScreen';
import { UploadShortScreen } from '../screens/barber/UploadShortScreen';
import { ShortDetailScreen } from '../screens/barber/ShortDetailScreen';

// Chat Screens
import { ConversationsScreen, ChatScreen } from '../screens/common';

const Tab = createBottomTabNavigator<BarberTabParamList>();
const Stack = createNativeStackNavigator<BarberStackParamList>();

/**
 * Tab Navigator for Barber
 */
const BarberTabs: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
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
        name="Sales"
        component={BarberSalesScreen}
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shorts"
        component={BarberShortsScreen}
        options={{
          title: 'Shorts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
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
  const { data: barberStatus, isLoading } = useBarberStatus();

  // Show loading while checking barber status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If barber is not approved, show pending screen
  if (barberStatus && barberStatus.approval_status !== 'approved') {
    return (
      <BarberPendingScreen
        approvalStatus={barberStatus.approval_status}
        rejectionReason={barberStatus.rejection_reason}
        barbershopName={barberStatus.barbershop_name}
      />
    );
  }

  // If approved, show normal navigation
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
      <Stack.Screen
        name="UploadShort"
        component={UploadShortScreen}
        options={{
          title: 'Subir Short',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="ShortDetail"
        component={ShortDetailScreen}
        options={{
          title: 'Detalle del Short',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: true,
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};
