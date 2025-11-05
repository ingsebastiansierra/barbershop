/**
 * Card Component
 * Reusable card container with variants
 */

import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { spacing, borderRadius, shadows } from '../../styles/theme';

type CardVariant = 'elevated' | 'outlined' | 'filled';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  padding = 'md',
  style,
}) => {
  const { colors } = useThemeStore();

  const paddingStyles: Record<CardPadding, number> = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: paddingStyles[padding],
    };

    const variantStyles: Record<CardVariant, ViewStyle> = {
      elevated: {
        backgroundColor: colors.surface,
        ...shadows.md,
      },
      outlined: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      },
      filled: {
        backgroundColor: colors.surfaceVariant,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
};
