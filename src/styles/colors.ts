/**
 * Color Palette for Light and Dark Themes
 * Trimly - Barbershop App Theme
 */

export const lightColors = {
  // Primary - Marrón Barbería
  primary: '#582308',        // Brown-barbershop
  primaryDark: '#3D1806',    // Darker brown
  primaryLight: '#7A3010',   // Lighter brown
  
  // Secondary - Dorado/Beige
  secondary: '#D4A574',      // Gold/Beige
  secondaryDark: '#B8894F',  // Darker gold
  secondaryLight: '#E5C9A3', // Lighter beige
  
  // Accent
  accent: '#C19A6B',         // Camel/Tan
  accentLight: '#D4B896',    // Light tan
  
  // Neutrals
  background: '#FFFFFF',
  surface: '#F9FAFB',        // Gray-50
  surfaceVariant: '#F3F4F6', // Gray-100
  
  // Text
  textPrimary: '#111827',    // Gray-900
  textSecondary: '#6B7280',  // Gray-500
  textDisabled: '#9CA3AF',   // Gray-400
  
  // Status
  success: '#10B981',        // Green-500
  warning: '#F59E0B',        // Amber-500
  error: '#EF4444',          // Red-500
  info: '#582308',           // Brown-barbershop
  
  // Borders
  border: '#E5E7EB',         // Gray-200
  divider: '#F3F4F6',        // Gray-100
} as const;

export const darkColors = {
  // Primary - Marrón Barbería (más claro en dark mode)
  primary: '#D4A574',        // Gold/Beige
  primaryDark: '#B8894F',    // Darker gold
  primaryLight: '#E5C9A3',   // Lighter beige
  
  // Secondary
  secondary: '#C19A6B',      // Camel/Tan
  secondaryDark: '#A67C52',  // Darker tan
  secondaryLight: '#D4B896', // Light tan
  
  // Accent
  accent: '#7A3010',         // Brown accent
  accentLight: '#8F4520',    // Lighter brown
  
  // Neutrals
  background: '#111827',     // Gray-900
  surface: '#1F2937',        // Gray-800
  surfaceVariant: '#374151', // Gray-700
  
  // Text
  textPrimary: '#F9FAFB',    // Gray-50
  textSecondary: '#D1D5DB',  // Gray-300
  textDisabled: '#6B7280',   // Gray-500
  
  // Status
  success: '#34D399',        // Green-400
  warning: '#FBBF24',        // Amber-400
  error: '#F87171',          // Red-400
  info: '#D4A574',           // Gold (info in dark mode)
  
  // Borders
  border: '#374151',         // Gray-700
  divider: '#1F2937',        // Gray-800
} as const;

export type ColorScheme = typeof lightColors;
