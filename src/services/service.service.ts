import { supabase } from '../supabase/client';
import {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilters,
} from '../types/models';

/**
 * ServiceService
 * Handles all service-related operations including CRUD and combo management
 */
class ServiceService {
  /**
   * Get all services with optional filters
   */
  async getServices(filters?: ServiceFilters): Promise<Service[]> {
    try {
      let query = supabase.from('services').select('*');

      // Apply filters
      if (filters?.barbershop_id) {
        query = query.eq('barbershop_id', filters.barbershop_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters?.is_combo !== undefined) {
        query = query.eq('is_combo', filters.is_combo);
      }

      // Order by name
      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching services: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getServices error:', error);
      throw error;
    }
  }

  /**
   * Get a single service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching service: ${error.message}`);
      }

      if (!data) {
        throw new Error('Service not found');
      }

      return data;
    } catch (error) {
      console.error('getServiceById error:', error);
      throw error;
    }
  }

  /**
   * Get services by barbershop
   */
  async getServicesByBarbershop(barbershopId: string): Promise<Service[]> {
    try {
      return await this.getServices({
        barbershop_id: barbershopId,
        is_active: true,
      });
    } catch (error) {
      console.error('getServicesByBarbershop error:', error);
      throw error;
    }
  }

  /**
   * Create a new service
   */
  async createService(data: CreateServiceDto): Promise<Service> {
    try {
      // Validate duration is multiple of 15
      if (data.duration_minutes % 15 !== 0) {
        throw new Error('Duration must be a multiple of 15 minutes');
      }

      // Validate price is positive
      if (data.price < 0) {
        throw new Error('Price must be a positive number');
      }

      const serviceData: any = {
        barbershop_id: data.barbershop_id,
        name: data.name,
        description: data.description,
        duration_minutes: data.duration_minutes,
        price: data.price,
        is_combo: data.is_combo || false,
        combo_services: data.combo_services || [],
        is_active: true,
      };

      // If it's a combo, validate combo services exist
      if (serviceData.is_combo && serviceData.combo_services.length > 0) {
        await this.validateComboServices(
          serviceData.combo_services,
          data.barbershop_id
        );
      }

      const { data: newService, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating service: ${error.message}`);
      }

      if (!newService) {
        throw new Error('Failed to create service');
      }

      return newService;
    } catch (error) {
      console.error('createService error:', error);
      throw error;
    }
  }

  /**
   * Update an existing service
   */
  async updateService(id: string, updates: UpdateServiceDto): Promise<Service> {
    try {
      // Validate duration if provided
      if (updates.duration_minutes !== undefined && updates.duration_minutes % 15 !== 0) {
        throw new Error('Duration must be a multiple of 15 minutes');
      }

      // Validate price if provided
      if (updates.price !== undefined && updates.price < 0) {
        throw new Error('Price must be a positive number');
      }

      // If updating combo services, validate they exist
      if (updates.combo_services && updates.combo_services.length > 0) {
        const service = await this.getServiceById(id);
        await this.validateComboServices(updates.combo_services, service.barbershop_id);
      }

      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating service: ${error.message}`);
      }

      if (!data) {
        throw new Error('Service not found');
      }

      return data;
    } catch (error) {
      console.error('updateService error:', error);
      throw error;
    }
  }

  /**
   * Delete (deactivate) a service
   * Soft delete by setting is_active to false
   */
  async deleteService(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting service: ${error.message}`);
      }
    } catch (error) {
      console.error('deleteService error:', error);
      throw error;
    }
  }

  /**
   * Activate a service
   */
  async activateService(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: true })
        .eq('id', id);

      if (error) {
        throw new Error(`Error activating service: ${error.message}`);
      }
    } catch (error) {
      console.error('activateService error:', error);
      throw error;
    }
  }

  /**
   * Validate that combo services exist and belong to the same barbershop
   */
  private async validateComboServices(
    serviceIds: string[],
    barbershopId: string
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, barbershop_id, is_active')
        .in('id', serviceIds);

      if (error) {
        throw new Error(`Error validating combo services: ${error.message}`);
      }

      if (!data || data.length !== serviceIds.length) {
        throw new Error('One or more combo services not found');
      }

      // Check all services belong to the same barbershop
      const invalidServices = data.filter(
        (service) => service.barbershop_id !== barbershopId || !service.is_active
      );

      if (invalidServices.length > 0) {
        throw new Error(
          'All combo services must belong to the same barbershop and be active'
        );
      }
    } catch (error) {
      console.error('validateComboServices error:', error);
      throw error;
    }
  }

  /**
   * Get combo details with individual service information
   */
  async getComboDetails(comboId: string): Promise<{
    combo: Service;
    services: Service[];
    total_duration: number;
    individual_total_price: number;
    savings: number;
  }> {
    try {
      const combo = await this.getServiceById(comboId);

      if (!combo.is_combo) {
        throw new Error('Service is not a combo');
      }

      // Get individual services
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .in('id', combo.combo_services);

      if (error) {
        throw new Error(`Error fetching combo services: ${error.message}`);
      }

      if (!services || services.length === 0) {
        throw new Error('Combo services not found');
      }

      // Calculate totals
      const totalDuration = services.reduce(
        (sum, service) => sum + service.duration_minutes,
        0
      );
      const individualTotalPrice = services.reduce(
        (sum, service) => sum + Number(service.price),
        0
      );
      const savings = individualTotalPrice - Number(combo.price);

      return {
        combo,
        services,
        total_duration: totalDuration,
        individual_total_price: individualTotalPrice,
        savings,
      };
    } catch (error) {
      console.error('getComboDetails error:', error);
      throw error;
    }
  }

  /**
   * Create a combo service from existing services
   */
  async createCombo(
    barbershopId: string,
    name: string,
    description: string,
    serviceIds: string[],
    discountPercentage: number
  ): Promise<Service> {
    try {
      if (serviceIds.length < 2) {
        throw new Error('A combo must include at least 2 services');
      }

      if (discountPercentage < 0 || discountPercentage > 100) {
        throw new Error('Discount percentage must be between 0 and 100');
      }

      // Validate services
      await this.validateComboServices(serviceIds, barbershopId);

      // Get services to calculate price and duration
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .in('id', serviceIds);

      if (error || !services) {
        throw new Error('Error fetching services for combo');
      }

      // Calculate combo price and duration
      const totalDuration = services.reduce(
        (sum, service) => sum + service.duration_minutes,
        0
      );
      const totalPrice = services.reduce((sum, service) => sum + Number(service.price), 0);
      const comboPrice = totalPrice * (1 - discountPercentage / 100);

      // Round duration to nearest 15 minutes
      const roundedDuration = Math.ceil(totalDuration / 15) * 15;

      // Create combo
      return await this.createService({
        barbershop_id: barbershopId,
        name,
        description,
        duration_minutes: roundedDuration,
        price: Math.round(comboPrice * 100) / 100, // Round to 2 decimals
        is_combo: true,
        combo_services: serviceIds,
      });
    } catch (error) {
      console.error('createCombo error:', error);
      throw error;
    }
  }

  /**
   * Search services by name or description
   */
  async searchServices(searchTerm: string, barbershopId?: string): Promise<Service[]> {
    try {
      let query = supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (barbershopId) {
        query = query.eq('barbershop_id', barbershopId);
      }

      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error searching services: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('searchServices error:', error);
      throw error;
    }
  }

  /**
   * Get popular services by appointment count
   */
  async getPopularServices(
    barbershopId: string,
    limit: number = 5
  ): Promise<Array<Service & { appointment_count: number }>> {
    try {
      // This would require a more complex query with joins
      // For now, we'll get all services and sort by a simple metric
      const services = await this.getServicesByBarbershop(barbershopId);

      // Get appointment counts for each service
      const servicesWithCounts = await Promise.all(
        services.map(async (service) => {
          const { count, error } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('service_id', service.id)
            .eq('status', 'completed');

          return {
            ...service,
            appointment_count: error ? 0 : count || 0,
          };
        })
      );

      // Sort by appointment count and return top N
      return servicesWithCounts
        .sort((a, b) => b.appointment_count - a.appointment_count)
        .slice(0, limit);
    } catch (error) {
      console.error('getPopularServices error:', error);
      throw error;
    }
  }

  /**
   * Calculate service price with tax
   */
  calculatePriceWithTax(price: number, taxRate: number = 0): number {
    return Math.round(price * (1 + taxRate) * 100) / 100;
  }

  /**
   * Format service duration for display
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  }

  /**
   * Check if service belongs to a specific barbershop
   */
  async belongsToBarbershop(serviceId: string, barbershopId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('barbershop_id')
        .eq('id', serviceId)
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
   * Get service statistics
   */
  async getServiceStatistics(
    serviceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    total_appointments: number;
    completed_appointments: number;
    total_revenue: number;
    average_rating: number;
  }> {
    try {
      let query = supabase
        .from('appointments')
        .select('status, total_price')
        .eq('service_id', serviceId);

      if (startDate) {
        query = query.gte('appointment_date', startDate);
      }

      if (endDate) {
        query = query.lte('appointment_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching service statistics: ${error.message}`);
      }

      const appointments = data || [];
      const completed = appointments.filter((a) => a.status === 'completed');
      const totalRevenue = completed.reduce((sum, a) => sum + Number(a.total_price), 0);

      return {
        total_appointments: appointments.length,
        completed_appointments: completed.length,
        total_revenue: totalRevenue,
        average_rating: 0, // Would need reviews table to calculate
      };
    } catch (error) {
      console.error('getServiceStatistics error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const serviceService = new ServiceService();
export default serviceService;
