import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import {
  AppointmentWithDetails,
  AppointmentStatus,
} from '../../types/models';
import { formatTimeForDisplay } from '../../utils/availability';

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
  onPress: () => void;
  showActions?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onComplete?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  showActions = false,
  onCancel,
  onConfirm,
  onComplete,
}) => {
  const { colors } = useThemeStore();

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return colors.warning;
      case AppointmentStatus.CONFIRMED:
        return colors.info;
      case AppointmentStatus.COMPLETED:
        return colors.success;
      case AppointmentStatus.CANCELLED:
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'Pendiente';
      case AppointmentStatus.CONFIRMED:
        return 'Confirmada';
      case AppointmentStatus.COMPLETED:
        return 'Completada';
      case AppointmentStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const statusColor = getStatusColor(appointment.status);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with status */}
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <Text style={[styles.date, { color: colors.textPrimary }]}>
            {formatDate(appointment.appointment_date)}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formatTimeForDisplay(appointment.start_time)}
          </Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusText(appointment.status)}
          </Text>
        </View>
      </View>

      {/* Barber info */}
      <View style={styles.barberInfo}>
        {appointment.barber?.user?.avatar ? (
          <Image
            source={{ uri: appointment.barber.user.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {appointment.barber?.user?.nombre?.charAt(0).toUpperCase() || 'B'}
            </Text>
          </View>
        )}
        <View style={styles.barberDetails}>
          <Text style={[styles.barberName, { color: colors.textPrimary }]}>
            {appointment.barber?.user?.nombre || 'Barbero'}
          </Text>
          <Text style={[styles.serviceName, { color: colors.textSecondary }]}>
            {appointment.service?.name}
          </Text>
          {appointment.haircut_style && (
            <Text style={[styles.haircutStyleBadge, { color: colors.primary }]}>
              💇 {appointment.haircut_style.name}
            </Text>
          )}
        </View>
      </View>

      {/* Price and duration */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            ${appointment.total_price.toFixed(2)}
          </Text>
        </View>
        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          {appointment.service?.duration_minutes} min
        </Text>
      </View>

      {/* Action buttons */}
      {showActions && (
        <View style={styles.actions}>
          {appointment.status === AppointmentStatus.PENDING && onConfirm && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.success + '20' },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
            >
              <Text style={[styles.actionButtonText, { color: colors.success }]}>
                ✓ Confirmar
              </Text>
            </TouchableOpacity>
          )}

          {appointment.status === AppointmentStatus.CONFIRMED && onComplete && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + '20' },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onComplete();
              }}
            >
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Completar
              </Text>
            </TouchableOpacity>
          )}

          {(appointment.status === AppointmentStatus.PENDING ||
            appointment.status === AppointmentStatus.CONFIRMED) &&
            onCancel && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.error + '20' },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                <Text style={[styles.actionButtonText, { color: colors.error }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  barberDetails: {
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 14,
  },
  haircutStyleBadge: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  duration: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
