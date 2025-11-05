import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '../supabase/types';
import { Session } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';

interface AuthState {
  user: Usuario | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: Usuario | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    nombre: string,
    telefono: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Usuario>) => Promise<void>;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const STORAGE_KEY = '@barbershop:auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setSession: (session) => {
    set({
      session,
      isAuthenticated: !!session,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const session = await authService.login(email, password);
      const user = await authService.getCurrentUser();

      if (!user) {
        throw new Error('Failed to get user after login');
      }

      // Persist session to AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ session, user })
      );

      set({
        session,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (
    email: string,
    password: string,
    nombre: string,
    telefono: string
  ) => {
    try {
      set({ isLoading: true });

      await authService.register(email, password, nombre, telefono);

      // After registration, user needs to verify email
      // So we don't automatically log them in
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      await authService.logout();

      // Clear persisted session
      await AsyncStorage.removeItem(STORAGE_KEY);

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (updates: Partial<Usuario>) => {
    try {
      const { user } = get();

      if (!user) {
        throw new Error('No user logged in');
      }

      set({ isLoading: true });

      const updatedUser = await authService.updateProfile(user.id, updates);

      // Update persisted session
      const { session } = get();
      if (session) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ session, user: updatedUser })
        );
      }

      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Try to restore session from AsyncStorage
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedData) {
        // Verify session is still valid
        const currentSession = await authService.getSession();

        if (currentSession) {
          // Get fresh user data
          const currentUser = await authService.getCurrentUser();

          if (currentUser) {
            set({
              session: currentSession,
              user: currentUser,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });
            return;
          }
        }

        // Session is invalid, clear storage
        await AsyncStorage.removeItem(STORAGE_KEY);
      }

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  refreshSession: async () => {
    try {
      const session = await authService.refreshSession();

      if (session) {
        const user = await authService.getCurrentUser();

        if (user) {
          // Update persisted session
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ session, user })
          );

          set({
            session,
            user,
            isAuthenticated: true,
          });
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // If refresh fails, logout
      get().logout();
    }
  },
}));

// Setup auth state change listener
authService.onAuthStateChange(async (session) => {
  const store = useAuthStore.getState();

  if (session) {
    const user = await authService.getCurrentUser();

    if (user) {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ session, user })
      );

      store.setSession(session);
      store.setUser(user);
    }
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);
    store.setSession(null);
    store.setUser(null);
  }
});
