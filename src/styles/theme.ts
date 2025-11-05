/**
 * Theme System
 * Typography, spacing, border radius, shadows, and animations
 */

import { TextStyle } from 'react-native';

/**
 * Typography System
 */
export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
  
  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  
  // Labels
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 14,
  },
} as const;

/**
 * Spacing System
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Border Radius System
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/**
 * Shadow System
 */
export const shadows = {
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
} as const;

/**
 * Animation Timings
 */
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

/**
 * Complete Theme Type
 */
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Animations = typeof animations;
