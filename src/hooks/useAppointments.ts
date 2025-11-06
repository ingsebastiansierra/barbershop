import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import {
  Appointment,
  AppointmentWithDetails,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilters,
  UserRole,
} from '../types/models';
import { useAuthStore } from '../store/authStore';

/**
 * Query keys for appointments
 */
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (userId: string, role: UserRole, filters?: AppointmentFilters) =>
    [...appointmentKeys.lists(), userId, role, filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  today: (userId: string, role: UserRole) =>
    [...appointmentKeys.all, 'today', userId, role] as const,
  upcoming: (userId: string, role: UserRole) =>
    [...appointmentKeys.all, 'upcoming', userId, role] as const,
  history: (userId: string, role: UserRole) =>
    [...appointmentKeys.all, 'history', userId, role] as const,
};

/**
 * Hook to fetch appointments with filters
 */
export function useAppointments(filters?: AppointmentFilters) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: appointmentKeys.list(
      user?.id || '',
      (user?.role || user?.rol) as UserRole || UserRole.CLIENT,
      filters
    ),
    queryFn: () =>
      appointmentService.getAppointments(
        user?.id || '',
        (user?.role || user?.rol) as UserRole || UserRole.CLIENT,
        filters
      ),
    enabled: !!user,
  });
}

/**
 * Hook to fetch a single appointment by ID
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getAppointmentById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch today's appointments
 */
export function useTodayAppointments() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: appointmentKeys.today(
      user?.id || '',
      (user?.role || user?.rol) as UserRole || UserRole.CLIENT
    ),
    queryFn: () =>
      appointmentService.getTodayAppointments(
        user?.id || '',
        (user?.role || user?.rol) as UserRole || UserRole.CLIENT
      ),
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch upcoming appointments
 */
export function useUpcomingAppointments() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: appointmentKeys.upcoming(
      user?.id || '',
      (user?.role || user?.rol) as UserRole || UserRole.CLIENT
    ),
    queryFn: () =>
      appointmentService.getUpcomingAppointments(
        user?.id || '',
        (user?.role || user?.rol) as UserRole || UserRole.CLIENT
      ),
    enabled: !!user,
  });
}

/**
 * Hook to fetch appointment history
 */
export function useAppointmentHistory() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: appointmentKeys.history(
      user?.id || '',
      (user?.role || user?.rol) as UserRole || UserRole.CLIENT
    ),
    queryFn: () =>
      appointmentService.getAppointmentHistory(
        user?.id || '',
        (user?.role || user?.rol) as UserRole || UserRole.CLIENT
      ),
    enabled: !!user,
  });
}

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateAppointmentDto) =>
      appointmentService.createAppointment(user?.id || '', data),
    onSuccess: () => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      // Also invalidate availability queries
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

/**
 * Hook to update an appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateAppointmentDto;
    }) => appointmentService.updateAppointment(id, updates),
    onSuccess: (data) => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentService.cancelAppointment(id, reason),
    onSuccess: (data) => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(data.id), data);
      // Invalidate availability queries
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

/**
 * Hook to confirm an appointment
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.confirmAppointment(id),
    onSuccess: (data) => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to complete an appointment
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.completeAppointment(id),
    onSuccess: (data) => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(data.id), data);
    },
  });
}

/**
 * Combined hook for all appointment mutations
 */
export function useAppointmentMutations() {
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();
  const confirmMutation = useConfirmAppointment();
  const completeMutation = useCompleteAppointment();

  return {
    create: createMutation,
    update: updateMutation,
    cancel: cancelMutation,
    confirm: confirmMutation,
    complete: completeMutation,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      cancelMutation.isPending ||
      confirmMutation.isPending ||
      completeMutation.isPending,
  };
}
