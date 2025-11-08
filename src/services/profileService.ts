import { supabase } from '../supabase/client';
import * as ImagePicker from 'expo-image-picker';

class ProfileService {
  /**
   * Solicitar permisos de cámara y galería
   */
  async requestPermissions(): Promise<boolean> {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  }

  /**
   * Seleccionar imagen de la galería
   */
  async pickImageFromLibrary(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Se necesita permiso para acceder a la galería');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Cuadrado para foto de perfil
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  /**
   * Tomar foto con la cámara
   */
  async takePhoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Se necesita permiso para acceder a la cámara');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  /**
   * Subir foto de perfil a Supabase Storage
   */
  async uploadProfilePhoto(userId: string, imageUri: string): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Leer el archivo como ArrayBuffer (funciona en React Native)
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  /**
   * Actualizar avatar_url en la base de datos
   */
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user avatar:', error);
      throw error;
    }
  }

  /**
   * Eliminar foto de perfil anterior
   */
  async deleteOldAvatar(avatarUrl: string): Promise<void> {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = avatarUrl.split('/avatars/');
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) console.error('Error deleting old avatar:', error);
    } catch (error) {
      console.error('Error in deleteOldAvatar:', error);
    }
  }

  /**
   * Proceso completo: seleccionar, subir y actualizar foto de perfil
   */
  async changeProfilePhoto(userId: string, currentAvatarUrl?: string): Promise<string> {
    try {
      // 1. Seleccionar imagen
      const imageUri = await this.pickImageFromLibrary();
      if (!imageUri) throw new Error('No se seleccionó ninguna imagen');

      // 2. Subir nueva imagen
      const newAvatarUrl = await this.uploadProfilePhoto(userId, imageUri);

      // 3. Actualizar en base de datos
      await this.updateUserAvatar(userId, newAvatarUrl);

      // 4. Eliminar imagen anterior (opcional, en segundo plano)
      if (currentAvatarUrl) {
        this.deleteOldAvatar(currentAvatarUrl).catch(console.error);
      }

      return newAvatarUrl;
    } catch (error) {
      console.error('Error changing profile photo:', error);
      throw error;
    }
  }

  /**
   * Tomar foto y actualizar perfil
   */
  async takeProfilePhoto(userId: string, currentAvatarUrl?: string): Promise<string> {
    try {
      // 1. Tomar foto
      const imageUri = await this.takePhoto();
      if (!imageUri) throw new Error('No se tomó ninguna foto');

      // 2. Subir nueva imagen
      const newAvatarUrl = await this.uploadProfilePhoto(userId, imageUri);

      // 3. Actualizar en base de datos
      await this.updateUserAvatar(userId, newAvatarUrl);

      // 4. Eliminar imagen anterior (opcional)
      if (currentAvatarUrl) {
        this.deleteOldAvatar(currentAvatarUrl).catch(console.error);
      }

      return newAvatarUrl;
    } catch (error) {
      console.error('Error taking profile photo:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
