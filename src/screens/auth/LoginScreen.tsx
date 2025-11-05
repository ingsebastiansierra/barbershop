/**
 * LoginScreen
 * Screen for user authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useThemeStore } from '../../store/themeStore';
import { typography, spacing } from '../../styles/theme';
import { validateEmail } from '../../utils/validation';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError('El email es requerido');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Ingresa un email válido');
      isValid = false;
    } else {
      setEmailError(undefined);
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else {
      setPasswordError(undefined);
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      showToast.loading('Iniciando sesión...');
      await login(email.trim(), password);
      showToast.success('¡Bienvenido de nuevo!', '✅ Inicio de sesión exitoso');
      // Navigation is handled by RootNavigator based on auth state
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Verifica tus credenciales e intenta nuevamente';
      let errorTitle = 'Error al iniciar sesión';
      
      if (error.message) {
        if (error.message.includes('Failed to get user after login')) {
          errorMessage = 'Error al obtener datos del usuario. Por favor contacta al administrador.';
          errorTitle = 'Error del sistema';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos';
          errorTitle = 'Credenciales inválidas';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor verifica tu email antes de iniciar sesión';
          errorTitle = 'Email no verificado';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast.error(errorMessage, errorTitle);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Bienvenido
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Inicia sesión para continuar
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(undefined);
            }}
            placeholder="tu@email.com"
            keyboardType="email-address"
            error={emailError}
            editable={!isLoading}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(undefined);
            }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            error={passwordError}
            editable={!isLoading}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ color: colors.primary }}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
            disabled={isLoading}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ¿No tienes una cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>
              Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.bodyMedium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodyMedium,
  },
  registerLink: {
    ...typography.labelLarge,
  },
});
