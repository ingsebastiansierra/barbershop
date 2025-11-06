/**
 * BookAppointmentScreen
 * Screen for booking appointments with stepper
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useBarbershop } from '../../hooks/useBarbershops';
import { useQuery } from '@tanstack/react-query';
import { barberService } from '../../services/barber.service';
import { serviceService } from '../../services/service.service';
import { useAvailability } from '../../hooks/useAvailability';
import { useCreateAppointment } from '../../hooks/useAppointments';
import { CalendarPicker } from '../../components/appointment/CalendarPicker';
import { TimeSlotPicker } from '../../components/appointment/TimeSlotPicker';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Service, BarberWithUser } from '../../types/models';
import { showToast } from '../../utils/toast';

type Props = NativeStackScreenProps<ClientStackParamList, 'BookAppointment'>;

type Step = 1 | 2 | 3 | 4;

export const BookAppointmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barbershopId, barberId: initialBarberId } = route.params;
  const { colors } = useThemeStore();

  // State
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberWithUser | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch data
  const { data: barbershop } = useBarbershop(barbershopId);
  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services', barbershopId],
    queryFn: () => serviceService.getServicesByBarbershop(barbershopId),
  });
  const { data: barbers = [], isLoading: loadingBarbers } = useQuery({
    queryKey: ['barbers', barbershopId],
    queryFn: () => barberService.getActiveBarbersByBarbershop(barbershopId),
  });

  // Fetch availability
  const {
    data: availableSlots = [],
    isLoading: loadingAvailability,
  } = useAvailability(
    selectedBarber?.id || '',
    selectedDate.toISOString().split('T')[0],
    selectedService?.id || '',
    currentStep === 3 && !!selectedBarber && !!selectedService
  );

  // Create appointment mutation
  const createAppointmentMutation = useCreateAppointment();

  // Set initial barber if provided
  useEffect(() => {
    if (initialBarberId && barbers.length > 0) {
      const barber = barbers.find((b) => b.id === initialBarberId);
      if (barber) {
        setSelectedBarber(barber);
      }
    }
  }, [initialBarberId, barbers]);

  const handleNext = () => {
    if (currentStep === 1 && !selectedService) {
      showToast.error('Por favor selecciona un servicio');
      return;
    }
    if (currentStep === 2 && !selectedBarber) {
      showToast.error('Por favor selecciona un barbero');
      return;
    }
    if (currentStep === 3 && !selectedTime) {
      showToast.error('Por favor selecciona un horario');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedBarber || !selectedTime) {
      showToast.error('Faltan datos para completar la reserva');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    if (!selectedService || !selectedBarber || !selectedTime) return;

    try {
      showToast.loading('Creando cita...');

      await createAppointmentMutation.mutateAsync({
        barbershop_id: barbershopId,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTime,
      });

      setShowConfirmModal(false);
      showToast.success('¡Cita agendada exitosamente!', '✅ Confirmado');

      // Navigate back to home or appointments
      navigation.navigate('ClientTabs', { screen: 'Appointments' });
    } catch (error: any) {
      setShowConfirmModal(false);
      showToast.error(
        error.message || 'No se pudo crear la cita',
        'Error al agendar'
      );
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor:
                  step <= currentStep ? colors.primary : colors.surface,
                borderColor: step <= currentStep ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                {
                  color: step <= currentStep ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor:
                    step < currentStep ? colors.primary : colors.border,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Selecciona un servicio
      </Text>

      {loadingServices ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    selectedService?.id === service.id
                      ? colors.primary
                      : colors.border,
                  borderWidth: selectedService?.id === service.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedService(service)}
            >
              <View style={styles.serviceHeader}>
                <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
                  {service.name}
                  {service.is_combo && (
                    <Text style={[styles.comboTag, { color: colors.secondary }]}>
                      {' '}
                      🎁 COMBO
                    </Text>
                  )}
                </Text>
                <Text style={[styles.servicePrice, { color: colors.primary }]}>
                  ${service.price.toFixed(2)}
                </Text>
              </View>
              {service.description && (
                <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                  {service.description}
                </Text>
              )}
              <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>
                ⏱️ {serviceService.formatDuration(service.duration_minutes)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Selecciona un barbero
      </Text>

      {loadingBarbers ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {barbers.map((barber) => (
            <TouchableOpacity
              key={barber.id}
              style={[
                styles.barberCard,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    selectedBarber?.id === barber.id ? colors.primary : colors.border,
                  borderWidth: selectedBarber?.id === barber.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedBarber(barber)}
            >
              <View
                style={[
                  styles.barberAvatar,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Text style={[styles.barberAvatarText, { color: colors.primary }]}>
                  {barber.user.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.barberInfo}>
                <Text style={[styles.barberName, { color: colors.textPrimary }]}>
                  {barber.user.full_name}
                </Text>
                {barber.specialties.length > 0 && (
                  <Text style={[styles.barberSpecialties, { color: colors.textSecondary }]}>
                    {barber.specialties.join(', ')}
                  </Text>
                )}
                <View style={styles.barberRating}>
                  <Text style={[styles.ratingText, { color: colors.warning }]}>
                    ⭐ {barber.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>
                    ({barber.total_reviews} reseñas)
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Selecciona fecha y hora
      </Text>

      <CalendarPicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        minDate={new Date()}
      />

      <View style={{ height: 16 }} />

      <TimeSlotPicker
        selectedTime={selectedTime || undefined}
        onTimeSelect={setSelectedTime}
        availableSlots={availableSlots}
        barberId={selectedBarber?.id || ''}
        serviceId={selectedService?.id || ''}
        date={selectedDate}
        isLoading={loadingAvailability}
        groupByPeriod
      />

      {availableSlots.length === 0 && !loadingAvailability && (
        <View style={[styles.waitlistContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.waitlistText, { color: colors.textPrimary }]}>
            No hay horarios disponibles para esta fecha
          </Text>
          <Text style={[styles.waitlistSubtext, { color: colors.textSecondary }]}>
            ¿Deseas unirte a la lista de espera?
          </Text>
          <Button
            title="Unirse a lista de espera"
            onPress={() => showToast.info('Funcionalidad próximamente')}
            variant="outline"
            size="sm"
          />
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        Confirmar reserva
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
          Resumen de la cita
        </Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Barbería:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {barbershop?.name}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Servicio:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {selectedService?.name}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Barbero:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {selectedBarber?.user.full_name}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Fecha:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {selectedDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Hora:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {selectedTime}
          </Text>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Duración:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {serviceService.formatDuration(selectedService?.duration_minutes || 0)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
            Total:
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            ${selectedService?.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={[styles.navigationButtons, { backgroundColor: colors.background }]}>
        {currentStep > 1 && (
          <Button
            title="Atrás"
            onPress={handleBack}
            variant="outline"
            size="lg"
            style={styles.backButton}
          />
        )}
        {currentStep < 4 ? (
          <Button
            title="Siguiente"
            onPress={handleNext}
            variant="primary"
            size="lg"
            style={currentStep === 1 ? styles.fullWidthButton : styles.nextButton}
          />
        ) : (
          <Button
            title="Confirmar"
            onPress={handleConfirmBooking}
            variant="primary"
            size="lg"
            loading={createAppointmentMutation.isPending}
            style={styles.confirmButton}
          />
        )}
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalConfirm}
        title="Confirmar Cita"
        message={`¿Estás seguro de agendar esta cita?\n\n📅 ${selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}\n🕐 ${selectedTime}\n💈 ${selectedBarber?.user.full_name}\n✂️ ${selectedService?.name}\n💰 $${selectedService?.price.toFixed(2)}`}
        confirmText="Sí, confirmar"
        cancelText="Cancelar"
        icon="💈"
        loading={createAppointmentMutation.isPending}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  comboTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceDuration: {
    fontSize: 12,
  },
  barberCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  barberAvatar: {
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
  barberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  barberSpecialties: {
    fontSize: 12,
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
  waitlistContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  waitlistText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  waitlistSubtext: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
});
