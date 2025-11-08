/**
 * BarberDetailScreen
 * Screen showing barber details
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { barberService } from '../../services/barber.service';
import { ChatButton } from '../../components/chat';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<ClientStackParamList, 'BarberDetail'>;

export const BarberDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberId } = route.params;
  const { colors } = useThemeStore();

  // Fetch barber details
  const { data: barber, isLoading } = useQuery({
    queryKey: ['barber', barberId],
    queryFn: () => barberService.getBarberById(barberId),
  });

  const handleBookAppointment = () => {
    if (barber) {
      navigation.navigate('BookAppointment', {
        barbershopId: barber.barbershop_id,
        barberId: barber.id,
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

  if (!barber) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Barbero no encontrado
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            {barber.user.avatar ? (
              <Image source={{ uri: barber.user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}>
                <Text style={styles.avatarText}>
                  {barber.user.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Barber Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {barber.user.full_name}
          </Text>

          {barber.specialties.length > 0 && (
            <View style={styles.specialtiesContainer}>
              {barber.specialties.map((specialty, index) => (
                <View
                  key={index}
                  style={[styles.specialtyBadge, { backgroundColor: colors.primary + '20' }]}
                >
                  <Text style={[styles.specialtyText, { color: colors.primary }]}>
                    {specialty}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingText, { color: colors.warning }]}>
              ⭐ {(barber.rating || 0).toFixed(1)}
            </Text>
            <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>
              ({barber.total_reviews || 0} reseñas)
            </Text>
          </View>

          {/* Bio */}
          {barber.bio && (
            <View style={styles.bioContainer}>
              <Text style={[styles.bioTitle, { color: colors.textPrimary }]}>
                Sobre mí
              </Text>
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>
                {barber.bio}
              </Text>
            </View>
          )}

          {/* Experience */}
          {barber.years_of_experience && (
            <View style={styles.experienceContainer}>
              <Text style={[styles.experienceLabel, { color: colors.textSecondary }]}>
                Experiencia
              </Text>
              <Text style={[styles.experienceValue, { color: colors.textPrimary }]}>
                {barber.years_of_experience} {barber.years_of_experience === 1 ? 'año' : 'años'}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom padding for floating buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.floatingButtonContainer, { backgroundColor: colors.background }]}>
        <View style={styles.buttonRow}>
          <View style={styles.bookButtonContainer}>
            <Button
              title="Reservar Cita"
              onPress={handleBookAppointment}
              variant="primary"
              size="lg"
            />
          </View>
          <View style={styles.chatButtonContainer}>
            <ChatButton
              barberId={barber.id}
              barberName={barber.user.full_name}
              barberAvatar={barber.user.avatar}
              variant="secondary"
              size="medium"
            />
          </View>
        </View>
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
  header: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContainer: {
    padding: 16,
    marginTop: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  specialtyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 14,
  },
  bioContainer: {
    marginBottom: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  experienceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  experienceLabel: {
    fontSize: 14,
  },
  experienceValue: {
    fontSize: 16,
    fontWeight: '600',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bookButtonContainer: {
    flex: 2,
  },
  chatButtonContainer: {
    flex: 1,
  },
});
