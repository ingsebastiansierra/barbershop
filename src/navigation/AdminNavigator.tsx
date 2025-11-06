/**
 * AdminNavigator
 * Navigation structure for barbershop admin users with tabs and stack
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminTabParamList, AdminStackParamList } from '../types/navigation';
import { useThemeStore } from '../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedTabBar } from '../components/common';

// Tab Screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminAppointmentsScreen } from '../screens/admin/AdminAppointmentsScreen';
import { BarbersManagementScreen } from '../screens/admin/BarbersManagementScreen';
import { ServicesManagementScreen } from '../screens/admin/ServicesManagementScreen';
import { AdminProfileScreen } from '../screens/admin/AdminProfileScreen';

// Stack Screens
import { BarbershopSettingsScreen } from '../screens/admin/BarbershopSettingsScreen';
import { BarberRequestsScreen } from '../screens/admin/BarberRequestsScreen';
import { AddBarberScreen } from '../screens/admin/AddBarberScreen';
import { EditBarberScreen } from '../screens/admin/EditBarberScreen';
import { AddServiceScreen } from '../screens/admin/AddServiceScreen';
import { EditServiceScreen } from '../screens/admin/EditServiceScreen';
import { AdminAppointmentDetailScreen } from '../screens/admin/AdminAppointmentDetailScreen';
import { StatisticsScreen } from '../screens/admin/StatisticsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

/**
 * Tab Navigator for Admin
 */
const AdminTabs: React.FC = () => {
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
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AdminAppointmentsScreen}
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Barbers"
        component={BarbersManagementScreen}
        options={{
          title: 'Barberos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={BarberRequestsScreen}
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesManagementScreen}
        options={{
          title: 'Servicios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cut" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AdminProfileScreen}
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
 * Main Admin Navigator with Stack
 */
export const AdminNavigator: React.FC = () => {
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
        name="AdminTabs"
        component={AdminTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BarbershopSettings"
        component={BarbershopSettingsScreen}
        options={{
          title: 'Configuración',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="AddBarber"
        component={AddBarberScreen}
        options={{
          title: 'Agregar Barbero',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="EditBarber"
        component={EditBarberScreen}
        options={{
          title: 'Editar Barbero',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{
          title: 'Agregar Servicio',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="EditService"
        component={EditServiceScreen}
        options={{
          title: 'Editar Servicio',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={AdminAppointmentDetailScreen}
        options={{
          title: 'Detalles de Cita',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'Estadísticas',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};
