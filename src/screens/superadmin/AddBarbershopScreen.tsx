/**
 * AddBarbershopScreen
 * Screen for adding a new barbershop
 * Requirements: 3.1, 3.2, 3.3
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useCreateBarbershop } from '../../hooks/useBarbershops';
import { CreateBarbershopDto, OpeningHours } from '../../types/models';
import { showToast } from '../../utils/toast';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'AddBarbershop'>;

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const AddBarbershopScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const createMutation = useCreateBarbershop();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    latitude: '',
    longitude: '',
  });

  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '14:00' },
    sunday: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast.error('Por favor corrige los errores', '❌ Validación');
      return;
    }

    try {
      const barbershopData: CreateBarbershopDto = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        description: formData.description.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        opening_hours: openingHours,
      };

      await createMutation.mutateAsync(barbershopData);
      showToast.success('Barbería creada correctamente', '✅ Éxito');
      navigation.goBack();
    } catch (error) {
      showToast.error('No se pudo crear la barbería', '❌ Error');
    }
  };

  const toggleDayOpen = (day: keyof OpeningHours) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: prev[day] ? null : { open: '09:00', close: '18:00' },
    }));
  };

  const updateDayHours = (
    day: keyof OpeningHours,
    field: 'open' | 'close',
    value: string
  ) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: prev[day] ? { ...prev[day]!, [field]: value } : null,
    }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información Básica
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Nombre de la Barbería *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: errors.name ? colors.error : colors.border,
              },
            ]}
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Ej: Barbería El Clásico"
            placeholderTextColor={colors.textSecondary + '80'}
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.name}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Dirección *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: errors.address ? colors.error : colors.border,
              },
            ]}
            value={formData.address}
            onChangeText={(text) => {
              setFormData({ ...formData, address: text });
              if (errors.address) setErrors({ ...errors, address: '' });
            }}
            placeholder="Ej: Calle Principal #123, Col. Centro"
            placeholderTextColor={colors.textSecondary + '80'}
            multiline
          />
          {errors.address && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.address}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Teléfono *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: errors.phone ? colors.error : colors.border,
              },
            ]}
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({ ...formData, phone: text });
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            placeholder="Ej: 5512345678"
            placeholderTextColor={colors.textSecondary + '80'}
            keyboardType="phone-pad"
          />
          {errors.phone && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.phone}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Descripción
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Descripción de la barbería..."
            placeholderTextColor={colors.textSecondary + '80'}
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Ubicación (Opcional)
        </Text>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Latitud
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
              value={formData.latitude}
              onChangeText={(text) => setFormData({ ...formData, latitude: text })}
              placeholder="19.4326"
              placeholderTextColor={colors.textSecondary + '80'}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Longitud
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
              value={formData.longitude}
              onChangeText={(text) => setFormData({ ...formData, longitude: text })}
              placeholder="-99.1332"
              placeholderTextColor={colors.textSecondary + '80'}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Horarios de Operación
        </Text>

        {DAYS_OF_WEEK.map(({ key, label }) => {
          const dayKey = key as keyof OpeningHours;
          const hours = openingHours[dayKey];

          return (
            <View
              key={key}
              style={[styles.dayRow, { backgroundColor: colors.surface }]}
            >
              <TouchableOpacity
                style={styles.dayToggle}
                onPress={() => toggleDayOpen(dayKey)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: hours ? colors.primary : 'transparent',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {hours && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.dayLabel, { color: colors.textPrimary }]}>
                  {label}
                </Text>
              </TouchableOpacity>

              {hours && (
                <View style={styles.timeInputs}>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: colors.background,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                      },
                    ]}
                    value={hours.open}
                    onChangeText={(text) => updateDayHours(dayKey, 'open', text)}
                    placeholder="09:00"
                    placeholderTextColor={colors.textSecondary + '80'}
                  />
                  <Text style={[styles.timeSeparator, { color: colors.textSecondary }]}>
                    -
                  </Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: colors.background,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                      },
                    ]}
                    value={hours.close}
                    onChangeText={(text) => updateDayHours(dayKey, 'close', text)}
                    placeholder="18:00"
                    placeholderTextColor={colors.textSecondary + '80'}
                  />
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: createMutation.isPending ? 0.6 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {createMutation.isPending ? 'Creando...' : '✓ Crear Barbería'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 70,
    height: 36,
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
  },
  timeSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
