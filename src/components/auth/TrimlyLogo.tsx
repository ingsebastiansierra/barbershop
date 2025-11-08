/**
 * TrimlyLogo
 * Custom logo component with stylized scissors design
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

interface TrimlyLogoProps {
  size?: number;
  color?: string;
}

export const TrimlyLogo: React.FC<TrimlyLogoProps> = ({ 
  size = 140, 
  color = '#8B5CF6' 
}) => {
  const iconSize = size * 0.65;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={iconSize} height={iconSize} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.75" />
          </LinearGradient>
          <LinearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.75" />
          </LinearGradient>
        </Defs>
        
        {/* Left scissor handle - modern design */}
        <Circle cx="30" cy="30" r="15" fill="url(#grad1)" />
        <Circle cx="30" cy="30" r="10" fill="white" opacity="0.25" />
        <Circle cx="30" cy="30" r="5" fill="white" opacity="0.4" />
        
        {/* Right scissor handle - modern design */}
        <Circle cx="90" cy="30" r="15" fill="url(#grad2)" />
        <Circle cx="90" cy="30" r="10" fill="white" opacity="0.25" />
        <Circle cx="90" cy="30" r="5" fill="white" opacity="0.4" />
        
        {/* Center pivot - enhanced */}
        <Circle cx="60" cy="60" r="10" fill={color} />
        <Circle cx="60" cy="60" r="6" fill="white" opacity="0.3" />
        <Circle cx="60" cy="60" r="3" fill={color} opacity="0.8" />
        
        {/* Left blade - sleek design */}
        <Path
          d="M 30 30 Q 40 40 55 55 L 60 60 L 25 100 Q 20 105 15 100 Q 10 95 15 90 L 50 55 Z"
          fill="url(#grad1)"
          stroke={color}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Left blade highlight */}
        <Path
          d="M 32 32 Q 42 42 54 54"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Left blade edge */}
        <Path
          d="M 30 30 L 55 55 L 20 95"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />
        
        {/* Right blade - sleek design */}
        <Path
          d="M 90 30 Q 80 40 65 55 L 60 60 L 95 100 Q 100 105 105 100 Q 110 95 105 90 L 70 55 Z"
          fill="url(#grad2)"
          stroke={color}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Right blade highlight */}
        <Path
          d="M 88 32 Q 78 42 66 54"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Right blade edge */}
        <Path
          d="M 90 30 L 65 55 L 100 95"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />
        
        {/* Blade tips - sharp points */}
        <Path
          d="M 15 100 L 20 105 L 15 105 Z"
          fill={color}
          opacity="0.9"
        />
        <Path
          d="M 105 100 L 100 105 L 105 105 Z"
          fill={color}
          opacity="0.9"
        />
        
        {/* Decorative cut lines - modern style */}
        <Path
          d="M 35 70 L 42 77"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <Path
          d="M 85 70 L 78 77"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <Path
          d="M 28 82 L 35 89"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <Path
          d="M 92 82 L 85 89"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Additional accent lines */}
        <Path
          d="M 45 62 L 50 67"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
        <Path
          d="M 75 62 L 70 67"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
