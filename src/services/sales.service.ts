import { supabase } from '../supabase/client';

export interface Sale {
  id: string;
  barber_id: string;
  barbershop_id: string;
  service_name: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'other';
  client_name?: string;
  notes?: string;
  sale_date: string;
  sale_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSaleDto {
  service_name: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'other';
  client_name?: string;
  notes?: string;
  sale_date?: string;
  sale_time?: string;
}

export interface SalesStats {
  total_sales: number;
  total_revenue: number;
  average_sale: number;
  highest_sale: number;
  lowest_sale: number;
}

class SalesService {
  /**
   * Create a new sale record
   */
  async createSale(barberId: string, barbershopId: string, data: CreateSaleDto): Promise<Sale> {
    try {
      const saleData = {
        barber_id: barberId,
        barbershop_id: barbershopId,
        service_name: data.service_name,
        amount: data.amount,
        payment_method: data.payment_method,
        client_name: data.client_name,
        notes: data.notes,
        sale_date: data.sale_date || new Date().toISOString().split('T')[0],
        sale_time: data.sale_time || new Date().toTimeString().split(' ')[0],
      };

      const { data: sale, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating sale: ${error.message}`);
      }

      return sale;
    } catch (error) {
      console.error('createSale error:', error);
      throw error;
    }
  }

  /**
   * Get sales for a barber with optional date range
   */
  async getSalesByBarber(
    barberId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Sale[]> {
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .eq('barber_id', barberId)
        .order('sale_date', { ascending: false })
        .order('sale_time', { ascending: false });

      if (startDate) {
        query = query.gte('sale_date', startDate);
      }

      if (endDate) {
        query = query.lte('sale_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching sales: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getSalesByBarber error:', error);
      throw error;
    }
  }

  /**
   * Get sales statistics for a barber
   */
  async getBarberStats(
    barberId: string,
    startDate?: string,
    endDate?: string
  ): Promise<SalesStats> {
    try {
      const sales = await this.getSalesByBarber(barberId, startDate, endDate);

      if (sales.length === 0) {
        return {
          total_sales: 0,
          total_revenue: 0,
          average_sale: 0,
          highest_sale: 0,
          lowest_sale: 0,
        };
      }

      const amounts = sales.map((s) => Number(s.amount));
      const total_revenue = amounts.reduce((sum, amount) => sum + amount, 0);

      return {
        total_sales: sales.length,
        total_revenue,
        average_sale: total_revenue / sales.length,
        highest_sale: Math.max(...amounts),
        lowest_sale: Math.min(...amounts),
      };
    } catch (error) {
      console.error('getBarberStats error:', error);
      throw error;
    }
  }

  /**
   * Get sales for today
   */
  async getTodaySales(barberId: string): Promise<Sale[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getSalesByBarber(barberId, today, today);
  }

  /**
   * Get sales for current week
   */
  async getWeekSales(barberId: string): Promise<Sale[]> {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return this.getSalesByBarber(barberId, startDate, endDate);
  }

  /**
   * Get sales for current month
   */
  async getMonthSales(barberId: string): Promise<Sale[]> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return this.getSalesByBarber(barberId, startDate, endDate);
  }

  /**
   * Update a sale
   */
  async updateSale(saleId: string, updates: Partial<CreateSaleDto>): Promise<Sale> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', saleId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating sale: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('updateSale error:', error);
      throw error;
    }
  }

  /**
   * Delete a sale
   */
  async deleteSale(saleId: string): Promise<void> {
    try {
      const { error } = await supabase.from('sales').delete().eq('id', saleId);

      if (error) {
        throw new Error(`Error deleting sale: ${error.message}`);
      }
    } catch (error) {
      console.error('deleteSale error:', error);
      throw error;
    }
  }

  /**
   * Get sales grouped by date
   */
  async getSalesGroupedByDate(
    barberId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; sales: Sale[]; total: number }[]> {
    try {
      const sales = await this.getSalesByBarber(barberId, startDate, endDate);

      const grouped = sales.reduce((acc, sale) => {
        const date = sale.sale_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(sale);
        return acc;
      }, {} as Record<string, Sale[]>);

      return Object.entries(grouped)
        .map(([date, sales]) => ({
          date,
          sales,
          total: sales.reduce((sum, s) => sum + Number(s.amount), 0),
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('getSalesGroupedByDate error:', error);
      throw error;
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodName(method: string): string {
    const names: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      other: 'Otro',
    };
    return names[method] || method;
  }
}

export const salesService = new SalesService();
export default salesService;
