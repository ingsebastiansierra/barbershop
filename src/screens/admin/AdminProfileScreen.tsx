/**
 * AdminProfileScreen
 * Screen for admin profile management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { showToast } from '../../utils/toast';

export const AdminProfileScreen: React.FC = () => {
  const { colors, theme, setTheme } = useThemeStore();
  const { user, logout, updateProfile } = useAuth();
  const { data: barbershop, isLoading: isLoadingBarbershop } = useAdminBarbershop();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      showToast.error('El nombre es requerido');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      showToast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error: any) {
      showToast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.full_name || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              showToast.success('Sesión cerrada correctamente');
            } catch (error: any) {
              showToast.error(error.message || 'Error al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleOpenLocation = () => {
    if (!barbershop?.latitude || !barbershop?.longitude) {
      showToast.error('No hay ubicación configurada');
      return;
    }

    const lat = barbershop.latitude;
    const lng = barbershop.longitude;
    const label = encodeURIComponent(barbershop.name || 'Barbería');
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(webUrl);
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user?.full_name?.charAt(0).toUpperCase() || 'A'}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {user?.full_name}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.roleText}>Administrador</Text>
        </View>
      </View>

      {/* Profile Information */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
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

        <View style={styles.form}>
          <Input
            label="Nombre Completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ingresa tu nombre"
            editable={isEditing}
          />

          <Input
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            placeholder="Ingresa tu teléfono"
            keyboardType="phone-pad"
            editable={isEditing}
          />

          <Input
            label="Email"
            value={user?.email || ''}
            editable={false}
            placeholder="Email"
          />
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Guardar"
              onPress={handleSave}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        )}
      </View>

      {/* Settings */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Configuración
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
              Tema Oscuro
            </Text>
            <Text
              style={[styles.settingDescription, { color: colors.textSecondary }]}
            >
              Cambiar entre tema claro y oscuro
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      {/* Barbershop Info */}
      {barbershop && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Mi Barbería
          </Text>
          
          <View style={styles.barbershopInfo}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Nombre:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {barbershop.name}
              </Text>
            </View>

            {barbershop.address && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Dirección:
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {barbershop.address}
                </Text>
              </View>
            )}

            {barbershop.phone && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Teléfono:
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {barbershop.phone}
                </Text>
              </View>
            )}

            {barbershop.latitude && barbershop.longitude && (
              <>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Ubicación:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {barbershop.latitude.toFixed(6)}, {barbershop.longitude.toFixed(6)}
                  </Text>
                </View>

                <Button
                  title="🗺️ Ver Ubicación en Mapa"
                  onPress={handleOpenLocation}
                  variant="outline"
                  size="sm"
                  style={styles.locationButton}
                />
              </>
            )}

            {(!barbershop.latitude || !barbershop.longitude) && (
              <View style={[styles.warningBox, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  ⚠️ No hay ubicación configurada. Ve a Configuración para agregar la ubicación del negocio.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {isLoadingBarbershop && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {/* Logout Button */}
      <Button
        title="Cerrar Sesión"
        onPress={handleLogout}
        variant="outline"
        style={[styles.logoutButton, { borderColor: colors.error }]}
        textStyle={{ color: colors.error }}
      />

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Versión 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  infoText: {
    fontSize: 14,
  },
  barbershopInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  locationButton: {
    marginTop: 8,
  },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
  },
});
