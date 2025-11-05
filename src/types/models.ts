/**
 * TypeScript type definitions for data models
 */

import type {
  UserRole,
  AppointmentStatus,
  PaymentStatus,
  PaymentMethod,
  WaitlistStatus,
  NotificationType,
  DayOfWeek,
} from '../utils/constants';

// User Model
export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Opening Hours
export interface TimeSlot {
  open: string;  // HH:mm format
  close: string; // HH:mm format
}

export type OpeningHours = {
  [K in DayOfWeek]: TimeSlot | null;
};

// Barbershop Model
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

// Time Range
export interface TimeRange {
  start: string;  // HH:mm format
  end: string;    // HH:mm format
}

// Barber Schedule
export type BarberSchedule = {
  [K in DayOfWeek]: TimeRange[] | null;
};

// Barber Model
export interface Barber {
  id: string;
  barbershop_id: string;
  specialties: string[];
  bio?: string;
  rating?: number;
  total_reviews?: number;
  is_active: boolean;
  schedule: BarberSchedule;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
  barbershop?: Barbershop;
}

// Service Model
export interface Service {
  id: string;
  barbershop_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_combo: boolean;
  combo_services?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Appointment Model
export interface Appointment {
  id: string;
  barbershop_id: string;
  barber_id: string;
  client_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  total_price: number;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  barbershop?: Barbershop;
  barber?: Barber;
  client?: User;
  service?: Service;
}

// Waitlist Entry Model
export interface WaitlistEntry {
  id: string;
  barbershop_id: string;
  barber_id: string;
  client_id: string;
  service_id: string;
  preferred_date: string;
  preferred_time?: string;
  status: WaitlistStatus;
  notified_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  barbershop?: Barbershop;
  barber?: Barber;
  client?: User;
  service?: Service;
}

// Notification Model
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// Admin Assignment Model
export interface AdminAssignment {
  id: string;
  user_id: string;
  barbershop_id: string;
  created_at: string;
}

// DTOs (Data Transfer Objects)
export interface CreateBarbershopDto {
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  opening_hours: OpeningHours;
}

export interface CreateBarberDto {
  user_id: string;
  barbershop_id: string;
  specialties: string[];
  bio?: string;
  schedule: BarberSchedule;
}

export interface CreateServiceDto {
  barbershop_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_combo: boolean;
  combo_services?: string[];
}

export interface CreateAppointmentDto {
  barbershop_id: string;
  barber_id: string;
  client_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  payment_method?: PaymentMethod;
  total_price: number;
  notes?: string;
}

export interface CreateWaitlistDto {
  barbershop_id: string;
  barber_id: string;
  client_id: string;
  service_id: string;
  preferred_date: string;
  preferred_time?: string;
}

// Available Time Slot
export interface AvailableTimeSlot {
  time: string;
  available: boolean;
  barberId: string;
}
