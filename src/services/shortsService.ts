/**
 * Shorts Service
 * Handles all operations related to barber shorts (videos/images)
 */

import { supabase } from '../supabase/client';
import {
  BarberShort,
  BarberShortWithDetails,
  CreateBarberShortDto,
  UpdateBarberShortDto,
  ShortMediaType,
} from '../types/models';

/**
 * Get all active shorts (for feed)
 */
export const getActiveShorts = async (
  limit: number = 20,
  offset: number = 0
): Promise<BarberShortWithDetails[]> => {
  // Get shorts
  const { data: shorts, error } = await supabase
    .from('barber_shorts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  if (!shorts || shorts.length === 0) return [];

  // Get unique barber and barbershop IDs
  const barberIds = [...new Set(shorts.map(s => s.barber_id))];
  const barbershopIds = [...new Set(shorts.map(s => s.barbershop_id))];

  // Fetch barbers
  const { data: barbers } = await supabase
    .from('barbers')
    .select(`*, user:users(*)`)
    .in('id', barberIds);

  // Fetch barbershops
  const { data: barbershops } = await supabase
    .from('barbershops')
    .select('*')
    .in('id', barbershopIds);

  // Map data
  const barbersMap = new Map(barbers?.map(b => [b.id, b]) || []);
  const barbershopsMap = new Map(barbershops?.map(b => [b.id, b]) || []);

  return shorts.map(short => ({
    ...short,
    barber: barbersMap.get(short.barber_id)!,
    barbershop: barbershopsMap.get(short.barbershop_id)!,
  })) as BarberShortWithDetails[];
};

/**
 * Get shorts by barber ID
 */
export const getShortsByBarberId = async (
  barberId: string,
  includeInactive: boolean = false
): Promise<BarberShort[]> => {
  let query = supabase
    .from('barber_shorts')
    .select('*')
    .eq('barber_id', barberId)
    .order('created_at', { ascending: false });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as BarberShort[];
};

/**
 * Get shorts by barbershop ID
 */
export const getShortsByBarbershopId = async (
  barbershopId: string
): Promise<BarberShortWithDetails[]> => {
  // Get shorts
  const { data: shorts, error } = await supabase
    .from('barber_shorts')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!shorts || shorts.length === 0) return [];

  // Get unique barber IDs
  const barberIds = [...new Set(shorts.map(s => s.barber_id))];

  // Fetch barbers
  const { data: barbers } = await supabase
    .from('barbers')
    .select(`*, user:users(*)`)
    .in('id', barberIds);

  // Fetch barbershop
  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('*')
    .eq('id', barbershopId)
    .single();

  // Map data
  const barbersMap = new Map(barbers?.map(b => [b.id, b]) || []);

  return shorts.map(short => ({
    ...short,
    barber: barbersMap.get(short.barber_id)!,
    barbershop: barbershop!,
  })) as BarberShortWithDetails[];
};

/**
 * Get a single short by ID
 */
export const getShortById = async (
  shortId: string
): Promise<BarberShortWithDetails> => {
  // First get the short
  const { data: shortData, error: shortError } = await supabase
    .from('barber_shorts')
    .select('*')
    .eq('id', shortId)
    .single();

  if (shortError) {
    console.error('Error fetching short:', shortError);
    throw shortError;
  }

  // Then get barber info
  const { data: barberData, error: barberError } = await supabase
    .from('barbers')
    .select(`
      *,
      user:users(*)
    `)
    .eq('id', shortData.barber_id)
    .single();

  if (barberError) {
    console.error('Error fetching barber:', barberError);
    throw barberError;
  }

  // Get barbershop info
  const { data: barbershopData, error: barbershopError } = await supabase
    .from('barbershops')
    .select('*')
    .eq('id', shortData.barbershop_id)
    .single();

  if (barbershopError) {
    console.error('Error fetching barbershop:', barbershopError);
    throw barbershopError;
  }

  // Combine all data
  return {
    ...shortData,
    barber: barberData,
    barbershop: barbershopData,
  } as BarberShortWithDetails;
};

/**
 * Create a new short
 */
export const createShort = async (
  shortData: CreateBarberShortDto
): Promise<BarberShort> => {
  const { data, error } = await supabase
    .from('barber_shorts')
    .insert(shortData)
    .select()
    .single();

  if (error) throw error;
  return data as BarberShort;
};

/**
 * Update a short
 */
export const updateShort = async (
  shortId: string,
  updates: UpdateBarberShortDto
): Promise<BarberShort> => {
  const { data, error } = await supabase
    .from('barber_shorts')
    .update(updates)
    .eq('id', shortId)
    .select()
    .single();

  if (error) throw error;
  return data as BarberShort;
};

/**
 * Delete a short
 */
export const deleteShort = async (shortId: string): Promise<void> => {
  const { error } = await supabase
    .from('barber_shorts')
    .delete()
    .eq('id', shortId);

  if (error) throw error;
};

/**
 * Upload short media to storage
 */
export const uploadShortMedia = async (
  barberId: string,
  fileUri: string,
  mediaType: ShortMediaType
): Promise<string> => {
  const fileExt = mediaType === ShortMediaType.VIDEO ? 'mp4' : 'jpg';
  const fileName = `${barberId}/${Date.now()}.${fileExt}`;

  // For React Native, we need to create a FormData object
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: mediaType === ShortMediaType.VIDEO ? 'video/mp4' : 'image/jpeg',
    name: fileName,
  } as any);

  // Use fetch directly for file upload in React Native
  const response = await fetch(
    `${supabase.storage.url}/object/barber-shorts/${fileName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error uploading file');
  }

  // Get public URL using the fileName
  const { data: urlData } = supabase.storage
    .from('barber-shorts')
    .getPublicUrl(fileName);

  console.log('Uploaded file:', { fileName, publicUrl: urlData.publicUrl });
  
  return urlData.publicUrl;
};

/**
 * Delete media from storage
 */
export const deleteShortMedia = async (mediaUrl: string): Promise<void> => {
  // Extract path from URL
  const path = mediaUrl.split('/barber-shorts/')[1];
  
  if (!path) return;

  const { error } = await supabase.storage
    .from('barber-shorts')
    .remove([path]);

  if (error) throw error;
};

/**
 * Like a short
 */
export const likeShort = async (
  shortId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('shorts_likes')
    .insert({ short_id: shortId, user_id: userId });

  if (error) throw error;
};

/**
 * Unlike a short
 */
export const unlikeShort = async (
  shortId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('shorts_likes')
    .delete()
    .eq('short_id', shortId)
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Check if user liked a short
 */
export const isShortLikedByUser = async (
  shortId: string,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('shorts_likes')
    .select('id')
    .eq('short_id', shortId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

/**
 * Record a view for a short
 */
export const recordShortView = async (
  shortId: string,
  userId?: string
): Promise<void> => {
  const { error } = await supabase
    .from('shorts_views')
    .insert({ short_id: shortId, user_id: userId });

  // Ignore duplicate view errors
  if (error && !error.message.includes('duplicate')) {
    throw error;
  }
};

/**
 * Get shorts with like status for a user
 */
export const getShortsWithLikeStatus = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<BarberShortWithDetails[]> => {
  const shorts = await getActiveShorts(limit, offset);

  // Get all like statuses in one query
  const shortIds = shorts.map(s => s.id);
  const { data: likes } = await supabase
    .from('shorts_likes')
    .select('short_id')
    .eq('user_id', userId)
    .in('short_id', shortIds);

  const likedShortIds = new Set(likes?.map(l => l.short_id) || []);

  return shorts.map(short => ({
    ...short,
    is_liked_by_user: likedShortIds.has(short.id),
  }));
};
