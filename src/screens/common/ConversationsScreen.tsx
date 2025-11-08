import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatService, Conversation } from '../../services/chatService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

export const ConversationsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
      
      // Suscribirse a actualizaciones en tiempo real
      const channel = chatService.subscribeToConversations(
        user.id,
        handleConversationUpdate
      );

      return () => {
        chatService.unsubscribeFromConversations(user.id);
      };
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const data = await chatService.getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversations((prev) => {
      const index = prev.findIndex((c) => c.id === updatedConversation.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedConversation;
        return updated.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      } else {
        return [updatedConversation, ...prev];
      }
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    if (!user) return null;

    const otherUser = chatService.getOtherUser(item, user.id);
    const unreadCount = chatService.getUnreadCount(item, user.id);
    const timeAgo = item.last_message_at
      ? formatDistanceToNow(new Date(item.last_message_at), {
          addSuffix: true,
          locale: es,
        })
      : '';

    return (
      <TouchableOpacity
        style={[styles.conversationItem, { 
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        }]}
        onPress={() =>
          navigation.navigate('Chat' as never, {
            conversationId: item.id,
            otherUser,
          } as never)
        }
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {otherUser?.avatar_url ? (
            <Image
              source={{ uri: otherUser.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {otherUser?.full_name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
          {/* Online indicator (opcional) */}
          <View style={styles.onlineIndicator} />
        </View>

        {/* Info */}
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.conversationName,
                { 
                  color: colors.textPrimary,
                  fontWeight: unreadCount > 0 ? '700' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {otherUser?.full_name || 'Usuario'}
            </Text>
            <Text style={[styles.conversationTime, { color: colors.textSecondary }]}>
              {timeAgo}
            </Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text
              style={[
                styles.conversationMessage,
                {
                  color: unreadCount > 0 ? colors.textPrimary : colors.textSecondary,
                  fontWeight: unreadCount > 0 ? '600' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {item.last_message || 'Sin mensajes'}
            </Text>
            {unreadCount > 0 && (
              <Ionicons name="checkmark-done" size={16} color={colors.primary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando conversaciones...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No hay conversaciones
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Inicia una conversación con un barbero desde su perfil o desde los detalles de una cita
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
