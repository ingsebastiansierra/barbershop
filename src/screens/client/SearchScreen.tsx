/**
 * SearchScreen
 * Screen for searching barbershops and barbers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { barberService } from '../../services/barber.service';
import { barbershopService } from '../../services/barbershop.service';
import { BarberWithUser } from '../../types/models';

type NavigationProp = NativeStackNavigationProp<ClientStackParamList>;

export const SearchScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search barbers
  const { data: barbers = [], isLoading } = useQuery({
    queryKey: ['searchBarbers', debouncedSearchTerm],
    queryFn: () => barberService.searchBarbers(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
  });

  const handleBarberPress = async (barber: BarberWithUser) => {
    // Get barbershop info
    const barbershop = await barbershopService.getBarbershopById(barber.barbershop_id);
    
    // Navigate to book appointment with pre-selected barber
    navigation.navigate('BookAppointment', {
      barbershopId: barber.barbershop_id,
      barberId: barber.id,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const renderBarberItem = ({ item }: { item: BarberWithUser }) => (
    <TouchableOpacity
      style={[styles.barberCard, { backgroundColor: colors.surface }]}
      onPress={() => handleBarberPress(item)}
    >
      <View style={[styles.barberAvatar, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.barberAvatarText, { color: colors.primary }]}>
          {item.user.full_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
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
            ⭐ {item.rating.toFixed(1)}
          </Text>
          <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>
            ({item.total_reviews} reseñas)
          </Text>
        </View>
      </View>

      <View style={[styles.bookButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.bookButtonText}>Agendar</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;

    return (
      <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>
          {debouncedSearchTerm ? '🔍' : '💈'}
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {debouncedSearchTerm
            ? 'No se encontraron barberos'
            : 'Busca tu barbero favorito'}
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
          {debouncedSearchTerm
            ? 'Intenta con otro nombre o especialidad'
            : 'Escribe el nombre del barbero o especialidad'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>
          🔍
        </Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar barbero por nombre o especialidad..."
          placeholderTextColor={colors.textDisabled}
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoFocus
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Text style={[styles.clearIcon, { color: colors.textSecondary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results count */}
      {!isLoading && barbers.length > 0 && (
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {barbers.length} {barbers.length === 1 ? 'barbero encontrado' : 'barberos encontrados'}
        </Text>
      )}

      {/* Results list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Buscando barberos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={barbers}
          renderItem={renderBarberItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 18,
  },
  resultsCount: {
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  barberAvatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  barberInfo: {
    flex: 1,
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
  bookButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
