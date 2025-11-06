import { supabase } from '../supabase/client';
import { HaircutStyle, UserGender } from '../types/models';

/**
 * HaircutStyleService
 * Handles all haircut style-related operations
 */
class HaircutStyleService {
  /**
   * Get all active haircut styles
   */
  async getAllStyles(): Promise<HaircutStyle[]> {
    try {
      const { data, error } = await supabase
        .from('haircut_styles')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Error fetching haircut styles: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getAllStyles error:', error);
      throw error;
    }
  }

  /**
   * Get haircut styles by gender
   */
  async getStylesByGender(gender: UserGender): Promise<HaircutStyle[]> {
    try {
      const { data, error } = await supabase
        .from('haircut_styles')
        .select('*')
        .eq('is_active', true)
        .in('gender', [gender, 'other']) // Include gender-specific and unisex styles
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Error fetching haircut styles by gender: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getStylesByGender error:', error);
      throw error;
    }
  }

  /**
   * Get a single haircut style by ID
   */
  async getStyleById(id: string): Promise<HaircutStyle> {
    try {
      const { data, error } = await supabase
        .from('haircut_styles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching haircut style: ${error.message}`);
      }

      if (!data) {
        throw new Error('Haircut style not found');
      }

      return data;
    } catch (error) {
      console.error('getStyleById error:', error);
      throw error;
    }
  }

  /**
   * Create a new haircut style (super_admin only)
   */
  async createStyle(style: Omit<HaircutStyle, 'id' | 'created_at' | 'updated_at'>): Promise<HaircutStyle> {
    try {
      const { data, error } = await supabase
        .from('haircut_styles')
        .insert(style)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating haircut style: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create haircut style');
      }

      return data;
    } catch (error) {
      console.error('createStyle error:', error);
      throw error;
    }
  }

  /**
   * Update a haircut style (super_admin only)
   */
  async updateStyle(id: string, updates: Partial<HaircutStyle>): Promise<HaircutStyle> {
    try {
      const { data, error } = await supabase
        .from('haircut_styles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating haircut style: ${error.message}`);
      }

      if (!data) {
        throw new Error('Haircut style not found');
      }

      return data;
    } catch (error) {
      console.error('updateStyle error:', error);
      throw error;
    }
  }

  /**
   * Deactivate a haircut style (soft delete)
   */
  async deactivateStyle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('haircut_styles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Error deactivating haircut style: ${error.message}`);
      }
    } catch (error) {
      console.error('deactivateStyle error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const haircutStyleService = new HaircutStyleService();
export default haircutStyleService;
