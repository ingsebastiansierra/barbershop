/**
 * ShortCard Component
 * Reusable card component to display a short
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarberShort, BarberShortWithDetails, ShortMediaType } from '../../types/models';
import { useThemeStore } from '../../store/themeStore';

interface ShortCardProps {
  short: BarberShort | BarberShortWithDetails;
  onPress?: () => void;
  onDelete?: () => void;
  showBarberInfo?: boolean;
  width?: number | string;
}

export const ShortCard: React.FC<ShortCardProps> = ({
  short,
  onPress,
  onDelete,
  showBarberInfo = false,
  width = '48%',
}) => {
  const { colors } = useThemeStore();

  const shortWithDetails = short as BarberShortWithDetails;
  const hasBarberInfo = showBarberInfo && shortWithDetails.barber;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width,
          backgroundColor: colors.surface,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Media */}
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: short.thumbnail_url || short.media_url }}
          style={styles.media}
          resizeMode="cover"
        />

        {/* Media type indicator */}
        {short.media_type === ShortMediaType.VIDEO && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
          </View>
        )}

        {/* Duration badge for videos */}
        {short.media_type === ShortMediaType.VIDEO && short.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {Math.floor(short.duration / 60)}:{(short.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {/* Status badge */}
        {!short.is_active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Inactivo</Text>
          </View>
        )}

        {/* Delete button */}
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info overlay */}
      <View style={styles.infoOverlay}>
        {/* Barber info */}
        {hasBarberInfo && (
          <View style={styles.barberInfo}>
            <Image
              source={{ uri: shortWithDetails.barber.user.avatar_url || 'https://via.placeholder.com/40' }}
              style={styles.barberAvatar}
            />
            <Text style={styles.barberName} numberOfLines={1}>
              {shortWithDetails.barber.user.full_name}
            </Text>
          </View>
        )}

        {/* Title */}
        {short.title && (
          <Text style={styles.title} numberOfLines={2}>
            {short.title}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={14} color="#fff" />
            <Text style={styles.statText}>{short.views_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={14} color="#fff" />
            <Text style={styles.statText}>{short.likes_count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 9 / 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  durationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  barberName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});
