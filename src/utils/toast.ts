import Toast from 'react-native-toast-message';

/**
 * Utility functions for showing toast messages
 */

export const showToast = {
  /**
   * Show success message
   */
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || '✅ Éxito',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 50,
    });
  },

  /**
   * Show error message
   */
  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || '❌ Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      topOffset: 50,
    });
  },

  /**
   * Show info message
   */
  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'ℹ️ Información',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 50,
    });
  },

  /**
   * Show warning message
   */
  warning: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || '⚠️ Advertencia',
      text2: message,
      position: 'top',
      visibilityTime: 3500,
      topOffset: 50,
    });
  },

  /**
   * Show loading message
   */
  loading: (message: string) => {
    Toast.show({
      type: 'info',
      text1: '⏳ Cargando...',
      text2: message,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 50,
    });
  },
};
