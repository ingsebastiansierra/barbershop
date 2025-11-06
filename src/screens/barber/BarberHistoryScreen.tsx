/**
 * BarberHistoryScreen
 * Screen showing barber's completed appointment history with statistics
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { useAppointmentHistory } from '../../hooks/useAppointments';
import { useSalesStats } from '../../hooks/useSales';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { AppointmentWithDetails } from '../../types/models';
import { BarberStackParamList } from '../../types/navigation';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

type NavigationProp = NativeStackNavigationProp<BarberStackParamList>;

type DateRangeFilter = 'month' | '3months' | '6months' | 'year' | 'all';

export const BarberHistoryScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [dateRange, setDateRange] = useState<DateRangeFilter>('month');

  // Get date range for sales query
  const getDateRangeForQuery = () => {
    if (dateRange === 'all') {
      // Para "Todo", no aplicar filtro de fechas
      return { startDate: undefined, endDate: undefined };
    }

    const today = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'month':
        startDate = startOfMonth(today);
        break;
      case '3months':
        startDate = startOfMonth(subMonths(today, 3));
        break;
      case '6months':
        startDate = startOfMonth(subMonths(today, 6));
        break;
      case 'year':
        startDate = startOfMonth(subMonths(today, 12));
        break;
      default:
        return { startDate: undefined, endDate: undefined };
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: undefined, // No limitar fecha final para incluir ventas futuras
    };
  };

  const { startDate: salesStartDate, endDate: salesEndDate } = getDateRangeForQuery();

  // Fetch appointment history
  const { data: appointments = [], isLoading, refetch, isRefetching } = useAppointmentHistory();

  // Fetch sales statistics
  const {
    data: salesStats,
    isLoading: loadingSalesStats,
    refetch: refetchSalesStats,
  } = useSalesStats(user?.id || '', salesStartDate, salesEndDate);

  // Filter appointments by date range
  const filteredAppointments = useMemo(() => {
    if (dateRange === 'all') return appointments;

    const today = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'month':
        startDate = startOfMonth(today);
        break;
      case '3months':
        startDate = startOfMonth(subMonths(today, 3));
        break;
      case '6months':
        startDate = startOfMonth(subMonths(today, 6));
        break;
      case 'year':
        startDate = startOfMonth(subMonths(today, 12));
        break;
      default:
        return appointments;
    }

    const startDateString = format(startDate, 'yyyy-MM-dd');

    return appointments.filter(
      (apt) => apt.appointment_date >= startDateString
    );
  }, [appointments, dateRange]);

  // Calculate statistics combining appointments and sales
  const statistics = useMemo(() => {
    const totalAppointments = filteredAppointments.length;
    
    // Calculate revenue from appointments
    const appointmentsRevenue = filteredAppointments.reduce((sum, apt) => {
      const price = Number(apt.total_price || apt.service?.price || 0);
      return sum + price;
    }, 0);

    // Get sales statistics from the hook
    const salesCount = salesStats?.total_sales || 0;
    const salesRevenue = salesStats?.total_revenue || 0;

    // Total revenue from both sources
    const totalRevenue = appointmentsRevenue + salesRevenue;
    const totalServices = totalAppointments + salesCount;

    // Group by service to find most popular (from appointments only)
    const serviceCount: Record<string, number> = {};
    filteredAppointments.forEach((apt) => {
      const serviceName = apt.service?.name || 'Desconocido';
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
    });

    const mostPopularService = Object.entries(serviceCount).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || 'N/A';

    // Calculate average duration (only from appointments)
    const totalDuration = filteredAppointments.reduce(
      (sum, apt) => sum + (apt.service?.duration_minutes || 0),
      0
    );
    const averageDuration = totalAppointments > 0 ? totalDuration / totalAppointments : 0;

    return {
      totalAppointments,
      salesCount,
      totalServices,
      totalRevenue,
      appointmentsRevenue,
      salesRevenue,
      averageRevenue: totalServices > 0 ? totalRevenue / totalServices : 0,
      mostPopularService,
      averageDuration,
    };
  }, [filteredAppointments, salesStats]);

  const handleAppointmentPress = (appointmentId: string) => {
    navigation.navigate('AppointmentDetail', { appointmentId });
  };

  const renderDateRangeButton = (range: DateRangeFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: dateRange === range ? colors.primary : colors.surface,
          borderColor: dateRange === range ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setDateRange(range)}
    >
      <Text
        style={[
          styles.filterChipText,
          {
            color: dateRange === range ? '#FFFFFF' : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStatisticsCard = () => (
    <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>
        📊 Estadísticas del Período
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {statistics.totalServices}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Servicios
          </Text>
          <Text style={[styles.statSubtext, { color: colors.textDisabled }]}>
            {statistics.totalAppointments} citas + {statistics.salesCount} ventas
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            ${statistics.totalRevenue.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Ingresos Totales
          </Text>
          <Text style={[styles.statSubtext, { color: colors.textDisabled }]}>
            ${statistics.appointmentsRevenue.toFixed(2)} + ${statistics.salesRevenue.toFixed(2)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.info }]}>
            ${statistics.averageRevenue.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Promedio por Servicio
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {Math.round(statistics.averageDuration)} min
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Duración Promedio
          </Text>
        </View>

        <View style={[styles.statItem, styles.statItemWide]}>
          <Text style={[styles.statValue, { color: colors.secondary, fontSize: 16 }]}>
            {statistics.mostPopularService}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Servicio Más Popular
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAppointmentItem = ({ item }: { item: AppointmentWithDetails }) => (
    <AppointmentCard
      appointment={item}
      onPress={() => handleAppointmentPress(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        No hay citas completadas en este período
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Statistics Card */}
      {renderStatisticsCard()}

      {/* Date Range Filters */}
      <View style={styles.filtersContainer}>
        {renderDateRangeButton('month', 'Este mes')}
        {renderDateRangeButton('3months', '3 meses')}
        {renderDateRangeButton('6months', '6 meses')}
        {renderDateRangeButton('year', '1 año')}
        {renderDateRangeButton('all', 'Todo')}
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {filteredAppointments.length}{' '}
          {filteredAppointments.length === 1 ? 'cita' : 'citas'}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || loadingSalesStats}
            onRefresh={() => {
              refetch();
              refetchSalesStats();
            }}
            tintColor={colors.primary}
          />
        }
      />
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
  listContent: {
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItemWide: {
    minWidth: '100%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
