/**
 * SuperAdminBarbershopDetailScreen
 * Screen showing detailed barbershop statistics and information for super admin
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useBarbershop } from '../../hooks/useBarbershops';
import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '../../services/statistics.service';
import { supabase } from '../../supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppointmentStatus } from '../../types/models';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'SuperAdminBarbershopDetail'>;

export const SuperAdminBarbershopDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barbershopId } = route.params;
  const { colors } = useThemeStore();
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  const { data: barbershop, isLoading: barbershopLoading } = useBarbershop(barbershopId);

  const now = new Date();
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(now), 'yyyy-MM-dd');

  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['barbershop-metrics', barbershopId],
    queryFn: () => statisticsService.getDashboardMetrics(barbershopId),
    enabled: !!barbershopId,
  });

  const {
    data: topBarbers,
    isLoading: barbersLoading,
  } = useQuery({
    queryKey: ['barbershop-top-barbers', barbershopId],
    queryFn: () => statisticsService.getTopBarbers(barbershopId, 10),
    enabled: !!barbershopId,
  });

  // Fetch all appointments for this barbershop
  const {
    data: appointments,
    isLoading: appointmentsLoading,
  } = useQuery({
    queryKey: ['barbershop-appointments', barbershopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          barber:barbers(id, user:users(nombre, email)),
          client:users!appointments_client_id_fkey(nombre, email),
          service:services(name, price, duration_minutes)
        `)
        .eq('barbershop_id', barbershopId)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!barbershopId,
  });

  // Fetch all sales for this barbershop
  const {
    data: sales,
    isLoading: salesLoading,
  } = useQuery({
    queryKey: ['barbershop-sales', barbershopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          barber:barbers(id, user:users(nombre, email))
        `)
        .eq('barbershop_id', barbershopId)
        .order('sale_date', { ascending: false })
        .order('sale_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!barbershopId,
  });

  const isLoading = barbershopLoading || metricsLoading || barbersLoading || appointmentsLoading || salesLoading;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando detalles...
        </Text>
      </View>
    );
  }

  if (!barbershop) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          No se pudo cargar la barbería
        </Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {barbershop.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: barbershop.is_active
                  ? colors.success + '20'
                  : colors.error + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: barbershop.is_active ? colors.success : colors.error },
              ]}
            >
              {barbershop.is_active ? '✓ Activa' : '✕ Inactiva'}
            </Text>
          </View>
        </View>

        <Text style={[styles.address, { color: colors.textSecondary }]}>
          📍 {barbershop.address}
        </Text>

        {barbershop.phone && (
          <Text style={[styles.phone, { color: colors.textSecondary }]}>
            📞 {barbershop.phone}
          </Text>
        )}

        {barbershop.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {barbershop.description}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('EditBarbershop', { barbershopId })}
          >
            <Text style={styles.actionButtonText}>✏️ Editar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Grid */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Estadísticas del Mes Actual
      </Text>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: colors.success }]}>
            ${metrics?.total_revenue.toFixed(2) || '0.00'}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Ingresos Totales
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.metricCard, { backgroundColor: colors.surface }]}
          onPress={() => setShowAppointmentsModal(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {metrics?.total_appointments || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Citas Totales
          </Text>
          <Text style={[styles.metricHint, { color: colors.textSecondary }]}>
            👆 Ver desglose
          </Text>
        </TouchableOpacity>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: colors.info }]}>
            {metrics?.new_clients || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Nuevos Clientes
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.metricValue,
              {
                color:
                  (metrics?.cancellation_rate || 0) > 30
                    ? colors.error
                    : colors.warning,
              },
            ]}
          >
            {metrics?.cancellation_rate.toFixed(1) || '0.0'}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Tasa de Cancelación
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: colors.secondary }]}>
            {metrics?.pending_appointments || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Citas Pendientes
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {metrics?.today_appointments || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Citas Hoy
          </Text>
        </View>
      </View>

      {/* Revenue Trend */}
      {metrics?.revenue_trend && metrics.revenue_trend.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Tendencia de Ingresos (Últimos 6 Meses)
          </Text>

          <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
            {metrics.revenue_trend.map((trend) => {
              const maxRevenue = Math.max(
                ...metrics.revenue_trend.map((t) => t.revenue),
                1
              );
              const barWidth = (trend.revenue / maxRevenue) * 100;

              return (
                <View key={trend.month} style={styles.chartRow}>
                  <Text style={[styles.chartLabel, { color: colors.textPrimary }]}>
                    {trend.month}
                  </Text>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBar,
                        { width: `${barWidth}%`, backgroundColor: colors.primary },
                      ]}
                    />
                    <Text style={[styles.chartValue, { color: colors.textSecondary }]}>
                      ${trend.revenue.toFixed(0)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Top Barbers */}
      {topBarbers && topBarbers.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Top Barberos por Ingresos
          </Text>

          <View style={[styles.barbersContainer, { backgroundColor: colors.surface }]}>
            {topBarbers.map((barber, index) => (
              <View
                key={barber.barber_id}
                style={[
                  styles.barberRow,
                  index < topBarbers.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.barberRank}>
                  <Text style={[styles.rankNumber, { color: colors.primary }]}>
                    #{index + 1}
                  </Text>
                </View>

                <View style={styles.barberInfo}>
                  <Text style={[styles.barberName, { color: colors.textPrimary }]}>
                    {barber.barber_name}
                  </Text>
                  <Text style={[styles.barberStats, { color: colors.textSecondary }]}>
                    {barber.total_appointments} citas • {barber.completion_rate.toFixed(1)}%
                    completadas
                  </Text>
                </View>

                <View style={styles.barberRevenue}>
                  <Text style={[styles.revenueAmount, { color: colors.success }]}>
                    ${barber.total_revenue.toFixed(0)}
                  </Text>
                  {barber.average_rating > 0 && (
                    <Text style={[styles.rating, { color: colors.warning }]}>
                      ⭐ {barber.average_rating.toFixed(1)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* All Appointments */}
      {appointments && appointments.length > 0 && (
        <>
          <View style={styles.appointmentsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Todas las Citas ({appointments.length})
            </Text>
            {appointments.length > 5 && (
              <TouchableOpacity
                onPress={() => setShowAllAppointments(!showAllAppointments)}
              >
                <Text style={[styles.toggleText, { color: colors.primary }]}>
                  {showAllAppointments ? 'Ver menos' : 'Ver todas'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.appointmentsContainer, { backgroundColor: colors.surface }]}>
            {(showAllAppointments ? appointments : appointments.slice(0, 5)).map(
              (appointment: any, index: number) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case AppointmentStatus.COMPLETED:
                      return colors.success;
                    case AppointmentStatus.CONFIRMED:
                      return colors.info;
                    case AppointmentStatus.PENDING:
                      return colors.warning;
                    case AppointmentStatus.CANCELLED:
                      return colors.error;
                    default:
                      return colors.textSecondary;
                  }
                };

                const getStatusLabel = (status: string) => {
                  switch (status) {
                    case AppointmentStatus.COMPLETED:
                      return '✓ Completada';
                    case AppointmentStatus.CONFIRMED:
                      return '✓ Confirmada';
                    case AppointmentStatus.PENDING:
                      return '⏳ Pendiente';
                    case AppointmentStatus.CANCELLED:
                      return '✕ Cancelada';
                    default:
                      return status;
                  }
                };

                const appointmentDate = new Date(
                  `${appointment.appointment_date}T${appointment.start_time}`
                );

                return (
                  <View
                    key={appointment.id}
                    style={[
                      styles.appointmentCard,
                      index < (showAllAppointments ? appointments : appointments.slice(0, 5)).length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentDateContainer}>
                        <Text style={[styles.appointmentDate, { color: colors.textPrimary }]}>
                          📅 {format(appointmentDate, "d 'de' MMMM, yyyy", { locale: es })}
                        </Text>
                        <Text style={[styles.appointmentTime, { color: colors.textSecondary }]}>
                          🕐 {appointment.start_time} - {appointment.end_time}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.appointmentStatusBadge,
                          { backgroundColor: getStatusColor(appointment.status) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.appointmentStatusText,
                            { color: getStatusColor(appointment.status) },
                          ]}
                        >
                          {getStatusLabel(appointment.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.appointmentDetails}>
                      <View style={styles.appointmentDetailRow}>
                        <Text style={[styles.appointmentDetailLabel, { color: colors.textSecondary }]}>
                          Cliente:
                        </Text>
                        <Text style={[styles.appointmentDetailValue, { color: colors.textPrimary }]}>
                          {appointment.client?.nombre || appointment.client?.email || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.appointmentDetailRow}>
                        <Text style={[styles.appointmentDetailLabel, { color: colors.textSecondary }]}>
                          Barbero:
                        </Text>
                        <Text style={[styles.appointmentDetailValue, { color: colors.textPrimary }]}>
                          {appointment.barber?.user?.nombre || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.appointmentDetailRow}>
                        <Text style={[styles.appointmentDetailLabel, { color: colors.textSecondary }]}>
                          Servicio:
                        </Text>
                        <Text style={[styles.appointmentDetailValue, { color: colors.textPrimary }]}>
                          {appointment.service?.name || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.appointmentDetailRow}>
                        <Text style={[styles.appointmentDetailLabel, { color: colors.textSecondary }]}>
                          Duración:
                        </Text>
                        <Text style={[styles.appointmentDetailValue, { color: colors.textPrimary }]}>
                          {appointment.service?.duration_minutes || 0} min
                        </Text>
                      </View>

                      <View style={styles.appointmentDetailRow}>
                        <Text style={[styles.appointmentDetailLabel, { color: colors.textSecondary }]}>
                          Precio:
                        </Text>
                        <Text
                          style={[
                            styles.appointmentDetailValue,
                            styles.appointmentPrice,
                            { color: colors.success },
                          ]}
                        >
                          ${Number(appointment.total_price || 0).toFixed(2)}
                        </Text>
                      </View>

                      {appointment.notes && (
                        <View style={styles.appointmentNotes}>
                          <Text style={[styles.appointmentDetailLabel, { color: colors.textSecondary }]}>
                            Notas:
                          </Text>
                          <Text style={[styles.appointmentNotesText, { color: colors.textPrimary }]}>
                            {appointment.notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              }
            )}
          </View>

          {!showAllAppointments && appointments.length > 5 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setShowAllAppointments(true)}
            >
              <Text style={[styles.viewAllButtonText, { color: colors.primary }]}>
                Ver todas las {appointments.length} citas →
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* All Sales */}
      {sales && sales.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Ventas Directas ({sales.length})
          </Text>

          <View style={[styles.salesContainer, { backgroundColor: colors.surface }]}>
            {sales.slice(0, 10).map((sale: any, index: number) => {
              const saleDate = new Date(`${sale.sale_date}T${sale.sale_time}`);

              return (
                <View
                  key={sale.id}
                  style={[
                    styles.saleCard,
                    index < Math.min(sales.length, 10) - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.saleHeader}>
                    <View style={styles.saleDateContainer}>
                      <Text style={[styles.saleDate, { color: colors.textPrimary }]}>
                        📅 {format(saleDate, "d 'de' MMMM, yyyy", { locale: es })}
                      </Text>
                      <Text style={[styles.saleTime, { color: colors.textSecondary }]}>
                        🕐 {sale.sale_time}
                      </Text>
                    </View>
                    <Text style={[styles.saleAmount, { color: colors.success }]}>
                      ${Number(sale.amount || 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.saleDetails}>
                    <View style={styles.saleDetailRow}>
                      <Text style={[styles.saleDetailLabel, { color: colors.textSecondary }]}>
                        Servicio:
                      </Text>
                      <Text style={[styles.saleDetailValue, { color: colors.textPrimary }]}>
                        {sale.service_name}
                      </Text>
                    </View>

                    <View style={styles.saleDetailRow}>
                      <Text style={[styles.saleDetailLabel, { color: colors.textSecondary }]}>
                        Barbero:
                      </Text>
                      <Text style={[styles.saleDetailValue, { color: colors.textPrimary }]}>
                        {sale.barber?.user?.nombre || 'N/A'}
                      </Text>
                    </View>

                    {sale.client_name && (
                      <View style={styles.saleDetailRow}>
                        <Text style={[styles.saleDetailLabel, { color: colors.textSecondary }]}>
                          Cliente:
                        </Text>
                        <Text style={[styles.saleDetailValue, { color: colors.textPrimary }]}>
                          {sale.client_name}
                        </Text>
                      </View>
                    )}

                    <View style={styles.saleDetailRow}>
                      <Text style={[styles.saleDetailLabel, { color: colors.textSecondary }]}>
                        Método de pago:
                      </Text>
                      <Text style={[styles.saleDetailValue, { color: colors.textPrimary }]}>
                        {sale.payment_method === 'cash' && '💵 Efectivo'}
                        {sale.payment_method === 'card' && '💳 Tarjeta'}
                        {sale.payment_method === 'transfer' && '🏦 Transferencia'}
                        {sale.payment_method === 'other' && '💰 Otro'}
                      </Text>
                    </View>

                    {sale.notes && (
                      <View style={styles.saleNotes}>
                        <Text style={[styles.saleDetailLabel, { color: colors.textSecondary }]}>
                          Notas:
                        </Text>
                        <Text style={[styles.saleNotesText, { color: colors.textPrimary }]}>
                          {sale.notes}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {sales.length > 10 && (
            <Text style={[styles.moreItemsText, { color: colors.textSecondary }]}>
              Y {sales.length - 10} ventas más...
            </Text>
          )}
        </>
      )}
    </ScrollView>

      {/* Modal de Desglose de Citas */}
      <Modal
        visible={showAppointmentsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAppointmentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Desglose de Citas del Mes
              </Text>
              <TouchableOpacity
                onPress={() => setShowAppointmentsModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Total */}
              <View style={[styles.modalSection, { backgroundColor: colors.background }]}>
                <Text style={[styles.modalSectionTitle, { color: colors.textPrimary }]}>
                  📊 Total del Mes
                </Text>
                <Text style={[styles.modalTotalValue, { color: colors.primary }]}>
                  {metrics?.total_appointments || 0} transacciones
                </Text>
              </View>

              {/* Citas Agendadas */}
              <View style={[styles.modalSection, { backgroundColor: colors.background }]}>
                <View style={styles.modalSectionHeader}>
                  <Text style={[styles.modalSectionTitle, { color: colors.textPrimary }]}>
                    📅 Citas Agendadas
                  </Text>
                  <View style={[styles.modalBadge, { backgroundColor: colors.info + '20' }]}>
                    <Text style={[styles.modalBadgeText, { color: colors.info }]}>
                      {appointments?.filter((apt: any) => {
                        const aptDate = new Date(apt.appointment_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return aptDate >= monthStart && aptDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.modalSectionDesc, { color: colors.textSecondary }]}>
                  Citas reservadas a través del sistema de agendamiento
                </Text>

                {/* Desglose por estado */}
                <View style={styles.modalBreakdown}>
                  <View style={styles.modalBreakdownRow}>
                    <Text style={[styles.modalBreakdownLabel, { color: colors.textSecondary }]}>
                      ✓ Completadas:
                    </Text>
                    <Text style={[styles.modalBreakdownValue, { color: colors.success }]}>
                      {appointments?.filter((apt: any) => {
                        const aptDate = new Date(apt.appointment_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return apt.status === AppointmentStatus.COMPLETED && 
                               aptDate >= monthStart && aptDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>

                  <View style={styles.modalBreakdownRow}>
                    <Text style={[styles.modalBreakdownLabel, { color: colors.textSecondary }]}>
                      ⏳ Pendientes:
                    </Text>
                    <Text style={[styles.modalBreakdownValue, { color: colors.warning }]}>
                      {appointments?.filter((apt: any) => {
                        const aptDate = new Date(apt.appointment_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return apt.status === AppointmentStatus.PENDING && 
                               aptDate >= monthStart && aptDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>

                  <View style={styles.modalBreakdownRow}>
                    <Text style={[styles.modalBreakdownLabel, { color: colors.textSecondary }]}>
                      ✕ Canceladas:
                    </Text>
                    <Text style={[styles.modalBreakdownValue, { color: colors.error }]}>
                      {appointments?.filter((apt: any) => {
                        const aptDate = new Date(apt.appointment_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return apt.status === AppointmentStatus.CANCELLED && 
                               aptDate >= monthStart && aptDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Ventas Directas */}
              <View style={[styles.modalSection, { backgroundColor: colors.background }]}>
                <View style={styles.modalSectionHeader}>
                  <Text style={[styles.modalSectionTitle, { color: colors.textPrimary }]}>
                    💰 Ventas Directas
                  </Text>
                  <View style={[styles.modalBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.modalBadgeText, { color: colors.success }]}>
                      {sales?.filter((sale: any) => {
                        const saleDate = new Date(sale.sale_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return saleDate >= monthStart && saleDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.modalSectionDesc, { color: colors.textSecondary }]}>
                  Servicios registrados directamente sin cita previa
                </Text>

                {/* Desglose por método de pago */}
                <View style={styles.modalBreakdown}>
                  <View style={styles.modalBreakdownRow}>
                    <Text style={[styles.modalBreakdownLabel, { color: colors.textSecondary }]}>
                      💵 Efectivo:
                    </Text>
                    <Text style={[styles.modalBreakdownValue, { color: colors.textPrimary }]}>
                      {sales?.filter((sale: any) => {
                        const saleDate = new Date(sale.sale_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return sale.payment_method === 'cash' && 
                               saleDate >= monthStart && saleDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>

                  <View style={styles.modalBreakdownRow}>
                    <Text style={[styles.modalBreakdownLabel, { color: colors.textSecondary }]}>
                      💳 Tarjeta:
                    </Text>
                    <Text style={[styles.modalBreakdownValue, { color: colors.textPrimary }]}>
                      {sales?.filter((sale: any) => {
                        const saleDate = new Date(sale.sale_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return sale.payment_method === 'card' && 
                               saleDate >= monthStart && saleDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>

                  <View style={styles.modalBreakdownRow}>
                    <Text style={[styles.modalBreakdownLabel, { color: colors.textSecondary }]}>
                      🏦 Transferencia:
                    </Text>
                    <Text style={[styles.modalBreakdownValue, { color: colors.textPrimary }]}>
                      {sales?.filter((sale: any) => {
                        const saleDate = new Date(sale.sale_date);
                        const now = new Date();
                        const monthStart = startOfMonth(now);
                        const monthEnd = endOfMonth(now);
                        return sale.payment_method === 'transfer' && 
                               saleDate >= monthStart && saleDate <= monthEnd;
                      }).length || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAppointmentsModal(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  address: {
    fontSize: 14,
    marginBottom: 6,
  },
  phone: {
    fontSize: 14,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  chartRow: {
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  chartBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartBar: {
    height: 24,
    borderRadius: 6,
    minWidth: 2,
  },
  chartValue: {
    fontSize: 13,
    minWidth: 60,
  },
  barbersContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  barberRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  barberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  barberStats: {
    fontSize: 12,
  },
  barberRevenue: {
    alignItems: 'flex-end',
  },
  revenueAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  rating: {
    fontSize: 12,
  },
  appointmentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  appointmentCard: {
    paddingVertical: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentDateContainer: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 13,
  },
  appointmentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    gap: 8,
  },
  appointmentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentDetailLabel: {
    fontSize: 13,
    flex: 1,
  },
  appointmentDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  appointmentPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  appointmentNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  appointmentNotesText: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: -12,
    marginBottom: 24,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  salesContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  saleCard: {
    paddingVertical: 16,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  saleDateContainer: {
    flex: 1,
  },
  saleDate: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  saleTime: {
    fontSize: 13,
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  saleDetails: {
    gap: 8,
  },
  saleDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleDetailLabel: {
    fontSize: 13,
    flex: 1,
  },
  saleDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  saleNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saleNotesText: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  moreItemsText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: -12,
    marginBottom: 24,
  },
  metricHint: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    fontWeight: '300',
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSectionDesc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  modalTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  modalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalBreakdown: {
    gap: 8,
  },
  modalBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  modalBreakdownLabel: {
    fontSize: 14,
  },
  modalBreakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButton: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
