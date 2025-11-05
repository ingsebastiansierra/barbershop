/**
 * ResetPasswordScreen
 * Screen for resetting password after clicking email link
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { supabase } from '../../supabase/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión de recuperación activa
    checkRecoverySession();
  }, []);

  const checkRecoverySession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert(
          'Sesión Expirada',
          'El enlace de recuperación ha expirado. Por favor solicita uno nuevo.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ForgotPassword'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setIsLoading(true);

      // Actualizar la contraseña usando el método de Supabase
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      // Cerrar sesión después de cambiar la contraseña
      await supabase.auth.signOut();
      
      Alert.alert(
        '✅ Contraseña Actualizada',
        'Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error actualizando contraseña:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo actualizar la contraseña. Por favor intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.iconText}>🔑</Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Nueva Contraseña
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ingresa tu nueva contraseña (mínimo 6 caracteres)
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Nueva contraseña"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Confirmar contraseña"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {password.length > 0 && password.length < 6 && (
            <Text style={[styles.warningText, { color: colors.error }]}>
              ⚠️ La contraseña debe tener al menos 6 caracteres
            </Text>
          )}

          {password.length >= 6 && confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={[styles.warningText, { color: colors.error }]}>
              ⚠️ Las contraseñas no coinciden
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              (isLoading || password.length < 6 || password !== confirmPassword) && styles.buttonDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={isLoading || password.length < 6 || password !== confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>✅ Actualizar Contraseña</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              ← Volver al inicio de sesión
            </Text>
          </TouchableOpacity>

          <View style={[styles.infoBox, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              💡 Después de cambiar tu contraseña, podrás iniciar sesión con tu nueva contraseña.
            </Text>
          </View>
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
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 24,
  },
  warningText: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: -8,
    paddingHorizontal: 4,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
