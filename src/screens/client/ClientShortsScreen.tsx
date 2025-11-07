/**
 * ClientShortsScreen
 * TikTok-style shorts feed for clients
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Share,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { getShortsWithLikeStatus, likeShort, unlikeShort, recordShortView } from '../../services/shortsService';
import { BarberShortWithDetails } from '../../types/models';
import { ShortItem, CommentsModal } from '../../components/shorts';
import Toast from 'react-native-toast-message';

const SCREEN_DIMENSIONS = Dimensions.get('screen');
const SCREEN_HEIGHT = SCREEN_DIMENSIONS.height;
const SCREEN_WIDTH = SCREEN_DIMENSIONS.width;

export const ClientShortsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Pause video when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  // Pause video when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsScreenFocused(false);
      } else if (nextAppState === 'active') {
        setIsScreenFocused(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Fetch shorts
  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ['shorts-feed', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await getShortsWithLikeStatus(user.id, 50, 0);
      console.log('Shorts loaded in screen:', result.map(s => ({
        id: s.id,
        likes: s.likes_count,
        comments: s.comments_count,
      })));
      return result;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  // Like/Unlike mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ shortId, isLiked }: { shortId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('Debes iniciar sesión');
      
      if (isLiked) {
        await unlikeShort(shortId, user.id);
      } else {
        await likeShort(shortId, user.id);
      }
    },
    onMutate: async ({ shortId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['shorts-feed'] });

      // Snapshot previous value
      const previousShorts = queryClient.getQueryData(['shorts-feed', user?.id]);

      // Optimistically update
      queryClient.setQueryData(['shorts-feed', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((short: BarberShortWithDetails) => {
          if (short.id === shortId) {
            const newLikesCount = isLiked ? Math.max(0, (short.likes_count || 0) - 1) : (short.likes_count || 0) + 1;
            console.log('Updating like:', { shortId, isLiked, oldCount: short.likes_count, newCount: newLikesCount });
            return {
              ...short,
              is_liked_by_user: !isLiked,
              likes_count: newLikesCount,
            };
          }
          return short;
        });
      });

      return { previousShorts };
    },
    onSuccess: () => {
      // Force refetch to get accurate data from server
      queryClient.invalidateQueries({ queryKey: ['shorts-feed'] });
    },
    onError: (error: any, variables, context: any) => {
      // Rollback on error
      if (context?.previousShorts) {
        queryClient.setQueryData(['shorts-feed', user?.id], context.previousShorts);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo actualizar el like',
      });
    },
  });

  // Record view mutation
  const recordViewMutation = useMutation({
    mutationFn: (shortId: string) => recordShortView(shortId, user?.id),
  });

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);
      
      // Record view
      const short = shorts[index];
      if (short) {
        recordViewMutation.mutate(short.id);
      }
    }
  }).current;

  const handleLike = (short: BarberShortWithDetails) => {
    toggleLikeMutation.mutate({
      shortId: short.id,
      isLiked: short.is_liked_by_user || false,
    });
  };

  const handleComment = (short: BarberShortWithDetails) => {
    console.log('Opening comments for short:', short.id, 'Current comments:', short.comments_count);
    setSelectedShortId(short.id);
    setCommentsModalVisible(true);
  };

  const handleShare = async (short: BarberShortWithDetails) => {
    try {
      await Share.share({
        message: `Mira este corte de ${short.barber.user.full_name} en ${short.barbershop.name}!\n\n${short.description || ''}`,
        title: short.title || 'Short de barbería',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderShortItem = ({ item, index }: { item: BarberShortWithDetails; index: number }) => {
    const isActive = index === currentIndex && isScreenFocused;

    return (
      <ShortItem
        item={item}
        isActive={isActive}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (shorts.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="film-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No hay shorts disponibles
        </Text>
      </View>
    );
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['shorts-feed'] });
    queryClient.refetchQueries({ queryKey: ['shorts-feed'] });
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <SafeAreaView style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shorts</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={shorts}
        renderItem={renderShortItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Comments Modal */}
      {selectedShortId && (
        <CommentsModal
          visible={commentsModalVisible}
          shortId={selectedShortId}
          onClose={() => {
            setCommentsModalVisible(false);
            // Refetch shorts to update comment count
            queryClient.invalidateQueries({ queryKey: ['shorts-feed'] });
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginLeft: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
