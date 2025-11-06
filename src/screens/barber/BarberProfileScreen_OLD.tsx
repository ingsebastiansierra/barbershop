/**
 * BarberProfileScreen
 * Screen for barber profile management with editable fields and settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { supabase } from '../../supabase/client';

export const BarberProfileScreen: React.FC = () => {
  const { colors, theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuth();
  const { updateProfile } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [especialidades, setEspecialidades] = useState('');
  const [bio, setBio] = useState('');

  // Barber-specific data
  const [barberData, setBarberData] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || user.full_name || '');
      setTelefono(user.telefono || user.phone || '');
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
        setEspecialidades(data.specialties?.join(', ') || '');
        setBio(data.bio || '');
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Error loading barber data:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos permisos para acceder a tus fotos'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleUploadImage = async (imageUri: string) => {
    if (!user?.id) return;

    try {
      setIsUploadingImage(true);

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user profile
      await updateProfile({ avatar: publicUrl });

      Alert.alert('Éxito', 'Foto actualizada correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Update user profile
      await updateProfile({
        nombre,
        telefono,
      });

      // Update barber-specific data
      const specialtiesArray = especialidades
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { error } = await supabase
        .from('barbers')
        .update({
          specialties: specialtiesArray,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      loadBarberData();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  };

  const renderScheduleDay = (day: string, label: string) => {
    if (!schedule || !schedule[day]) {
      return (
        <View key={day} style={styles.scheduleRow}>
          <Text style={[styles.scheduleDay, { color: colors.textPrimary }]}>
            {label}
          </Text>
          <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
            No disponible
          </Text>
        </View>
      );
    }

    const ranges = schedule[day];
    const timeText = ranges
      .map((r: any) => `${r.start} - ${r.end}`)
      .join(', ');

    return (
      <View key={day} style={styles.scheduleRow}>
        <Text style={[styles.scheduleDay, { color: colors.textPrimary }]}>
          {label}
        </Text>
        <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
          {timeText}
        </Text>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
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
        <TouchableOpacity onPress={handlePickImage} disabled={isUploadingImage}>
          {user.avatar || user.avatar_url ? (
            <Image
              source={{ uri: user.avatar || user.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {(user.nombre || user.full_name || 'B').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isUploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePickImage} disabled={isUploadingImage}>
          <Text style={[styles.changePhotoText, { color: colors.primary }]}>
            Cambiar foto
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Información Personal
          </Text>
          {!isEditing && (
            <Button
              title="Editar"
              onPress={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
            />
          )}
        </View>

        {isEditing ? (
          <>
            <Input
              label="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
            />
            <Input
              label="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Tu teléfono"
              keyboardType="phone-pad"
            />
            <Input
              label="Especialidades"
              value={especialidades}
              onChangeText={setEspecialidades}
              placeholder="Corte, Barba, Cejas (separadas por comas)"
            />
            <Input
              label="Biografía"
              value={bio}
              onChangeText={setBio}
              placeholder="Cuéntanos sobre ti..."
              multiline
              numberOfLines={4}
            />

            <View style={styles.editActions}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setIsEditing(false);
                  setNombre(user.nombre || user.full_name || '');
                  setTelefono(user.telefono || user.phone || '');
                  setEspecialidades(barberData?.specialties?.join(', ') || '');
                  setBio(barberData?.bio || '');
                }}
                variant="outline"
                size="sm"
              />
              <Button
                title="Guardar"
                onPress={handleSave}
                size="sm"
                loading={isLoading}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {user.email}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Teléfono
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {telefono || 'No especificado'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Especialidades
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {especialidades || 'No especificadas'}
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

      {/* Schedule (Read-only) */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Horarios de Trabajo
        </Text>
        <Text style={[styles.scheduleNote, { color: colors.textSecondary }]}>
          Los horarios son gestionados por el administrador
        </Text>
        <View style={styles.scheduleContainer}>
          {renderScheduleDay('monday', 'Lunes')}
          {renderScheduleDay('tuesday', 'Martes')}
          {renderScheduleDay('wednesday', 'Miércoles')}
          {renderScheduleDay('thursday', 'Jueves')}
          {renderScheduleDay('friday', 'Viernes')}
          {renderScheduleDay('saturday', 'Sábado')}
          {renderScheduleDay('sunday', 'Domingo')}
        </View>
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
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="outline"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '600',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  scheduleNote: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  scheduleContainer: {
    gap: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  scheduleTime: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
});
