/**
 * ClientProfileScreen
 * Screen for client profile management
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
  Modal,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { showToast } from '../../utils/toast';

export const ClientProfileScreen: React.FC = () => {
  const { colors, theme, toggleTheme } = useThemeStore();
  const { user, logout, getUserDisplayName, getUserInitials, updateProfile } = useAuth();

  // Edit profile modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Change password modal state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleEditProfile = () => {
    setEditName(user?.full_name || '');
    setEditPhone(user?.phone || '');
    setEditEmail(user?.email || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!editName.trim()) {
        showToast.error('El nombre es requerido');
        return;
      }

      showToast.loading('Actualizando perfil...');

      await updateProfile({
        full_name: editName.trim(),
        phone: editPhone.trim() || undefined,
        email: editEmail.trim(),
      });

      showToast.success('Perfil actualizado correctamente');
      setEditModalVisible(false);
    } catch (error: any) {
      showToast.error(error.message || 'No se pudo actualizar el perfil', 'Error');
    }
  };

  const handleChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(true);
  };

  const handleSavePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast.error('Todos los campos son requeridos');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast.error('Las contraseñas no coinciden');
        return;
      }

      if (newPassword.length < 8) {
        showToast.error('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      showToast.info('Funcionalidad de cambio de contraseña próximamente');
      setPasswordModalVisible(false);
    } catch (error: any) {
      showToast.error(error.message || 'No se pudo cambiar la contraseña', 'Error');
    }
  };

  const handleChangeAvatar = () => {
    showToast.info('Funcionalidad de cambio de foto próximamente');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar y nombre */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.avatar,
            { backgroundColor: colors.primary + '20', borderColor: colors.primary },
          ]}
          onPress={handleChangeAvatar}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {getUserInitials()}
          </Text>
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.editBadgeText}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {getUserDisplayName()}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      {/* Información del perfil */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Información Personal
          </Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={[styles.editButton, { color: colors.primary }]}>
              Editar
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Nombre
          </Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {user?.full_name || 'No especificado'}
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
            {user?.phone || 'No especificado'}
          </Text>
        </View>
      </View>

      {/* Configuración */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Configuración
        </Text>

        <View style={styles.infoRow}>
          <View>
            <Text style={[styles.infoLabel, { color: colors.textPrimary }]}>
              Tema Oscuro
            </Text>
            <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>
              Cambiar entre tema claro y oscuro
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.infoRow} onPress={handleChangePassword}>
          <Text style={[styles.infoLabel, { color: colors.textPrimary }]}>
            Cambiar Contraseña
          </Text>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Editar Perfil
            </Text>

            <Input
              label="Nombre completo"
              value={editName}
              onChangeText={setEditName}
              placeholder="Ingresa tu nombre"
            />

            <Input
              label="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
            />

            <Input
              label="Teléfono"
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="(opcional)"
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setEditModalVisible(false)}
                variant="outline"
                size="md"
              />
              <Button
                title="Guardar"
                onPress={handleSaveProfile}
                variant="primary"
                size="md"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Cambiar Contraseña
            </Text>

            <Input
              label="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Ingresa tu contraseña actual"
              secureTextEntry
            />

            <Input
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
            />

            <Input
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la nueva contraseña"
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setPasswordModalVisible(false)}
                variant="outline"
                size="md"
              />
              <Button
                title="Cambiar"
                onPress={handleSavePassword}
                variant="primary"
                size="md"
              />
            </View>
          </View>
        </View>
      </Modal>
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
    position: 'relative',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
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
  },
  editBadgeText: {
    fontSize: 14,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
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
  infoSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
