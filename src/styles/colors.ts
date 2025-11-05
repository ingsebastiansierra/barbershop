/**
 * Color palette for light and dark themes
 */

export const lightColors = {
  // Primary
  primary: '#6366F1',        // Indigo-500
  primaryDark: '#4F46E5',    // Indigo-600
  primaryLight: '#818CF8',   // Indigo-400
  
  // Secondary
  secondary: '#EC4899',      // Pink-500
  secondaryDark: '#DB2777',  // Pink-600
  secondaryLight: '#F472B6', // Pink-400
  
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
  info: '#3B82F6',           // Blue-500
  
  // Borders
  border: '#E5E7EB',         // Gray-200
  divider: '#F3F4F6',        // Gray-100
} as const;

export const darkColors = {
  // Primary
  primary: '#818CF8',        // Indigo-400
  primaryDark: '#6366F1',    // Indigo-500
  primaryLight: '#A5B4FC',   // Indigo-300
  
  // Secondary
  secondary: '#F472B6',      // Pink-400
  secondaryDark: '#EC4899',  // Pink-500
  secondaryLight: '#F9A8D4', // Pink-300
  
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
  info: '#60A5FA',           // Blue-400
  
  // Borders
  border: '#374151',         // Gray-700
  divider: '#1F2937',        // Gray-800
} as const;

export type ColorPalette = typeof lightColors;
