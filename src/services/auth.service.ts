import { supabase } from '../supabase/client';
import { Usuario } from '../supabase/types';
import { Session as SupabaseSession } from '@supabase/supabase-js';

export class AuthService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<SupabaseSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error('No session returned from login');
    }

    return data.session;
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    nombre: string,
    telefono: string
  ): Promise<Usuario> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          telefono,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('No user returned from registration');
    }

    // Create user profile using database function (bypasses RLS)
    const { data: userData, error: userError } = await supabase.rpc(
      'handle_new_user_registration',
      {
        user_id: authData.user.id,
        user_email: email,
        user_nombre: nombre,
        user_telefono: telefono,
      }
    );

    if (userError) {
      throw new Error(userError.message);
    }

    return userData as Usuario;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'com.barbershop.manager://reset-password',
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<Usuario | null> {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Error getting auth user:', authError);
        return null;
      }

      if (!authUser) {
        console.log('No auth user found');
        return null;
      }

      console.log('Auth user found:', authUser.id, authUser.email);

      // Get user profile from usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Error getting user profile:', userError);
        console.error('User ID:', authUser.id);
        console.error('Error details:', JSON.stringify(userError, null, 2));
        return null;
      }

      if (!userData) {
        console.error('No user profile found for ID:', authUser.id);
        return null;
      }

      console.log('User profile found:', userData.email, userData.rol);
      return userData as Usuario;
    } catch (error) {
      console.error('Unexpected error in getCurrentUser:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Usuario>
  ): Promise<Usuario> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Usuario;
  }

  /**
   * Upload user avatar to Supabase Storage
   */
  async uploadAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user profile with new avatar URL
      await this.updateProfile(userId, { avatar: publicUrl });

      return publicUrl;
    } catch (error) {
      throw new Error(`Failed to upload avatar: ${error}`);
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<SupabaseSession | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<SupabaseSession | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error || !session) {
      return null;
    }

    return session;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (session: SupabaseSession | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
