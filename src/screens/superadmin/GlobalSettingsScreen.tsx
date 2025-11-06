/**
 * GlobalSettingsScreen
 * Screen for super admin profile and global system settings
 * Requirements: 18.1, 20.3
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';

export const GlobalSettingsScreen: React.FC = () => {
  const { colors, theme, toggleTheme } = useThemeStore();
  const { user, logout, getUserDisplayName, getUserInitials } = useAuth();

  // Global system settings (these would normally be stored in a database)
  const [defaultTaxRate, setDefaultTaxRate] = useState('16');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowNewRegistrations, setAllowNewRegistrations] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              showToast.loading('Cerrando sesión...');
              await logout();
              showToast.success('Sesión cerrada correctamente', '👋 Hasta pronto');
            } catch (error) {
              showToast.error('No se pudo cerrar sesión', 'Error');
            }
          },
        },
      ]
    );
  };

  const handleSaveSettings = () => {
    // In a real implementation, this would save to the database
    showToast.success('Configuración guardada', '✅ Éxito');
  };

  const handleViewPrivacyPolicy = () => {
    Alert.alert(
      'Política de Privacidad',
      'Esta funcionalidad abrirá la política de privacidad del sistema.',
      [{ text: 'OK' }]
    );
  };

  const handleViewTerms = () => {
    Alert.alert(
      'Términos y Condiciones',
      'Esta funcionalidad abrirá los términos y condiciones del sistema.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar y nombre */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.primary + '20', borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {getUserInitials()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {getUserDisplayName()}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>👑 Super Admin</Text>
        </View>
      </View>

      {/* Información del perfil */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información Personal
        </Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Nombre
          </Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {user?.nombre || 'No especificado'}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Email
          </Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {user?.email}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Teléfono
          </Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {user?.telefono || 'No especificado'}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Rol
          </Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            Super Administrador
          </Text>
        </View>
      </View>

      {/* Configuración Global del Sistema */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          ⚙️ Configuración Global del Sistema
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
              Tasa de Impuesto por Defecto (%)
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Impuesto aplicado a los servicios
            </Text>
          </View>
          <TextInput
            style={[
              styles.taxInput,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            value={defaultTaxRate}
            onChangeText={setDefaultTaxRate}
            keyboardType="decimal-pad"
            placeholder="16"
            placeholderTextColor={colors.textSecondary + '80'}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
              Modo Mantenimiento
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Bloquea el acceso al sistema
            </Text>
          </View>
          <Switch
            value={maintenanceMode}
            onValueChange={setMaintenanceMode}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={maintenanceMode ? colors.primary : colors.surface}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
              Permitir Nuevos Registros
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Habilita el registro de nuevos usuarios
            </Text>
          </View>
          <Switch
            value={allowNewRegistrations}
            onValueChange={setAllowNewRegistrations}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={allowNewRegistrations ? colors.primary : colors.surface}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>💾 Guardar Configuración</Text>
        </TouchableOpacity>
      </View>

      {/* Políticas y Términos */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          📄 Políticas y Términos
        </Text>

        <TouchableOpacity
          style={styles.policyButton}
          onPress={handleViewPrivacyPolicy}
        >
          <Text style={[styles.policyButtonText, { color: colors.textPrimary }]}>
            Ver Política de Privacidad
          </Text>
          <Text style={[styles.policyButtonIcon, { color: colors.textSecondary }]}>
            →
          </Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.policyButton}
          onPress={handleViewTerms}
        >
          <Text style={[styles.policyButtonText, { color: colors.textPrimary }]}>
            Ver Términos y Condiciones
          </Text>
          <Text style={[styles.policyButtonIcon, { color: colors.textSecondary }]}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preferencias de Aplicación */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          🎨 Preferencias de Aplicación
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
              Tema Oscuro
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Cambiar entre tema claro y oscuro
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={theme === 'dark' ? colors.primary : colors.surface}
          />
        </View>
      </View>

      {/* Permisos */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          🔐 Permisos de Super Admin
        </Text>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionIcon}>✅</Text>
          <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
            Gestión completa de barberías
          </Text>
        </View>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionIcon}>✅</Text>
          <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
            Gestión de todos los usuarios
          </Text>
        </View>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionIcon}>✅</Text>
          <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
            Acceso a estadísticas globales
          </Text>
        </View>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionIcon}>✅</Text>
          <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
            Configuración del sistema
          </Text>
        </View>
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Versión */}
      <Text style={[styles.version, { color: colors.textSecondary }]}>
        Versión 1.0.0 - Super Admin Panel
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  taxInput: {
    width: 70,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
  },
  saveButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  policyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  policyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  policyButtonIcon: {
    fontSize: 18,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  permissionText: {
    fontSize: 14,
    flex: 1,
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
});
