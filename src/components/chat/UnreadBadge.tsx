import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/authStore';

export const UnreadBadge: React.FC = () => {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();

      // Suscribirse a actualizaciones
      const channel = chatService.subscribeToConversations(
        user.id,
        () => loadUnreadCount()
      );

      return () => {
        chatService.unsubscribeFromConversations(user.id);
      };
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await chatService.getTotalUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
      <Text className="text-white text-xs font-bold">
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
};
