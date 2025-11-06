/**
 * ServicesManagementScreen
 * Screen for managing services in the barbershop
 * Allows admin to view, add, edit, and activate/deactivate services
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
import { serviceService } from '../../services/service.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AdminStackParamList } from '../../types/navigation';
import { Service } from '../../types/models';
import { spacing, typography, borderRadius } from '../../styles/theme';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export const ServicesManagementScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { data: barbershop, isLoading: barbershopLoading } = useAdminBarbershop();
  const [showInactive, setShowInactive] = useState(false);

  // Fetch services
  const {
    data: services,
    isLoading: servicesLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['services', barbershop?.id, showInactive],
    queryFn: () =>
      serviceService.getServices({
        barbershop_id: barbershop!.id,
        is_active: showInactive ? undefined : true,
      }),
    enabled: !!barbershop,
  });

  // Toggle service active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) => {
      if (isActive) {
        await serviceService.deleteService(serviceId);
      } else {
        await serviceService.activateService(serviceId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'No se pudo cambiar el estado del servicio');
    },
  });

  const isLoading = barbershopLoading || servicesLoading;

  const handleToggleActive = (service: Service) => {
    const action = service.is_active ? 'desactivar' : 'activar';
    Alert.alert(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} servicio?`,
      `¿Estás seguro de que deseas ${action} "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: service.is_active ? 'destructive' : 'default',
          onPress: () =>
            toggleActiveMutation.mutate({
              serviceId: service.id,
              isActive: service.is_active,
            }),
        },
      ]
    );
  };

  const renderServiceItem = ({ item: service }: { item: Service }) => (
    <Card style={styles.serviceCard} variant="outlined">
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceTitleRow}>
            <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
              {service.name}
            </Text>
            {service.is_combo && (
              <View
                style={[styles.comboBadge, { backgroundColor: colors.secondary + '20' }]}
              >
                <Text style={[styles.comboText, { color: colors.secondary }]}>
                  COMBO
                </Text>
              </View>
            )}
          </View>
          {service.description && (
            <Text
              style={[styles.serviceDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {service.description}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: service.is_active
                ? colors.success + '20'
                : colors.error + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: service.is_active ? colors.success : colors.error },
            ]}
          >
            {service.is_active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      {/* Service Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Duración
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {serviceService.formatDuration(service.duration_minutes)}
          </Text>
        </View>
        <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Precio
          </Text>
          <Text style={[styles.detailValue, { color: colors.success }]}>
            ${service.price.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Combo Services Info */}
      {service.is_combo && service.combo_services.length > 0 && (
        <View style={styles.comboInfo}>
          <Text style={[styles.comboInfoText, { color: colors.textSecondary }]}>
            Incluye {service.combo_services.length} servicio
            {service.combo_services.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Editar"
          onPress={() => navigation.navigate('EditService', { serviceId: service.id })}
          variant="outline"
          size="sm"
          style={styles.actionButton}
        />
        <Button
          title={service.is_active ? 'Desactivar' : 'Activar'}
          onPress={() => handleToggleActive(service)}
          variant={service.is_active ? 'ghost' : 'secondary'}
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
          Cargando servicios...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Error al cargar los servicios
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
              Servicios
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {services?.length || 0} servicio{services?.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Button
            title="Agregar"
            onPress={() => navigation.navigate('AddService')}
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

      {/* Services List */}
      <FlatList
        data={services}
        renderItem={renderServiceItem}
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
              No hay servicios registrados
            </Text>
            <Button
              title="Agregar primer servicio"
              onPress={() => navigation.navigate('AddService')}
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
  serviceCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs / 2,
  },
  serviceName: {
    ...typography.labelLarge,
  },
  comboBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  comboText: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  serviceDescription: {
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
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs / 2,
  },
  detailValue: {
    ...typography.labelLarge,
  },
  detailDivider: {
    width: 1,
    height: 30,
  },
  comboInfo: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  comboInfoText: {
    ...typography.bodySmall,
    fontStyle: 'italic',
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
