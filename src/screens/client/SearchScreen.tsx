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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { barberService } from '../../services/barber.service';
import { barbershopService } from '../../services/barbershop.service';
import { BarberWithUser, Barbershop } from '../../types/models';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<ClientStackParamList>;
type SearchCategory = 'all' | 'barbershops' | 'barbers';

export const SearchScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all barbershops
  const { data: allBarbershops = [], isLoading: loadingBarbershops } = useQuery({
    queryKey: ['barbershops'],
    queryFn: () => barbershopService.getBarbershops({ is_active: true }),
  });

  // Fetch all barbers
  const { data: allBarbers = [], isLoading: loadingBarbers } = useQuery({
    queryKey: ['allBarbers'],
    queryFn: () => barberService.getBarbers({ is_active: true }),
  });

  // Filter based on search term
  const filteredBarbershops = debouncedSearchTerm
    ? allBarbershops.filter((shop) =>
        shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    : allBarbershops;

  const filteredBarbers = debouncedSearchTerm
    ? allBarbers.filter((barber) =>
        barber.user.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        barber.specialties.some((s) => s.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      )
    : allBarbers;

  const isLoading = loadingBarbershops || loadingBarbers;

  const handleBarbershopPress = (barbershopId: string) => {
    navigation.navigate('BarbershopDetail', { barbershopId });
  };

  const handleBarberPress = async (barber: BarberWithUser) => {
    navigation.navigate('BookAppointment', {
      barbershopId: barber.barbershop_id,
      barberId: barber.id,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const categories = [
    { id: 'all', label: 'Todo', icon: 'grid-outline' },
    { id: 'barbershops', label: 'Barberías', icon: 'business-outline' },
    { id: 'barbers', label: 'Barberos', icon: 'people-outline' },
  ];

  const getDisplayData = () => {
    if (selectedCategory === 'barbershops') {
      return { barbershops: filteredBarbershops, barbers: [] };
    }
    if (selectedCategory === 'barbers') {
      return { barbershops: [], barbers: filteredBarbers };
    }
    return { barbershops: filteredBarbershops, barbers: filteredBarbers };
  };

  const { barbershops, barbers } = getDisplayData();
  const totalResults = barbershops.length + barbers.length;

  const renderBarbershopItem = ({ item }: { item: Barbershop }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => handleBarbershopPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name="business" size={28} color={colors.primary} />
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          <Ionicons name="location" size={12} color={colors.textSecondary} /> {item.address}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
              {(item.rating || 0).toFixed(1)}
            </Text>
          </View>
          {item.phone && (
            <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
              <Ionicons name="call" size={12} /> {item.phone}
            </Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderBarberItem = ({ item }: { item: BarberWithUser }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => handleBarberPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: colors.success + '20' }]}>
        <Text style={[styles.avatarText, { color: colors.success }]}>
          {item.user.full_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {item.user.full_name}
        </Text>
        {item.specialties.length > 0 && (
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.specialties.join(', ')}
          </Text>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
              {(item.rating || 0).toFixed(1)}
            </Text>
            <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>
              ({item.total_reviews || 0})
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.bookButton, { backgroundColor: colors.primary }]}>
        <Ionicons name="calendar" size={16} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;

    return (
      <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
        <Ionicons 
          name={debouncedSearchTerm ? 'search-outline' : 'cut-outline'} 
          size={64} 
          color={colors.textSecondary} 
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {debouncedSearchTerm
            ? 'No se encontraron resultados'
            : 'Explora barberías y barberos'}
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
          {debouncedSearchTerm
            ? 'Intenta con otro término de búsqueda'
            : 'Usa el buscador o navega por categorías'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar barberías o barberos..."
          placeholderTextColor={colors.textDisabled}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              { 
                backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
                borderColor: selectedCategory === category.id ? colors.primary : colors.border,
              }
            ]}
            onPress={() => setSelectedCategory(category.id as SearchCategory)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={category.icon as any} 
              size={18} 
              color={selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary} 
            />
            <Text style={[
              styles.categoryLabel,
              { color: selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      {!isLoading && totalResults > 0 && (
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </Text>
      )}

      {/* Results list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando resultados...
          </Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {barbershops.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Barberías ({barbershops.length})
              </Text>
              {barbershops.map((item) => (
                <View key={item.id}>
                  {renderBarbershopItem({ item })}
                </View>
              ))}
            </View>
          )}

          {barbers.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Barberos ({barbers.length})
              </Text>
              {barbers.map((item) => (
                <View key={item.id}>
                  {renderBarberItem({ item })}
                </View>
              ))}
            </View>
          )}

          {totalResults === 0 && renderEmptyState()}
        </ScrollView>
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
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 12,
  },
  phoneText: {
    fontSize: 12,
  },
  bookButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
