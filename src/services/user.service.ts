import { supabase } from '../supabase/client';
import { User } from '../types/models';

/**
 * UserService
 * Handles user management operations
 */
class UserService {
  /**
   * Get all users in the system (Super Admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getAllUsers error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }

      if (!data) {
        throw new Error('User not found');
      }

      return data;
    } catch (error) {
      console.error('getUserById error:', error);
      throw error;
    }
  }

  /**
   * Update user role (Super Admin only)
   */
  async updateUserRole(userId: string, role: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating user role: ${error.message}`);
      }

      if (!data) {
        throw new Error('User not found');
      }

      return data;
    } catch (error) {
      console.error('updateUserRole error:', error);
      throw error;
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error searching users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('searchUsers error:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching users by role: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('getUsersByRole error:', error);
      throw error;
    }
  }

  /**
   * Get users by barbershop
   */
  async getUsersByBarbershop(barbershopId: string): Promise<User[]> {
    try {
      // Get admins assigned to this barbershop
      const { data: adminAssignments, error: adminError } = await supabase
        .from('admin_assignments')
        .select('user_id, users(*)')
        .eq('barbershop_id', barbershopId);

      if (adminError) {
        console.error('Error fetching admin assignments:', adminError);
      }

      // Get barbers in this barbershop
      const { data: barbers, error: barberError } = await supabase
        .from('barbers')
        .select('id, users(*)')
        .eq('barbershop_id', barbershopId);

      if (barberError) {
        console.error('Error fetching barbers:', barberError);
      }

      // Combine results
      const adminUsers = adminAssignments?.map((a: any) => a.users).filter(Boolean) || [];
      const barberUsers = barbers?.map((b: any) => b.users).filter(Boolean) || [];

      // Deduplicate
      const allUsers = [...adminUsers, ...barberUsers];
      const uniqueUsers = Array.from(
        new Map(allUsers.map((user) => [user.id, user])).values()
      );

      return uniqueUsers;
    } catch (error) {
      console.error('getUsersByBarbershop error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
