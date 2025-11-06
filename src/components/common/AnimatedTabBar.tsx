/**
 * AnimatedTabBar
 * Animated bottom tab bar with sliding indicator
 */

import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const AnimatedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useThemeStore();
  const tabCount = state.routes.length;
  const tabWidth = width / tabCount;
  
  // Animated value for the sliding indicator
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the indicator to the active tab
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Animated sliding indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: colors.primary,
            width: tabWidth,
            transform: [{ translateX }],
          },
        ]}
      />

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Get icon name from options
        const iconName = options.tabBarIcon
          ? (options.tabBarIcon as any)({ focused: isFocused, color: '', size: 24 })?.props?.name
          : 'ellipse';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? '#FFFFFF' : colors.textSecondary}
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: 50,
    borderRadius: 25,
    top: 10,
    left: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    zIndex: 2,
  },
});
