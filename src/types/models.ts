// =====================================================
// TypeScript Types and Interfaces for Barbershop App
// =====================================================

// =====================================================
// ENUMS
// =====================================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  BARBER = 'barber',
  CLIENT = 'client',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
}

export enum WaitlistStatus {
  WAITING = 'waiting',
  NOTIFIED = 'notified',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
}

export enum NotificationType {
  APPOINTMENT = 'appointment',
  REMINDER = 'reminder',
  CANCELLATION = 'cancellation',
  WAITLIST = 'waitlist',
  SYSTEM = 'system',
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum ShortMediaType {
  VIDEO = 'video',
  IMAGE = 'image',
}

// =====================================================
// BASE TYPES
// =====================================================

export interface TimeRange {
  start: string; // HH:mm format (e.g., "09:00")
  end: string;   // HH:mm format (e.g., "18:00")
}

export interface DaySchedule {
  open: string;  // HH:mm format
  close: string; // HH:mm format
}

export interface OpeningHours {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

export interface BarberSchedule {
  monday: TimeRange[] | null;
  tuesday: TimeRange[] | null;
  wednesday: TimeRange[] | null;
  thursday: TimeRange[] | null;
  friday: TimeRange[] | null;
  saturday: TimeRange[] | null;
  sunday: TimeRange[] | null;
}

export interface TimeSlot {
  time: string;      // HH:mm format
  available: boolean;
  barberId: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

// =====================================================
// DATABASE MODELS
// =====================================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  gender?: UserGender;
  created_at: string;
  updated_at: string;
}

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  opening_hours: OpeningHours;
  created_at: string;
  updated_at: string;
}

export interface BarbershopWithDistance extends Barbershop {
  distance_meters?: number;
}

export interface AdminAssignment {
  id: string;
  user_id: string;
  barbershop_id: string;
  created_at: string;
}

export type BarberApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Barber {
  id: string;
  barbershop_id: string;
  specialties: string[];
  bio?: string;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  schedule: BarberSchedule;
  approval_status: BarberApprovalStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BarberWithUser extends Barber {
  user: User;
}

export interface Service {
  id: string;
  barbershop_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_combo: boolean;
  combo_services: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HaircutStyle {
  id: string;
  name: string;
  description?: string;
  gender: UserGender;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarberShort {
  id: string;
  barber_id: string;
  barbershop_id: string;
  media_type: ShortMediaType;
  media_url: string;
  thumbnail_url?: string;
  duration?: number; // Duration in seconds (max 60 for videos)
  title?: string;
  description?: string;
  tags?: string[];
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarberShortWithDetails extends BarberShort {
  barber: BarberWithUser;
  barbershop: Barbershop;
  is_liked_by_user?: boolean;
}

export interface ShortLike {
  id: string;
  short_id: string;
  user_id: string;
  created_at: string;
}

export interface ShortView {
  id: string;
  short_id: string;
  user_id?: string;
  viewed_at: string;
}

export interface ShortComment {
  id: string;
  short_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ShortCommentWithUser extends ShortComment {
  user: User;
}

export interface Appointment {
  id: string;
  barbershop_id: string;
  barber_id: string;
  client_id: string;
  service_id: string;
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  start_time: string;       // HH:mm format
  end_time: string;         // HH:mm format
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  total_price: number;
  notes?: string;
  haircut_style_id?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  barber: BarberWithUser;
  client: User;
  service: Service;
  barbershop: Barbershop;
  haircut_style?: HaircutStyle;
}

export interface WaitlistEntry {
  id: string;
  barbershop_id: string;
  barber_id: string;
  client_id: string;
  service_id: string;
  preferred_date: string; // ISO date string
  preferred_time?: string; // HH:mm format
  status: WaitlistStatus;
  notified_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntryWithDetails extends WaitlistEntry {
  barber: BarberWithUser;
  client: User;
  service: Service;
  barbershop: Barbershop;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// =====================================================
// DTO (Data Transfer Objects) for API requests
// =====================================================

export interface CreateUserDto {
  email: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface CreateBarbershopDto {
  name: string;
  address: string;
  phone: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: OpeningHours;
}

export interface UpdateBarbershopDto {
  name?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  opening_hours?: OpeningHours;
}

export interface CreateBarberDto {
  user_id: string;
  barbershop_id: string;
  specialties?: string[];
  bio?: string;
  schedule?: BarberSchedule;
}

export interface UpdateBarberDto {
  specialties?: string[];
  bio?: string;
  is_active?: boolean;
  schedule?: BarberSchedule;
}

export interface CreateServiceDto {
  barbershop_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_combo?: boolean;
  combo_services?: string[];
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  is_combo?: boolean;
  combo_services?: string[];
  is_active?: boolean;
}

export interface CreateAppointmentDto {
  barbershop_id: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface UpdateAppointmentDto {
  status?: AppointmentStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  notes?: string;
  cancellation_reason?: string;
}

export interface CreateWaitlistDto {
  barbershop_id: string;
  barber_id: string;
  service_id: string;
  preferred_date: string;
  preferred_time?: string;
}

export interface CreateNotificationDto {
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export interface CreateBarberShortDto {
  barber_id: string;
  barbershop_id: string;
  media_type: ShortMediaType;
  media_url: string;
  thumbnail_url?: string;
  duration?: number;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateBarberShortDto {
  title?: string;
  description?: string;
  tags?: string[];
  is_active?: boolean;
}

// =====================================================
// QUERY FILTERS
// =====================================================

export interface AppointmentFilters {
  barbershop_id?: string;
  barber_id?: string;
  client_id?: string;
  status?: AppointmentStatus;
  date_from?: string;
  date_to?: string;
  payment_status?: PaymentStatus;
}

export interface BarbershopFilters {
  is_active?: boolean;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
}

export interface ServiceFilters {
  barbershop_id?: string;
  is_active?: boolean;
  is_combo?: boolean;
}

export interface BarberFilters {
  barbershop_id?: string;
  is_active?: boolean;
}

export interface WaitlistFilters {
  barbershop_id?: string;
  barber_id?: string;
  client_id?: string;
  status?: WaitlistStatus;
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

export interface BarbershopStatistics {
  total_appointments: number;
  total_revenue: number;
  new_clients: number;
  cancellation_rate: number;
  average_rating: number;
  period_start: string;
  period_end: string;
}

export interface BarberStatistics {
  barber_id: string;
  barber_name: string;
  total_appointments: number;
  total_revenue: number;
  average_rating: number;
  completion_rate: number;
}

export interface RevenueByMonth {
  month: string; // YYYY-MM format
  revenue: number;
  appointments: number;
}

export interface DashboardMetrics {
  total_appointments: number;
  total_revenue: number;
  new_clients: number;
  cancellation_rate: number;
  pending_appointments: number;
  today_appointments: number;
  revenue_trend: RevenueByMonth[];
  top_barbers: BarberStatistics[];
}

// =====================================================
// AVAILABILITY
// =====================================================

export interface AvailabilityRequest {
  barber_id: string;
  service_id: string;
  date: string; // ISO date string
}

export interface AvailabilityResponse {
  date: string;
  available_slots: TimeSlot[];
  barbershop_hours: DaySchedule | null;
  barber_schedule: TimeRange[] | null;
}

// =====================================================
// AUTHENTICATION
// =====================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

// =====================================================
// PAGINATION
// =====================================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =====================================================
// API RESPONSE
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// =====================================================
// FORM VALIDATION
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// =====================================================
// FILE UPLOAD
// =====================================================

export interface UploadedFile {
  url: string;
  path: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// =====================================================
// PUSH NOTIFICATIONS
// =====================================================

export interface PushToken {
  user_id: string;
  token: string;
  device_type: 'ios' | 'android';
  created_at: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
}

// =====================================================
// TYPE GUARDS
// =====================================================

export const isUserRole = (value: any): value is UserRole => {
  return Object.values(UserRole).includes(value);
};

export const isAppointmentStatus = (value: any): value is AppointmentStatus => {
  return Object.values(AppointmentStatus).includes(value);
};

export const isPaymentStatus = (value: any): value is PaymentStatus => {
  return Object.values(PaymentStatus).includes(value);
};

export const isPaymentMethod = (value: any): value is PaymentMethod => {
  return Object.values(PaymentMethod).includes(value);
};

export const isWaitlistStatus = (value: any): value is WaitlistStatus => {
  return Object.values(WaitlistStatus).includes(value);
};

export const isNotificationType = (value: any): value is NotificationType => {
  return Object.values(NotificationType).includes(value);
};

// =====================================================
// UTILITY TYPES
// =====================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
