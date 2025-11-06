import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService, CreateSaleDto, Sale, SalesStats } from '../services/sales.service';

/**
 * Query keys for sales
 */
export const salesKeys = {
  all: ['sales'] as const,
  lists: () => [...salesKeys.all, 'list'] as const,
  list: (barberId: string, startDate?: string, endDate?: string) =>
    [...salesKeys.lists(), barberId, startDate, endDate] as const,
  stats: (barberId: string, startDate?: string, endDate?: string) =>
    [...salesKeys.all, 'stats', barberId, startDate, endDate] as const,
  today: (barberId: string) => [...salesKeys.all, 'today', barberId] as const,
  week: (barberId: string) => [...salesKeys.all, 'week', barberId] as const,
  month: (barberId: string) => [...salesKeys.all, 'month', barberId] as const,
  grouped: (barberId: string, startDate?: string, endDate?: string) =>
    [...salesKeys.all, 'grouped', barberId, startDate, endDate] as const,
};

/**
 * Hook to fetch sales for a barber
 */
export function useSales(barberId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: salesKeys.list(barberId, startDate, endDate),
    queryFn: () => salesService.getSalesByBarber(barberId, startDate, endDate),
    enabled: !!barberId,
  });
}

/**
 * Hook to fetch sales statistics
 */
export function useSalesStats(barberId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: salesKeys.stats(barberId, startDate, endDate),
    queryFn: () => salesService.getBarberStats(barberId, startDate, endDate),
    enabled: !!barberId,
  });
}

/**
 * Hook to fetch today's sales
 */
export function useTodaySales(barberId: string) {
  return useQuery({
    queryKey: salesKeys.today(barberId),
    queryFn: () => salesService.getTodaySales(barberId),
    enabled: !!barberId,
  });
}

/**
 * Hook to fetch week sales
 */
export function useWeekSales(barberId: string) {
  return useQuery({
    queryKey: salesKeys.week(barberId),
    queryFn: () => salesService.getWeekSales(barberId),
    enabled: !!barberId,
  });
}

/**
 * Hook to fetch month sales
 */
export function useMonthSales(barberId: string) {
  return useQuery({
    queryKey: salesKeys.month(barberId),
    queryFn: () => salesService.getMonthSales(barberId),
    enabled: !!barberId,
  });
}

/**
 * Hook to fetch sales grouped by date
 */
export function useSalesGroupedByDate(
  barberId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: salesKeys.grouped(barberId, startDate, endDate),
    queryFn: () => salesService.getSalesGroupedByDate(barberId, startDate, endDate),
    enabled: !!barberId,
  });
}

/**
 * Hook to create a sale
 */
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      barberId,
      barbershopId,
      data,
    }: {
      barberId: string;
      barbershopId: string;
      data: CreateSaleDto;
    }) => salesService.createSale(barberId, barbershopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

/**
 * Hook to update a sale
 */
export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ saleId, updates }: { saleId: string; updates: Partial<CreateSaleDto> }) =>
      salesService.updateSale(saleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

/**
 * Hook to delete a sale
 */
export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleId: string) => salesService.deleteSale(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}
