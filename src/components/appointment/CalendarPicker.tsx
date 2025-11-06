import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

interface CalendarPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateChange,
  availableDates = [],
  minDate = new Date(),
  maxDate,
}) => {
  const { colors } = useThemeStore();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isDateAvailable = (date: Date): boolean => {
    if (availableDates.length === 0) return true;
    return availableDates.some(
      (availableDate) =>
        availableDate.toDateString() === date.toDateString()
    );
  };

  const isDateDisabled = (date: Date): boolean => {
    if (date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const renderDays = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        days.push(
          <View key={`empty-${i}`} style={styles.dayCell}>
            <View style={styles.emptyDay} />
          </View>
        );
      } else {
        const date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          dayNumber
        );
        const available = isDateAvailable(date);
        const disabled = isDateDisabled(date);
        const selected = isDateSelected(date);

        days.push(
          <TouchableOpacity
            key={`day-${i}`}
            style={styles.dayCell}
            onPress={() => !disabled && onDateChange(date)}
            disabled={disabled}
          >
            <View
              style={[
                styles.day,
                selected && {
                  backgroundColor: colors.primary,
                },
                disabled && styles.disabledDay,
                !available && !disabled && styles.unavailableDay,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: colors.textPrimary },
                  selected && styles.selectedDayText,
                  disabled && { color: colors.textDisabled },
                ]}
              >
                {dayNumber}
              </Text>
              {available && !disabled && !selected && (
                <View
                  style={[
                    styles.availableDot,
                    { backgroundColor: colors.success },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      }
    }

    return days;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={[styles.navButtonText, { color: colors.primary }]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={[styles.monthYear, { color: colors.textPrimary }]}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={[styles.navButtonText, { color: colors.primary }]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <Text style={[styles.dayName, { color: colors.textSecondary }]}>
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>{renderDays()}</View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.success }]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Disponible
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.primary }]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Seleccionado
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 32,
    fontWeight: '600',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  emptyDay: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabledDay: {
    opacity: 0.3,
  },
  unavailableDay: {
    opacity: 0.5,
  },
  availableDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
});
