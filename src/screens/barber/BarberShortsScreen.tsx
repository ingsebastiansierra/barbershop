/**
 * BarberShortsScreen
 * Screen for barbers to manage their shorts (videos/images)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarberStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { getShortsByBarberId, deleteShort, deleteShortMedia } from '../../services/shortsService';
import { BarberShort, ShortMediaType } from '../../types/models';
import { VideoPreview } from '../../components/shorts';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<BarberStackParamList, 'Shorts'>;

export const BarberShortsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch barber's shorts
  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ['barber-shorts', user?.id],
    queryFn: () => getShortsByBarberId(user!.id, true),
    enabled: !!user?.id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (short: BarberShort) => {
      await deleteShort(short.id);
      await deleteShortMedia(short.media_url);
      if (short.thumbnail_url) {
        await deleteShortMedia(short.thumbnail_url);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-shorts'] });
      Toast.show({
        type: 'success',
        text1: 'Short eliminado',
        text2: 'El short se eliminó correctamente',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo eliminar el short',
      });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['barber-shorts'] });
    setRefreshing(false);
  };

  const handleDelete = (short: BarberShort) => {
    Alert.alert(
      'Eliminar Short',
      '¿Estás seguro de que quieres eliminar este short?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(short),
        },
      ]
    );
  };

  const renderShortItem = ({ item }: { item: BarberShort }) => {
    return (
      <TouchableOpacity
        style={{
          width: '48%',
          aspectRatio: 9 / 16,
          marginBottom: 12,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: colors.surface,
        }}
        onPress={() => navigation.navigate('ShortDetail', { shortId: item.id })}
      >
        {/* Show video preview or image */}
        {item.media_type === ShortMediaType.VIDEO ? (
          <VideoPreview 
            uri={item.media_url} 
            thumbnailUri={item.thumbnail_url || undefined}
          />
        ) : (
          <Image
            source={{ uri: item.media_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}
        
        {/* Video play indicator overlay */}
        {item.media_type === ShortMediaType.VIDEO && (
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -20 }, { translateY: -20 }],
            }}
          >
            <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
          </View>
        )}
      
      {/* Overlay with info */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 8,
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons
            name={item.media_type === ShortMediaType.VIDEO ? 'play-circle' : 'image'}
            size={16}
            color="#fff"
          />
          {item.media_type === ShortMediaType.VIDEO && item.duration && (
            <Text style={{ color: '#fff', fontSize: 12, marginLeft: 4 }}>
              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="eye" size={14} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, marginLeft: 4 }}>
              {item.views_count}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="heart" size={14} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, marginLeft: 4 }}>
              {item.likes_count}
            </Text>
          </View>
        </View>
      </View>

      {/* Status badge */}
      {!item.is_active && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,0,0,0.8)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
            Inactivo
          </Text>
        </View>
      )}

      {/* Delete button */}
        {/* Delete button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0,0,0,0.6)',
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={shorts}
        renderItem={renderShortItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="film-outline" size={64} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}>
              No tienes shorts aún
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
              Comparte videos o fotos de tus mejores cortes
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* Floating action button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => navigation.navigate('UploadShort')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
