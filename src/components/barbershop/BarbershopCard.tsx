import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Barbershop, BarbershopWithDistance } from '../../types/models';
import { barbershopService } from '../../services/barbershop.service';

interface BarbershopCardProps {
  barbershop: Barbershop | BarbershopWithDistance;
  onPress: () => void;
  showDistance?: boolean;
}

export const BarbershopCard: React.FC<BarbershopCardProps> = ({
  barbershop,
  onPress,
  showDistance = false,
}) => {
  const { colors } = useThemeStore();

  const isOpen = barbershopService.isOpen(barbershop);
  const todayHours = barbershopService.getTodayHours(barbershop);

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const distance = 'distance_meters' in barbershop ? barbershop.distance_meters : undefined;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Logo */}
      {barbershop.logo_url ? (
        <Image source={{ uri: barbershop.logo_url }} style={styles.logo} />
      ) : (
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.logoText, { color: colors.primary }]}>
            {barbershop.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {barbershop.name}
          </Text>
          {showDistance && distance && (
            <Text style={[styles.distance, { color: colors.textSecondary }]}>
              {formatDistance(distance)}
            </Text>
          )}
        </View>

        <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
          📍 {barbershop.address}
        </Text>

        {/* Status and hours */}
        <View style={styles.footer}>
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
              {isOpen ? 'Abierto' : 'Cerrado'}
            </Text>
          </View>

          {todayHours && (
            <Text style={[styles.hours, { color: colors.textSecondary }]}>
              {todayHours.open} - {todayHours.close}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  distance: {
    fontSize: 12,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hours: {
    fontSize: 12,
  },
});
