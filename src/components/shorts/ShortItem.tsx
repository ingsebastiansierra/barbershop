/**
 * ShortItem Component
 * Individual short item with double-tap like animation
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarberShortWithDetails } from '../../types/models';
import { VideoPlayer } from './VideoPlayer';

const SCREEN_DIMENSIONS = Dimensions.get('screen');
const SCREEN_HEIGHT = SCREEN_DIMENSIONS.height;
const SCREEN_WIDTH = SCREEN_DIMENSIONS.width;

interface ShortItemProps {
  item: BarberShortWithDetails;
  isActive: boolean;
  onLike: (short: BarberShortWithDetails) => void;
  onComment: (short: BarberShortWithDetails) => void;
  onShare: (short: BarberShortWithDetails) => void;
}

export const ShortItem: React.FC<ShortItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onShare,
}) => {
  const [showHeart, setShowHeart] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);

  // Reset pause state when video becomes inactive
  React.useEffect(() => {
    if (!isActive) {
      setIsPaused(false);
    }
  }, [isActive]);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - Like
      if (!item.is_liked_by_user) {
        onLike(item);
      }
      
      // Show heart animation
      setShowHeart(true);
      heartScale.setValue(0);
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.timing(heartScale, {
          toValue: 0,
          duration: 400,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setShowHeart(false));
    } else {
      // Single tap - Toggle play/pause
      setIsPaused(!isPaused);
    }
    lastTap.current = now;
  };

  return (
    <View style={styles.shortContainer}>
      {/* Video Player */}
      <VideoPlayer 
        uri={item.media_url} 
        autoPlay={isActive && !isPaused}
      />

      {/* Tap detector overlay */}
      <Pressable 
        style={styles.tapOverlay}
        onPress={handleTap}
      />

      {/* Double tap heart animation */}
      {showHeart && (
        <Animated.View
          style={[
            styles.doubleTapHeart,
            {
              transform: [{ scale: heartScale }],
            },
          ]}
        >
          <Ionicons name="heart" size={120} color="#ff2d55" />
        </Animated.View>
      )}

      {/* Overlay with info */}
      <View style={styles.overlay}>
        {/* Right side actions */}
        <View style={styles.actionsContainer}>
          {/* Like button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(item)}
          >
            <Ionicons
              name={item.is_liked_by_user ? 'heart' : 'heart-outline'}
              size={32}
              color={item.is_liked_by_user ? '#ff2d55' : '#fff'}
            />
            <Text style={styles.actionText}>{item.likes_count}</Text>
          </TouchableOpacity>

          {/* Comment button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onComment(item)}
          >
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{item.comments_count || 0}</Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare(item)}
          >
            <Ionicons name="share-social-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={styles.infoContainer}>
          {/* Barber info */}
          <View style={styles.barberInfo}>
            <Text style={styles.barberName}>
              @{item.barber.user.full_name.replace(/\s+/g, '').toLowerCase()}
            </Text>
            <Text style={styles.barbershopName}>
              {item.barbershop.name}
            </Text>
          </View>

          {/* Description */}
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, idx) => (
                <Text key={idx} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={14} color="#fff" />
              <Text style={styles.statText}>{item.views_count} vistas</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shortContainer: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: '#000',
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 100,
    bottom: 150,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -60,
    marginTop: -60,
    zIndex: 100,
  },
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 20,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 80,
    padding: 16,
    paddingBottom: 16,
  },
  barberInfo: {
    marginBottom: 8,
  },
  barberName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  barbershopName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
