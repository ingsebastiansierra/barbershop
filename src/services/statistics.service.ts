import { supabase } from '../supabase/client';
import {
  DashboardMetrics,
  BarbershopStatistics,
  BarberStatistics,
  RevenueByMonth,
  AppointmentStatus,
} from '../types/models';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * StatisticsService
 * Handles all statistics and analytics operations for dashboards
 */
class StatisticsService {
  /**
   * Get dashboard metrics for a barbershop
   */
  async getDashboardMetrics(barbershopId: string): Promise<DashboardMetrics> {
    try {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const today = format(now, 'yyyy-MM-dd');

      // Get all appointments for the barbershop
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('barbershop_id', barbershopId);

      if (appointmentsError) {
        throw new Error(`Error fetching appointments: ${appointmentsError.message}`);
      }

      const allAppointments = appointments || [];

      // Calculate current month metrics
      const currentMonthAppointments = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= startOfCurrentMonth && aptDate <= endOfCurrentMonth;
      });

      const totalAppointments = currentMonthAppointments.length;
      const completedAppointments = currentMonthAppointments.filter(
        (apt) => apt.status === AppointmentStatus.COMPLETED
      );
      const cancelledAppointments = currentMonthAppointments.filter(
        (apt) => apt.status === AppointmentStatus.CANCELLED
      );

      const appointmentsRevenue = completedAppointments.reduce(
        (sum, apt) => sum + Number(apt.total_price || 0),
        0
      );

      // Get sales for this month
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('amount')
        .eq('barbershop_id', barbershopId)
        .gte('sale_date', format(startOfCurrentMonth, 'yyyy-MM-dd'))
        .lte('sale_date', format(endOfCurrentMonth, 'yyyy-MM-dd'));

      if (salesError) {
        console.error('Error fetching sales:', salesError);
      }

      const salesRevenue = (sales || []).reduce(
        (sum, sale) => sum + Number(sale.amount || 0),
        0
      );

      const totalRevenue = appointmentsRevenue + salesRevenue;

      const cancellationRate =
        totalAppointments > 0
          ? (cancelledAppointments.length / totalAppointments) * 100
          : 0;

      // Get new clients this month
      const { data: newClients, error: clientsError } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('barbershop_id', barbershopId)
        .gte('created_at', startOfCurrentMonth.toISOString())
        .lte('created_at', endOfCurrentMonth.toISOString());

      if (clientsError) {
        console.error('Error fetching new clients:', clientsError);
      }

      const uniqueNewClients = new Set(newClients?.map((apt) => apt.client_id) || []);

      // Get pending appointments
      const pendingAppointments = allAppointments.filter(
        (apt) => apt.status === AppointmentStatus.PENDING
      ).length;

      // Get today's appointments
      const todayAppointments = allAppointments.filter(
        (apt) => apt.appointment_date === today
      ).length;

      // Get revenue trend for last 6 months
      const revenueTrend = await this.getRevenueTrend(barbershopId, 6);

      // Get top barbers
      const topBarbers = await this.getTopBarbers(barbershopId, 5);

      return {
        total_appointments: totalAppointments,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        new_clients: uniqueNewClients.size,
        cancellation_rate: Math.round(cancellationRate * 100) / 100,
        pending_appointments: pendingAppointments,
        today_appointments: todayAppointments,
        revenue_trend: revenueTrend,
        top_barbers: topBarbers,
      };
    } catch (error) {
      console.error('getDashboardMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get revenue trend for the last N months
   */
  async getRevenueTrend(
    barbershopId: string,
    months: number = 6
  ): Promise<RevenueByMonth[]> {
    try {
      const now = new Date();
      const trends: RevenueByMonth[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthKey = format(monthDate, 'yyyy-MM');

        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('total_price, status')
          .eq('barbershop_id', barbershopId)
          .gte('appointment_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('appointment_date', format(monthEnd, 'yyyy-MM-dd'));

        if (error) {
          console.error(`Error fetching appointments for ${monthKey}:`, error);
          trends.push({ month: monthKey, revenue: 0, appointments: 0 });
          continue;
        }

        const completedAppointments = (appointments || []).filter(
          (apt) => apt.status === AppointmentStatus.COMPLETED
        );

        const appointmentsRevenue = completedAppointments.reduce(
          (sum, apt) => sum + Number(apt.total_price || 0),
          0
        );

        // Get sales for this month
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select('amount')
          .eq('barbershop_id', barbershopId)
          .gte('sale_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('sale_date', format(monthEnd, 'yyyy-MM-dd'));

        if (salesError) {
          console.error(`Error fetching sales for ${monthKey}:`, salesError);
        }

        const salesRevenue = (sales || []).reduce(
          (sum, sale) => sum + Number(sale.amount || 0),
          0
        );

        const revenue = appointmentsRevenue + salesRevenue;

        trends.push({
          month: monthKey,
          revenue: Math.round(revenue * 100) / 100,
          appointments: completedAppointments.length,
        });
      }

      return trends;
    } catch (error) {
      console.error('getRevenueTrend error:', error);
      return [];
    }
  }

  /**
   * Get top barbers by revenue or appointments
   */
  async getTopBarbers(
    barbershopId: string,
    limit: number = 5
  ): Promise<BarberStatistics[]> {
    try {
      // Get all barbers for the barbershop
      const { data: barbers, error: barbersError } = await supabase
        .from('barbers')
        .select('id, user:users(full_name), rating')
        .eq('barbershop_id', barbershopId)
        .eq('is_active', true);

      if (barbersError) {
        throw new Error(`Error fetching barbers: ${barbersError.message}`);
      }

      if (!barbers || barbers.length === 0) {
        return [];
      }

      // Get statistics for each barber
      const barberStats = await Promise.all(
        barbers.map(async (barber: any) => {
          const { data: appointments, error } = await supabase
            .from('appointments')
            .select('status, total_price')
            .eq('barber_id', barber.id);

          if (error) {
            console.error(`Error fetching appointments for barber ${barber.id}:`, error);
            return null;
          }

          const allAppointments = appointments || [];
          const completedAppointments = allAppointments.filter(
            (apt) => apt.status === AppointmentStatus.COMPLETED
          );

          const appointmentsRevenue = completedAppointments.reduce(
            (sum, apt) => sum + Number(apt.total_price || 0),
            0
          );

          // Get sales for this barber
          const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('amount')
            .eq('barber_id', barber.id);

          if (salesError) {
            console.error(`Error fetching sales for barber ${barber.id}:`, salesError);
          }

          const salesRevenue = (sales || []).reduce(
            (sum, sale) => sum + Number(sale.amount || 0),
            0
          );

          const totalRevenue = appointmentsRevenue + salesRevenue;

          const completionRate =
            allAppointments.length > 0
              ? (completedAppointments.length / allAppointments.length) * 100
              : 0;

          return {
            barber_id: barber.id,
            barber_name: barber.user?.full_name || 'Unknown',
            total_appointments: allAppointments.length,
            total_revenue: Math.round(totalRevenue * 100) / 100,
            average_rating: barber.rating || 0,
            completion_rate: Math.round(completionRate * 100) / 100,
          };
        })
      );

      // Filter out null values and sort by revenue
      const validStats = barberStats.filter((stat) => stat !== null) as BarberStatistics[];
      const sortedStats = validStats.sort((a, b) => b.total_revenue - a.total_revenue);

      return sortedStats.slice(0, limit);
    } catch (error) {
      console.error('getTopBarbers error:', error);
      return [];
    }
  }

  /**
   * Get barbershop statistics for a specific period
   */
  async getBarbershopStatistics(
    barbershopId: string,
    startDate: string,
    endDate: string
  ): Promise<BarbershopStatistics> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate);

      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }

      const allAppointments = appointments || [];
      const completedAppointments = allAppointments.filter(
        (apt) => apt.status === AppointmentStatus.COMPLETED
      );
      const cancelledAppointments = allAppointments.filter(
        (apt) => apt.status === AppointmentStatus.CANCELLED
      );

      const appointmentsRevenue = completedAppointments.reduce(
        (sum, apt) => sum + Number(apt.total_price || 0),
        0
      );

      // Get sales for this period
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('amount')
        .eq('barbershop_id', barbershopId)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);

      if (salesError) {
        console.error('Error fetching sales:', salesError);
      }

      const salesRevenue = (sales || []).reduce(
        (sum, sale) => sum + Number(sale.amount || 0),
        0
      );

      const totalRevenue = appointmentsRevenue + salesRevenue;

      const cancellationRate =
        allAppointments.length > 0
          ? (cancelledAppointments.length / allAppointments.length) * 100
          : 0;

      // Get unique clients
      const uniqueClients = new Set(allAppointments.map((apt) => apt.client_id));

      return {
        total_appointments: allAppointments.length,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        new_clients: uniqueClients.size,
        cancellation_rate: Math.round(cancellationRate * 100) / 100,
        average_rating: 0, // Would need reviews table
        period_start: startDate,
        period_end: endDate,
      };
    } catch (error) {
      console.error('getBarbershopStatistics error:', error);
      throw error;
    }
  }

  /**
   * Get barber statistics for a specific period
   */
  async getBarberStatistics(
    barberId: string,
    startDate?: string,
    endDate?: string
  ): Promise<BarberStatistics> {
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

      const { data: appointments, error } = await query;

      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }

      // Get barber details
      const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('user:users(full_name), rating')
        .eq('id', barberId)
        .single();

      if (barberError) {
        throw new Error(`Error fetching barber: ${barberError.message}`);
      }

      const allAppointments = appointments || [];
      const completedAppointments = allAppointments.filter(
        (apt) => apt.status === AppointmentStatus.COMPLETED
      );

      const appointmentsRevenue = completedAppointments.reduce(
        (sum, apt) => sum + Number(apt.total_price || 0),
        0
      );

      // Get sales for this barber
      let salesQuery = supabase
        .from('sales')
        .select('amount')
        .eq('barber_id', barberId);

      if (startDate) {
        salesQuery = salesQuery.gte('sale_date', startDate);
      }

      if (endDate) {
        salesQuery = salesQuery.lte('sale_date', endDate);
      }

      const { data: sales, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('Error fetching sales:', salesError);
      }

      const salesRevenue = (sales || []).reduce(
        (sum, sale) => sum + Number(sale.amount || 0),
        0
      );

      const totalRevenue = appointmentsRevenue + salesRevenue;

      const completionRate =
        allAppointments.length > 0
          ? (completedAppointments.length / allAppointments.length) * 100
          : 0;

      return {
        barber_id: barberId,
        barber_name: (barber as any)?.user?.full_name || 'Unknown',
        total_appointments: allAppointments.length,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        average_rating: (barber as any)?.rating || 0,
        completion_rate: Math.round(completionRate * 100) / 100,
      };
    } catch (error) {
      console.error('getBarberStatistics error:', error);
      throw error;
    }
  }

  /**
   * Get appointments by status for a barbershop
   */
  async getAppointmentsByStatus(
    barbershopId: string
  ): Promise<Record<AppointmentStatus, number>> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('status')
        .eq('barbershop_id', barbershopId);

      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }

      const statusCounts: Record<AppointmentStatus, number> = {
        [AppointmentStatus.PENDING]: 0,
        [AppointmentStatus.CONFIRMED]: 0,
        [AppointmentStatus.COMPLETED]: 0,
        [AppointmentStatus.CANCELLED]: 0,
      };

      (appointments || []).forEach((apt) => {
        statusCounts[apt.status as AppointmentStatus]++;
      });

      return statusCounts;
    } catch (error) {
      console.error('getAppointmentsByStatus error:', error);
      throw error;
    }
  }

  /**
   * Get revenue comparison between two periods
   */
  async getRevenueComparison(
    barbershopId: string,
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ): Promise<{
    current_revenue: number;
    previous_revenue: number;
    change_percentage: number;
  }> {
    try {
      // Get current period revenue
      const currentStats = await this.getBarbershopStatistics(
        barbershopId,
        currentStart,
        currentEnd
      );

      // Get previous period revenue
      const previousStats = await this.getBarbershopStatistics(
        barbershopId,
        previousStart,
        previousEnd
      );

      const changePercentage =
        previousStats.total_revenue > 0
          ? ((currentStats.total_revenue - previousStats.total_revenue) /
              previousStats.total_revenue) *
            100
          : 0;

      return {
        current_revenue: currentStats.total_revenue,
        previous_revenue: previousStats.total_revenue,
        change_percentage: Math.round(changePercentage * 100) / 100,
      };
    } catch (error) {
      console.error('getRevenueComparison error:', error);
      throw error;
    }
  }

  /**
   * Get global metrics for all barbershops (Super Admin)
   */
  async getGlobalMetrics(): Promise<{
    total_barbershops: number;
    active_barbershops: number;
    total_appointments: number;
    total_revenue: number;
    total_barbers: number;
    total_clients: number;
  }> {
    try {
      // Get all barbershops
      const { data: barbershops, error: barbershopsError } = await supabase
        .from('barbershops')
        .select('id, is_active');

      if (barbershopsError) {
        throw new Error(`Error fetching barbershops: ${barbershopsError.message}`);
      }

      const allBarbershops = barbershops || [];
      const activeBarbershops = allBarbershops.filter((b) => b.is_active);

      // Get all appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('status, total_price');

      if (appointmentsError) {
        throw new Error(`Error fetching appointments: ${appointmentsError.message}`);
      }

      const allAppointments = appointments || [];
      const completedAppointments = allAppointments.filter(
        (apt) => apt.status === AppointmentStatus.COMPLETED
      );

      const appointmentsRevenue = completedAppointments.reduce(
        (sum, apt) => sum + Number(apt.total_price || 0),
        0
      );

      // Get all sales (this is the real revenue from the sales table)
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('amount');

      if (salesError) {
        console.error('Error fetching sales:', salesError);
      }

      const salesRevenue = (sales || []).reduce(
        (sum, sale) => sum + Number(sale.amount || 0),
        0
      );

      // Total revenue is the sum of both appointments and direct sales
      const totalRevenue = appointmentsRevenue + salesRevenue;

      // Get total barbers
      const { count: barbersCount, error: barbersError } = await supabase
        .from('barbers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (barbersError) {
        console.error('Error fetching barbers count:', barbersError);
      }

      // Get total clients (unique users with client role)
      const { count: clientsCount, error: clientsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

      if (clientsError) {
        console.error('Error fetching clients count:', clientsError);
      }

      return {
        total_barbershops: allBarbershops.length,
        active_barbershops: activeBarbershops.length,
        total_appointments: allAppointments.length,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_barbers: barbersCount || 0,
        total_clients: clientsCount || 0,
      };
    } catch (error) {
      console.error('getGlobalMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get statistics for all barbershops (Super Admin)
   */
  async getAllBarbershopsStatistics(): Promise<
    Array<{
      barbershop_id: string;
      barbershop_name: string;
      total_appointments: number;
      total_revenue: number;
      active_barbers: number;
      cancellation_rate: number;
      is_active: boolean;
    }>
  > {
    try {
      // Get all barbershops
      const { data: barbershops, error: barbershopsError } = await supabase
        .from('barbershops')
        .select('id, name, is_active')
        .order('name', { ascending: true });

      if (barbershopsError) {
        throw new Error(`Error fetching barbershops: ${barbershopsError.message}`);
      }

      if (!barbershops || barbershops.length === 0) {
        return [];
      }

      // Get statistics for each barbershop
      const stats = await Promise.all(
        barbershops.map(async (barbershop) => {
          // Get appointments for this barbershop
          const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('status, total_price')
            .eq('barbershop_id', barbershop.id);

          if (appointmentsError) {
            console.error(
              `Error fetching appointments for barbershop ${barbershop.id}:`,
              appointmentsError
            );
          }

          const allAppointments = appointments || [];
          const completedAppointments = allAppointments.filter(
            (apt) => apt.status === AppointmentStatus.COMPLETED
          );
          const cancelledAppointments = allAppointments.filter(
            (apt) => apt.status === AppointmentStatus.CANCELLED
          );

          const appointmentsRevenue = completedAppointments.reduce(
            (sum, apt) => sum + Number(apt.total_price || 0),
            0
          );

          // Get sales for this barbershop
          const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('amount')
            .eq('barbershop_id', barbershop.id);

          if (salesError) {
            console.error(
              `Error fetching sales for barbershop ${barbershop.id}:`,
              salesError
            );
          }

          const salesRevenue = (sales || []).reduce(
            (sum, sale) => sum + Number(sale.amount || 0),
            0
          );

          // Total revenue is the sum of both appointments and direct sales
          const totalRevenue = appointmentsRevenue + salesRevenue;

          const cancellationRate =
            allAppointments.length > 0
              ? (cancelledAppointments.length / allAppointments.length) * 100
              : 0;

          // Get active barbers count
          const { count: barbersCount, error: barbersError } = await supabase
            .from('barbers')
            .select('*', { count: 'exact', head: true })
            .eq('barbershop_id', barbershop.id)
            .eq('is_active', true);

          if (barbersError) {
            console.error(
              `Error fetching barbers for barbershop ${barbershop.id}:`,
              barbersError
            );
          }

          return {
            barbershop_id: barbershop.id,
            barbershop_name: barbershop.name,
            total_appointments: allAppointments.length,
            total_revenue: Math.round(totalRevenue * 100) / 100,
            active_barbers: barbersCount || 0,
            cancellation_rate: Math.round(cancellationRate * 100) / 100,
            is_active: barbershop.is_active,
          };
        })
      );

      // Sort by revenue descending
      return stats.sort((a, b) => b.total_revenue - a.total_revenue);
    } catch (error) {
      console.error('getAllBarbershopsStatistics error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService();
export default statisticsService;
