/**
 * BarberProfileScreen - VERSIÓN MEJORADA
 * Con nombre correcto y horario editable
 * 
 * INSTRUCCIONES:
 * 1. Renombra el archivo actual BarberProfileScreen.tsx a BarberProfileScreen_OLD.tsx
 * 2. Renombra este archivo a BarberProfileScreen.tsx
 * 3. Reinicia la app
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TimePicker } from '../../components/common/TimePicker';
import { Avatar } from '../../components/common/Avatar';
import { supabase } from '../../supabase/client';
import { BarberSchedule } from '../../types/models';
import { showToast } from '../../utils/toast';
import { spacing, typography } from '../../styles/theme';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export const BarberProfileScreen: React.FC = () => {
  const { colors, theme, setTheme } = useThemeStore();
  const { user, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Barber data
  const [barberData, setBarberData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      loadBarberData();
    }
  }, [user]);

  const loadBarberData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading barber data:', error);
        return;
      }

      if (data) {
        setBarberData(data);
        setSpecialties(data.specialties?.join(', ') || '');
        setBio(data.bio || '');
        setSchedule(data.schedule || {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null,
        });
      }
    } catch (error) {
      console.error('Error loading barber data:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Update user profile
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      // Update barber-specific data
      const specialtiesArray = specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { error } = await supabase
        .from('barbers')
        .update({
          specialties: specialtiesArray,
          bio: bio.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsEditing(false);
      showToast('success', 'Perfil actualizado correctamente');
      loadBarberData();
    } catch (error: any) {
      showToast('error', error.message || 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Cambiar Foto de Perfil',
      'Selecciona una opción',
      [
        {
          text: 'Tomar Foto',
          onPress: handleTakePhoto,
        },
        {
          text: 'Elegir de Galería',
          onPress: handlePickFromGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      if (!user?.id) return;

      showToast('loading', 'Tomando foto...');
      
      const { profileService } = await import('../../services/profileService');
      const newAvatarUrl = await profileService.takeProfilePhoto(
        user.id,
        user.avatar_url
      );

      // Actualizar el estado local
      if (updateProfile) {
        await updateProfile({ avatar_url: newAvatarUrl });
      }

      showToast('success', 'Foto de perfil actualizada 📸');
    } catch (error: any) {
      console.error('Error taking photo:', error);
      showToast('error', error.message || 'No se pudo actualizar la foto');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      if (!user?.id) return;

      showToast('loading', 'Subiendo foto...');
      
      const { profileService } = await import('../../services/profileService');
      const newAvatarUrl = await profileService.changeProfilePhoto(
        user.id,
        user.avatar_url
      );

      // Actualizar el estado local
      if (updateProfile) {
        await updateProfile({ avatar_url: newAvatarUrl });
      }

      showToast('success', 'Foto de perfil actualizada ✨');
    } catch (error: any) {
      console.error('Error picking photo:', error);
      
      if (error.message === 'No se seleccionó ninguna imagen') {
        return; // Usuario canceló
      }
      
      showToast('error', error.message || 'No se pudo actualizar la foto');
    }
  };

  const handleSaveSchedule = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('barbers')
        .update({ schedule })
        .eq('id', user.id);

      if (error) throw error;

      setIsEditingSchedule(false);
      showToast('success', 'Horario actualizado correctamente');
      loadBarberData();
    } catch (error: any) {
      showToast('error', error.message || 'Error al actualizar horario');
    } finally {
      setIsLoading(false);
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

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!user) {
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
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleChangeAvatar} activeOpacity={0.7}>
          <Avatar uri={user?.avatar_url} name={fullName} size="xl" />
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.editBadgeText}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {fullName}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      {/* Profile Information */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Información Personal
          </Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.editButton, { color: colors.primary }]}>
                Editar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <>
            <Input
              label="Nombre completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Tu nombre"
            />
            <Input
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              placeholder="Tu teléfono"
              keyboardType="phone-pad"
            />
            <Input
              label="Especialidades (separadas por comas)"
              value={specialties}
              onChangeText={setSpecialties}
              placeholder="Corte, Barba, Cejas"
            />
            <Input
              label="Biografía"
              value={bio}
              onChangeText={setBio}
              placeholder="Cuéntanos sobre ti..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonRow}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setIsEditing(false);
                  setFullName(user.full_name || '');
                  setPhone(user.phone || '');
                  setSpecialties(barberData?.specialties?.join(', ') || '');
                  setBio(barberData?.bio || '');
                }}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Guardar"
                onPress={handleSaveProfile}
                loading={isLoading}
                style={styles.button}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Teléfono
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {phone || 'No especificado'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Especialidades
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {specialties || 'No especificadas'}
              </Text>
            </View>
            {bio && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Biografía
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {bio}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Schedule Section */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Mi Horario de Trabajo
          </Text>
          {!isEditingSchedule && (
            <TouchableOpacity onPress={() => setIsEditingSchedule(true)}>
              <Text style={[styles.editButton, { color: colors.primary }]}>
                Editar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditingSchedule ? (
          <>
            <Text style={[styles.scheduleNote, { color: colors.textSecondary }]}>
              Configura tus horarios de trabajo
            </Text>

            {DAYS.map((day) => (
              <View key={day.key} style={styles.dayContainer}>
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayLabel, { color: colors.textPrimary }]}>
                    {day.label}
                  </Text>
                  <Button
                    title="+ Agregar"
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

            <View style={styles.buttonRow}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setIsEditingSchedule(false);
                  setSchedule(barberData?.schedule || {});
                }}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Guardar Horario"
                onPress={handleSaveSchedule}
                loading={isLoading}
                style={styles.button}
              />
            </View>
          </>
        ) : (
          <View style={styles.scheduleContainer}>
            {DAYS.map((day) => {
              const daySchedule = schedule[day.key];
              return (
                <View key={day.key} style={styles.scheduleRow}>
                  <Text style={[styles.scheduleDay, { color: colors.textPrimary }]}>
                    {day.label}
                  </Text>
                  <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
                    {daySchedule && daySchedule.length > 0
                      ? daySchedule.map((r) => `${r.start}-${r.end}`).join(', ')
                      : 'No disponible'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Settings */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Configuración
        </Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
            Tema oscuro
          </Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      {/* Logout Button */}
      <Button
        title="Cerrar Sesión"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
      />
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editBadgeText: {
    fontSize: 14,
  },
  name: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.bodyMedium,
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h4,
  },
  editButton: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    ...typography.bodyLarge,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
  scheduleNote: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
    fontStyle: 'italic',
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
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  noScheduleText: {
    ...typography.bodySmall,
    fontStyle: 'italic',
    marginLeft: spacing.sm,
  },
  scheduleContainer: {
    gap: spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDay: {
    ...typography.bodyMedium,
    fontWeight: '600',
    flex: 1,
  },
  scheduleTime: {
    ...typography.bodySmall,
    flex: 2,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    ...typography.bodyLarge,
  },
  logoutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
