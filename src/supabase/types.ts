// Database types for Supabase tables - Based on actual database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario;
        Insert: Omit<Usuario, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Usuario, 'id' | 'created_at'>>;
      };
      negocios: {
        Row: Negocio;
        Insert: Omit<Negocio, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Negocio, 'id' | 'created_at'>>;
      };
      servicios: {
        Row: Servicio;
        Insert: Omit<Servicio, 'id' | 'created_at'>;
        Update: Partial<Omit<Servicio, 'id' | 'created_at'>>;
      };
      citas: {
        Row: Cita;
        Insert: Omit<Cita, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Cita, 'id' | 'created_at'>>;
      };
      fila: {
        Row: FilaEntry;
        Insert: Omit<FilaEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<FilaEntry, 'id' | 'created_at'>>;
      };
      shorts: {
        Row: Short;
        Insert: Omit<Short, 'id' | 'created_at'>;
        Update: Partial<Omit<Short, 'id' | 'created_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: 'barbero' | 'cliente' | 'admin' | 'super_admin';
      cita_estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
      fila_estado: 'esperando' | 'atendiendo' | 'completado' | 'cancelado';
      metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
    };
  };
}

// User types
export type UserRole = Database['public']['Enums']['user_role'];

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: UserRole;
  negocio_id: string | null;
  avatar: string | null;
  especialidad: string | null;
  horario_inicio: string | null;
  horario_fin: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Negocio types
export interface Negocio {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

// Servicio types
export interface Servicio {
  id: string;
  negocio_id: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: number; // in minutes
  activo: boolean;
  created_at: string;
}

// Cita types
export type CitaEstado = Database['public']['Enums']['cita_estado'];
export type MetodoPago = Database['public']['Enums']['metodo_pago'];

export interface Cita {
  id: string;
  cliente_id: string | null;
  barbero_id: string | null;
  negocio_id: string | null;
  servicio_id: string | null;
  fecha: string; // date
  hora_inicio: string; // time
  hora_fin: string; // time
  estado: CitaEstado;
  precio: number;
  pagado: boolean;
  metodo_pago: MetodoPago | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

// Fila types
export type FilaEstado = Database['public']['Enums']['fila_estado'];

export interface FilaEntry {
  id: string;
  negocio_id: string | null;
  barbero_id: string | null;
  cliente_id: string | null;
  posicion: number;
  estado: FilaEstado;
  hora_llegada: string;
  hora_atencion: string | null;
  servicio_id: string | null;
  created_at: string;
}

// Short types
export interface Short {
  id: string;
  negocio_id: string | null;
  titulo: string;
  descripcion: string | null;
  video_url: string;
  thumbnail: string | null;
  duracion: number; // in seconds
  vistas: number;
  likes: number;
  activo: boolean;
  created_at: string;
}

// Time slot type for availability
export interface TimeSlot {
  time: string;
  available: boolean;
}

// Re-export Session type from Supabase Auth
export type { Session } from '@supabase/supabase-js';

// Alias for compatibility with existing code
export type User = Usuario;
export type Barbershop = Negocio;
export type Service = Servicio;
export type Appointment = Cita;
export type AppointmentStatus = CitaEstado;
export type PaymentStatus = 'pending' | 'paid' | 'refunded'; // Extended for app logic
export type PaymentMethod = MetodoPago;
