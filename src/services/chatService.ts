import { supabase } from '../supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  barber_id: string;
  last_message?: string;
  last_message_at?: string;
  client_unread_count: number;
  barber_unread_count: number;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  client?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  barber?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

class ChatService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // ==================== CONVERSACIONES ====================

  async getOrCreateConversation(clientId: string, barberId: string): Promise<string> {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_client_id: clientId,
      p_barber_id: barberId,
    });

    if (error) throw error;
    return data;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`client_id.eq.${userId},barber_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Fetch user details separately
    const conversationsWithUsers = await Promise.all(
      (data || []).map(async (conv) => {
        const [clientData, barberData] = await Promise.all([
          supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', conv.client_id)
            .single(),
          supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', conv.barber_id)
            .single(),
        ]);

        return {
          ...conv,
          client: clientData.data ? {
            id: conv.client_id,
            full_name: clientData.data.full_name,
            avatar_url: clientData.data.avatar_url,
          } : undefined,
          barber: barberData.data ? {
            id: conv.barber_id,
            full_name: barberData.data.full_name,
            avatar_url: barberData.data.avatar_url,
          } : undefined,
        };
      })
    );

    return conversationsWithUsers;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Fetch user details separately
    const [clientData, barberData] = await Promise.all([
      supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', data.client_id)
        .single(),
      supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', data.barber_id)
        .single(),
    ]);

    return {
      ...data,
      client: clientData.data ? {
        id: data.client_id,
        full_name: clientData.data.full_name,
        avatar_url: clientData.data.avatar_url,
      } : undefined,
      barber: barberData.data ? {
        id: data.barber_id,
        full_name: barberData.data.full_name,
        avatar_url: barberData.data.avatar_url,
      } : undefined,
    };
  }

  // ==================== MENSAJES ====================

  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    imageUrl?: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });

    if (error) throw error;
  }

  // ==================== TIEMPO REAL ====================

  subscribeToConversation(
    conversationId: string,
    onNewMessage: (message: Message) => void,
    onMessageUpdate: (message: Message) => void
  ): RealtimeChannel {
    const channelName = `conversation:${conversationId}`;
    
    // Si ya existe un canal, removerlo primero
    if (this.channels.has(channelName)) {
      this.unsubscribeFromConversation(conversationId);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessageUpdate(payload.new as Message);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToConversations(
    userId: string,
    onConversationUpdate: (conversation: Conversation) => void
  ): RealtimeChannel {
    const channelName = `conversations:${userId}`;
    
    if (this.channels.has(channelName)) {
      this.unsubscribeFromConversations(userId);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `client_id=eq.${userId}`,
        },
        async (payload) => {
          const conversation = await this.getConversation(payload.new.id);
          if (conversation) onConversationUpdate(conversation);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `barber_id=eq.${userId}`,
        },
        async (payload) => {
          const conversation = await this.getConversation(payload.new.id);
          if (conversation) onConversationUpdate(conversation);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  unsubscribeFromConversation(conversationId: string): void {
    const channelName = `conversation:${conversationId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeFromConversations(userId: string): void {
    const channelName = `conversations:${userId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // ==================== IMÁGENES ====================

  async uploadChatImage(userId: string, imageUri: string): Promise<string> {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const fileExt = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(fileName, blob, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // ==================== UTILIDADES ====================

  async getTotalUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('conversations')
      .select('client_id, barber_id, client_unread_count, barber_unread_count')
      .or(`client_id.eq.${userId},barber_id.eq.${userId}`);

    if (error) throw error;

    const total = (data || []).reduce((sum, conv) => {
      if (conv.client_id === userId) {
        return sum + conv.client_unread_count;
      } else {
        return sum + conv.barber_unread_count;
      }
    }, 0);

    return total;
  }

  getUnreadCount(conversation: Conversation, userId: string): number {
    if (conversation.client_id === userId) {
      return conversation.client_unread_count;
    } else {
      return conversation.barber_unread_count;
    }
  }

  getOtherUser(conversation: Conversation, userId: string) {
    if (conversation.client_id === userId) {
      return conversation.barber;
    } else {
      return conversation.client;
    }
  }
}

export const chatService = new ChatService();
