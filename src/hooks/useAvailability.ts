import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { TimeSlot } from '../types/models';

/**
 * Query keys for availability
 */
export const availabilityKeys = {
  all: ['availability'] as const,
  slots: (barberId: string, date: string, serviceId: string) =>
    [...availabilityKeys.all, 'slots', barberId, date, serviceId] as const,
};

/**
 * Hook to fetch available time slots for a barber on a specific date
 * @param barberId - Barber ID
 * @param date - Date in ISO format (YYYY-MM-DD)
 * @param serviceId - Service ID
 * @param enabled - Whether to enable the query (default: true)
 */
export function useAvailability(
  barberId: string,
  date: string,
  serviceId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: availabilityKeys.slots(barberId, date, serviceId),
    queryFn: () =>
      appointmentService.getAvailableSlots(barberId, date, serviceId),
    enabled: enabled && !!barberId && !!date && !!serviceId,
    staleTime: 2 * 60 * 1000, // 2 minutes - availability changes frequently
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if specific time slots are available
 * Useful for validating a selected time before booking
 */
export function useCheckSlotAvailability(
  barberId: string,
  date: string,
  serviceId: string,
  selectedTime?: string
) {
  const { data: availableSlots, isLoading, error } = useAvailability(
    barberId,
    date,
    serviceId,
    !!selectedTime
  );

  const isSlotAvailable =
    selectedTime &&
    availableSlots?.some((slot) => slot.time === selectedTime);

  return {
    isSlotAvailable,
    availableSlots,
    isLoading,
    error,
  };
}

/**
 * Hook to get availability for multiple dates
 * Useful for calendar views showing available dates
 */
export function useMultiDateAvailability(
  barberId: string,
  dates: string[],
  serviceId: string
) {
  const queries = dates.map((date) =>
    useAvailability(barberId, date, serviceId, dates.length > 0)
  );

  const availabilityByDate = dates.reduce(
    (acc, date, index) => {
      acc[date] = queries[index].data || [];
      return acc;
    },
    {} as Record<string, TimeSlot[]>
  );

  const isLoading = queries.some((query) => query.isLoading);
  const hasError = queries.some((query) => query.error);

  return {
    availabilityByDate,
    isLoading,
    hasError,
    queries,
  };
}

/**
 * Hook to get the first available slot for a barber
 * Useful for "quick book" features
 */
export function useFirstAvailableSlot(
  barberId: string,
  date: string,
  serviceId: string
) {
  const { data: availableSlots, isLoading, error } = useAvailability(
    barberId,
    date,
    serviceId
  );

  const firstAvailableSlot = availableSlots?.[0];

  return {
    firstAvailableSlot,
    hasAvailability: !!firstAvailableSlot,
    totalSlots: availableSlots?.length || 0,
    isLoading,
    error,
  };
}

/**
 * Hook to group available slots by time of day
 * Useful for displaying slots in morning/afternoon/evening sections
 */
export function useGroupedAvailability(
  barberId: string,
  date: string,
  serviceId: string
) {
  const { data: availableSlots, isLoading, error } = useAvailability(
    barberId,
    date,
    serviceId
  );

  const groupedSlots = {
    morning: [] as TimeSlot[],
    afternoon: [] as TimeSlot[],
    evening: [] as TimeSlot[],
  };

  availableSlots?.forEach((slot) => {
    const hour = parseInt(slot.time.split(':')[0]);

    if (hour < 12) {
      groupedSlots.morning.push(slot);
    } else if (hour < 17) {
      groupedSlots.afternoon.push(slot);
    } else {
      groupedSlots.evening.push(slot);
    }
  });

  return {
    groupedSlots,
    totalSlots: availableSlots?.length || 0,
    hasMorningSlots: groupedSlots.morning.length > 0,
    hasAfternoonSlots: groupedSlots.afternoon.length > 0,
    hasEveningSlots: groupedSlots.evening.length > 0,
    isLoading,
    error,
  };
}
