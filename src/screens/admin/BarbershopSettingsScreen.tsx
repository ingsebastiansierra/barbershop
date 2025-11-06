/**
 * BarbershopSettingsScreen
 * Screen for barbershop settings including opening hours
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../store/themeStore';
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { barbershopService } from '../../services/barbershop.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TimePicker } from '../../components/common/TimePicker';
import { OpeningHours, DaySchedule } from '../../types/models';
import { spacing, typography } from '../../styles/theme';
import { showToast } from '../../utils/toast';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export const BarbershopSettingsScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();
  const { data: barbershop, isLoading } = useAdminBarbershop();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  });

  useEffect(() => {
    if (barbershop) {
      setName(barbershop.name);
      setAddress(barbershop.address || '');
      setPhone(barbershop.phone || '');
      setDescription(barbershop.description || '');
      setOpeningHours(barbershop.opening_hours);
    }
  }, [barbershop]);

  const updateBarbershopMutation = useMutation({
    mutationFn: async () => {
      if (!barbershop) throw new Error('No barbershop found');

      if (!name.trim()) {
        throw new Error('El nombre es requerido');
      }

      await barbershopService.updateBarbershop(barbershop.id, {
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        description: description.trim() || undefined,
        opening_hours: openingHours,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-barbershop'] });
      showToast('success', 'Configuración actualizada correctamente');
    },
    onError: (error: any) => {
      showToast('error', error.message || 'Error al actualizar configuración');
    },
  });

  const handleToggleDay = (day: keyof OpeningHours, isOpen: boolean) => {
    setOpeningHours({
      ...openingHours,
      [day]: isOpen ? { open: '09:00', close: '18:00' } : null,
    });
  };

  const handleUpdateTime = (
    day: keyof OpeningHours,
    field: 'open' | 'close',
    value: string
  ) => {
    const currentDay = openingHours[day];
    if (currentDay) {
      setOpeningHours({
        ...openingHours,
        [day]: { ...currentDay, [field]: value },
      });
    }
  };

  const handleSubmit = () => {
    updateBarbershopMutation.mutate();
  };

  const handleCopySchedule = (fromDay: keyof OpeningHours) => {
    const schedule = openingHours[fromDay];
    if (!schedule) return;

    Alert.alert(
      'Copiar Horario',
      '¿A qué días deseas copiar este horario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Todos los días',
          onPress: () => {
            const newHours: OpeningHours = {
              monday: { ...schedule },
              tuesday: { ...schedule },
              wednesday: { ...schedule },
              thursday: { ...schedule },
              friday: { ...schedule },
              saturday: { ...schedule },
              sunday: { ...schedule },
            };
            setOpeningHours(newHours);
            showToast('success', 'Horario copiado a todos los días');
          },
        },
        {
          text: 'Días laborales',
          onPress: () => {
            setOpeningHours({
              ...openingHours,
              monday: { ...schedule },
              tuesday: { ...schedule },
              wednesday: { ...schedule },
              thursday: { ...schedule },
              friday: { ...schedule },
            });
            showToast('success', 'Horario copiado a días laborales');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!barbershop) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          No se pudo cargar la barbería
        </Text>
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
          Información General
        </Text>

        <Input
          label="Nombre de la Barbería"
          value={name}
          onChangeText={setName}
          placeholder="Mi Barbería"
        />

        <Input
          label="Dirección"
          value={address}
          onChangeText={setAddress}
          placeholder="Calle Principal #123"
          multiline
        />

        <Input
          label="Teléfono"
          value={phone}
          onChangeText={setPhone}
          placeholder="+52 123 456 7890"
          keyboardType="phone-pad"
        />

        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu barbería"
          multiline
          numberOfLines={3}
        />
      </Card>

      <Card style={styles.section} variant="outlined">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Horarios de Apertura
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Configura los horarios en que tu barbería está abierta
        </Text>

        {DAYS.map((day) => {
          const daySchedule = openingHours[day.key];
          const isOpen = daySchedule !== null;

          return (
            <View key={day.key} style={styles.dayContainer}>
              <View style={styles.dayHeader}>
                <View style={styles.dayTitleContainer}>
                  <Text style={[styles.dayLabel, { color: colors.textPrimary }]}>
                    {day.label}
                  </Text>
                  {isOpen && (
                    <Button
                      title="Copiar"
                      onPress={() => handleCopySchedule(day.key)}
                      variant="ghost"
                      size="sm"
                    />
                  )}
                </View>
                <Switch
                  value={isOpen}
                  onValueChange={(value) => handleToggleDay(day.key, value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>

              {isOpen && daySchedule && (
                <View style={styles.timeContainer}>
                  <View style={styles.timePickerWrapper}>
                    <TimePicker
                      label="Apertura"
                      value={daySchedule.open}
                      onTimeChange={(value) => handleUpdateTime(day.key, 'open', value)}
                    />
                  </View>
                  <Text style={[styles.timeSeparator, { color: colors.textSecondary }]}>
                    -
                  </Text>
                  <View style={styles.timePickerWrapper}>
                    <TimePicker
                      label="Cierre"
                      value={daySchedule.close}
                      onTimeChange={(value) => handleUpdateTime(day.key, 'close', value)}
                      minTime={daySchedule.open}
                    />
                  </View>
                </View>
              )}

              {!isOpen && (
                <Text style={[styles.closedText, { color: colors.textSecondary }]}>
                  Cerrado
                </Text>
              )}
            </View>
          );
        })}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Guardar Cambios"
          onPress={handleSubmit}
          variant="primary"
          loading={updateBarbershopMutation.isPending}
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
  errorText: {
    ...typography.bodyLarge,
    textAlign: 'center',
  },
  dayContainer: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayLabel: {
    ...typography.labelLarge,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  timePickerWrapper: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  closedText: {
    ...typography.bodySmall,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
