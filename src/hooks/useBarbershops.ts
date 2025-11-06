import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { barbershopService } from '../services/barbershop.service';
import {
  Barbershop,
  BarbershopWithDistance,
  BarbershopFilters,
  CreateBarbershopDto,
  UpdateBarbershopDto,
} from '../types/models';

/**
 * Query keys for barbershops
 */
export const barbershopKeys = {
  all: ['barbershops'] as const,
  lists: () => [...barbershopKeys.all, 'list'] as const,
  list: (filters?: BarbershopFilters) => [...barbershopKeys.lists(), filters] as const,
  details: () => [...barbershopKeys.all, 'detail'] as const,
  detail: (id: string) => [...barbershopKeys.details(), id] as const,
  nearby: (lat: number, lng: number, radius: number) =>
    [...barbershopKeys.all, 'nearby', lat, lng, radius] as const,
  search: (term: string) => [...barbershopKeys.all, 'search', term] as const,
};

/**
 * Hook to fetch all barbershops with optional filters
 */
export function useBarbershops(filters?: BarbershopFilters) {
  return useQuery({
    queryKey: barbershopKeys.list(filters),
    queryFn: () => barbershopService.getBarbershops(filters),
  });
}

/**
 * Hook to fetch a single barbershop by ID
 */
export function useBarbershop(id: string) {
  return useQuery({
    queryKey: barbershopKeys.detail(id),
    queryFn: () => barbershopService.getBarbershopById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch nearby barbershops
 */
export function useNearbyBarbershops(
  latitude?: number,
  longitude?: number,
  radiusMeters: number = 5000
) {
  return useQuery({
    queryKey: barbershopKeys.nearby(latitude || 0, longitude || 0, radiusMeters),
    queryFn: () =>
      barbershopService.getNearbyBarbershops(latitude!, longitude!, radiusMeters),
    enabled: !!latitude && !!longitude,
  });
}

/**
 * Hook to search barbershops
 */
export function useSearchBarbershops(searchTerm: string) {
  return useQuery({
    queryKey: barbershopKeys.search(searchTerm),
    queryFn: () => barbershopService.searchBarbershops(searchTerm),
    enabled: searchTerm.length >= 2,
  });
}

/**
 * Hook to create a new barbershop
 */
export function useCreateBarbershop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBarbershopDto) => barbershopService.createBarbershop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: barbershopKeys.all });
    },
  });
}

/**
 * Hook to update a barbershop
 */
export function useUpdateBarbershop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateBarbershopDto }) =>
      barbershopService.updateBarbershop(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: barbershopKeys.all });
      queryClient.setQueryData(barbershopKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to delete (deactivate) a barbershop
 */
export function useDeleteBarbershop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => barbershopService.deleteBarbershop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: barbershopKeys.all });
    },
  });
}

/**
 * Combined hook for all barbershop mutations
 */
export function useBarbershopMutations() {
  const createMutation = useCreateBarbershop();
  const updateMutation = useUpdateBarbershop();
  const deleteMutation = useDeleteBarbershop();

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
