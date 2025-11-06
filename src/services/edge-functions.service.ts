/**
 * Edge Functions Service
 * Service for calling Supabase Edge Functions
 */

import { supabase } from '../supabase/client';
import { BarberSchedule } from '../types/models';

interface CreateBarberParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  specialties?: string[];
  bio?: string;
  schedule: BarberSchedule;
}

interface CreateBarberResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  error?: string;
}

export const edgeFunctionsService = {
  /**
   * Create a barber user using Edge Function
   * This allows admins to create barbers with confirmed emails
   */
  async createBarber(params: CreateBarberParams): Promise<CreateBarberResponse> {
    try {
      const response = await supabase.functions.invoke('create-barber', {
        body: params,
      });

      console.log('Edge Function response:', response);

      // If there's an error, try to get the error message from the response body
      if (response.error) {
        console.error('Edge Function error details:', response.error);
        
        // Try to read the response body for more details
        if (response.error.context?.body) {
          console.error('Error body:', response.error.context.body);
        }
        
        throw new Error(response.error.message || 'Edge Function error');
      }

      const data = response.data;

      // Check if the response indicates an error
      if (data && !data.success) {
        console.error('Edge Function returned error:', data.error);
        throw new Error(data.error || 'Unknown error from Edge Function');
      }

      return data as CreateBarberResponse;
    } catch (error: any) {
      console.error('Error calling create-barber function:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
};
