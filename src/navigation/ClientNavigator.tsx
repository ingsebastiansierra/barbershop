/**
 * ClientNavigator
 * Navigation structure for client users with tabs and stack
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientTabParamList, ClientStackParamList } from '../types/navigation';
import { useThemeStore } from '../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedTabBar } from '../components/common';

// Tab Screens
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';
import { SearchScreen } from '../screens/client/SearchScreen';
import { ClientShortsScreen } from '../screens/client/ClientShortsScreen';
import { ClientAppointmentsScreen } from '../screens/client/ClientAppointmentsScreen';
import { ClientProfileScreen } from '../screens/client/ClientProfileScreen';

// Stack Screens
import { BarbershopDetailScreen } from '../screens/client/BarbershopDetailScreen';
import { BarberDetailScreen } from '../screens/client/BarberDetailScreen';
import { BookAppointmentScreen } from '../screens/client/BookAppointmentScreen';
import { AppointmentDetailScreen } from '../screens/client/AppointmentDetailScreen';
import { NotificationsScreen } from '../screens/client/NotificationsScreen';
import { HistoryScreen } from '../screens/client/HistoryScreen';

// Chat Screens
import { ConversationsScreen, ChatScreen } from '../screens/common';

const Tab = createBottomTabNavigator<ClientTabParamList>();
const Stack = createNativeStackNavigator<ClientStackParamList>();

/**
 * Tab Navigator for Client
 */
const ClientTabs: React.FC = () => {
  const { colors } = useThemeStore();
  const [tabBarVisible, setTabBarVisible] = React.useState(true);

  return (
    <Tab.Navigator
      tabBar={(props) => tabBarVisible ? <AnimatedTabBar {...props} /> : null}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
      screenListeners={{
        state: (e) => {
          const state = e.data.state;
          const currentRoute = state.routes[state.index];
          setTabBarVisible(currentRoute.name !== 'Shorts');
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ClientHomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shorts"
        component={ClientShortsScreen}
        options={{
          title: 'Shorts',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={ClientAppointmentsScreen}
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
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
 * Main Client Navigator with Stack
 */
export const ClientNavigator: React.FC = () => {
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
        name="ClientTabs"
        component={ClientTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BarbershopDetail"
        component={BarbershopDetailScreen}
        options={{
          title: 'Detalles de Barbería',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="BarberDetail"
        component={BarberDetailScreen}
        options={{
          title: 'Detalles del Barbero',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{
          title: 'Agendar Cita',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{
          title: 'Detalles de Cita',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notificaciones',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Historial',
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
