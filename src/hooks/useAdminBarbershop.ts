import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { useAuthStore } from '../store/authStore';
import { Barbershop } from '../types/models';

/**
 * Hook to get the barbershop assigned to the current admin user
 */
export const useAdminBarbershop = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['admin-barbershop', user?.id],
    queryFn: async (): Promise<Barbershop | null> => {
      if (!user || user.role !== 'admin') {
        return null;
      }

      // Get the barbershop assigned to this admin
      const { data, error } = await supabase
        .from('admin_assignments')
        .select('barbershop:barbershops(*)')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching admin barbershop:', error);
        throw new Error('Failed to fetch barbershop');
      }

      return (data as any)?.barbershop || null;
    },
    enabled: !!user && user.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
