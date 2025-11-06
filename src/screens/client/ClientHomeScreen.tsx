/**
 * ClientHomeScreen
 * Home screen for clients showing nearby barbershops and upcoming appointments
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { useBarbershops } from '../../hooks/useBarbershops';
import { useUpcomingAppointments } from '../../hooks/useAppointments';
import { BarbershopCard } from '../../components/barbershop/BarbershopCard';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { Barbershop } from '../../types/models';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<ClientStackParamList>;

export const ClientHomeScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const { user, getUserDisplayName, getUserInitials } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch barbershops
  const {
    data: barbershops = [],
    isLoading: loadingBarbershops,
    refetch: refetchBarbershops,
  } = useBarbershops({ is_active: true });

  // Fetch upcoming appointments
  const {
    data: upcomingAppointments = [],
    isLoading: loadingAppointments,
    refetch: refetchAppointments,
  } = useUpcomingAppointments();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBarbershops(), refetchAppointments()]);
    setRefreshing(false);
  };

  const handleBarbershopPress = (barbershopId: string) => {
    navigation.navigate('BarbershopDetail', { barbershopId });
  };

  const handleAppointmentPress = (appointmentId: string) => {
    navigation.navigate('AppointmentDetail', { appointmentId });
  };

  const handleSearchPress = () => {
    navigation.navigate('ClientTabs', { screen: 'Search' });
  };

  const renderBarbershopItem = ({ item }: { item: Barbershop }) => (
    <View style={styles.barbershopItem}>
      <BarbershopCard
        barbershop={item}
        onPress={() => handleBarbershopPress(item.id)}
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header with avatar and name */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Hola,
          </Text>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {getUserDisplayName()}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            <View style={[styles.badge, { backgroundColor: colors.error }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.avatar,
              { backgroundColor: colors.primary + '20', borderColor: colors.primary },
            ]}
            onPress={() => navigation.navigate('ClientTabs', { screen: 'Profile' })}
            activeOpacity={0.7}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {getUserInitials()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: colors.surface }]}
        onPress={handleSearchPress}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
          Buscar barberías o barberos...
        </Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
          onPress={handleSearchPress}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="calendar" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionTitle}>Agendar Cita</Text>
          <Text style={styles.quickActionSubtitle}>Reserva ahora</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="time" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionTitle}>Historial</Text>
          <Text style={styles.quickActionSubtitle}>Ver citas pasadas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: colors.warning }]}
          onPress={handleSearchPress}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="star" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionTitle}>Favoritos</Text>
          <Text style={styles.quickActionSubtitle}>Tus preferidos</Text>
        </TouchableOpacity>
      </View>

      {/* Próximas Citas Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Próximas Citas
          </Text>
          {upcomingAppointments.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ClientTabs', { screen: 'Appointments' })}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                Ver todas
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingAppointments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : upcomingAppointments.length > 0 ? (
          <View>
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => handleAppointmentPress(appointment.id)}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>
              📅
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tienes citas próximas
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
              Busca una barbería y agenda tu primera cita
            </Text>
          </View>
        )}
      </View>

      {/* Barberías Cercanas Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Barberías Cercanas
          </Text>
          {barbershops.length > 3 && (
            <TouchableOpacity onPress={handleSearchPress}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                Ver todas
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingBarbershops ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : barbershops.length > 0 ? (
          <FlatList
            data={barbershops.slice(0, 5)}
            renderItem={renderBarbershopItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barbershopsList}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>
              💈
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay barberías disponibles
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
              Intenta buscar en otra ubicación
            </Text>
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  barbershopsList: {
    paddingRight: 16,
  },
  barbershopItem: {
    width: 280,
    marginRight: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
