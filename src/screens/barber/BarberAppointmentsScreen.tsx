/**
 * BarberAppointmentsScreen
 * Screen showing all barber's appointments with filters and search
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
import { useAppointments } from '../../hooks/useAppointments';
import { Input } from '../../components/common/Input';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { AppointmentStatus, AppointmentWithDetails } from '../../types/models';
import { BarberStackParamList } from '../../types/navigation';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

type NavigationProp = NativeStackNavigationProp<BarberStackParamList>;

type StatusFilter = 'all' | AppointmentStatus;

export const BarberAppointmentsScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState<'current' | 'previous' | 'next'>('current');

  // Calculate date range
  const today = new Date();
  const getDateRange = () => {
    let start: Date;
    let end: Date;

    switch (dateRange) {
      case 'previous':
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case 'next':
        start = startOfMonth(addMonths(today, 1));
        end = endOfMonth(addMonths(today, 1));
        break;
      default:
        start = startOfMonth(today);
        end = endOfMonth(today);
    }

    return {
      date_from: format(start, 'yyyy-MM-dd'),
      date_to: format(end, 'yyyy-MM-dd'),
    };
  };

  const { date_from, date_to } = getDateRange();

  // Fetch appointments
  const { data: appointments = [], isLoading, refetch, isRefetching } = useAppointments({
    barber_id: user?.id,
    date_from,
    date_to,
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });

  // Filter appointments by search query
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;

    const query = searchQuery.toLowerCase();
    return appointments.filter((apt) => {
      const clientName = apt.client?.full_name?.toLowerCase() || '';
      const serviceName = apt.service?.name?.toLowerCase() || '';
      return clientName.includes(query) || serviceName.includes(query);
    });
  }, [appointments, searchQuery]);

  const handleAppointmentPress = (appointmentId: string) => {
    navigation.navigate('AppointmentDetail', { appointmentId });
  };

  const renderStatusFilter = (status: StatusFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: statusFilter === status ? colors.primary : colors.surface,
          borderColor: statusFilter === status ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setStatusFilter(status)}
    >
      <Text
        style={[
          styles.filterChipText,
          {
            color: statusFilter === status ? '#FFFFFF' : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDateRangeButton = (range: 'current' | 'previous' | 'next', label: string) => (
    <TouchableOpacity
      style={[
        styles.dateRangeButton,
        {
          backgroundColor: dateRange === range ? colors.primary + '20' : 'transparent',
        },
      ]}
      onPress={() => setDateRange(range)}
    >
      <Text
        style={[
          styles.dateRangeButtonText,
          {
            color: dateRange === range ? colors.primary : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
        {searchQuery
          ? 'No se encontraron citas con ese criterio'
          : 'No tienes citas en este período'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          label=""
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por cliente o servicio..."
        />
      </View>

      {/* Date Range Selector */}
      <View style={styles.dateRangeContainer}>
        {renderDateRangeButton('previous', 'Mes anterior')}
        {renderDateRangeButton('current', 'Este mes')}
        {renderDateRangeButton('next', 'Próximo mes')}
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        {renderStatusFilter('all', 'Todas')}
        {renderStatusFilter(AppointmentStatus.PENDING, 'Pendientes')}
        {renderStatusFilter(AppointmentStatus.CONFIRMED, 'Confirmadas')}
        {renderStatusFilter(AppointmentStatus.COMPLETED, 'Completadas')}
        {renderStatusFilter(AppointmentStatus.CANCELLED, 'Canceladas')}
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {filteredAppointments.length}{' '}
          {filteredAppointments.length === 1 ? 'cita encontrada' : 'citas encontradas'}
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
            refreshing={isRefetching}
            onRefresh={refetch}
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
  searchContainer: {
    marginBottom: 16,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateRangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
