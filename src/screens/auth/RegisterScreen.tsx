/**
 * RegisterScreen
 * Screen for user registration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useThemeStore } from '../../store/themeStore';
import { typography, spacing } from '../../styles/theme';
import { validateEmail, validatePassword, getPasswordError, validatePhone } from '../../utils/validation';
import { supabase } from '../../supabase/client';
import { barberService } from '../../services/barber.service';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const { register, isLoading } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'barber'>('client');
  const [selectedBarbershopId, setSelectedBarbershopId] = useState<string>('');
  const [barbershops, setBarbershops] = useState<Array<{ id: string; name: string }>>([]);

  const [nombreError, setNombreError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [telefonoError, setTelefonoError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [barbershopError, setBarbershopError] = useState<string>();
  const [loadingBarbershops, setLoadingBarbershops] = useState(false);

  // Load barbershops when user selects barber type
  useEffect(() => {
    if (userType === 'barber') {
      loadBarbershops();
    }
  }, [userType]);

  const loadBarbershops = async () => {
    try {
      setLoadingBarbershops(true);
      const { data, error } = await supabase
        .from('barbershops')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setBarbershops(data || []);
    } catch (error) {
      console.error('Error loading barbershops:', error);
      Alert.alert('Error', 'No se pudieron cargar las barberías');
    } finally {
      setLoadingBarbershops(false);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate nombre
    if (!nombre.trim()) {
      setNombreError('El nombre completo es requerido');
      isValid = false;
    } else if (nombre.trim().length < 3) {
      setNombreError('El nombre debe tener al menos 3 caracteres');
      isValid = false;
    } else {
      setNombreError(undefined);
    }

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

    // Validate telefono
    if (!telefono.trim()) {
      setTelefonoError('El teléfono es requerido');
      isValid = false;
    } else if (!validatePhone(telefono)) {
      setTelefonoError('Ingresa un teléfono válido (10 dígitos)');
      isValid = false;
    } else {
      setTelefonoError(undefined);
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (!validatePassword(password)) {
      const error = getPasswordError(password);
      setPasswordError(error || 'La contraseña no cumple los requisitos');
      isValid = false;
    } else {
      setPasswordError(undefined);
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirma tu contraseña');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      isValid = false;
    } else {
      setConfirmPasswordError(undefined);
    }

    // Validate barbershop selection if user is barber
    if (userType === 'barber') {
      if (!selectedBarbershopId) {
        setBarbershopError('Selecciona una barbería');
        isValid = false;
      } else {
        setBarbershopError(undefined);
      }
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (userType === 'client') {
        // Register as client (normal flow)
        await register(email.trim(), password, nombre.trim(), telefono.trim());
        
        Alert.alert(
          'Registro exitoso',
          'Se ha enviado un email de verificación a tu correo. Por favor verifica tu cuenta antes de iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('VerifyEmail', { email: email.trim() }),
            },
          ]
        );
      } else {
        // Register as barber with pending status
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: nombre.trim(),
              phone: telefono.trim(),
              role: 'barber',
              barbershop_id: selectedBarbershopId,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No se pudo crear el usuario');

        // Wait a moment for auth to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create user profile using service role via RPC function
        const { error: profileError } = await supabase.rpc('create_barber_profile', {
          p_user_id: authData.user.id,
          p_email: email.trim(),
          p_full_name: nombre.trim(),
          p_phone: telefono.trim(),
          p_barbershop_id: selectedBarbershopId,
        });

        if (profileError) {
          console.error('Error creating barber profile:', profileError);
          // Don't throw error, the trigger might have created it
        }

        Alert.alert(
          '¡Solicitud Enviada!',
          'Tu solicitud para trabajar como barbero ha sido enviada. El administrador de la barbería la revisará pronto.\n\nRecibirás una notificación cuando sea aprobada.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error al registrarse',
        error.message || 'No se pudo completar el registro. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
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
            Crear Cuenta
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Completa tus datos para registrarte
          </Text>
        </View>

        <View style={styles.form}>
          {/* User Type Selector */}
          <View style={styles.selectorContainer}>
            <Text style={[styles.selectorLabel, { color: colors.textPrimary }]}>
              ¿Cómo te quieres registrar?
            </Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: userType === 'client' ? colors.primary : colors.surface,
                    borderColor: userType === 'client' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setUserType('client')}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: userType === 'client' ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  👤 Cliente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: userType === 'barber' ? colors.primary : colors.surface,
                    borderColor: userType === 'barber' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setUserType('barber')}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: userType === 'barber' ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  ✂️ Barbero
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Barbershop Selector (only for barbers) */}
          {userType === 'barber' && (
            <View style={styles.barbershopSelector}>
              <Text style={[styles.selectorLabel, { color: colors.textPrimary }]}>
                Selecciona la barbería
              </Text>
              {loadingBarbershops ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <ScrollView
                  style={styles.barbershopList}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {barbershops.map((barbershop) => (
                    <TouchableOpacity
                      key={barbershop.id}
                      style={[
                        styles.barbershopItem,
                        {
                          backgroundColor:
                            selectedBarbershopId === barbershop.id
                              ? colors.primary + '20'
                              : colors.surface,
                          borderColor:
                            selectedBarbershopId === barbershop.id
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedBarbershopId(barbershop.id);
                        setBarbershopError(undefined);
                      }}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.barbershopName,
                          {
                            color:
                              selectedBarbershopId === barbershop.id
                                ? colors.primary
                                : colors.textPrimary,
                          },
                        ]}
                      >
                        {barbershop.name}
                      </Text>
                      {selectedBarbershopId === barbershop.id && (
                        <Text style={{ color: colors.primary }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {barbershopError && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {barbershopError}
                </Text>
              )}
            </View>
          )}

          <Input
            label="Nombre Completo"
            value={nombre}
            onChangeText={(text) => {
              setNombre(text);
              setNombreError(undefined);
            }}
            placeholder="Juan Pérez"
            error={nombreError}
            editable={!isLoading}
          />

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
            label="Teléfono"
            value={telefono}
            onChangeText={(text) => {
              setTelefono(text);
              setTelefonoError(undefined);
            }}
            placeholder="1234567890"
            keyboardType="phone-pad"
            error={telefonoError}
            editable={!isLoading}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (text.length > 0) {
                setPasswordError(getPasswordError(text));
              } else {
                setPasswordError(undefined);
              }
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

          <View style={styles.passwordRequirements}>
            <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
              La contraseña debe contener:
            </Text>
            <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
              • Al menos 8 caracteres
            </Text>
            <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
              • Una letra mayúscula
            </Text>
            <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
              • Una letra minúscula
            </Text>
            <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
              • Un número
            </Text>
          </View>

          <Input
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError(undefined);
            }}
            placeholder="••••••••"
            secureTextEntry={!showConfirmPassword}
            error={confirmPasswordError}
            editable={!isLoading}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={{ color: colors.primary }}>
                  {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              </TouchableOpacity>
            }
          />

          <Button
            title="Registrarse"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ¿Ya tienes una cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              Inicia Sesión
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
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  passwordRequirements: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  requirementText: {
    ...typography.bodySmall,
    marginBottom: spacing.xs / 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodyMedium,
  },
  loginLink: {
    ...typography.labelLarge,
  },
  selectorContainer: {
    marginBottom: spacing.lg,
  },
  selectorLabel: {
    ...typography.labelLarge,
    marginBottom: spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  barbershopSelector: {
    marginBottom: spacing.lg,
  },
  barbershopList: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  barbershopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  barbershopName: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  errorText: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
});
