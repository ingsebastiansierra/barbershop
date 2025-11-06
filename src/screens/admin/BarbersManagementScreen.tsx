/**
 * BarbersManagementScreen
 * Screen for managing barbers in the barbershop
 * Allows admin to view, add, edit, and activate/deactivate barbers
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../store/themeStore';
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { barberService } from '../../services/barber.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { AdminStackParamList } from '../../types/navigation';
import { BarberWithUser } from '../../types/models';
import { spacing, typography, borderRadius } from '../../styles/theme';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export const BarbersManagementScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { data: barbershop, isLoading: barbershopLoading } = useAdminBarbershop();
  const [showInactive, setShowInactive] = useState(false);

  // Fetch barbers
  const {
    data: barbers,
    isLoading: barbersLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['barbers', barbershop?.id, showInactive],
    queryFn: () =>
      barberService.getBarbers({
        barbershop_id: barbershop!.id,
        is_active: showInactive ? undefined : true,
      }),
    enabled: !!barbershop,
  });

  // Toggle barber active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ barberId, isActive }: { barberId: string; isActive: boolean }) => {
      if (isActive) {
        await barberService.deactivateBarber(barberId);
      } else {
        await barberService.activateBarber(barberId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'No se pudo cambiar el estado del barbero');
    },
  });

  const isLoading = barbershopLoading || barbersLoading;

  const handleToggleActive = (barber: BarberWithUser) => {
    const action = barber.is_active ? 'desactivar' : 'activar';
    Alert.alert(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} barbero?`,
      `¿Estás seguro de que deseas ${action} a ${barber.user.full_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: barber.is_active ? 'destructive' : 'default',
          onPress: () =>
            toggleActiveMutation.mutate({
              barberId: barber.id,
              isActive: barber.is_active,
            }),
        },
      ]
    );
  };

  const renderBarberItem = ({ item: barber }: { item: BarberWithUser }) => (
    <Card style={styles.barberCard} variant="outlined">
      <View style={styles.barberHeader}>
        <Avatar
          uri={barber.user.avatar_url}
          name={barber.user.full_name}
          size="lg"
        />
        <View style={styles.barberInfo}>
          <Text style={[styles.barberName, { color: colors.textPrimary }]}>
            {barber.user.full_name}
          </Text>
          <Text style={[styles.barberEmail, { color: colors.textSecondary }]}>
            {barber.user.email}
          </Text>
          {barber.user.phone && (
            <Text style={[styles.barberPhone, { color: colors.textSecondary }]}>
              {barber.user.phone}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: barber.is_active
                ? colors.success + '20'
                : colors.error + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: barber.is_active ? colors.success : colors.error },
            ]}
          >
            {barber.is_active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      {/* Specialties */}
      {barber.specialties && barber.specialties.length > 0 && (
        <View style={styles.specialtiesContainer}>
          <Text style={[styles.specialtiesLabel, { color: colors.textSecondary }]}>
            Especialidades:
          </Text>
          <View style={styles.specialtiesList}>
            {barber.specialties.map((specialty, index) => (
              <View
                key={index}
                style={[styles.specialtyChip, { backgroundColor: colors.primary + '20' }]}
              >
                <Text style={[styles.specialtyText, { color: colors.primary }]}>
                  {specialty}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            ⭐ {barber.rating.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Rating
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {barber.total_reviews}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Reseñas
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Editar"
          onPress={() => navigation.navigate('EditBarber', { barberId: barber.id })}
          variant="outline"
          size="sm"
          style={styles.actionButton}
        />
        <Button
          title={barber.is_active ? 'Desactivar' : 'Activar'}
          onPress={() => handleToggleActive(barber)}
          variant={barber.is_active ? 'ghost' : 'secondary'}
          size="sm"
          style={styles.actionButton}
          loading={toggleActiveMutation.isPending}
        />
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando barberos...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Error al cargar los barberos
        </Text>
        <Button title="Reintentar" onPress={() => refetch()} variant="outline" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Barberos
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {barbers?.length || 0} barbero{barbers?.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Button
            title="Agregar"
            onPress={() => navigation.navigate('AddBarber')}
            variant="primary"
            size="sm"
          />
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowInactive(!showInactive)}
        >
          <Text style={[styles.filterText, { color: colors.textSecondary }]}>
            {showInactive ? 'Mostrar solo activos' : 'Mostrar todos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barbers List */}
      <FlatList
        data={barbers}
        renderItem={renderBarberItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay barberos registrados
            </Text>
            <Button
              title="Agregar primer barbero"
              onPress={() => navigation.navigate('AddBarber')}
              variant="primary"
              style={styles.emptyButton}
            />
          </View>
        }
      />
    </View>
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
  header: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.bodyMedium,
    marginTop: spacing.xs / 2,
  },
  filterToggle: {
    paddingVertical: spacing.xs,
  },
  filterText: {
    ...typography.labelMedium,
  },
  loadingText: {
    ...typography.bodyMedium,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.bodyLarge,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  barberCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  barberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  barberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  barberName: {
    ...typography.labelLarge,
    marginBottom: spacing.xs / 2,
  },
  barberEmail: {
    ...typography.bodySmall,
    marginBottom: spacing.xs / 2,
  },
  barberPhone: {
    ...typography.bodySmall,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.labelSmall,
  },
  specialtiesContainer: {
    marginBottom: spacing.md,
  },
  specialtiesLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  specialtyChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
  },
  specialtyText: {
    ...typography.labelSmall,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h4,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.bodySmall,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.bodyLarge,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 200,
  },
});
