/**
 * Comments Service
 * Handles all operations related to short comments
 */

import { supabase } from '../supabase/client';
import { ShortComment, ShortCommentWithUser } from '../types/models';

/**
 * Get comments for a short
 */
export const getShortComments = async (shortId: string): Promise<ShortCommentWithUser[]> => {
  // First get comments
  const { data: comments, error: commentsError } = await supabase
    .from('shorts_comments')
    .select('*')
    .eq('short_id', shortId)
    .order('created_at', { ascending: false });

  if (commentsError) throw commentsError;
  if (!comments || comments.length === 0) return [];

  // Get unique user IDs
  const userIds = [...new Set(comments.map(c => c.user_id))];

  // Fetch user data
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds);

  if (usersError) throw usersError;

  // Map users by ID
  const usersMap = new Map(users?.map(u => [u.id, u]) || []);

  // Combine comments with user data
  return comments.map(comment => ({
    ...comment,
    user: usersMap.get(comment.user_id)!,
  })) as ShortCommentWithUser[];
};

/**
 * Add a comment to a short
 */
export const addComment = async (
  shortId: string,
  userId: string,
  comment: string
): Promise<ShortComment> => {
  const { data, error } = await supabase
    .from('shorts_comments')
    .insert({
      short_id: shortId,
      user_id: userId,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ShortComment;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('shorts_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

/**
 * Update a comment
 */
export const updateComment = async (
  commentId: string,
  comment: string
): Promise<ShortComment> => {
  const { data, error } = await supabase
    .from('shorts_comments')
    .update({ comment })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data as ShortComment;
};
