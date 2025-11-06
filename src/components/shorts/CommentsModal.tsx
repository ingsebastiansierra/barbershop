/**
 * CommentsModal Component
 * Bottom sheet modal for viewing and adding comments
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { getShortComments, addComment, deleteComment } from '../../services/commentsService';
import { ShortCommentWithUser } from '../../types/models';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Toast from 'react-native-toast-message';

interface CommentsModalProps {
  visible: boolean;
  shortId: string;
  onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  shortId,
  onClose,
}) => {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // Fetch comments
  const { data: comments = [], isLoading, error: commentsError, refetch } = useQuery({
    queryKey: ['short-comments', shortId],
    queryFn: async () => {
      console.log('Fetching comments for short:', shortId);
      const result = await getShortComments(shortId);
      console.log('Comments fetched:', result);
      return result;
    },
    enabled: visible,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale
  });

  // Refetch when modal opens
  React.useEffect(() => {
    if (visible) {
      console.log('Modal opened, refetching comments...');
      refetch();
    }
  }, [visible, refetch]);

  // Log errors
  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  // Log comments state
  console.log('Comments state:', { shortId, visible, commentsCount: comments.length, isLoading });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!user?.id) throw new Error('Debes iniciar sesión');
      return addComment(shortId, user.id, comment);
    },
    onMutate: async (comment: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['short-comments', shortId] });
      await queryClient.cancelQueries({ queryKey: ['shorts-feed'] });

      // Snapshot previous values
      const previousComments = queryClient.getQueryData(['short-comments', shortId]);
      const previousShorts = queryClient.getQueryData(['shorts-feed', user?.id]);

      // Optimistically add comment to list
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        short_id: shortId,
        user_id: user!.id,
        comment: comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: user!.id,
          email: user!.email,
          full_name: user!.full_name || 'Usuario',
          role: user!.role,
          created_at: user!.created_at || new Date().toISOString(),
          updated_at: user!.updated_at || new Date().toISOString(),
        },
      };

      queryClient.setQueryData(['short-comments', shortId], (old: any) => {
        return [optimisticComment, ...(old || [])];
      });

      // Optimistically update comment count
      queryClient.setQueryData(['shorts-feed', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((short: any) => {
          if (short.id === shortId) {
            return {
              ...short,
              comments_count: (short.comments_count || 0) + 1,
            };
          }
          return short;
        });
      });

      return { previousComments, previousShorts };
    },
    onSuccess: () => {
      // Refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: ['short-comments', shortId] });
      queryClient.invalidateQueries({ queryKey: ['shorts-feed'] });
      
      // Clear input
      setCommentText('');
      
      Toast.show({
        type: 'success',
        text1: 'Comentario publicado',
      });
    },
    onError: (error: any, variables, context: any) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['short-comments', shortId], context.previousComments);
      }
      if (context?.previousShorts) {
        queryClient.setQueryData(['shorts-feed', user?.id], context.previousShorts);
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo publicar el comentario',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['shorts-feed'] });

      // Snapshot previous value
      const previousShorts = queryClient.getQueryData(['shorts-feed', user?.id]);

      // Optimistically update comment count
      queryClient.setQueryData(['shorts-feed', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((short: any) => {
          if (short.id === shortId) {
            return {
              ...short,
              comments_count: Math.max(0, (short.comments_count || 0) - 1),
            };
          }
          return short;
        });
      });

      return { previousShorts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['short-comments', shortId] });
      queryClient.invalidateQueries({ queryKey: ['shorts-feed'] });
      Toast.show({
        type: 'success',
        text1: 'Comentario eliminado',
      });
    },
    onError: (error: any, variables, context: any) => {
      // Rollback on error
      if (context?.previousShorts) {
        queryClient.setQueryData(['shorts-feed', user?.id], context.previousShorts);
      }
    },
  });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que quieres eliminar este comentario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCommentMutation.mutate(commentId),
        },
      ]
    );
  };

  const renderComment = ({ item }: { item: ShortCommentWithUser }) => {
    const isOwnComment = item.user_id === user?.id;
    const timeAgo = formatDistanceToNow(new Date(item.created_at), {
      addSuffix: true,
      locale: es,
    });

    return (
      <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { color: colors.textPrimary }]}>
            {item.user.full_name}
          </Text>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            {timeAgo}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: colors.textPrimary }]}>
          {item.comment}
        </Text>
        {isOwnComment && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteComment(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Comentarios
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay comentarios aún
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Sé el primero en comentar
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentsList}
            />
          )}

          {/* Input */}
          <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Escribe un comentario..."
              placeholderTextColor={colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: commentText.trim() ? colors.primary : colors.surface },
              ]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={commentText.trim() ? '#fff' : colors.textSecondary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    position: 'relative',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
