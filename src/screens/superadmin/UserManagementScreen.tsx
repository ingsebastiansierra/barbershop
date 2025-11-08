/**
 * UserManagementScreen
 * Screen for managing all users in the system
 * Requirements: 2.1, 2.4
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useUsers, useUpdateUserRole } from '../../hooks/useUsers';
import { useBarbershops } from '../../hooks/useBarbershops';
import { User } from '../../types/models';
import { showToast } from '../../utils/toast';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../hooks/useAuth';

const ROLE_OPTIONS = [
  { value: 'client', label: 'Cliente', icon: '👤', color: '#582308' },
  { value: 'barber', label: 'Barbero', icon: '✂️', color: '#10B981' },
  { value: 'admin', label: 'Admin', icon: '👔', color: '#F59E0B' },
  { value: 'super_admin', label: 'Super Admin', icon: '👑', color: '#EF4444' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'client', label: 'Clientes' },
  { value: 'barber', label: 'Barberos' },
  { value: 'admin', label: 'Admins' },
  { value: 'super_admin', label: 'Super Admins' },
];

export const UserManagementScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { user } = useAuth();
  const { data: users, isLoading, refetch, isRefetching } = useUsers();
  const { data: barbershops } = useBarbershops();
  const updateRoleMutation = useUpdateUserRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: User;
    newRole: string;
    roleLabel: string;
  } | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users;

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nombre?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, roleFilter, searchQuery]);

  const getRoleInfo = (role: string) => {
    return ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0];
  };

  const handleChangeRole = (user: User) => {
    Alert.alert(
      'Cambiar Rol',
      `Selecciona el nuevo rol para ${user.nombre || user.email}`,
      [
        ...ROLE_OPTIONS.map((role) => ({
          text: `${role.icon} ${role.label}`,
          onPress: () => {
            if (role.value === user.role) {
              showToast.info('El usuario ya tiene este rol', 'ℹ️ Info');
              return;
            }

            // Guardar el cambio pendiente y mostrar modal de contraseña
            setPendingRoleChange({
              user,
              newRole: role.value,
              roleLabel: role.label,
            });
            setShowPasswordModal(true);
          },
        })),
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;

    if (!password.trim()) {
      showToast.error('Debes ingresar tu contraseña', '❌ Error');
      return;
    }

    try {
      // Verificar la contraseña del super admin
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password,
      });

      if (authError || !user) {
        showToast.error('Contraseña incorrecta', '❌ Error');
        return;
      }

      // Si la contraseña es correcta, proceder con el cambio de rol
      await updateRoleMutation.mutateAsync({
        userId: pendingRoleChange.user.id,
        role: pendingRoleChange.newRole,
      });

      showToast.success(
        `Rol actualizado a ${pendingRoleChange.roleLabel}`,
        '✅ Éxito'
      );

      // Limpiar y cerrar modal
      setPassword('');
      setShowPasswordModal(false);
      setPendingRoleChange(null);
    } catch (error) {
      showToast.error('No se pudo actualizar el rol', '❌ Error');
    }
  };

  const handleCancelPasswordModal = () => {
    setPassword('');
    setShowPasswordModal(false);
    setPendingRoleChange(null);
  };

  const renderUserCard = ({ item }: { item: User }) => {
    const roleInfo = getRoleInfo(item.role);

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: roleInfo.color + '20', borderColor: roleInfo.color },
            ]}
          >
            <Text style={[styles.avatarText, { color: roleInfo.color }]}>
              {item.nombre
                ? item.nombre
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : item.email[0].toUpperCase()}
            </Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: colors.textPrimary }]}>
              {item.nombre || 'Sin nombre'}
            </Text>
            <Text style={[styles.cardEmail, { color: colors.textSecondary }]}>
              {item.email}
            </Text>
            {item.telefono && (
              <Text style={[styles.cardPhone, { color: colors.textSecondary }]}>
                📞 {item.telefono}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: roleInfo.color + '20' },
            ]}
          >
            <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>
              {roleInfo.icon} {roleInfo.label}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.changeRoleButton, { backgroundColor: colors.primary }]}
            onPress={() => handleChangeRole(item)}
          >
            <Text style={styles.changeRoleButtonText}>Cambiar Rol</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        {searchQuery || roleFilter !== 'all'
          ? 'No se encontraron usuarios'
          : 'No hay usuarios registrados'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery || roleFilter !== 'all'
          ? 'Intenta con otros filtros'
          : 'Los usuarios aparecerán aquí'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando usuarios...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Gestión de Usuarios
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredUsers.length} de {users?.length || 0} usuarios
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre o email..."
          placeholderTextColor={colors.textSecondary + '80'}
        />
      </View>

      {/* Role Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    roleFilter === filter.value ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setRoleFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      roleFilter === filter.value ? '#FFFFFF' : colors.textPrimary,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      />

      {/* Modal de Confirmación de Contraseña */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              🔐 Confirmar Cambio de Rol
            </Text>

            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Por seguridad, ingresa tu contraseña para cambiar el rol de{' '}
              <Text style={{ fontWeight: '600' }}>
                {pendingRoleChange?.user.nombre || pendingRoleChange?.user.email}
              </Text>{' '}
              a{' '}
              <Text style={{ fontWeight: '600', color: colors.primary }}>
                {pendingRoleChange?.roleLabel}
              </Text>
            </Text>

            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={colors.textSecondary + '80'}
              secureTextEntry
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={handleCancelPasswordModal}
              >
                <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleConfirmRoleChange}
                disabled={updateRoleMutation.isPending}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {updateRoleMutation.isPending ? 'Verificando...' : 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  filtersWrapper: {
    marginBottom: 12,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardPhone: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  changeRoleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeRoleButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  passwordInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
