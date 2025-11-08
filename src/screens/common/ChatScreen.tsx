import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { chatService, Message } from '../../services/chatService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
  conversationId: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId, otherUser } = route.params as RouteParams;
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user && conversationId) {
      loadMessages();
      markAsRead();

      // Suscribirse a nuevos mensajes
      const channel = chatService.subscribeToConversation(
        conversationId,
        handleNewMessage,
        handleMessageUpdate
      );

      return () => {
        chatService.unsubscribeFromConversation(conversationId);
      };
    }
  }, [user, conversationId]);

  useEffect(() => {
    if (!otherUser) return;
    
    // Configurar header
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          {otherUser?.avatar_url ? (
            <Image
              source={{ uri: otherUser.avatar_url }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={[styles.headerAvatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.headerAvatarText}>
                {otherUser?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerName, { color: colors.textPrimary }]}>
              {otherUser?.full_name || 'Usuario'}
            </Text>
            <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>
              Toca para ver perfil
            </Text>
          </View>
        </View>
      ),
    });
  }, [otherUser, colors]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!user) return;
    try {
      await chatService.markMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => {
      // Evitar duplicados (por si ya está el mensaje temporal)
      const exists = prev.some((m) => m.id === message.id);
      if (exists) return prev;
      
      // Evitar agregar nuestro propio mensaje si ya lo agregamos optimísticamente
      if (user && message.sender_id === user.id) {
        const hasTemp = prev.some((m) => m.id.startsWith('temp-'));
        if (hasTemp) {
          // Reemplazar el temporal con el real
          return prev.map((m) => 
            m.id.startsWith('temp-') && m.content === message.content ? message : m
          );
        }
      }
      
      return [...prev, message];
    });
    
    setTimeout(() => scrollToBottom(), 50);
    
    // Marcar como leído si no es mi mensaje
    if (user && message.sender_id !== user.id) {
      markAsRead();
    }
  };

  const handleMessageUpdate = (message: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? message : m))
    );
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    if (!user || (!inputText.trim() && !uploadingImage)) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic update - Agregar mensaje inmediatamente
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageText,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const sentMessage = await chatService.sendMessage(conversationId, user.id, messageText);
      
      // Reemplazar mensaje temporal con el real
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? sentMessage : m))
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      
      // Remover mensaje temporal si falla
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && user) {
      setUploadingImage(true);
      
      // Optimistic update - Mostrar imagen inmediatamente
      const tempMessage: Message = {
        id: `temp-img-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content: '📷 Imagen',
        image_url: result.assets[0].uri, // Usar URI local temporalmente
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setTimeout(() => scrollToBottom(), 50);

      try {
        const imageUrl = await chatService.uploadChatImage(
          user.id,
          result.assets[0].uri
        );
        const sentMessage = await chatService.sendMessage(
          conversationId,
          user.id,
          '📷 Imagen',
          imageUrl
        );
        
        // Reemplazar mensaje temporal con el real
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? sentMessage : m))
        );
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'No se pudo enviar la imagen');
        
        // Remover mensaje temporal si falla
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!user) return null;

    const isMyMessage = item.sender_id === user.id;
    const timeAgo = formatDistanceToNow(new Date(item.created_at), {
      addSuffix: false,
      locale: es,
    });

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isMyMessage && otherUser && (
          <View style={styles.messageAvatarContainer}>
            {otherUser?.avatar_url ? (
              <Image
                source={{ uri: otherUser.avatar_url }}
                style={styles.messageAvatar}
              />
            ) : (
              <View style={[styles.messageAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.messageAvatarText}>
                  {otherUser?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isMyMessage
              ? [styles.myMessageBubble, { backgroundColor: colors.primary }]
              : [styles.otherMessageBubble, { backgroundColor: colors.surface }],
          ]}
        >
          {item.image_url && (
            <TouchableOpacity activeOpacity={0.9}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          <Text
            style={[
              styles.messageText,
              { color: isMyMessage ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                { color: isMyMessage ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
              ]}
            >
              {timeAgo}
            </Text>
            {isMyMessage && (
              <Ionicons
                name={item.is_read ? 'checkmark-done' : 'checkmark'}
                size={14}
                color="rgba(255,255,255,0.7)"
                style={styles.checkIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando mensajes...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Inicia la conversación
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Envía un mensaje para comenzar a chatear{otherUser?.full_name ? ` con ${otherUser.full_name}` : ''}
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { 
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      }]}>
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={uploadingImage}
          style={styles.iconButton}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="image-outline" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>

        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary }]}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() && !sending
                ? colors.primary
                : colors.border,
            },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !sending ? 'white' : colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  checkIcon: {
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
