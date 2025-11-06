/**
 * RootNavigator
 * Main navigation component that determines which navigator to show based on authentication and user role
 */

import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { ClientNavigator } from './ClientNavigator';
import { BarberNavigator } from './BarberNavigator';
import { AdminNavigator } from './AdminNavigator';
import { SuperAdminNavigator } from './SuperAdminNavigator';
import { useThemeStore } from '../store/themeStore';
import { supabase } from '../supabase/client';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const { colors, theme } = useThemeStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    // Escuchar eventos de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        // Cuando el usuario hace clic en el enlace de recuperación
        console.log('Password recovery event detected');
        
        // Navegar a la pantalla de reset password
        if (navigationRef.current?.isReady()) {
          navigationRef.current.navigate('Auth', {
            screen: 'ResetPassword',
          } as any);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Determine which navigator to show based on authentication and role
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!isAuthenticated || !user) {
      return 'Auth';
    }

    // Get role from either 'role' or 'rol' field for compatibility
    const userRole = user.role || user.rol;

    // Route based on user role
    switch (userRole) {
      case 'client':
      case 'cliente':
        return 'Client';
      case 'barber':
      case 'barbero':
        return 'Barber';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'SuperAdmin';
      default:
        // Default to client if role is not recognized
        console.warn('Unknown user role:', userRole);
        return 'Client';
    }
  };

  const linking = {
    prefixes: [
      'com.barbershop.manager://',
      'https://barbershop-manager.com',
      'exp://192.168.1.1:8081', // Para desarrollo con Expo
    ],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            Register: 'register',
            ForgotPassword: 'forgot-password',
            ResetPassword: {
              path: 'reset-password',
              parse: {
                access_token: (token: string) => token,
                refresh_token: (token: string) => token,
                type: (type: string) => type,
              },
            },
            VerifyEmail: 'verify-email',
          },
        },
      },
    },
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      theme={{
        dark: theme === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isAuthenticated || !user ? (
          // Show auth navigator if not authenticated
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Show appropriate navigator based on user role
          <>
            {((user.role || user.rol) === 'client' || (user.role || user.rol) === 'cliente') && (
              <Stack.Screen name="Client" component={ClientNavigator} />
            )}
            {((user.role || user.rol) === 'barber' || (user.role || user.rol) === 'barbero') && (
              <Stack.Screen name="Barber" component={BarberNavigator} />
            )}
            {(user.role || user.rol) === 'admin' && (
              <Stack.Screen name="Admin" component={AdminNavigator} />
            )}
            {(user.role || user.rol) === 'super_admin' && (
              <Stack.Screen name="Admin" component={SuperAdminNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
