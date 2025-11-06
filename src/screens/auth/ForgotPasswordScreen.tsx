/**
 * ForgotPasswordScreen
 * Complete password recovery flow within the app
 */

import React, { useState } from 'react';
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
import { showToast } from '../../utils/toast';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      showToast.error('Por favor ingresa tu email', 'Campo requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast.error('Por favor ingresa un email válido', 'Email inválido');
      return;
    }

    try {
      setIsLoading(true);
      showToast.loading('Enviando email de recuperación...');

      // Enviar email de recuperación
      // Para desarrollo, no especificamos redirectTo y manejamos el reset en la app
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim()
      );

      if (error) {
        console.error('Error enviando email:', error);
        showToast.error('No se pudo enviar el email de recuperación', 'Error');
        return;
      }

      showToast.success(
        `Hemos enviado un enlace de recuperación a ${email}. Revisa tu correo (incluyendo spam).`,
        '📧 Email enviado'
      );
      
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error: any) {
      console.error('Error en recuperación:', error);
      showToast.error('Ocurrió un error al enviar el email', 'Error');
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
            <Text style={styles.iconText}>🔒</Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            🔒 ¿Olvidaste tu contraseña?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ingresa tu email y te enviaremos un enlace para recuperar tu cuenta
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="tu@email.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSendResetEmail}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>📧 Enviar Email de Recuperación</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              ← Volver al inicio de sesión
            </Text>
          </TouchableOpacity>

          <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
              📋 Cómo funciona:
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              1. Ingresa tu email{'\n'}
              2. Recibirás un email con un enlace{'\n'}
              3. Haz clic en el enlace{'\n'}
              4. La app se abrirá automáticamente{'\n'}
              5. Ingresa tu nueva contraseña
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
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
