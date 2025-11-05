/**
 * AuthNavigator
 * Navigation stack for authentication screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { useThemeStore } from '../store/themeStore';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
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
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Registro',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Recuperar Contraseña',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
        options={{
          title: 'Verificar Email',
          headerBackTitle: 'Atrás',
          headerLeft: () => null, // Prevent going back
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: 'Restablecer Contraseña',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};
