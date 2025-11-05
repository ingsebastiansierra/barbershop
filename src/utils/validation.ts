/**
 * Validation utilities
 * Functions for validating user input
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic validation)
 */
export const validatePhone = (phone: string): boolean => {
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  // Check if it's 10 digits (adjust based on your region)
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate password strength
 * Must contain at least 8 characters, one uppercase, one lowercase, and one number
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Get password validation error message
 */
export const getPasswordError = (password: string): string | undefined => {
  if (password.length === 0) return undefined;
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Debe contener al menos una minúscula';
  if (!/\d/.test(password)) return 'Debe contener al menos un número';
  return undefined;
};

/**
 * Validate required field
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

/**
 * Validate time range format (HH:mm)
 */
export const validateTimeRange = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};
