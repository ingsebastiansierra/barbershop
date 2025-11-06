/**
 * AddBarberScreen
 * Screen for adding a new barber to the barbershop
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../store/themeStore';
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { barberService } from '../../services/barber.service';
import { edgeFunctionsService } from '../../services/edge-functions.service';
import { supabase } from '../../supabase/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TimePicker } from '../../components/common/TimePicker';
import { AdminStackParamList } from '../../types/navigation';
import { BarberSchedule, TimeRange } from '../../types/models';
import { spacing, typography, borderRadius } from '../../styles/theme';
import { validateEmail, validatePhone } from '../../utils/validation';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export const AddBarberScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { data: barbershop, isLoading: barbershopLoading } = useAdminBarbershop();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [bio, setBio] = useState('');
  const [schedule, setSchedule] = useState<BarberSchedule>({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create barber mutation
  const createBarberMutation = useMutation({
    mutationFn: async () => {
      // Validate form
      const newErrors: Record<string, string> = {};

      if (!fullName.trim()) {
        newErrors.fullName = 'El nombre es requerido';
      }

      if (!email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!validateEmail(email)) {
        newErrors.email = 'Email inválido';
      }

      if (!password.trim()) {
        newErrors.password = 'La contraseña es requerida';
      } else if (password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (phone && !validatePhone(phone)) {
        newErrors.phone = 'Teléfono inválido';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Por favor corrige los errores en el formulario');
      }

      // Validate schedule
      if (!barberService.validateSchedule(schedule)) {
        throw new Error('El horario contiene errores. Verifica los horarios ingresados.');
      }

      // Validate schedule is within barbershop hours
      if (barbershop) {
        const isValid = validateScheduleWithinBarbershopHours(schedule, barbershop.opening_hours);
        if (!isValid) {
          throw new Error(
            'Los horarios del barbero deben estar dentro del horario de la barbería'
          );
        }
      }

      // Prepare specialties array
      const specialtiesArray = specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      try {
        // Try to create barber using Edge Function (recommended for production)
        // This allows creating users with confirmed emails without requiring email verification
        const result = await edgeFunctionsService.createBarber({
          email,
          password,
          full_name: fullName,
          phone: phone || undefined,
          specialties: specialtiesArray,
          bio: bio || undefined,
          schedule,
        });

        if (!result.success) {
          throw new Error(result.error || 'Error al crear barbero');
        }
      } catch (edgeFunctionError: any) {
        // Fallback: If Edge Function is not deployed, use signUp method
        console.log('Edge Function not available, using signUp fallback');

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || null,
              role: 'barber',
              barbershop_id: barbershop!.id,
            },
          },
        });

        if (authError) {
          throw new Error(`Error al crear usuario: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error('No se pudo crear el usuario');
        }

        // Create user profile
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone: phone || null,
          role: 'barber',
          barbershop_id: barbershop!.id,
        });

        if (userError && userError.code !== '23505') {
          throw new Error(`Error al crear perfil: ${userError.message}`);
        }

        // Create barber profile
        await barberService.createBarber({
          user_id: authData.user.id,
          barbershop_id: barbershop!.id,
          specialties: specialtiesArray,
          bio: bio || undefined,
          schedule,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      Alert.alert(
        'Éxito',
        'Barbero agregado correctamente.\n\nNOTA: Si la confirmación de email está activada en Supabase, el barbero deberá confirmar su email antes de iniciar sesión. Para desarrollo, puedes desactivar la confirmación en: Authentication → Settings → Email Auth',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'No se pudo agregar el barbero');
    },
  });

  const validateScheduleWithinBarbershopHours = (
    barberSchedule: BarberSchedule,
    barbershopHours: any
  ): boolean => {
    for (const day of DAYS) {
      const barberDay = barberSchedule[day.key];
      const barbershopDay = barbershopHours[day.key];

      if (barberDay && barberDay.length > 0) {
        if (!barbershopDay) {
          return false; // Barber has hours but barbershop is closed
        }

        for (const timeRange of barberDay) {
          if (
            timeRange.start < barbershopDay.open ||
            timeRange.end > barbershopDay.close
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleAddTimeRange = (day: keyof BarberSchedule) => {
    const currentRanges = schedule[day] || [];
    setSchedule({
      ...schedule,
      [day]: [...currentRanges, { start: '09:00', end: '18:00' }],
    });
  };

  const handleRemoveTimeRange = (day: keyof BarberSchedule, index: number) => {
    const currentRanges = schedule[day] || [];
    const newRanges = currentRanges.filter((_, i) => i !== index);
    setSchedule({
      ...schedule,
      [day]: newRanges.length > 0 ? newRanges : null,
    });
  };

  const handleUpdateTimeRange = (
    day: keyof BarberSchedule,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const currentRanges = schedule[day] || [];
    const newRanges = [...currentRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setSchedule({
      ...schedule,
      [day]: newRanges,
    });
  };

  const handleSubmit = () => {
    setErrors({});
    createBarberMutation.mutate();
  };

  if (barbershopLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.section} variant="outlined">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información básica
        </Text>

        <Input
          label="Nombre completo"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (errors.fullName) setErrors({ ...errors, fullName: '' });
          }}
          placeholder="Juan Pérez"
          error={errors.fullName}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          placeholder="juan@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Contraseña"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          error={errors.password}
        />

        <Input
          label="Teléfono (opcional)"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (errors.phone) setErrors({ ...errors, phone: '' });
          }}
          placeholder="+52 123 456 7890"
          keyboardType="phone-pad"
          error={errors.phone}
        />
      </Card>

      <Card style={styles.section} variant="outlined">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información profesional
        </Text>

        <Input
          label="Especialidades (separadas por comas)"
          value={specialties}
          onChangeText={setSpecialties}
          placeholder="Corte, Barba, Cejas"
          multiline
        />

        <Input
          label="Biografía (opcional)"
          value={bio}
          onChangeText={setBio}
          placeholder="Describe la experiencia y estilo del barbero"
          multiline
          numberOfLines={3}
        />
      </Card>

      <Card style={styles.section} variant="outlined">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Horario semanal
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Configura los horarios de trabajo del barbero
        </Text>

        {DAYS.map((day) => (
          <View key={day.key} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayLabel, { color: colors.textPrimary }]}>
                {day.label}
              </Text>
              <Button
                title="+ Agregar horario"
                onPress={() => handleAddTimeRange(day.key)}
                variant="ghost"
                size="sm"
              />
            </View>

            {schedule[day.key]?.map((timeRange, index) => (
              <View key={index} style={styles.timeRangeContainer}>
                <View style={styles.timePickerWrapper}>
                  <TimePicker
                    label="Inicio"
                    value={timeRange.start}
                    onTimeChange={(value) =>
                      handleUpdateTimeRange(day.key, index, 'start', value)
                    }
                  />
                </View>
                <Text style={[styles.timeSeparator, { color: colors.textSecondary }]}>
                  -
                </Text>
                <View style={styles.timePickerWrapper}>
                  <TimePicker
                    label="Fin"
                    value={timeRange.end}
                    onTimeChange={(value) =>
                      handleUpdateTimeRange(day.key, index, 'end', value)
                    }
                    minTime={timeRange.start}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveTimeRange(day.key, index)}
                  style={styles.removeButton}
                >
                  <Text style={[styles.removeButtonText, { color: colors.error }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {(!schedule[day.key] || schedule[day.key]?.length === 0) && (
              <Text style={[styles.noScheduleText, { color: colors.textSecondary }]}>
                Sin horarios configurados
              </Text>
            )}
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Cancelar"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Agregar barbero"
          onPress={handleSubmit}
          variant="primary"
          style={styles.actionButton}
          loading={createBarberMutation.isPending}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  dayContainer: {
    marginBottom: spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    ...typography.labelLarge,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  timePickerWrapper: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  removeButton: {
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  removeButtonText: {
    ...typography.h4,
  },
  noScheduleText: {
    ...typography.bodySmall,
    fontStyle: 'italic',
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
