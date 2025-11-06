import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { TimeSlot } from '../../types/models';
import { formatTimeForDisplay } from '../../utils/availability';

interface TimeSlotPickerProps {
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  availableSlots: TimeSlot[];
  barberId: string;
  serviceId: string;
  date: Date;
  isLoading?: boolean;
  groupByPeriod?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedTime,
  onTimeSelect,
  availableSlots,
  isLoading = false,
  groupByPeriod = true,
}) => {
  const { colors } = useThemeStore();

  const groupSlotsByPeriod = () => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    availableSlots.forEach((slot) => {
      const hour = parseInt(slot.time.split(':')[0]);

      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const renderSlot = (slot: TimeSlot) => {
    const isSelected = selectedTime === slot.time;

    return (
      <TouchableOpacity
        key={slot.time}
        style={[
          styles.timeSlot,
          {
            backgroundColor: isSelected ? colors.primary : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => onTimeSelect(slot.time)}
      >
        <Text
          style={[
            styles.timeSlotText,
            {
              color: isSelected ? '#FFFFFF' : colors.textPrimary,
            },
          ]}
        >
          {formatTimeForDisplay(slot.time)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPeriodSection = (
    title: string,
    slots: TimeSlot[],
    icon: string
  ) => {
    if (slots.length === 0) return null;

    return (
      <View style={styles.periodSection}>
        <View style={styles.periodHeader}>
          <Text style={styles.periodIcon}>{icon}</Text>
          <Text style={[styles.periodTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.slotCount, { color: colors.textSecondary }]}>
            {slots.length} disponibles
          </Text>
        </View>
        <View style={styles.slotsGrid}>{slots.map(renderSlot)}</View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando horarios disponibles...
        </Text>
      </View>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyIcon, { color: colors.textDisabled }]}>
          📅
        </Text>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          No hay horarios disponibles
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Por favor selecciona otra fecha o barbero
        </Text>
      </View>
    );
  }

  if (groupByPeriod) {
    const { morning, afternoon, evening } = groupSlotsByPeriod();

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {renderPeriodSection('Mañana', morning, '🌅')}
        {renderPeriodSection('Tarde', afternoon, '☀️')}
        {renderPeriodSection('Noche', evening, '🌙')}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slotsGrid}>{availableSlots.map(renderSlot)}</View>
    </ScrollView>
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
    padding: 32,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  periodSection: {
    marginBottom: 24,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  periodIcon: {
    fontSize: 20,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotCount: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
