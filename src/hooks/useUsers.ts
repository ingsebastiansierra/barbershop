import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { User } from '../types/models';

/**
 * Query keys for users
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  byRole: (role: string) => [...userKeys.all, 'role', role] as const,
  byBarbershop: (barbershopId: string) => [...userKeys.all, 'barbershop', barbershopId] as const,
  search: (term: string) => [...userKeys.all, 'search', term] as const,
};

/**
 * Hook to fetch all users
 */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => userService.getAllUsers(),
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

/**
 * Hook to search users
 */
export function useSearchUsers(searchTerm: string) {
  return useQuery({
    queryKey: userKeys.search(searchTerm),
    queryFn: () => userService.searchUsers(searchTerm),
    enabled: searchTerm.length >= 2,
  });
}

/**
 * Hook to get users by role
 */
export function useUsersByRole(role: string) {
  return useQuery({
    queryKey: userKeys.byRole(role),
    queryFn: () => userService.getUsersByRole(role),
    enabled: !!role,
  });
}

/**
 * Hook to get users by barbershop
 */
export function useUsersByBarbershop(barbershopId: string) {
  return useQuery({
    queryKey: userKeys.byBarbershop(barbershopId),
    queryFn: () => userService.getUsersByBarbershop(barbershopId),
    enabled: !!barbershopId,
  });
}

/**
 * Hook to update user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userService.updateUserRole(userId, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.detail(data.id), data);
    },
  });
}
