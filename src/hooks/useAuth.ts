import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../supabase/types';

/**
 * Custom hook to access authentication state and methods
 */
export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    initialize,
    refreshSession,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    const userRole = user?.role || user?.rol;
    // Handle both English and Spanish role names
    if (role === 'barber' || role === 'barbero') {
      return userRole === 'barber' || userRole === 'barbero';
    }
    if (role === 'client' || role === 'cliente') {
      return userRole === 'client' || userRole === 'cliente';
    }
    return userRole === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    const userRole = user.role || user.rol;
    return roles.some(role => {
      if (role === 'barber' || role === 'barbero') {
        return userRole === 'barber' || userRole === 'barbero';
      }
      if (role === 'client' || role === 'cliente') {
        return userRole === 'client' || userRole === 'cliente';
      }
      return userRole === role;
    });
  };

  /**
   * Check if user is a barber
   */
  const isBarber = (): boolean => {
    return hasRole('barber');
  };

  /**
   * Check if user is a client
   */
  const isClient = (): boolean => {
    return hasRole('client');
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * Check if user can manage appointments (barbers can manage their own appointments)
   */
  const canManageAppointments = (): boolean => {
    return isBarber();
  };

  /**
   * Get user's full name or email as fallback
   */
  const getUserDisplayName = (): string => {
    if (!user) return 'Invitado';
    return user.full_name || user.nombre || user.email;
  };

  /**
   * Get user's initials for avatar fallback
   */
  const getUserInitials = (): string => {
    if (!user) return '?';

    const name = user.full_name || user.nombre || user.email;
    const parts = name.split(' ');

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Get user's role display name in Spanish
   */
  const getRoleDisplayName = (): string => {
    if (!user) return '';

    const role = user.role || user.rol;
    switch (role) {
      case 'barber':
      case 'barbero':
        return 'Barbero';
      case 'client':
      case 'cliente':
        return 'Cliente';
      case 'admin':
        return 'Administrador';
      case 'super_admin':
        return 'Super Administrador';
      default:
        return role || '';
    }
  };

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    isInitialized,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshSession,

    // Role checks
    hasRole,
    hasAnyRole,
    isBarber,
    isClient,
    isAdmin,

    // Permission checks
    canManageAppointments,

    // Utilities
    getUserDisplayName,
    getUserInitials,
    getRoleDisplayName,
  };
};
