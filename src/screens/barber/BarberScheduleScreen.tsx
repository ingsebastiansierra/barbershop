/**
 * BarberScheduleScreen
 * Screen showing barber's schedule with calendar and appointment list
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { useAppointments, useAppointmentMutations } from '../../hooks/useAppointments';
import { CalendarPicker } from '../../components/appointment/CalendarPicker';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { AppointmentStatus, AppointmentWithDetails } from '../../types/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type FilterType = 'all' | 'pending' | 'confirmed';

export const BarberScheduleScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<FilterType>('all');

  // Fetch appointments for the barber
  const { data: appointments = [], isLoading, refetch, isRefetching } = useAppointments({
    barber_id: user?.id,
  });

  const { confirm, complete, cancel } = useAppointmentMutations();

  // Filter appointments by selected date
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = appointments.filter(
    (apt) => apt.appointment_date === selectedDateString
  );

  // Apply status filter
  const filteredAppointments = dayAppointments.filter((apt) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return apt.status === AppointmentStatus.PENDING;
    if (filter === 'confirmed') return apt.status === AppointmentStatus.CONFIRMED;
    return true;
  });

  // Get dates with appointments for calendar
  const datesWithAppointments = Array.from(
    new Set(
      appointments
        .filter(
          (apt) =>
            apt.status === AppointmentStatus.PENDING ||
            apt.status === AppointmentStatus.CONFIRMED
        )
        .map((apt) => apt.appointment_date)
    )
  ).map((dateStr) => new Date(dateStr + 'T00:00:00'));

  const handleConfirm = async (appointmentId: string) => {
    try {
      await confirm.mutateAsync(appointmentId);
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    try {
      await complete.mutateAsync(appointmentId);
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancel.mutateAsync({ id: appointmentId, reason: 'Cancelado por el barbero' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const renderFilterButton = (filterType: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === filterType ? colors.primary : colors.surface,
          borderColor: filter === filterType ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: filter === filterType ? '#FFFFFF' : colors.textSecondary,
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
      onPress={() => {}}
      showActions={true}
      onConfirm={() => handleConfirm(item.id)}
      onComplete={() => handleComplete(item.id)}
      onCancel={() => handleCancel(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        No hay citas para este día
      </Text>
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <CalendarPicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            availableDates={datesWithAppointments}
            minDate={new Date()}
          />
        </View>

        {/* Selected Date Header */}
        <View style={styles.dateHeader}>
          <Text style={[styles.dateHeaderText, { color: colors.textPrimary }]}>
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </Text>
          <View
            style={[
              styles.appointmentCountBadge,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Text style={[styles.appointmentCountText, { color: colors.primary }]}>
              {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {renderFilterButton('all', 'Todas')}
          {renderFilterButton('pending', 'Pendientes')}
          {renderFilterButton('confirmed', 'Confirmadas')}
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsContainer}>
          {filteredAppointments.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    padding: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  appointmentCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentsContainer: {
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
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
