import { supabase } from '../supabase/client';
import {
  Appointment,
  AppointmentWithDetails,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilters,
  AppointmentStatus,
  TimeSlot,
  UserRole,
} from '../types/models';

/**
 * AppointmentService
 * Handles all appointment-related operations including CRUD, availability checks, and status management
 */
class AppointmentService {
  /**
   * Get appointments with filters based on user role
   * @param userId - Current user ID
   * @param role - User role (client, barber, admin, super_admin)
   * @param filters - Optional filters for appointments
   */
  async getAppointments(
    userId: string,
    role: UserRole,
    filters?: AppointmentFilters
  ): Promise<AppointmentWithDetails[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          barber:barbers!appointments_barber_id_fkey(
            *,
            user:users!barbers_id_fkey(*)
          ),
          client:users!appointments_client_id_fkey(*),
          service:services!appointments_service_id_fkey(*),
          barbershop:barbershops!appointments_barbershop_id_fkey(*)
        `);

      // Apply role-based filtering
      switch (role) {
        case UserRole.CLIENT:
          query = query.eq('client_id', userId);
          break;
        case UserRole.BARBER:
          query = query.eq('barber_id', userId);
          break;
        case UserRole.ADMIN:
          // Admin sees appointments for their barbershop(s)
          if (filters?.barbershop_id) {
            query = query.eq('barbershop_id', filters.barbershop_id);
          }
          break;
        case UserRole.SUPER_ADMIN:
          // Super admin sees all appointments
          break;
      }

      // Apply additional filters
      if (filters?.barbershop_id && role !== UserRole.ADMIN) {
        query = query.eq('barbershop_id', filters.barbershop_id);
      }

      if (filters?.barber_id) {
        query = query.eq('barber_id', filters.barber_id);
      }

      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.date_from) {
        query = query.gte('appointment_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('appointment_date', filters.date_to);
      }

      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      // Order by date and time
      query = query.order('appointment_date', { ascending: true });
      query = query.order('start_time', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }

      return (data || []) as AppointmentWithDetails[];
    } catch (error) {
      console.error('getAppointments error:', error);
      throw error;
    }
  }

  /**
   * Get a single appointment by ID with full details
   */
  async getAppointmentById(id: string): Promise<AppointmentWithDetails> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          barber:barbers!appointments_barber_id_fkey(
            *,
            user:users!barbers_id_fkey(*)
          ),
          client:users!appointments_client_id_fkey(*),
          service:services!appointments_service_id_fkey(*),
          barbershop:barbershops!appointments_barbershop_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching appointment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Appointment not found');
      }

      return data as AppointmentWithDetails;
    } catch (error) {
      console.error('getAppointmentById error:', error);
      throw error;
    }
  }

  /**
   * Create a new appointment with availability validation
   */
  async createAppointment(
    clientId: string,
    data: CreateAppointmentDto
  ): Promise<Appointment> {
    try {
      // Get service details to calculate end time
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration_minutes, price')
        .eq('id', data.service_id)
        .single();

      if (serviceError || !service) {
        throw new Error('Service not found');
      }

      // Calculate end time
      const endTime = this.calculateEndTime(
        data.start_time,
        service.duration_minutes
      );

      // Check availability before creating
      const isAvailable = await this.checkAvailability(
        data.barber_id,
        data.appointment_date,
        data.start_time,
        endTime
      );

      if (!isAvailable) {
        throw new Error('Selected time slot is not available');
      }

      // Create appointment
      const appointmentData: any = {
        barbershop_id: data.barbershop_id,
        barber_id: data.barber_id,
        client_id: clientId,
        service_id: data.service_id,
        appointment_date: data.appointment_date,
        start_time: data.start_time,
        end_time: endTime,
        status: AppointmentStatus.PENDING,
        payment_status: 'pending',
        payment_method: data.payment_method || null,
        total_price: service.price,
        notes: data.notes || null,
      };

      const { data: newAppointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating appointment: ${error.message}`);
      }

      if (!newAppointment) {
        throw new Error('Failed to create appointment');
      }

      return newAppointment as Appointment;
    } catch (error) {
      console.error('createAppointment error:', error);
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  async updateAppointment(
    id: string,
    updates: UpdateAppointmentDto
  ): Promise<Appointment> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating appointment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Appointment not found');
      }

      return data as Appointment;
    } catch (error) {
      console.error('updateAppointment error:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(
    id: string,
    reason?: string
  ): Promise<Appointment> {
    try {
      const updateData: any = {
        status: AppointmentStatus.CANCELLED,
        cancellation_reason: reason || null,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error cancelling appointment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Appointment not found');
      }

      return data as Appointment;
    } catch (error) {
      console.error('cancelAppointment error:', error);
      throw error;
    }
  }

  /**
   * Confirm an appointment (barber or admin action)
   */
  async confirmAppointment(id: string): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: AppointmentStatus.CONFIRMED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error confirming appointment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Appointment not found');
      }

      return data as Appointment;
    } catch (error) {
      console.error('confirmAppointment error:', error);
      throw error;
    }
  }

  /**
   * Complete an appointment (barber or admin action)
   */
  async completeAppointment(id: string): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: AppointmentStatus.COMPLETED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error completing appointment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Appointment not found');
      }

      return data as Appointment;
    } catch (error) {
      console.error('completeAppointment error:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for a barber on a specific date
   */
  async getAvailableSlots(
    barberId: string,
    date: string,
    serviceId: string
  ): Promise<TimeSlot[]> {
    try {
      // Get service duration
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single();

      if (serviceError || !service) {
        throw new Error('Service not found');
      }

      // Get barber details with schedule
      const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('schedule, barbershop_id')
        .eq('id', barberId)
        .single();

      if (barberError || !barber) {
        throw new Error('Barber not found');
      }

      // Get barbershop opening hours
      const { data: barbershop, error: barbershopError } = await supabase
        .from('barbershops')
        .select('opening_hours')
        .eq('id', barber.barbershop_id)
        .single();

      if (barbershopError || !barbershop) {
        throw new Error('Barbershop not found');
      }

      // Get existing appointments for the barber on this date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('barber_id', barberId)
        .eq('appointment_date', date)
        .in('status', [
          AppointmentStatus.PENDING,
          AppointmentStatus.CONFIRMED,
        ]);

      if (appointmentsError) {
        throw new Error(`Error fetching appointments: ${appointmentsError.message}`);
      }

      // Import availability calculation utility
      const { calculateAvailableSlots } = await import('../utils/availability');

      // Calculate available slots
      const availableSlots = calculateAvailableSlots(
        date,
        barber.schedule,
        barbershop.opening_hours,
        appointments || [],
        service.duration_minutes
      );

      return availableSlots.map((slot) => ({
        time: slot,
        available: true,
        barberId,
      }));
    } catch (error) {
      console.error('getAvailableSlots error:', error);
      throw error;
    }
  }

  /**
   * Check if a specific time slot is available
   */
  private async checkAvailability(
    barberId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      // Check for overlapping appointments
      const { data: overlapping, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('barber_id', barberId)
        .eq('appointment_date', date)
        .in('status', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
        .or(
          `and(start_time.lt.${endTime},end_time.gt.${startTime})`
        );

      if (error) {
        throw new Error(`Error checking availability: ${error.message}`);
      }

      return !overlapping || overlapping.length === 0;
    } catch (error) {
      console.error('checkAvailability error:', error);
      return false;
    }
  }

  /**
   * Calculate end time based on start time and duration
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Get appointments for today
   */
  async getTodayAppointments(
    userId: string,
    role: UserRole
  ): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments(userId, role, {
      date_from: today,
      date_to: today,
    });
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(
    userId: string,
    role: UserRole
  ): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments(userId, role, {
      date_from: today,
      status: AppointmentStatus.CONFIRMED,
    });
  }

  /**
   * Get appointment history
   */
  async getAppointmentHistory(
    userId: string,
    role: UserRole
  ): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments(userId, role, {
      date_to: today,
      status: AppointmentStatus.COMPLETED,
    });
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();
export default appointmentService;
