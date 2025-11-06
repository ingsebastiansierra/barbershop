/**
 * EditBarberScreen
 * Screen for editing an existing barber's information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../store/themeStore';
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { barberService } from '../../services/barber.service';
import { supabase } from '../../supabase/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { TimePicker } from '../../components/common/TimePicker';
import { AdminStackParamList } from '../../types/navigation';
import { BarberSchedule } from '../../types/models';
import { spacing, typography } from '../../styles/theme';
import { validatePhone } from '../../utils/validation';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;
type RoutePropType = RouteProp<AdminStackParamList, 'EditBarber'>;

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export const EditBarberScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const queryClient = useQueryClient();
  const { barberId } = route.params;
  const { data: barbershop, isLoading: barbershopLoading } = useAdminBarbershop();

  // Fetch barber data
  const {
    data: barber,
    isLoading: barberLoading,
    error: barberError,
  } = useQuery({
    queryKey: ['barber', barberId],
    queryFn: () => barberService.getBarberById(barberId),
  });

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
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
  const [avatarUri, setAvatarUri] = useState<string | undefined>();

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with barber data
  useEffect(() => {
    if (barber) {
      setFullName(barber.user.full_name);
      setPhone(barber.user.phone || '');
      setSpecialties(barber.specialties.join(', '));
      setBio(barber.bio || '');
      setSchedule(barber.schedule);
      setAvatarUri(barber.user.avatar_url);
    }
  }, [barber]);

  // Update barber mutation
  const updateBarberMutation = useMutation({
    mutationFn: async () => {
      // Validate form
      const newErrors: Record<string, string> = {};

      if (!fullName.trim()) {
        newErrors.fullName = 'El nombre es requerido';
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

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq('id', barberId);

      if (userError) {
        throw new Error(`Error al actualizar perfil: ${userError.message}`);
      }

      // Update barber profile
      const specialtiesArray = specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await barberService.updateBarber(barberId, {
        specialties: specialtiesArray,
        bio: bio || undefined,
        schedule,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      queryClient.invalidateQueries({ queryKey: ['barber', barberId] });
      Alert.alert('Éxito', 'Barbero actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'No se pudo actualizar el barbero');
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (uri: string) => {
      const fileName = uri.split('/').pop() || 'photo.jpg';
      const fileType = fileName.split('.').pop() || 'jpg';

      const publicUrl = await barberService.uploadPhoto(barberId, {
        uri,
        type: `image/${fileType}`,
        name: fileName,
      });

      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      setAvatarUri(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['barber', barberId] });
      Alert.alert('Éxito', 'Foto actualizada correctamente');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'No se pudo subir la foto');
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
          return false;
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

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadPhotoMutation.mutate(result.assets[0].uri);
    }
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
    updateBarberMutation.mutate();
  };

  if (barberLoading || barbershopLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (barberError || !barber) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Error al cargar el barbero
        </Text>
        <Button title="Volver" onPress={() => navigation.goBack()} variant="outline" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar Section */}
      <Card style={styles.section} variant="outlined">
        <View style={styles.avatarSection}>
          <Avatar uri={avatarUri} name={fullName} size="xl" />
          <Button
            title="Cambiar foto"
            onPress={handlePickImage}
            variant="outline"
            size="sm"
            loading={uploadPhotoMutation.isPending}
            style={styles.changePhotoButton}
          />
        </View>
      </Card>

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
          value={barber.user.email}
          editable={false}
          placeholder="juan@ejemplo.com"
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
          title="Guardar cambios"
          onPress={handleSubmit}
          variant="primary"
          style={styles.actionButton}
          loading={updateBarberMutation.isPending}
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
  avatarSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  changePhotoButton: {
    minWidth: 150,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodyLarge,
    marginBottom: spacing.md,
    textAlign: 'center',
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
