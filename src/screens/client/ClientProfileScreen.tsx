/**
 * ClientProfileScreen
 * Screen for client profile management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';

export const ClientProfileScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { user, logout, getUserDisplayName, getUserInitials } = useAuth();

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
        Versión 1.0.0
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
