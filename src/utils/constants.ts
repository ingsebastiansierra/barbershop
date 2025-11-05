/**
 * Global constants for the Barbershop Manager application
 */

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 2,
} as const;

// Time Configuration
export const TIME_CONFIG = {
  SLOT_DURATION_MINUTES: 15,
  REMINDER_HOURS_BEFORE: 24,
  BARBER_REMINDER_HOURS_BEFORE: 1,
  WAITLIST_EXPIRY_MINUTES: 30,
  SESSION_TIMEOUT_MINUTES: 60,
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_MIN_LENGTH: 10,
  MAX_IMAGE_SIZE_MB: 5,
  MIN_AVATAR_SIZE_PX: 200,
  DEBOUNCE_DELAY_MS: 300,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  LARGE_LIST_THRESHOLD: 50,
} as const;

// Animation Timings
export const ANIMATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  MAX_DURATION: 300,
} as const;

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  BARBER: 'barber',
  CLIENT: 'client',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Waitlist Status
export const WAITLIST_STATUS = {
  WAITING: 'waiting',
  NOTIFIED: 'notified',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired',
} as const;

export type WaitlistStatus = typeof WAITLIST_STATUS[keyof typeof WAITLIST_STATUS];

// Notification Types
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  REMINDER: 'reminder',
  CANCELLATION: 'cancellation',
  WAITLIST: 'waitlist',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Days of Week
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Image Formats
export const IMAGE_FORMATS = {
  ALLOWED: ['jpg', 'jpeg', 'png', 'webp'],
  MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Error Messages (Spanish)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Sin conexión a internet. Por favor, verifica tu conexión.',
  AUTH_ERROR: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  PERMISSION_DENIED: 'No tienes permisos para realizar esta acción.',
  CONFLICT: 'Ya existe un registro con estos datos.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
} as const;

// Success Messages (Spanish)
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  REGISTER_SUCCESS: 'Registro exitoso. Por favor, verifica tu email.',
  APPOINTMENT_CREATED: 'Cita agendada exitosamente',
  APPOINTMENT_CANCELLED: 'Cita cancelada exitosamente',
  APPOINTMENT_CONFIRMED: 'Cita confirmada exitosamente',
  APPOINTMENT_COMPLETED: 'Cita completada exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  PASSWORD_UPDATED: 'Contraseña actualizada exitosamente',
  WAITLIST_JOINED: 'Te has unido a la lista de espera',
} as const;

// React Query Configuration
export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY: 2,
  REFETCH_ON_WINDOW_FOCUS: false,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@barbershop:auth_token',
  USER_DATA: '@barbershop:user_data',
  THEME: '@barbershop:theme',
  PUSH_TOKEN: '@barbershop:push_token',
  PENDING_OPERATIONS: '@barbershop:pending_operations',
} as const;

// Performance Thresholds
export const PERFORMANCE = {
  TARGET_FPS: 50,
  MAX_LOAD_TIME_MS: 2000,
  FLATLIST_WINDOW_SIZE: 10,
  IMAGE_CACHE_SIZE_MB: 100,
} as const;

// Location Configuration
export const LOCATION = {
  DEFAULT_RADIUS_KM: 10,
  MAX_RADIUS_KM: 50,
  ACCURACY: 'high',
} as const;
