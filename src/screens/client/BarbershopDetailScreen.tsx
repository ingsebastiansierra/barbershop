/**
 * BarbershopDetailScreen
 * Screen showing barbershop details
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useBarbershop } from '../../hooks/useBarbershops';
import { useQuery } from '@tanstack/react-query';
import { barberService } from '../../services/barber.service';
import { serviceService } from '../../services/service.service';
import { barbershopService } from '../../services/barbershop.service';
import { BarberWithUser, Service } from '../../types/models';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<ClientStackParamList, 'BarbershopDetail'>;

type TabType = 'services' | 'barbers' | 'reviews';

export const BarbershopDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barbershopId } = route.params;
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<TabType>('services');

  // Fetch barbershop details
  const { data: barbershop, isLoading: loadingBarbershop } = useBarbershop(barbershopId);

  // Fetch barbers
  const { data: barbers = [], isLoading: loadingBarbers } = useQuery({
    queryKey: ['barbers', barbershopId],
    queryFn: () => barberService.getActiveBarbersByBarbershop(barbershopId),
  });

  // Fetch services
  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services', barbershopId],
    queryFn: () => serviceService.getServicesByBarbershop(barbershopId),
  });

  const isOpen = barbershop ? barbershopService.isOpen(barbershop) : false;
  const todayHours = barbershop ? barbershopService.getTodayHours(barbershop) : null;

  const handleBookAppointment = () => {
    navigation.navigate('BookAppointment', { barbershopId });
  };

  const handleBarberPress = (barberId: string) => {
    navigation.navigate('BarberDetail', { barberId });
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={[styles.serviceCard, { backgroundColor: colors.surface }]}>
      <View style={styles.serviceHeader}>
        <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
          {item.name}
          {item.is_combo && (
            <Text style={[styles.comboTag, { color: colors.secondary }]}> 🎁 COMBO</Text>
          )}
        </Text>
        <Text style={[styles.servicePrice, { color: colors.primary }]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
      {item.description && (
        <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      )}
      <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>
        ⏱️ {serviceService.formatDuration(item.duration_minutes)}
      </Text>
    </View>
  );

  const renderBarberItem = ({ item }: { item: BarberWithUser }) => (
    <TouchableOpacity
      style={[styles.barberCard, { backgroundColor: colors.surface }]}
      onPress={() => handleBarberPress(item.id)}
      activeOpacity={0.7}
    >
      {item.user.avatar ? (
        <Image source={{ uri: item.user.avatar }} style={styles.barberAvatar} />
      ) : (
        <View style={[styles.barberAvatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.barberAvatarText, { color: colors.primary }]}>
            {item.user.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.barberInfo}>
        <Text style={[styles.barberName, { color: colors.textPrimary }]}>
          {item.user.full_name}
        </Text>
        {item.specialties.length > 0 && (
          <Text style={[styles.barberSpecialties, { color: colors.textSecondary }]}>
            {item.specialties.join(', ')}
          </Text>
        )}
        <View style={styles.barberRating}>
          <Text style={[styles.ratingText, { color: colors.warning }]}>
            ⭐ {(item.rating || 0).toFixed(1)}
          </Text>
          <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>
            ({item.total_reviews || 0} reseñas)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderReviewsTab = () => (
    <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
      <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>⭐</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Reseñas próximamente
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
        Estamos trabajando en esta funcionalidad
      </Text>
    </View>
  );

  if (loadingBarbershop) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!barbershop) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Barbería no encontrada
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {barbershop.logo_url ? (
            <Image source={{ uri: barbershop.logo_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.heroPlaceholderText, { color: colors.primary }]}>
                {barbershop.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Barbershop Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {barbershop.name}
          </Text>

          <Text style={[styles.address, { color: colors.textSecondary }]}>
            📍 {barbershop.address}
          </Text>

          {barbershop.phone && (
            <Text style={[styles.phone, { color: colors.textSecondary }]}>
              📞 {barbershop.phone}
            </Text>
          )}

          {/* Status and Hours */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOpen ? colors.success + '20' : colors.error + '20' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOpen ? colors.success : colors.error },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isOpen ? colors.success : colors.error },
                ]}
              >
                {isOpen ? 'Abierto ahora' : 'Cerrado'}
              </Text>
            </View>

            {todayHours && (
              <Text style={[styles.hours, { color: colors.textSecondary }]}>
                🕐 {todayHours.open} - {todayHours.close}
              </Text>
            )}
          </View>

          {barbershop.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {barbershop.description}
            </Text>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'services' && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('services')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'services' ? colors.primary : colors.textSecondary },
              ]}
            >
              Servicios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'barbers' && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('barbers')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'barbers' ? colors.primary : colors.textSecondary },
              ]}
            >
              Barberos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'reviews' && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'reviews' ? colors.primary : colors.textSecondary },
              ]}
            >
              Reseñas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'services' && (
            <>
              {loadingServices ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : services.length > 0 ? (
                <FlatList
                  data={services}
                  renderItem={renderServiceItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>✂️</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No hay servicios disponibles
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'barbers' && (
            <>
              {loadingBarbers ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : barbers.length > 0 ? (
                <FlatList
                  data={barbers}
                  renderItem={renderBarberItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>👨‍💼</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No hay barberos disponibles
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'reviews' && renderReviewsTab()}
        </View>

        {/* Bottom padding for floating button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Book Button */}
      <View style={[styles.floatingButtonContainer, { backgroundColor: colors.background }]}>
        <Button
          title="Agendar Cita"
          onPress={handleBookAppointment}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  heroContainer: {
    width: '100%',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 64,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hours: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  emptyState: {
    padding: 40,
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
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
