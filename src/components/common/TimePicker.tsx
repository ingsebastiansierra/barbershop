/**
 * TimePicker Component
 * Professional time picker with hour and minute selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

interface TimePickerProps {
  label?: string;
  value: string; // Format: "HH:mm"
  onTimeChange: (time: string) => void;
  error?: string;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
}

const { width } = Dimensions.get('window');

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onTimeChange,
  error,
  disabled = false,
  minTime,
  maxTime,
}) => {
  const { colors } = useThemeStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value.split(':')[0] || '09');
  const [selectedMinute, setSelectedMinute] = useState(value.split(':')[1] || '00');

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleConfirm = () => {
    const newTime = `${selectedHour}:${selectedMinute}`;
    onTimeChange(newTime);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    // Reset to current value
    setSelectedHour(value.split(':')[0] || '09');
    setSelectedMinute(value.split(':')[1] || '00');
    setIsModalVisible(false);
  };

  const handleOpen = () => {
    if (!disabled) {
      setSelectedHour(value.split(':')[0] || '09');
      setSelectedMinute(value.split(':')[1] || '00');
      setIsModalVisible(true);
    }
  };

  const isTimeDisabled = (hour: string, minute: string): boolean => {
    const time = `${hour}:${minute}`;
    if (minTime && time < minTime) return true;
    if (maxTime && time > maxTime) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
          disabled && styles.disabled,
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text
          style={[
            styles.inputText,
            { color: disabled ? colors.textSecondary : colors.textPrimary },
          ]}
        >
          {value || 'Seleccionar hora'}
        </Text>
        <Text style={[styles.icon, { color: colors.textSecondary }]}>🕐</Text>
      </TouchableOpacity>

      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Seleccionar Hora
              </Text>
            </View>

            <View style={styles.pickerContainer}>
              {/* Hours Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>
                  Hora
                </Text>
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {hours.map((hour) => {
                    const isDisabled = isTimeDisabled(hour, selectedMinute);
                    const isSelected = hour === selectedHour;

                    return (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.pickerItem,
                          isSelected && {
                            backgroundColor: colors.primary + '20',
                            borderColor: colors.primary,
                          },
                          isDisabled && styles.disabledItem,
                        ]}
                        onPress={() => !isDisabled && setSelectedHour(hour)}
                        disabled={isDisabled}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            {
                              color: isSelected
                                ? colors.primary
                                : isDisabled
                                ? colors.textSecondary
                                : colors.textPrimary,
                            },
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <Text style={[styles.separator, { color: colors.textPrimary }]}>:</Text>

              {/* Minutes Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>
                  Minutos
                </Text>
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {minutes.map((minute) => {
                    const isDisabled = isTimeDisabled(selectedHour, minute);
                    const isSelected = minute === selectedMinute;

                    return (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerItem,
                          isSelected && {
                            backgroundColor: colors.primary + '20',
                            borderColor: colors.primary,
                          },
                          isDisabled && styles.disabledItem,
                        ]}
                        onPress={() => !isDisabled && setSelectedMinute(minute)}
                        disabled={isDisabled}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            {
                              color: isSelected
                                ? colors.primary
                                : isDisabled
                                ? colors.textSecondary
                                : colors.textPrimary,
                            },
                            isSelected && styles.selectedText,
                          ]}
                        >
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleConfirm}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  inputText: {
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  scrollView: {
    maxHeight: 240,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
  },
  disabledItem: {
    opacity: 0.3,
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: '500',
  },
  selectedText: {
    fontWeight: '700',
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
