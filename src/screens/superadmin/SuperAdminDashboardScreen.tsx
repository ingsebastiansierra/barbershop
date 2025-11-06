/**
 * SuperAdminDashboardScreen
 * Dashboard screen for super administrators
 * Shows consolidated metrics from all barbershops, comparative statistics, and alerts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../store/themeStore';
import { statisticsService } from '../../services/statistics.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SuperAdminStackParamList } from '../../types/navigation';
import { spacing, typography, borderRadius } from '../../styles/theme';

type NavigationProp = NativeStackNavigationProp<SuperAdminStackParamList>;

export const SuperAdminDashboardScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();

  // Fetch global metrics
  const {
    data: globalMetrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['global-metrics'],
    queryFn: () => statisticsService.getGlobalMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch all barbershops statistics
  const {
    data: barbershopsStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['all-barbershops-statistics'],
    queryFn: () => statisticsService.getAllBarbershopsStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const isLoading = metricsLoading || statsLoading;
  const isRefetching = false;
  const error = metricsError || statsError;

  const handleRefresh = () => {
    refetchMetrics();
    refetchStats();
  };

  // Identify barbershops with problems
  const problemBarbershops = React.useMemo(() => {
    if (!barbershopsStats) return [];
    return barbershopsStats.filter(
      (shop) =>
        !shop.is_active ||
        shop.active_barbers === 0 ||
        shop.cancellation_rate > 30 ||
        (shop.total_appointments > 0 && shop.total_revenue === 0)
    );
  }, [barbershopsStats]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando dashboard global...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Error al cargar el dashboard
        </Text>
        <Button title="Reintentar" onPress={handleRefresh} variant="outline" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Dashboard Global
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Vista consolidada de todas las barberías
        </Text>
      </View>

      {/* Global Metrics Cards */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {globalMetrics?.total_barbershops || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Barberías totales
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.success }]}>
            {globalMetrics?.active_barbershops || 0} activas
          </Text>
        </Card>

        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.success }]}>
            ${globalMetrics?.total_revenue.toFixed(2) || '0.00'}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Ingresos totales
          </Text>
        </Card>

        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.secondary }]}>
            {globalMetrics?.total_appointments || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Citas totales
          </Text>
        </Card>

        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.info }]}>
            {globalMetrics?.total_barbers || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Barberos activos
          </Text>
        </Card>

        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {globalMetrics?.total_clients || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Clientes totales
          </Text>
        </Card>
      </View>

      {/* Alerts Section */}
      {problemBarbershops.length > 0 && (
        <Card style={styles.section} variant="outlined">
          <View style={styles.alertHeader}>
            <Text style={[styles.alertIcon, { color: colors.warning }]}>⚠️</Text>
            <View style={styles.alertHeaderText}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Alertas
              </Text>
              <Text style={[styles.alertSubtitle, { color: colors.textSecondary }]}>
                {problemBarbershops.length} barbería(s) requieren atención
              </Text>
            </View>
          </View>
          <View style={styles.alertsList}>
            {problemBarbershops.slice(0, 5).map((shop) => (
              <TouchableOpacity
                key={shop.barbershop_id}
                style={[styles.alertItem, { backgroundColor: colors.surfaceVariant }]}
                onPress={() =>
                  navigation.navigate('BarbershopDetail', {
                    barbershopId: shop.barbershop_id,
                  })
                }
              >
                <View style={styles.alertContent}>
                  <Text style={[styles.alertName, { color: colors.textPrimary }]}>
                    {shop.barbershop_name}
                  </Text>
                  <View style={styles.alertReasons}>
                    {!shop.is_active && (
                      <Text style={[styles.alertReason, { color: colors.error }]}>
                        • Inactiva
                      </Text>
                    )}
                    {shop.active_barbers === 0 && (
                      <Text style={[styles.alertReason, { color: colors.warning }]}>
                        • Sin barberos activos
                      </Text>
                    )}
                    {shop.cancellation_rate > 30 && (
                      <Text style={[styles.alertReason, { color: colors.warning }]}>
                        • Alta tasa de cancelación ({shop.cancellation_rate.toFixed(1)}%)
                      </Text>
                    )}
                    {shop.total_appointments > 0 && shop.total_revenue === 0 && (
                      <Text style={[styles.alertReason, { color: colors.warning }]}>
                        • Sin ingresos registrados
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={[styles.alertArrow, { color: colors.textSecondary }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
          {problemBarbershops.length > 5 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Barbershops')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                Ver todas las alertas ({problemBarbershops.length})
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      )}

      {/* Barbershops Statistics Table */}
      <Card style={styles.section} variant="outlined">
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Estadísticas por barbería
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Barbershops')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View style={[styles.tableHeader, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.tableHeaderCell, styles.nameColumn, { color: colors.textPrimary }]}>
            Barbería
          </Text>
          <Text style={[styles.tableHeaderCell, styles.numberColumn, { color: colors.textPrimary }]}>
            Citas
          </Text>
          <Text style={[styles.tableHeaderCell, styles.numberColumn, { color: colors.textPrimary }]}>
            Ingresos
          </Text>
          <Text style={[styles.tableHeaderCell, styles.numberColumn, { color: colors.textPrimary }]}>
            Barberos
          </Text>
        </View>

        {/* Table Rows */}
        <View style={styles.tableBody}>
          {barbershopsStats?.slice(0, 10).map((shop, index) => (
            <TouchableOpacity
              key={shop.barbershop_id}
              style={[
                styles.tableRow,
                index % 2 === 0 && { backgroundColor: colors.surface },
              ]}
              onPress={() =>
                navigation.navigate('BarbershopDetail', {
                  barbershopId: shop.barbershop_id,
                })
              }
            >
              <View style={[styles.tableCell, styles.nameColumn]}>
                <Text
                  style={[styles.tableCellText, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {shop.barbershop_name}
                </Text>
                {!shop.is_active && (
                  <Text style={[styles.inactiveBadge, { color: colors.error }]}>
                    (Inactiva)
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.numberColumn, { color: colors.textSecondary }]}>
                {shop.total_appointments}
              </Text>
              <Text
                style={[styles.tableCell, styles.numberColumn, { color: colors.success }]}
              >
                ${shop.total_revenue.toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, styles.numberColumn, { color: colors.textSecondary }]}>
                {shop.active_barbers}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {barbershopsStats && barbershopsStats.length > 10 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Barbershops')}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              Ver todas las barberías ({barbershopsStats.length})
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Comparative Chart Section */}
      <Card style={styles.section} variant="outlined">
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Comparativa de ingresos
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Statistics')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Ver detalles</Text>
          </TouchableOpacity>
        </View>

        {/* Simple bar chart visualization */}
        <View style={styles.chartContainer}>
          {barbershopsStats?.slice(0, 5).map((shop) => {
            const maxRevenue = Math.max(
              ...barbershopsStats.map((s) => s.total_revenue),
              1
            );
            const barWidth = (shop.total_revenue / maxRevenue) * 100;

            return (
              <View key={shop.barbershop_id} style={styles.chartRow}>
                <Text
                  style={[styles.chartLabel, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {shop.barbershop_name}
                </Text>
                <View style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      { width: `${barWidth}%`, backgroundColor: colors.primary },
                    ]}
                  />
                  <Text style={[styles.chartValue, { color: colors.textSecondary }]}>
                    ${shop.total_revenue.toFixed(0)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.section} variant="filled">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Acciones rápidas
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Barbershops')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary }]}>🏪</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Barberías
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary }]}>👥</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Usuarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary }]}>📊</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Estadísticas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('GlobalSettings')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary }]}>⚙️</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Configuración
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
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
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  metricValue: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  metricSubtext: {
    ...typography.bodySmall,
    marginTop: spacing.xs / 2,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
  },
  linkText: {
    ...typography.labelMedium,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  alertHeaderText: {
    flex: 1,
  },
  alertSubtitle: {
    ...typography.bodySmall,
    marginTop: spacing.xs / 2,
  },
  alertsList: {
    gap: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  alertContent: {
    flex: 1,
  },
  alertName: {
    ...typography.labelLarge,
    marginBottom: spacing.xs,
  },
  alertReasons: {
    gap: spacing.xs / 2,
  },
  alertReason: {
    ...typography.bodySmall,
  },
  alertArrow: {
    ...typography.h3,
    marginLeft: spacing.sm,
  },
  viewAllButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    ...typography.labelMedium,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  tableHeaderCell: {
    ...typography.labelMedium,
  },
  tableBody: {
    gap: spacing.xs / 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  tableCell: {
    ...typography.bodyMedium,
  },
  tableCellText: {
    ...typography.bodyMedium,
  },
  nameColumn: {
    flex: 2,
  },
  numberColumn: {
    flex: 1,
    textAlign: 'right',
  },
  inactiveBadge: {
    ...typography.bodySmall,
    marginTop: spacing.xs / 2,
  },
  chartContainer: {
    gap: spacing.md,
  },
  chartRow: {
    gap: spacing.sm,
  },
  chartLabel: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs,
  },
  chartBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chartBar: {
    height: 24,
    borderRadius: borderRadius.sm,
    minWidth: 2,
  },
  chartValue: {
    ...typography.bodySmall,
    minWidth: 60,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    ...typography.labelMedium,
    textAlign: 'center',
  },
});
