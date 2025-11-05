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
    return user?.rol === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.rol) : false;
  };

  /**
   * Check if user is a barber
   */
  const isBarber = (): boolean => {
    return hasRole('barbero');
  };

  /**
   * Check if user is a client
   */
  const isClient = (): boolean => {
    return hasRole('cliente');
  };

  /**
   * Check if user can manage appointments (barbers can manage their own appointments)
   */
  const canManageAppointments = (): boolean => {
    return isBarber();
  };

  /**
   * Check if user is associated with a barbershop (has negocio_id)
   */
  const hasNegocio = (): boolean => {
    return !!user?.negocio_id;
  };

  /**
   * Get user's full name or email as fallback
   */
  const getUserDisplayName = (): string => {
    if (!user) return 'Invitado';
    return user.nombre || user.email;
  };

  /**
   * Get user's initials for avatar fallback
   */
  const getUserInitials = (): string => {
    if (!user) return '?';

    const name = user.nombre || user.email;
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

    switch (user.rol) {
      case 'barbero':
        return 'Barbero';
      case 'cliente':
        return 'Cliente';
      default:
        return user.rol;
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

    // Permission checks
    canManageAppointments,
    hasNegocio,

    // Utilities
    getUserDisplayName,
    getUserInitials,
    getRoleDisplayName,
  };
};
