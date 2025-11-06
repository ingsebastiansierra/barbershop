/**
 * BarbershopsManagementScreen
 * Screen for managing all barbershops
 * Requirements: 3.1, 3.5
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useBarbershops, useDeleteBarbershop, useUpdateBarbershop } from '../../hooks/useBarbershops';
import { Barbershop } from '../../types/models';
import { showToast } from '../../utils/toast';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'BarbershopsManagement'>;

export const BarbershopsManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const { data: barbershops, isLoading, refetch, isRefetching } = useBarbershops();
  const deleteMutation = useDeleteBarbershop();
  const updateMutation = useUpdateBarbershop();

  const handleAddBarbershop = () => {
    navigation.navigate('AddBarbershop');
  };

  const handleEditBarbershop = (barbershopId: string) => {
    navigation.navigate('EditBarbershop', { barbershopId });
  };

  const handleViewDetail = (barbershopId: string) => {
    navigation.navigate('SuperAdminBarbershopDetail', { barbershopId });
  };

  const handleToggleActive = async (barbershop: Barbershop) => {
    const action = barbershop.is_active ? 'desactivar' : 'activar';
    
    Alert.alert(
      `${action === 'desactivar' ? 'Desactivar' : 'Activar'} Barbería`,
      `¿Estás seguro que deseas ${action} "${barbershop.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: action === 'desactivar' ? 'Desactivar' : 'Activar',
          style: action === 'desactivar' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateMutation.mutateAsync({
                id: barbershop.id,
                updates: { is_active: !barbershop.is_active },
              });
              showToast.success(
                `Barbería ${action === 'desactivar' ? 'desactivada' : 'activada'} correctamente`,
                '✅ Éxito'
              );
            } catch (error) {
              showToast.error(
                `No se pudo ${action} la barbería`,
                '❌ Error'
              );
            }
          },
        },
      ]
    );
  };

  const renderBarbershopCard = ({ item }: { item: Barbershop }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => handleViewDetail(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.is_active
                  ? colors.success + '20'
                  : colors.error + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.is_active ? colors.success : colors.error },
              ]}
            >
              {item.is_active ? '✓ Activa' : '✕ Inactiva'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.cardAddress, { color: colors.textSecondary }]}>
        📍 {item.address}
      </Text>

      {item.phone && (
        <Text style={[styles.cardPhone, { color: colors.textSecondary }]}>
          📞 {item.phone}
        </Text>
      )}

      {item.description && (
        <Text
          style={[styles.cardDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEditBarbershop(item.id)}
        >
          <Text style={styles.actionButtonText}>✏️ Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: item.is_active
                ? colors.error + '20'
                : colors.success + '20',
            },
          ]}
          onPress={() => handleToggleActive(item)}
        >
          <Text
            style={[
              styles.actionButtonText,
              { color: item.is_active ? colors.error : colors.success },
            ]}
          >
            {item.is_active ? '🚫 Desactivar' : '✓ Activar'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyIcon]}>🏪</Text>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No hay barberías registradas
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Crea la primera barbería para comenzar
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando barberías...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Gestión de Barberías
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {barbershops?.length || 0} barberías registradas
          </Text>
        </View>
      </View>

      <FlatList
        data={barbershops}
        renderItem={renderBarbershopCard}
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddBarbershop}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardAddress: {
    fontSize: 14,
    marginBottom: 6,
  },
  cardPhone: {
    fontSize: 14,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
  },
});
