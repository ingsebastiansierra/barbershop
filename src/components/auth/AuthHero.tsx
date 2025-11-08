/**
 * AuthHero
 * Hero component for authentication screens with decorative elements
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { spacing, typography } from '../../styles/theme';
import { TrimlyLogo } from './TrimlyLogo';

const { width } = Dimensions.get('window');

interface AuthHeroProps {
  size?: 'large' | 'small';
}

export const AuthHero: React.FC<AuthHeroProps> = ({ size = 'large' }) => {
  const { colors } = useThemeStore();
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, { height: isLarge ? 240 : 200 }]}>
      {/* Decorative circles */}
      <View
        style={[
          styles.decorativeCircle,
          {
            backgroundColor: colors.primary + '15',
            width: isLarge ? 200 : 180,
            height: isLarge ? 200 : 180,
            borderRadius: isLarge ? 100 : 90,
            top: isLarge ? 0 : -10,
            right: width / 2 - (isLarge ? 100 : 90),
          },
        ]}
      />
      <View
        style={[
          styles.decorativeCircle2,
          {
            backgroundColor: colors.primary + '08',
            width: isLarge ? 150 : 130,
            height: isLarge ? 150 : 130,
            borderRadius: isLarge ? 75 : 65,
            bottom: isLarge ? 50 : 40,
            left: width / 2 - (isLarge ? 75 : 65),
          },
        ]}
      />

      {/* Main logo */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: 'white',
            width: isLarge ? 140 : 120,
            height: isLarge ? 140 : 120,
            borderRadius: isLarge ? 70 : 60,
          },
        ]}
      >
        <TrimlyLogo size={isLarge ? 140 : 120} color={colors.primary} />
      </View>

      {/* Brand Name */}
      <View style={styles.brandContainer}>
        <Text
          style={[
            styles.brandName,
            {
              color: colors.primary,
              fontSize: isLarge ? 42 : 36,
            },
          ]}
        >
          Trimly
        </Text>
        <Text
          style={[
            styles.brandTagline,
            {
              color: colors.textSecondary,
              fontSize: isLarge ? 14 : 12,
            },
          ]}
        >
          Tu barbería en un toque
        </Text>
      </View>

      {/* Accent circles */}
      <View
        style={[
          styles.accentCircle,
          {
            backgroundColor: colors.primary + '25',
            width: 40,
            height: 40,
            borderRadius: 20,
            top: 30,
            left: width / 2 - 100,
          },
        ]}
      />
      <View
        style={[
          styles.accentCircle,
          {
            backgroundColor: colors.primary + '20',
            width: 30,
            height: 30,
            borderRadius: 15,
            bottom: 70,
            right: width / 2 - 90,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: spacing.md,
  },
  iconText: {
    color: '#FFFFFF',
  },
  decorativeCircle: {
    position: 'absolute',
    zIndex: 1,
  },
  decorativeCircle2: {
    position: 'absolute',
    zIndex: 0,
  },
  accentCircle: {
    position: 'absolute',
    zIndex: 2,
  },
  brandContainer: {
    alignItems: 'center',
    zIndex: 3,
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  brandTagline: {
    fontWeight: '400',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
