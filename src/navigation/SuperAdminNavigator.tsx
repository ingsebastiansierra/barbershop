/**
 * SuperAdminNavigator
 * Navigation structure for super admin users with tabs and stack
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SuperAdminTabParamList, SuperAdminStackParamList } from '../types/navigation';
import { useThemeStore } from '../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

// Tab Screens
import { SuperAdminDashboardScreen } from '../screens/superadmin/SuperAdminDashboardScreen';
import { BarbershopsManagementScreen } from '../screens/superadmin/BarbershopsManagementScreen';
import { UsersManagementScreen } from '../screens/superadmin/UsersManagementScreen';
import { SuperAdminStatisticsScreen } from '../screens/superadmin/SuperAdminStatisticsScreen';
import { GlobalSettingsScreen } from '../screens/superadmin/GlobalSettingsScreen';

// Stack Screens
import { AddBarbershopScreen } from '../screens/superadmin/AddBarbershopScreen';
import { EditBarbershopScreen } from '../screens/superadmin/EditBarbershopScreen';
import { SuperAdminBarbershopDetailScreen } from '../screens/superadmin/SuperAdminBarbershopDetailScreen';
import { UserManagementScreen } from '../screens/superadmin/UserManagementScreen';

const Tab = createBottomTabNavigator<SuperAdminTabParamList>();
const Stack = createNativeStackNavigator<SuperAdminStackParamList>();

/**
 * Tab Navigator for Super Admin
 */
const SuperAdminTabs: React.FC = () => {
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
        name="Dashboard"
        component={SuperAdminDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Barbershops"
        component={BarbershopsManagementScreen}
        options={{
          title: 'Barberías',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={UsersManagementScreen}
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={SuperAdminStatisticsScreen}
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={GlobalSettingsScreen}
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main Super Admin Navigator with Stack
 */
export const SuperAdminNavigator: React.FC = () => {
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
        name="SuperAdminTabs"
        component={SuperAdminTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddBarbershop"
        component={AddBarbershopScreen}
        options={{
          title: 'Agregar Barbería',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="EditBarbershop"
        component={EditBarbershopScreen}
        options={{
          title: 'Editar Barbería',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="BarbershopDetail"
        component={SuperAdminBarbershopDetailScreen}
        options={{
          title: 'Detalles de Barbería',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          title: 'Gestión de Usuarios',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="GlobalSettings"
        component={GlobalSettingsScreen}
        options={{
          title: 'Configuración Global',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};
