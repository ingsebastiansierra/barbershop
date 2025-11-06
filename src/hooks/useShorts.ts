/**
 * useShorts Hook
 * Custom hook for managing shorts operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import {
  getShortsByBarberId,
  getActiveShorts,
  getShortsWithLikeStatus,
  likeShort,
  unlikeShort,
  recordShortView,
  deleteShort,
  deleteShortMedia,
} from '../services/shortsService';
import { BarberShort } from '../types/models';
import Toast from 'react-native-toast-message';

/**
 * Hook to fetch barber's own shorts
 */
export const useBarberShorts = (includeInactive: boolean = false) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['barber-shorts', user?.id, includeInactive],
    queryFn: () => getShortsByBarberId(user!.id, includeInactive),
    enabled: !!user?.id,
  });
};

/**
 * Hook to fetch active shorts feed
 */
export const useShortsF = (limit: number = 20, offset: number = 0) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['shorts-feed', limit, offset, user?.id],
    queryFn: () => {
      if (user?.id) {
        return getShortsWithLikeStatus(user.id, limit, offset);
      }
      return getActiveShorts(limit, offset);
    },
  });
};

/**
 * Hook to like/unlike a short
 */
export const useToggleLike = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shortId, isLiked }: { shortId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      if (isLiked) {
        await unlikeShort(shortId, user.id);
      } else {
        await likeShort(shortId, user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts-feed'] });
      queryClient.invalidateQueries({ queryKey: ['short'] });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo actualizar el like',
      });
    },
  });
};

/**
 * Hook to record a view
 */
export const useRecordView = () => {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (shortId: string) => {
      await recordShortView(shortId, user?.id);
    },
    // Silent mutation, no need to show errors
  });
};

/**
 * Hook to delete a short
 */
export const useDeleteShort = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
};
