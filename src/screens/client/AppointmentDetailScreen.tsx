/**
 * AppointmentDetailScreen
 * Screen showing appointment details for clients
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import {
  useAppointment,
  useCancelAppointment,
} from '../../hooks/useAppointments';
import { Button } from '../../components/common/Button';
import { AppointmentStatus } from '../../types/models';
import { formatTimeForDisplay } from '../../utils/availability';
import { serviceService } from '../../services/service.service';
import { showToast } from '../../utils/toast';

type Props = NativeStackScreenProps<ClientStackParamList, 'AppointmentDetail'>;

export const AppointmentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const { colors } = useThemeStore();

  // Fetch appointment details
  const { data: appointment, isLoading } = useAppointment(appointmentId);

  // Cancel appointment mutation
  const cancelAppointmentMutation = useCancelAppointment();

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
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro que deseas cancelar esta cita?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              showToast.loading('Cancelando cita...');
              await cancelAppointmentMutation.mutateAsync({
                id: appointmentId,
                reason: 'Cancelada por el cliente',
              });
              showToast.success('Cita cancelada exitosamente');
              navigation.goBack();
            } catch (error: any) {
              showToast.error(
                error.message || 'No se pudo cancelar la cita',
                'Error'
              );
            }
          },
        },
      ]
    );
  };

  const handleViewBarbershop = () => {
    if (appointment) {
      navigation.navigate('BarbershopDetail', {
        barbershopId: appointment.barbershop_id,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Cita no encontrada
        </Text>
      </View>
    );
  }

  const statusColor = getStatusColor(appointment.status);
  const canCancel =
    appointment.status === AppointmentStatus.PENDING ||
    appointment.status === AppointmentStatus.CONFIRMED;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor + '20' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColor },
            ]}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusText(appointment.status)}
          </Text>
        </View>
      </View>

      {/* Date and Time */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          📅 Fecha y Hora
        </Text>
        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
          {formatDate(appointment.appointment_date)}
        </Text>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {formatTimeForDisplay(appointment.start_time)} -{' '}
          {formatTimeForDisplay(appointment.end_time)}
        </Text>
      </View>

      {/* Barber Info */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          💈 Barbero
        </Text>
        <View style={styles.barberInfo}>
          {appointment.barber?.user?.avatar ? (
            <Image
              source={{ uri: appointment.barber.user.avatar }}
              style={styles.barberAvatar}
            />
          ) : (
            <View
              style={[
                styles.barberAvatarPlaceholder,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.barberAvatarText, { color: colors.primary }]}>
                {appointment.barber?.user?.nombre?.charAt(0).toUpperCase() || 'B'}
              </Text>
            </View>
          )}
          <View style={styles.barberDetails}>
            <Text style={[styles.barberName, { color: colors.textPrimary }]}>
              {appointment.barber?.user?.nombre || 'Barbero'}
            </Text>
            {appointment.barber?.specialties &&
              appointment.barber.specialties.length > 0 && (
                <Text style={[styles.barberSpecialties, { color: colors.textSecondary }]}>
                  {appointment.barber.specialties.join(', ')}
                </Text>
              )}
            {appointment.barber?.rating !== undefined && (
              <View style={styles.barberRating}>
                <Text style={[styles.ratingText, { color: colors.warning }]}>
                  ⭐ {appointment.barber.rating.toFixed(1)}
                </Text>
                <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>
                  ({appointment.barber.total_reviews} reseñas)
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Service Info */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          ✂️ Servicio
        </Text>
        <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
          {appointment.service?.name}
          {appointment.service?.is_combo && (
            <Text style={[styles.comboTag, { color: colors.secondary }]}>
              {' '}
              🎁 COMBO
            </Text>
          )}
        </Text>
        {appointment.service?.description && (
          <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
            {appointment.service.description}
          </Text>
        )}
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetailItem}>
            <Text style={[styles.serviceDetailLabel, { color: colors.textSecondary }]}>
              Duración:
            </Text>
            <Text style={[styles.serviceDetailValue, { color: colors.textPrimary }]}>
              {serviceService.formatDuration(
                appointment.service?.duration_minutes || 0
              )}
            </Text>
          </View>
          <View style={styles.serviceDetailItem}>
            <Text style={[styles.serviceDetailLabel, { color: colors.textSecondary }]}>
              Precio:
            </Text>
            <Text style={[styles.serviceDetailValue, { color: colors.primary }]}>
              ${appointment.total_price.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Barbershop Info */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          🏪 Barbería
        </Text>
        <Text style={[styles.barbershopName, { color: colors.textPrimary }]}>
          {appointment.barbershop?.name}
        </Text>
        <Text style={[styles.barbershopAddress, { color: colors.textSecondary }]}>
          📍 {appointment.barbershop?.address}
        </Text>
        {appointment.barbershop?.phone && (
          <Text style={[styles.barbershopPhone, { color: colors.textSecondary }]}>
            📞 {appointment.barbershop.phone}
          </Text>
        )}
        <Button
          title="Ver Barbería"
          onPress={handleViewBarbershop}
          variant="outline"
          size="sm"
        />
      </View>

      {/* Notes */}
      {appointment.notes && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            📝 Notas
          </Text>
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            {appointment.notes}
          </Text>
        </View>
      )}

      {/* Cancellation Info */}
      {appointment.status === AppointmentStatus.CANCELLED &&
        appointment.cancellation_reason && (
          <View style={[styles.card, { backgroundColor: colors.error + '10' }]}>
            <Text style={[styles.cardTitle, { color: colors.error }]}>
              ❌ Motivo de Cancelación
            </Text>
            <Text style={[styles.cancellationText, { color: colors.textSecondary }]}>
              {appointment.cancellation_reason}
            </Text>
            {appointment.cancelled_at && (
              <Text style={[styles.cancellationDate, { color: colors.textDisabled }]}>
                Cancelada el{' '}
                {new Date(appointment.cancelled_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>
        )}

      {/* Cancel Button */}
      {canCancel && (
        <View style={styles.actionButtons}>
          <Button
            title="Cancelar Cita"
            onPress={handleCancelAppointment}
            variant="outline"
            size="lg"
            loading={cancelAppointmentMutation.isPending}
            fullWidth
          />
        </View>
      )}

      {/* Bottom padding */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 16,
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  barberAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberAvatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  barberDetails: {
    flex: 1,
  },
  barberName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  barberSpecialties: {
    fontSize: 14,
    marginBottom: 4,
  },
  barberRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  comboTag: {
    fontSize: 14,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceDetailItem: {
    flex: 1,
  },
  serviceDetailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  serviceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  barbershopName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  barbershopAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  barbershopPhone: {
    fontSize: 14,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cancellationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cancellationDate: {
    fontSize: 12,
  },
  actionButtons: {
    marginTop: 8,
  },
});
