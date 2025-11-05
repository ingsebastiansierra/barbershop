/**
 * VerifyEmailScreen
 * Screen shown after registration to prompt email verification
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/common/Button';
import { useThemeStore } from '../../store/themeStore';
import { typography, spacing } from '../../styles/theme';

type VerifyEmailScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'VerifyEmail'
>;

type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

interface Props {
  navigation: VerifyEmailScreenNavigationProp;
  route: VerifyEmailScreenRouteProp;
}

export const VerifyEmailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useThemeStore();
  const { email } = route.params;

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.iconText}>✉️</Text>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Verifica tu Email
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Hemos enviado un email de verificación a:
        </Text>

        <Text style={[styles.email, { color: colors.primary }]}>
          {email}
        </Text>

        <Text style={[styles.instructions, { color: colors.textSecondary }]}>
          Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
        </Text>

        <View style={styles.note}>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            💡 Si no ves el email, revisa tu carpeta de spam o correo no deseado.
          </Text>
        </View>

        <Button
          title="Ir a Iniciar Sesión"
          onPress={handleGoToLogin}
          fullWidth
        />

        <TouchableOpacity
          onPress={handleGoToLogin}
          style={styles.backLink}
        >
          <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyLarge,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  email: {
    ...typography.labelLarge,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  instructions: {
    ...typography.bodyMedium,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  note: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  noteText: {
    ...typography.bodySmall,
    textAlign: 'center',
    lineHeight: 18,
  },
  backLink: {
    marginTop: spacing.md,
  },
  backLinkText: {
    ...typography.bodyMedium,
  },
});
