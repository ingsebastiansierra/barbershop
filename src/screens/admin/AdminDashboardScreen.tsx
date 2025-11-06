/**
 * AdminDashboardScreen
 * Dashboard screen for barbershop administrators
 * Shows metrics, revenue trends, and quick actions
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
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { statisticsService } from '../../services/statistics.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AdminStackParamList } from '../../types/navigation';
import { spacing, typography, borderRadius } from '../../styles/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export const AdminDashboardScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const { data: barbershop, isLoading: barbershopLoading } = useAdminBarbershop();

  // Fetch dashboard metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-metrics', barbershop?.id],
    queryFn: () => statisticsService.getDashboardMetrics(barbershop!.id),
    enabled: !!barbershop,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const isLoading = barbershopLoading || metricsLoading;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando dashboard...
        </Text>
      </View>
    );
  }

  if (error || !barbershop) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Error al cargar el dashboard
        </Text>
        <Button title="Reintentar" onPress={() => refetch()} variant="outline" />
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
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {barbershop.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Dashboard del mes
        </Text>
      </View>

      {/* Metrics Cards */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {metrics?.total_appointments || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Citas del mes
          </Text>
        </Card>

        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.success }]}>
            ${metrics?.total_revenue.toFixed(2) || '0.00'}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Ingresos
          </Text>
        </Card>

        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.secondary }]}>
            {metrics?.new_clients || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Clientes nuevos
          </Text>
        </Card>

        <Card style={styles.metricCard} variant="elevated">
          <Text style={[styles.metricValue, { color: colors.warning }]}>
            {metrics?.cancellation_rate.toFixed(1) || '0.0'}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Cancelaciones
          </Text>
        </Card>
      </View>

      {/* Today's Summary */}
      <Card style={styles.section} variant="outlined">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Resumen de hoy
        </Text>
        <View style={styles.todayStats}>
          <View style={styles.todayStat}>
            <Text style={[styles.todayValue, { color: colors.textPrimary }]}>
              {metrics?.today_appointments || 0}
            </Text>
            <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>
              Citas hoy
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.todayStat}>
            <Text style={[styles.todayValue, { color: colors.textPrimary }]}>
              {metrics?.pending_appointments || 0}
            </Text>
            <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>
              Pendientes
            </Text>
          </View>
        </View>
      </Card>

      {/* Revenue Trend */}
      {metrics?.revenue_trend && metrics.revenue_trend.length > 0 && (
        <Card style={styles.section} variant="outlined">
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Tendencia de ingresos
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Statistics')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Ver más
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.trendList}>
            {metrics.revenue_trend.slice(-3).reverse().map((item) => (
              <View key={item.month} style={styles.trendItem}>
                <Text style={[styles.trendMonth, { color: colors.textPrimary }]}>
                  {format(new Date(item.month + '-01'), 'MMMM yyyy', { locale: es })}
                </Text>
                <View style={styles.trendValues}>
                  <Text style={[styles.trendRevenue, { color: colors.success }]}>
                    ${item.revenue.toFixed(2)}
                  </Text>
                  <Text style={[styles.trendAppointments, { color: colors.textSecondary }]}>
                    {item.appointments} citas
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Top Barbers */}
      {metrics?.top_barbers && metrics.top_barbers.length > 0 && (
        <Card style={styles.section} variant="outlined">
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Top barberos
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Barbers')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.barbersList}>
            {metrics.top_barbers.slice(0, 3).map((barber, index) => (
              <View key={barber.barber_id} style={styles.barberItem}>
                <View style={styles.barberRank}>
                  <Text style={[styles.rankNumber, { color: colors.primary }]}>
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.barberInfo}>
                  <Text style={[styles.barberName, { color: colors.textPrimary }]}>
                    {barber.barber_name}
                  </Text>
                  <Text style={[styles.barberStats, { color: colors.textSecondary }]}>
                    {barber.total_appointments} citas • ${barber.total_revenue.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.barberRating}>
                  <Text style={[styles.ratingText, { color: colors.warning }]}>
                    ⭐ {barber.average_rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.section} variant="filled">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Acciones rápidas
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Barbers')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary }]}>👨‍💼</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Barberos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Services')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary }]}>✂️</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Servicios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Text style={[styles.actionIcon, { color: colors.primary }]}>📅</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Citas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('BarbershopSettings')}
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
  todayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  todayStat: {
    alignItems: 'center',
    flex: 1,
  },
  todayValue: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  todayLabel: {
    ...typography.bodySmall,
  },
  divider: {
    width: 1,
    height: 40,
  },
  trendList: {
    gap: spacing.sm,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  trendMonth: {
    ...typography.bodyMedium,
    textTransform: 'capitalize',
  },
  trendValues: {
    alignItems: 'flex-end',
  },
  trendRevenue: {
    ...typography.labelLarge,
    marginBottom: spacing.xs / 2,
  },
  trendAppointments: {
    ...typography.bodySmall,
  },
  barbersList: {
    gap: spacing.sm,
  },
  barberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  barberRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    ...typography.h4,
  },
  barberInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  barberName: {
    ...typography.labelLarge,
    marginBottom: spacing.xs / 2,
  },
  barberStats: {
    ...typography.bodySmall,
  },
  barberRating: {
    marginLeft: spacing.sm,
  },
  ratingText: {
    ...typography.labelMedium,
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
