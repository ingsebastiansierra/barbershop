/**
 * Theme Constants
 * Colores y estilos centralizados de la app Trimly
 */

export const COLORS = {
  // Color principal - Marrón barbería
  primary: '#582308',
  primaryLight: '#7A3010',
  primaryDark: '#3D1806',
  
  // Color secundario - Dorado/Beige
  secondary: '#D4A574',
  secondaryLight: '#E5C9A3',
  secondaryDark: '#B8894F',
  
  // Colores de acento
  accent: '#C19A6B', // Camel/Tan
  accentLight: '#D4B896',
  
  // Grises
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  
  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#582308',
  
  // Texto
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Fondos
  background: '#FFFFFF',
  backgroundDark: '#0F172A',
  surface: '#F8FAFC',
  surfaceDark: '#1E293B',
  
  // Bordes
  border: '#E2E8F0',
  borderDark: '#334155',
  
  // Transparencias
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
  
  // Colores específicos de barbería
  barbershopPole: {
    red: '#DC2626',
    white: '#FFFFFF',
    blue: '#2563EB',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Tailwind classes personalizadas para usar en la app
export const TAILWIND_CLASSES = {
  // Botones
  buttonPrimary: 'bg-[#582308] active:bg-[#3D1806] rounded-lg py-3 px-6',
  buttonSecondary: 'bg-[#D4A574] active:bg-[#B8894F] rounded-lg py-3 px-6',
  buttonOutline: 'border-2 border-[#582308] rounded-lg py-3 px-6',
  
  // Texto
  textPrimary: 'text-gray-900 dark:text-white',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textAccent: 'text-[#582308]',
  
  // Contenedores
  card: 'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md',
  container: 'flex-1 bg-white dark:bg-gray-900',
  
  // Inputs
  input: 'bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white',
  
  // Badges
  badge: 'bg-[#582308] rounded-full px-3 py-1',
  badgeText: 'text-white text-xs font-semibold',
};

export default {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOWS,
  TAILWIND_CLASSES,
};
