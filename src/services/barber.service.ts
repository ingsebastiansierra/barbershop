import { supabase } from '../supabase/client';
import {
  Barber,
  BarberWithUser,
  CreateBarberDto,
  UpdateBarberDto,
  BarberFilters,
  BarberSchedule,
  TimeRange,
} from '../types/models';

/**
 * BarberService
 * Handles all barber-related operations including CRUD, schedule management, and photo uploads
 */
class BarberService {
  /**
   * Get all barbers with optional filters
   */
  async getBarbers(filters?: BarberFilters): Promise<BarberWithUser[]> {
    try {
      let query = supabase
        .from('barbers')
        .select(`
          *,
          user:users(*)
        `);

      // Apply filters
      if (filters?.barbershop_id) {
        query = query.eq('barbershop_id', filters.barbershop_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Order by rating descending
      query = query.order('rating', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching barbers: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getBarbers error:', error);
      throw error;
    }
  }

  /**
   * Get a single barber by ID with user details
   */
  async getBarberById(id: string): Promise<BarberWithUser> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching barber: ${error.message}`);
      }

      if (!data) {
        throw new Error('Barber not found');
      }

      return data;
    } catch (error) {
      console.error('getBarberById error:', error);
      throw error;
    }
  }

  /**
   * Create a new barber profile
   * Note: The user must already exist in the users table
   */
  async createBarber(data: CreateBarberDto): Promise<Barber> {
    try {
      // First, update the user's role to 'barber' if needed
      const { error: userError } = await supabase
        .from('users')
        .update({ role: 'barber' })
        .eq('id', data.user_id);

      if (userError) {
        throw new Error(`Error updating user role: ${userError.message}`);
      }

      // Create barber profile
      const barberData: any = {
        id: data.user_id,
        barbershop_id: data.barbershop_id,
        specialties: data.specialties || [],
        bio: data.bio,
        rating: 0,
        total_reviews: 0,
        is_active: true,
      };

      // Add schedule if provided
      if (data.schedule) {
        barberData.schedule = data.schedule;
      }

      const { data: newBarber, error } = await supabase
        .from('barbers')
        .insert(barberData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating barber: ${error.message}`);
      }

      if (!newBarber) {
        throw new Error('Failed to create barber');
      }

      return newBarber;
    } catch (error) {
      console.error('createBarber error:', error);
      throw error;
    }
  }

  /**
   * Update an existing barber profile
   */
  async updateBarber(id: string, updates: UpdateBarberDto): Promise<Barber> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating barber: ${error.message}`);
      }

      if (!data) {
        throw new Error('Barber not found');
      }

      return data;
    } catch (error) {
      console.error('updateBarber error:', error);
      throw error;
    }
  }

  /**
   * Deactivate a barber (soft delete)
   */
  async deactivateBarber(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('barbers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Error deactivating barber: ${error.message}`);
      }
    } catch (error) {
      console.error('deactivateBarber error:', error);
      throw error;
    }
  }

  /**
   * Activate a barber
   */
  async activateBarber(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('barbers')
        .update({ is_active: true })
        .eq('id', id);

      if (error) {
        throw new Error(`Error activating barber: ${error.message}`);
      }
    } catch (error) {
      console.error('activateBarber error:', error);
      throw error;
    }
  }

  /**
   * Update barber's schedule
   */
  async updateSchedule(id: string, schedule: BarberSchedule): Promise<Barber> {
    try {
      return await this.updateBarber(id, { schedule });
    } catch (error) {
      console.error('updateSchedule error:', error);
      throw error;
    }
  }

  /**
   * Get barber's schedule for a specific day
   */
  getScheduleForDay(
    barber: Barber,
    dayOfWeek: keyof BarberSchedule
  ): TimeRange[] | null {
    try {
      return barber.schedule[dayOfWeek];
    } catch (error) {
      console.error('getScheduleForDay error:', error);
      return null;
    }
  }

  /**
   * Check if barber is available on a specific day
   */
  isAvailableOnDay(barber: Barber, dayOfWeek: keyof BarberSchedule): boolean {
    try {
      const daySchedule = barber.schedule[dayOfWeek];
      return daySchedule !== null && daySchedule.length > 0;
    } catch (error) {
      console.error('isAvailableOnDay error:', error);
      return false;
    }
  }

  /**
   * Upload barber photo to Supabase Storage
   */
  async uploadPhoto(
    barberId: string,
    file: {
      uri: string;
      type: string;
      name: string;
    }
  ): Promise<string> {
    try {
      // Get file extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${barberId}-${Date.now()}.${fileExt}`;
      const filePath = `${barberId}/${fileName}`;

      // Convert file URI to blob for upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        throw new Error(`Error uploading photo: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user's avatar URL
      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', barberId);

      return publicUrl;
    } catch (error) {
      console.error('uploadPhoto error:', error);
      throw error;
    }
  }

  /**
   * Delete old photo from storage
   */
  async deleteOldPhoto(photoUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/avatars/');
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      const { error } = await supabase.storage.from('avatars').remove([filePath]);

      if (error) {
        console.error('Error deleting old photo:', error);
        // Don't throw error, just log it
      }
    } catch (error) {
      console.error('deleteOldPhoto error:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Update barber rating
   */
  async updateRating(
    barberId: string,
    newRating: number,
    incrementReviews: boolean = true
  ): Promise<void> {
    try {
      const barber = await this.getBarberById(barberId);

      let totalReviews = barber.total_reviews;
      let currentRating = barber.rating;

      if (incrementReviews) {
        totalReviews += 1;
      }

      // Calculate new average rating
      const totalRatingPoints = currentRating * (totalReviews - 1) + newRating;
      const averageRating = totalRatingPoints / totalReviews;

      // Round to 2 decimal places
      const roundedRating = Math.round(averageRating * 100) / 100;

      await this.updateBarber(barberId, {
        rating: roundedRating,
        // @ts-ignore - total_reviews is not in UpdateBarberDto but exists in DB
        total_reviews: totalReviews,
      });
    } catch (error) {
      console.error('updateRating error:', error);
      throw error;
    }
  }

  /**
   * Get barbers by barbershop with active status
   */
  async getActiveBarbersByBarbershop(
    barbershopId: string
  ): Promise<BarberWithUser[]> {
    try {
      return await this.getBarbers({
        barbershop_id: barbershopId,
        is_active: true,
      });
    } catch (error) {
      console.error('getActiveBarbersByBarbershop error:', error);
      throw error;
    }
  }

  /**
   * Search barbers by name or specialty
   */
  async searchBarbers(
    searchTerm: string,
    barbershopId?: string
  ): Promise<BarberWithUser[]> {
    try {
      let query = supabase
        .from('barbers')
        .select(`
          *,
          user:users(*)
        `)
        .eq('is_active', true);

      if (barbershopId) {
        query = query.eq('barbershop_id', barbershopId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error searching barbers: ${error.message}`);
      }

      // Filter by name or specialties in memory
      const filtered = (data || []).filter((barber: BarberWithUser) => {
        const nameMatch = barber.user.full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const specialtyMatch = barber.specialties.some((specialty) =>
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return nameMatch || specialtyMatch;
      });

      return filtered;
    } catch (error) {
      console.error('searchBarbers error:', error);
      throw error;
    }
  }

  /**
   * Validate schedule times
   * Ensures start time is before end time and times are in HH:mm format
   */
  validateSchedule(schedule: BarberSchedule): boolean {
    try {
      const days: (keyof BarberSchedule)[] = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];

      for (const day of days) {
        const daySchedule = schedule[day];
        if (daySchedule === null) continue;

        for (const timeRange of daySchedule) {
          // Validate time format (HH:mm)
          const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(timeRange.start) || !timeRegex.test(timeRange.end)) {
            return false;
          }

          // Validate start is before end
          if (timeRange.start >= timeRange.end) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('validateSchedule error:', error);
      return false;
    }
  }

  /**
   * Get barber statistics
   */
  async getBarberStatistics(
    barberId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    total_revenue: number;
    average_rating: number;
  }> {
    try {
      let query = supabase
        .from('appointments')
        .select('status, total_price')
        .eq('barber_id', barberId);

      if (startDate) {
        query = query.gte('appointment_date', startDate);
      }

      if (endDate) {
        query = query.lte('appointment_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching barber statistics: ${error.message}`);
      }

      const appointments = data || [];
      const completed = appointments.filter((a) => a.status === 'completed');
      const cancelled = appointments.filter((a) => a.status === 'cancelled');
      const totalRevenue = completed.reduce((sum, a) => sum + Number(a.total_price), 0);

      // Get current rating
      const barber = await this.getBarberById(barberId);

      return {
        total_appointments: appointments.length,
        completed_appointments: completed.length,
        cancelled_appointments: cancelled.length,
        total_revenue: totalRevenue,
        average_rating: barber.rating,
      };
    } catch (error) {
      console.error('getBarberStatistics error:', error);
      throw error;
    }
  }

  /**
   * Check if barber belongs to a specific barbershop
   */
  async belongsToBarbershop(barberId: string, barbershopId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('barbershop_id')
        .eq('id', barberId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.barbershop_id === barbershopId;
    } catch (error) {
      console.error('belongsToBarbershop error:', error);
      return false;
    }
  }

  /**
   * Get pending barber requests for a barbershop
   */
  async getPendingBarbers(barbershopId: string): Promise<BarberWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          user:users(*)
        `)
        .eq('barbershop_id', barbershopId)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching pending barbers: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getPendingBarbers error:', error);
      throw error;
    }
  }

  /**
   * Approve a barber request
   */
  async approveBarber(barberId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('barbers')
        .update({
          approval_status: 'approved',
          is_active: true,
          rejection_reason: null,
        })
        .eq('id', barberId);

      if (error) {
        throw new Error(`Error approving barber: ${error.message}`);
      }
    } catch (error) {
      console.error('approveBarber error:', error);
      throw error;
    }
  }

  /**
   * Reject a barber request
   */
  async rejectBarber(barberId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('barbers')
        .update({
          approval_status: 'rejected',
          is_active: false,
          rejection_reason: reason,
        })
        .eq('id', barberId);

      if (error) {
        throw new Error(`Error rejecting barber: ${error.message}`);
      }
    } catch (error) {
      console.error('rejectBarber error:', error);
      throw error;
    }
  }

  /**
   * Get barber requests count by status
   */
  async getBarberRequestsCount(barbershopId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('approval_status')
        .eq('barbershop_id', barbershopId);

      if (error) {
        throw new Error(`Error fetching requests count: ${error.message}`);
      }

      const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      data?.forEach((barber) => {
        if (barber.approval_status === 'pending') counts.pending++;
        else if (barber.approval_status === 'approved') counts.approved++;
        else if (barber.approval_status === 'rejected') counts.rejected++;
      });

      return counts;
    } catch (error) {
      console.error('getBarberRequestsCount error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const barberService = new BarberService();
export default barberService;
