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

      {/* Search bar */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: colors.surface }]}
        onPress={handleSearchPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>
          🔍
        </Text>
        <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
          Buscar barberías...
        </Text>
      </TouchableOpacity>

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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 16,
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
