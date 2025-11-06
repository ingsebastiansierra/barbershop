/**
 * BarberAppointmentDetailScreen
 * Screen showing appointment details for barber with action buttons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarberStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useAppointment, useAppointmentMutations } from '../../hooks/useAppointments';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AppointmentStatus } from '../../types/models';
import { formatTimeForDisplay } from '../../utils/availability';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Props = NativeStackScreenProps<BarberStackParamList, 'AppointmentDetail'>;

export const BarberAppointmentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const { colors } = useThemeStore();
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const { data: appointment, isLoading } = useAppointment(appointmentId);
  const { confirm, complete, cancel, update } = useAppointmentMutations();

  React.useEffect(() => {
    if (appointment?.notes) {
      setNotes(appointment.notes);
    }
  }, [appointment]);

  const handleConfirm = () => {
    Alert.alert(
      'Confirmar Cita',
      '¿Estás seguro de que quieres confirmar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await confirm.mutateAsync(appointmentId);
              Alert.alert('Éxito', 'Cita confirmada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo confirmar la cita');
            }
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Completar Cita',
      '¿Estás seguro de que quieres marcar esta cita como completada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              await complete.mutateAsync(appointmentId);
              Alert.alert('Éxito', 'Cita completada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo completar la cita');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro de que quieres cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancel.mutateAsync({
                id: appointmentId,
                reason: 'Cancelado por el barbero',
              });
              Alert.alert('Éxito', 'Cita cancelada correctamente');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la cita');
            }
          },
        },
      ]
    );
  };

  const handleSaveNotes = async () => {
    try {
      await update.mutateAsync({
        id: appointmentId,
        updates: { notes },
      });
      setIsEditingNotes(false);
      Alert.alert('Éxito', 'Notas guardadas correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las notas');
    }
  };

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

  if (isLoading || !appointment) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statusColor = getStatusColor(appointment.status);
  const canConfirm = appointment.status === AppointmentStatus.PENDING;
  const canComplete = appointment.status === AppointmentStatus.CONFIRMED;
  const canCancel =
    appointment.status === AppointmentStatus.PENDING ||
    appointment.status === AppointmentStatus.CONFIRMED;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getStatusText(appointment.status)}
        </Text>
      </View>

      {/* Date and Time */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Fecha y Hora
        </Text>
        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
          {format(new Date(appointment.appointment_date + 'T00:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", {
            locale: es,
          })}
        </Text>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {formatTimeForDisplay(appointment.start_time)} -{' '}
          {formatTimeForDisplay(appointment.end_time)}
        </Text>
      </View>

      {/* Client Information */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Cliente
        </Text>
        <View style={styles.clientInfo}>
          {appointment.client?.avatar_url ? (
            <Image
              source={{ uri: appointment.client.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {appointment.client?.full_name?.charAt(0).toUpperCase() || 'C'}
              </Text>
            </View>
          )}
          <View style={styles.clientDetails}>
            <Text style={[styles.clientName, { color: colors.textPrimary }]}>
              {appointment.client?.full_name || 'Cliente'}
            </Text>
            {appointment.client?.email && (
              <Text style={[styles.clientContact, { color: colors.textSecondary }]}>
                {appointment.client.email}
              </Text>
            )}
            {appointment.client?.phone && (
              <Text style={[styles.clientContact, { color: colors.textSecondary }]}>
                {appointment.client.phone}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Service Information */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Servicio
        </Text>
        <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
          {appointment.service?.name}
        </Text>
        {appointment.service?.description && (
          <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
            {appointment.service.description}
          </Text>
        )}
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetailItem}>
            <Text style={[styles.serviceDetailLabel, { color: colors.textSecondary }]}>
              Duración
            </Text>
            <Text style={[styles.serviceDetailValue, { color: colors.textPrimary }]}>
              {appointment.service?.duration_minutes} min
            </Text>
          </View>
          <View style={styles.serviceDetailItem}>
            <Text style={[styles.serviceDetailLabel, { color: colors.textSecondary }]}>
              Precio
            </Text>
            <Text style={[styles.serviceDetailValue, { color: colors.primary }]}>
              ${appointment.total_price.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.notesHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Notas
          </Text>
          {!isEditingNotes && (
            <Button
              title="Editar"
              onPress={() => setIsEditingNotes(true)}
              variant="ghost"
              size="sm"
            />
          )}
        </View>
        {isEditingNotes ? (
          <>
            <Input
              label=""
              value={notes}
              onChangeText={setNotes}
              placeholder="Agregar notas sobre la cita..."
              multiline
              numberOfLines={4}
            />
            <View style={styles.notesActions}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setNotes(appointment.notes || '');
                  setIsEditingNotes(false);
                }}
                variant="outline"
                size="sm"
              />
              <Button
                title="Guardar"
                onPress={handleSaveNotes}
                size="sm"
                loading={update.isPending}
              />
            </View>
          </>
        ) : (
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            {notes || 'Sin notas'}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      {(canConfirm || canComplete || canCancel) && (
        <View style={styles.actionsContainer}>
          {canConfirm && (
            <Button
              title="Confirmar"
              onPress={handleConfirm}
              loading={confirm.isPending}
              fullWidth
            />
          )}
          {canComplete && (
            <Button
              title="Completar"
              onPress={handleComplete}
              loading={complete.isPending}
              fullWidth
            />
          )}
          {canCancel && (
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="outline"
              loading={cancel.isPending}
              fullWidth
            />
          )}
        </View>
      )}
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
  },
  content: {
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  clientContact: {
    fontSize: 14,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 24,
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
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  notesActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
});
