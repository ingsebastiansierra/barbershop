/**
 * useBarberStatus Hook
 * Hook to get the current barber's approval status
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { useAuth } from './useAuth';
import { BarberApprovalStatus } from '../types/models';

interface BarberStatus {
  approval_status: BarberApprovalStatus;
  rejection_reason?: string;
  barbershop_name?: string;
}

export const useBarberStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['barber-status', user?.id],
    queryFn: async (): Promise<BarberStatus | null> => {
      if (!user || user.role !== 'barber') {
        return null;
      }

      const { data, error } = await supabase
        .from('barbers')
        .select(`
          approval_status,
          rejection_reason,
          barbershops:barbershop_id (
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching barber status:', error);
        throw error;
      }

      return {
        approval_status: data.approval_status as BarberApprovalStatus,
        rejection_reason: data.rejection_reason,
        barbershop_name: (data.barbershops as any)?.name,
      };
    },
    enabled: !!user && user.role === 'barber',
  });
};
