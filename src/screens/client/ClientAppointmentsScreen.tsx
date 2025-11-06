/**
 * ClientAppointmentsScreen
 * Screen showing client's appointments with tabs
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import {
  useAppointments,
  useCancelAppointment,
} from '../../hooks/useAppointments';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { AppointmentStatus, AppointmentWithDetails } from '../../types/models';
import { showToast } from '../../utils/toast';

type NavigationProp = NativeStackNavigationProp<ClientStackParamList>;
type TabType = 'upcoming' | 'past' | 'cancelled';

export const ClientAppointmentsScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch appointments
  const {
    data: allAppointments = [],
    isLoading,
    refetch,
  } = useAppointments();

  // Cancel appointment mutation
  const cancelAppointmentMutation = useCancelAppointment();

  // Filter appointments by tab
  const filteredAppointments = React.useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (activeTab) {
      case 'upcoming':
        return allAppointments.filter(
          (apt) =>
            (apt.status === AppointmentStatus.PENDING ||
              apt.status === AppointmentStatus.CONFIRMED) &&
            apt.appointment_date >= today
        );
      case 'past':
        return allAppointments.filter(
          (apt) =>
            apt.status === AppointmentStatus.COMPLETED ||
            (apt.appointment_date < today &&
              apt.status !== AppointmentStatus.CANCELLED)
        );
      case 'cancelled':
        return allAppointments.filter(
          (apt) => apt.status === AppointmentStatus.CANCELLED
        );
      default:
        return [];
    }
  }, [allAppointments, activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAppointmentPress = (appointmentId: string) => {
    navigation.navigate('AppointmentDetail', { appointmentId });
  };

  const handleCancelAppointment = (appointment: AppointmentWithDetails) => {
    Alert.alert(
      'Cancelar Cita',
      `¿Estás seguro que deseas cancelar tu cita con ${appointment.barber.user.full_name}?`,
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
                id: appointment.id,
                reason: 'Cancelada por el cliente',
              });
              showToast.success('Cita cancelada exitosamente');
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

  const renderAppointmentItem = ({ item }: { item: AppointmentWithDetails }) => (
    <AppointmentCard
      appointment={item}
      onPress={() => handleAppointmentPress(item.id)}
      showActions={activeTab === 'upcoming'}
      onCancel={
        activeTab === 'upcoming'
          ? () => handleCancelAppointment(item)
          : undefined
      }
    />
  );

  const renderEmptyState = () => {
    let message = '';
    let icon = '';

    switch (activeTab) {
      case 'upcoming':
        message = 'No tienes citas próximas';
        icon = '📅';
        break;
      case 'past':
        message = 'No tienes citas pasadas';
        icon = '📋';
        break;
      case 'cancelled':
        message = 'No tienes citas canceladas';
        icon = '❌';
        break;
    }

    return (
      <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>
          {icon}
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {message}
        </Text>
        {activeTab === 'upcoming' && (
          <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
            Busca una barbería y agenda tu primera cita
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'upcoming' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Próximas
          </Text>
          {allAppointments.filter(
            (apt) =>
              (apt.status === AppointmentStatus.PENDING ||
                apt.status === AppointmentStatus.CONFIRMED) &&
              apt.appointment_date >= new Date().toISOString().split('T')[0]
          ).length > 0 && (
            <View
              style={[styles.badge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.badgeText}>
                {
                  allAppointments.filter(
                    (apt) =>
                      (apt.status === AppointmentStatus.PENDING ||
                        apt.status === AppointmentStatus.CONFIRMED) &&
                      apt.appointment_date >= new Date().toISOString().split('T')[0]
                  ).length
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'past' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'past' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Pasadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'cancelled' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'cancelled'
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Canceladas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
