import { supabase } from '../supabase/client';
import {
  Barbershop,
  BarbershopWithDistance,
  CreateBarbershopDto,
  UpdateBarbershopDto,
  BarbershopFilters,
  ApiResponse,
} from '../types/models';

/**
 * BarbershopService
 * Handles all barbershop-related operations including CRUD, search, and geolocation
 */
class BarbershopService {
  /**
   * Get all barbershops with optional filters
   */
  async getBarbershops(filters?: BarbershopFilters): Promise<Barbershop[]> {
    try {
      let query = supabase.from('barbershops').select('*');

      // Apply filters
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Order by name
      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching barbershops: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getBarbershops error:', error);
      throw error;
    }
  }

  /**
   * Get a single barbershop by ID
   */
  async getBarbershopById(id: string): Promise<Barbershop> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching barbershop: ${error.message}`);
      }

      if (!data) {
        throw new Error('Barbershop not found');
      }

      return data;
    } catch (error) {
      console.error('getBarbershopById error:', error);
      throw error;
    }
  }

  /**
   * Get nearby barbershops using geolocation
   * Uses PostGIS function for efficient spatial queries
   */
  async getNearbyBarbershops(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
  ): Promise<BarbershopWithDistance[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_barbershops', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_meters: radiusMeters,
      });

      if (error) {
        throw new Error(`Error fetching nearby barbershops: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getNearbyBarbershops error:', error);
      throw error;
    }
  }

  /**
   * Create a new barbershop (Super Admin only)
   */
  async createBarbershop(data: CreateBarbershopDto): Promise<Barbershop> {
    try {
      const barbershopData: any = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        is_active: true,
      };

      // Add opening hours if provided
      if (data.opening_hours) {
        barbershopData.opening_hours = data.opening_hours;
      }

      const { data: newBarbershop, error } = await supabase
        .from('barbershops')
        .insert(barbershopData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating barbershop: ${error.message}`);
      }

      if (!newBarbershop) {
        throw new Error('Failed to create barbershop');
      }

      return newBarbershop;
    } catch (error) {
      console.error('createBarbershop error:', error);
      throw error;
    }
  }

  /**
   * Update an existing barbershop
   */
  async updateBarbershop(
    id: string,
    updates: UpdateBarbershopDto
  ): Promise<Barbershop> {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating barbershop: ${error.message}`);
      }

      if (!data) {
        throw new Error('Barbershop not found');
      }

      return data;
    } catch (error) {
      console.error('updateBarbershop error:', error);
      throw error;
    }
  }

  /**
   * Delete (deactivate) a barbershop
   * Soft delete by setting is_active to false
   */
  async deleteBarbershop(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('barbershops')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting barbershop: ${error.message}`);
      }
    } catch (error) {
      console.error('deleteBarbershop error:', error);
      throw error;
    }
  }

  /**
   * Upload barbershop logo to Supabase Storage
   */
  async uploadLogo(
    barbershopId: string,
    file: {
      uri: string;
      type: string;
      name: string;
    }
  ): Promise<string> {
    try {
      // Get file extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${barbershopId}-${Date.now()}.${fileExt}`;
      const filePath = `${barbershopId}/${fileName}`;

      // Convert file URI to blob for upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('negocio-logos')
        .upload(filePath, blob, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        throw new Error(`Error uploading logo: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('negocio-logos').getPublicUrl(filePath);

      // Update barbershop with new logo URL
      await this.updateBarbershop(barbershopId, { logo_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('uploadLogo error:', error);
      throw error;
    }
  }

  /**
   * Delete old logo from storage
   */
  async deleteOldLogo(logoUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = logoUrl.split('/negocio-logos/');
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('negocio-logos')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting old logo:', error);
        // Don't throw error, just log it
      }
    } catch (error) {
      console.error('deleteOldLogo error:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Check if barbershop is currently open based on opening hours
   */
  isOpen(barbershop: Barbershop): boolean {
    try {
      const now = new Date();
      const dayOfWeek = now
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase() as keyof typeof barbershop.opening_hours;

      const todayHours = barbershop.opening_hours[dayOfWeek];

      if (!todayHours) {
        return false; // Closed today
      }

      const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

      return currentTime >= todayHours.open && currentTime <= todayHours.close;
    } catch (error) {
      console.error('isOpen error:', error);
      return false;
    }
  }

  /**
   * Get today's opening hours for a barbershop
   */
  getTodayHours(barbershop: Barbershop): { open: string; close: string } | null {
    try {
      const now = new Date();
      const dayOfWeek = now
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase() as keyof typeof barbershop.opening_hours;

      return barbershop.opening_hours[dayOfWeek];
    } catch (error) {
      console.error('getTodayHours error:', error);
      return null;
    }
  }

  /**
   * Search barbershops by name, address, or barber name
   */
  async searchBarbershops(searchTerm: string): Promise<Barbershop[]> {
    try {
      // First, search barbershops by name, address, or description
      const { data: barbershopResults, error: barbershopError } = await supabase
        .from('barbershops')
        .select('*')
        .eq('is_active', true)
        .or(
          `name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );

      if (barbershopError) {
        throw new Error(`Error searching barbershops: ${barbershopError.message}`);
      }

      // Second, search barbershops by barber name
      const { data: barberResults, error: barberError } = await supabase
        .from('barbers')
        .select('barbershop_id, users!inner(full_name)')
        .eq('is_active', true)
        .ilike('users.full_name', `%${searchTerm}%`);

      if (barberError) {
        console.error('Error searching barbers:', barberError);
        // Don't throw, just continue with barbershop results
      }

      // Get unique barbershop IDs from barber search
      const barbershopIdsFromBarbers = barberResults
        ? [...new Set(barberResults.map((b) => b.barbershop_id))]
        : [];

      // Fetch full barbershop data for barber matches
      let barbershopsFromBarbers: Barbershop[] = [];
      if (barbershopIdsFromBarbers.length > 0) {
        const { data: barberBarbershops, error: barberBarbershopsError } = await supabase
          .from('barbershops')
          .select('*')
          .eq('is_active', true)
          .in('id', barbershopIdsFromBarbers);

        if (!barberBarbershopsError && barberBarbershops) {
          barbershopsFromBarbers = barberBarbershops;
        }
      }

      // Combine and deduplicate results
      const allResults = [...(barbershopResults || []), ...barbershopsFromBarbers];
      const uniqueResults = Array.from(
        new Map(allResults.map((item) => [item.id, item])).values()
      );

      // Sort by name
      uniqueResults.sort((a, b) => a.name.localeCompare(b.name));

      return uniqueResults;
    } catch (error) {
      console.error('searchBarbershops error:', error);
      throw error;
    }
  }

  /**
   * Get barbershops managed by a specific admin
   */
  async getBarbershopsByAdmin(adminId: string): Promise<Barbershop[]> {
    try {
      const { data, error } = await supabase
        .from('admin_assignments')
        .select('barbershop_id, barbershops(*)')
        .eq('user_id', adminId);

      if (error) {
        throw new Error(`Error fetching admin barbershops: ${error.message}`);
      }

      // Extract barbershops from the joined data
      const barbershops = data?.map((item: any) => item.barbershops).filter(Boolean) || [];

      return barbershops;
    } catch (error) {
      console.error('getBarbershopsByAdmin error:', error);
      throw error;
    }
  }

  /**
   * Assign an admin to a barbershop (Super Admin only)
   */
  async assignAdmin(adminId: string, barbershopId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_assignments')
        .insert({
          user_id: adminId,
          barbershop_id: barbershopId,
        });

      if (error) {
        throw new Error(`Error assigning admin: ${error.message}`);
      }
    } catch (error) {
      console.error('assignAdmin error:', error);
      throw error;
    }
  }

  /**
   * Remove admin assignment from a barbershop
   */
  async removeAdmin(adminId: string, barbershopId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_assignments')
        .delete()
        .eq('user_id', adminId)
        .eq('barbershop_id', barbershopId);

      if (error) {
        throw new Error(`Error removing admin: ${error.message}`);
      }
    } catch (error) {
      console.error('removeAdmin error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const barbershopService = new BarbershopService();
export default barbershopService;
