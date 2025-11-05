# Design Document

## Overview

Esta aplicación móvil de gestión de barberías está construida con React Native y Expo SDK 54, siguiendo principios de arquitectura limpia y diseño modular. El sistema utiliza Supabase como backend (autenticación, base de datos PostgreSQL y almacenamiento), implementa navegación basada en roles, y proporciona una experiencia de usuario moderna y fluida con soporte para temas claro/oscuro.

### Objetivos de Diseño

- **Escalabilidad**: Arquitectura modular que permite agregar nuevas barberías y funcionalidades sin refactorización mayor
- **Mantenibilidad**: Separación clara de responsabilidades con componentes reutilizables
- **Performance**: Optimización de renderizado, caché inteligente y lazy loading
- **UX Premium**: Diseño moderno inspirado en apps líderes (Uber, Fresha, Airbnb)
- **Seguridad**: Autenticación robusta y control de acceso basado en roles

### Stack Tecnológico

- **Framework**: React Native con Expo SDK 54
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Navegación**: React Navigation v6
- **Estado Global**: Zustand + React Query
- **Estilos**: NativeWind (Tailwind para React Native)
- **Fechas**: date-fns
- **Almacenamiento Local**: AsyncStorage
- **Notificaciones**: Expo Notifications
- **Imágenes**: Expo Image Picker + Expo Image

## Architecture

### Arquitectura General


```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (Screens, Components, Navigation, Theme Provider)          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Application Layer                         │
│     (Hooks, State Management, Business Logic)               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      Service Layer                           │
│  (API Services, Supabase Client, Storage, Auth)            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│         (Supabase Backend, PostgreSQL, Storage)             │
└─────────────────────────────────────────────────────────────┘
```

### Estructura de Carpetas

```
barbershop-app/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── common/          # Botones, inputs, cards, modals
│   │   ├── barbershop/      # Componentes específicos de barberías
│   │   ├── appointment/     # Componentes de citas
│   │   └── layout/          # Headers, footers, containers
│   ├── screens/             # Pantallas de la app
│   │   ├── auth/            # Login, registro, verificación
│   │   ├── client/          # Pantallas del cliente
│   │   ├── barber/          # Pantallas del barbero
│   │   ├── admin/           # Pantallas del admin de barbería
│   │   └── superadmin/      # Pantallas del súper admin
│   ├── navigation/          # Configuración de navegación
│   │   ├── AuthNavigator.tsx
│   │   ├── ClientNavigator.tsx
│   │   ├── BarberNavigator.tsx
│   │   ├── AdminNavigator.tsx
│   │   ├── SuperAdminNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useAppointments.ts
│   │   ├── useBarbershops.ts
│   │   └── useNotifications.ts
│   ├── services/            # Servicios de API
│   │   ├── auth.service.ts
│   │   ├── barbershop.service.ts
│   │   ├── appointment.service.ts
│   │   ├── user.service.ts
│   │   └── notification.service.ts
│   ├── supabase/            # Configuración de Supabase
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── queries.ts
│   ├── store/               # Estado global con Zustand
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   └── notificationStore.ts
│   ├── utils/               # Utilidades
│   │   ├── validation.ts
│   │   ├── dateHelpers.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── styles/              # Estilos globales y tema
│   │   ├── theme.ts
│   │   └── colors.ts
│   ├── assets/              # Imágenes, iconos, fuentes
│   │   ├── images/
│   │   └── icons/
│   └── types/               # TypeScript types
│       ├── models.ts
│       └── navigation.ts
├── app.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Components and Interfaces

### Componentes Principales

#### 1. Common Components

**Button Component**
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}
```

**Input Component**
```typescript
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Card Component**
```typescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'sm' | 'md' | 'lg';
}
```


**Avatar Component**
```typescript
interface AvatarProps {
  uri?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  editable?: boolean;
}
```

**Modal Component**
```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}
```

#### 2. Barbershop Components

**BarbershopCard**
```typescript
interface BarbershopCardProps {
  barbershop: Barbershop;
  onPress: () => void;
  showDistance?: boolean;
  distance?: number;
}
```

**BarberCard**
```typescript
interface BarberCardProps {
  barber: Barber;
  onPress: () => void;
  showAvailability?: boolean;
}
```

**ServiceCard**
```typescript
interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  selected?: boolean;
}
```

#### 3. Appointment Components

**AppointmentCard**
```typescript
interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
  showActions?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onComplete?: () => void;
}
```

**CalendarPicker**
```typescript
interface CalendarPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableDates: Date[];
  minDate?: Date;
  maxDate?: Date;
}
```

**TimeSlotPicker**
```typescript
interface TimeSlotPickerProps {
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  availableSlots: TimeSlot[];
  barberId: string;
  serviceId: string;
  date: Date;
}
```

### Navigation Structure

#### Root Navigator
```typescript
type RootStackParamList = {
  Auth: undefined;
  Client: undefined;
  Barber: undefined;
  Admin: undefined;
  SuperAdmin: undefined;
};
```

#### Auth Navigator
```typescript
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
};
```

#### Client Navigator
```typescript
type ClientTabParamList = {
  Home: undefined;
  Search: undefined;
  Appointments: undefined;
  Profile: undefined;
};

type ClientStackParamList = {
  ClientTabs: undefined;
  BarbershopDetail: { barbershopId: string };
  BarberDetail: { barberId: string };
  BookAppointment: { barbershopId: string; barberId?: string };
  AppointmentDetail: { appointmentId: string };
  Notifications: undefined;
};
```

#### Barber Navigator
```typescript
type BarberTabParamList = {
  Schedule: undefined;
  Appointments: undefined;
  History: undefined;
  Profile: undefined;
};

type BarberStackParamList = {
  BarberTabs: undefined;
  AppointmentDetail: { appointmentId: string };
  ClientProfile: { clientId: string };
  Notifications: undefined;
};
```

#### Admin Navigator
```typescript
type AdminTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Barbers: undefined;
  Services: undefined;
  Profile: undefined;
};

type AdminStackParamList = {
  AdminTabs: undefined;
  BarbershopSettings: undefined;
  AddBarber: undefined;
  EditBarber: { barberId: string };
  AddService: undefined;
  EditService: { serviceId: string };
  AppointmentDetail: { appointmentId: string };
  Statistics: undefined;
};
```

#### Super Admin Navigator
```typescript
type SuperAdminTabParamList = {
  Dashboard: undefined;
  Barbershops: undefined;
  Users: undefined;
  Statistics: undefined;
  Settings: undefined;
};

type SuperAdminStackParamList = {
  SuperAdminTabs: undefined;
  AddBarbershop: undefined;
  EditBarbershop: { barbershopId: string };
  BarbershopDetail: { barbershopId: string };
  UserManagement: undefined;
  GlobalSettings: undefined;
};
```

## Data Models

### Database Schema

#### Users Table
```typescript
interface User {
  id: string;                    // UUID
  email: string;
  role: 'super_admin' | 'admin' | 'barber' | 'client';
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

#### Barbershops Table
```typescript
interface Barbershop {
  id: string;                    // UUID
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  opening_hours: OpeningHours;   // JSON
  created_at: string;
  updated_at: string;
}

interface OpeningHours {
  monday: { open: string; close: string } | null;
  tuesday: { open: string; close: string } | null;
  wednesday: { open: string; close: string } | null;
  thursday: { open: string; close: string } | null;
  friday: { open: string; close: string } | null;
  saturday: { open: string; close: string } | null;
  sunday: { open: string; close: string } | null;
}
```


#### Barbers Table
```typescript
interface Barber {
  id: string;                    // UUID (references users.id)
  barbershop_id: string;         // FK to barbershops
  specialties: string[];
  bio?: string;
  rating?: number;
  total_reviews?: number;
  is_active: boolean;
  schedule: BarberSchedule;      // JSON
  created_at: string;
  updated_at: string;
}

interface BarberSchedule {
  monday: TimeRange[] | null;
  tuesday: TimeRange[] | null;
  wednesday: TimeRange[] | null;
  thursday: TimeRange[] | null;
  friday: TimeRange[] | null;
  saturday: TimeRange[] | null;
  sunday: TimeRange[] | null;
}

interface TimeRange {
  start: string;  // HH:mm format
  end: string;    // HH:mm format
}
```

#### Services Table
```typescript
interface Service {
  id: string;                    // UUID
  barbershop_id: string;         // FK to barbershops
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_combo: boolean;
  combo_services?: string[];     // Array of service IDs
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Appointments Table
```typescript
interface Appointment {
  id: string;                    // UUID
  barbershop_id: string;         // FK to barbershops
  barber_id: string;             // FK to barbers
  client_id: string;             // FK to users
  service_id: string;            // FK to services
  appointment_date: string;      // ISO date
  start_time: string;            // HH:mm format
  end_time: string;              // HH:mm format
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: 'cash' | 'card' | 'transfer';
  total_price: number;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}
```

#### Waitlist Table
```typescript
interface WaitlistEntry {
  id: string;                    // UUID
  barbershop_id: string;         // FK to barbershops
  barber_id: string;             // FK to barbers
  client_id: string;             // FK to users
  service_id: string;            // FK to services
  preferred_date: string;        // ISO date
  preferred_time?: string;       // HH:mm format
  status: 'waiting' | 'notified' | 'confirmed' | 'expired';
  notified_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
```

#### Notifications Table
```typescript
interface Notification {
  id: string;                    // UUID
  user_id: string;               // FK to users
  title: string;
  body: string;
  type: 'appointment' | 'reminder' | 'cancellation' | 'waitlist' | 'system';
  data?: Record<string, any>;    // JSON for additional data
  is_read: boolean;
  created_at: string;
}
```

#### Admin Assignments Table
```typescript
interface AdminAssignment {
  id: string;                    // UUID
  user_id: string;               // FK to users
  barbershop_id: string;         // FK to barbershops
  created_at: string;
}
```

### Supabase Row Level Security (RLS) Policies

#### Users Table Policies
- Super admins: Full access to all users
- Admins: Read access to users in their barbershop
- Barbers: Read access to their own profile and clients with appointments
- Clients: Read/update access to their own profile

#### Barbershops Table Policies
- Super admins: Full CRUD access
- Admins: Read/update access to their assigned barbershop
- Barbers/Clients: Read access to active barbershops

#### Appointments Table Policies
- Super admins: Full access to all appointments
- Admins: Full access to appointments in their barbershop
- Barbers: Read/update access to their own appointments
- Clients: Full access to their own appointments

#### Services Table Policies
- Super admins: Full access
- Admins: Full access to services in their barbershop
- Barbers/Clients: Read access to active services

### Database Relationships

```
users (1) ──< (many) appointments [as client]
users (1) ──< (many) barbers
users (1) ──< (many) admin_assignments

barbershops (1) ──< (many) barbers
barbershops (1) ──< (many) services
barbershops (1) ──< (many) appointments
barbershops (1) ──< (many) admin_assignments

barbers (1) ──< (many) appointments
barbers (1) ──< (many) waitlist_entries

services (1) ──< (many) appointments

appointments (1) ──< (many) notifications
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: string;
}
```

### Error Handling Strategy

1. **Network Errors**
   - Mostrar toast con mensaje "Sin conexión a internet"
   - Ofrecer botón de reintentar
   - Guardar operaciones pendientes en AsyncStorage para sincronización posterior

2. **Authentication Errors**
   - Redirigir a pantalla de login
   - Limpiar sesión local
   - Mostrar mensaje apropiado

3. **Validation Errors**
   - Mostrar errores inline en formularios
   - Prevenir envío hasta que se corrijan
   - Mensajes claros en español

4. **Permission Errors**
   - Mostrar modal explicando el problema
   - Redirigir a pantalla apropiada según rol

5. **Server Errors**
   - Mostrar mensaje genérico al usuario
   - Registrar error completo para debugging
   - Ofrecer contacto con soporte si persiste

### Error Boundary Component

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```


## Testing Strategy

### Testing Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E ╲         (10% - Flujos críticos)
                 ╱────────╲
                ╱          ╲
               ╱Integration╲      (30% - Servicios + Hooks)
              ╱──────────────╲
             ╱                ╲
            ╱  Unit Tests      ╲   (60% - Utilidades + Lógica)
           ╱────────────────────╲
```

### Unit Tests

**Scope**: Funciones puras, utilidades, validaciones, formatters

**Tools**: Jest

**Coverage Target**: 80%

**Examples**:
- `validation.test.ts`: Validación de email, teléfono, contraseña
- `dateHelpers.test.ts`: Formateo de fechas, cálculo de disponibilidad
- `formatters.test.ts`: Formateo de precios, nombres, teléfonos

```typescript
// Example: validation.test.ts
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  
  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### Integration Tests

**Scope**: Servicios de API, hooks personalizados, flujos de datos

**Tools**: Jest + React Native Testing Library

**Coverage Target**: 70%

**Examples**:
- `auth.service.test.ts`: Login, registro, logout
- `useAppointments.test.ts`: Crear, actualizar, cancelar citas
- `useBarbershops.test.ts`: Obtener barberías, filtrar, buscar

```typescript
// Example: useAppointments.test.ts
describe('useAppointments', () => {
  it('should fetch appointments for current user', async () => {
    const { result } = renderHook(() => useAppointments());
    
    await waitFor(() => {
      expect(result.current.appointments).toHaveLength(3);
    });
  });
});
```

### E2E Tests

**Scope**: Flujos críticos de usuario

**Tools**: Detox (opcional para CI/CD)

**Coverage Target**: Flujos principales

**Critical Flows**:
1. Registro y login de cliente
2. Búsqueda de barbería y agendamiento de cita
3. Barbero confirma y completa cita
4. Admin crea servicio y barbero

### Manual Testing Checklist

**Pre-Release**:
- [ ] Probar en dispositivos Android (mínimo 3 tamaños)
- [ ] Probar en dispositivos iOS (mínimo 2 tamaños)
- [ ] Verificar tema claro y oscuro
- [ ] Probar sin conexión a internet
- [ ] Verificar notificaciones push
- [ ] Probar permisos (cámara, ubicación, notificaciones)
- [ ] Verificar flujos de cada rol
- [ ] Probar con datos reales en staging

## UI/UX Design System

### Color Palette

#### Light Theme
```typescript
const lightColors = {
  // Primary
  primary: '#6366F1',        // Indigo-500
  primaryDark: '#4F46E5',    // Indigo-600
  primaryLight: '#818CF8',   // Indigo-400
  
  // Secondary
  secondary: '#EC4899',      // Pink-500
  secondaryDark: '#DB2777',  // Pink-600
  secondaryLight: '#F472B6', // Pink-400
  
  // Neutrals
  background: '#FFFFFF',
  surface: '#F9FAFB',        // Gray-50
  surfaceVariant: '#F3F4F6', // Gray-100
  
  // Text
  textPrimary: '#111827',    // Gray-900
  textSecondary: '#6B7280',  // Gray-500
  textDisabled: '#9CA3AF',   // Gray-400
  
  // Status
  success: '#10B981',        // Green-500
  warning: '#F59E0B',        // Amber-500
  error: '#EF4444',          // Red-500
  info: '#3B82F6',           // Blue-500
  
  // Borders
  border: '#E5E7EB',         // Gray-200
  divider: '#F3F4F6',        // Gray-100
};
```

#### Dark Theme
```typescript
const darkColors = {
  // Primary
  primary: '#818CF8',        // Indigo-400
  primaryDark: '#6366F1',    // Indigo-500
  primaryLight: '#A5B4FC',   // Indigo-300
  
  // Secondary
  secondary: '#F472B6',      // Pink-400
  secondaryDark: '#EC4899',  // Pink-500
  secondaryLight: '#F9A8D4', // Pink-300
  
  // Neutrals
  background: '#111827',     // Gray-900
  surface: '#1F2937',        // Gray-800
  surfaceVariant: '#374151', // Gray-700
  
  // Text
  textPrimary: '#F9FAFB',    // Gray-50
  textSecondary: '#D1D5DB',  // Gray-300
  textDisabled: '#6B7280',   // Gray-500
  
  // Status
  success: '#34D399',        // Green-400
  warning: '#FBBF24',        // Amber-400
  error: '#F87171',          // Red-400
  info: '#60A5FA',           // Blue-400
  
  // Borders
  border: '#374151',         // Gray-700
  divider: '#1F2937',        // Gray-800
};
```

### Typography

```typescript
const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  
  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  
  // Labels
  labelLarge: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
};
```

### Spacing System

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Border Radius

```typescript
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
```

### Shadows

```typescript
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
```

### Animation Timings

```typescript
const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};
```


### Key Screen Designs

#### 1. Login Screen
- Logo centrado en la parte superior
- Campos de email y contraseña con validación inline
- Botón principal "Iniciar Sesión"
- Enlaces a "¿Olvidaste tu contraseña?" y "Crear cuenta"
- Opción de cambiar tema (claro/oscuro)

#### 2. Client Home Screen
- Header con avatar y nombre del usuario
- Barra de búsqueda prominente
- Sección "Barberías Cercanas" con cards horizontales
- Sección "Próximas Citas" con lista vertical
- Bottom tab navigation

#### 3. Barbershop Detail Screen
- Hero image con logo de la barbería
- Información básica (nombre, dirección, horario, rating)
- Tabs: "Servicios", "Barberos", "Reseñas"
- Botón flotante "Agendar Cita"

#### 4. Book Appointment Screen
- Stepper: Servicio → Barbero → Fecha/Hora → Confirmar
- Calendario visual con días disponibles destacados
- Grid de horarios disponibles
- Resumen de la cita antes de confirmar

#### 5. Barber Schedule Screen
- Calendario mensual con indicadores de citas
- Lista de citas del día seleccionado
- Filtros por estado (todas, pendientes, confirmadas)
- Acciones rápidas: confirmar, completar, cancelar

#### 6. Admin Dashboard Screen
- Cards con métricas principales (ingresos, citas, clientes)
- Gráfico de tendencias (últimos 6 meses)
- Lista de citas recientes
- Accesos rápidos a gestión de barberos y servicios

#### 7. Super Admin Dashboard Screen
- Vista consolidada de todas las barberías
- Tabla con métricas por barbería
- Gráficos comparativos
- Acceso a gestión global de usuarios y barberías

## State Management

### Zustand Stores

#### Auth Store
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}
```

#### Theme Store
```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  colors: typeof lightColors | typeof darkColors;
  
  // Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

#### Notification Store
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
```

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Query Keys Structure

```typescript
export const queryKeys = {
  // Auth
  currentUser: ['user', 'current'] as const,
  
  // Barbershops
  barbershops: ['barbershops'] as const,
  barbershop: (id: string) => ['barbershops', id] as const,
  barbershopsByDistance: (lat: number, lng: number) => 
    ['barbershops', 'nearby', lat, lng] as const,
  
  // Barbers
  barbers: (barbershopId: string) => ['barbers', barbershopId] as const,
  barber: (id: string) => ['barbers', id] as const,
  
  // Services
  services: (barbershopId: string) => ['services', barbershopId] as const,
  service: (id: string) => ['services', id] as const,
  
  // Appointments
  appointments: (userId: string) => ['appointments', userId] as const,
  appointment: (id: string) => ['appointments', id] as const,
  appointmentsByBarber: (barberId: string, date: string) => 
    ['appointments', 'barber', barberId, date] as const,
  
  // Availability
  availability: (barberId: string, date: string) => 
    ['availability', barberId, date] as const,
  
  // Statistics
  statistics: (barbershopId: string, period: string) => 
    ['statistics', barbershopId, period] as const,
};
```

## Services Layer

### Auth Service

```typescript
class AuthService {
  async login(email: string, password: string): Promise<Session>;
  async register(email: string, password: string, fullName: string): Promise<User>;
  async logout(): Promise<void>;
  async resetPassword(email: string): Promise<void>;
  async updatePassword(newPassword: string): Promise<void>;
  async verifyEmail(token: string): Promise<void>;
  async getCurrentUser(): Promise<User | null>;
  async updateProfile(userId: string, updates: Partial<User>): Promise<User>;
  async uploadAvatar(userId: string, file: File): Promise<string>;
}
```

### Barbershop Service

```typescript
class BarbershopService {
  async getBarbershops(): Promise<Barbershop[]>;
  async getBarbershopById(id: string): Promise<Barbershop>;
  async getNearbyBarbershops(lat: number, lng: number, radius: number): Promise<Barbershop[]>;
  async createBarbershop(data: CreateBarbershopDto): Promise<Barbershop>;
  async updateBarbershop(id: string, updates: Partial<Barbershop>): Promise<Barbershop>;
  async deleteBarbershop(id: string): Promise<void>;
  async uploadLogo(barbershopId: string, file: File): Promise<string>;
}
```

### Appointment Service

```typescript
class AppointmentService {
  async getAppointments(userId: string, role: string): Promise<Appointment[]>;
  async getAppointmentById(id: string): Promise<Appointment>;
  async createAppointment(data: CreateAppointmentDto): Promise<Appointment>;
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment>;
  async cancelAppointment(id: string, reason: string): Promise<void>;
  async confirmAppointment(id: string): Promise<Appointment>;
  async completeAppointment(id: string): Promise<Appointment>;
  async getAvailableSlots(barberId: string, date: string, serviceId: string): Promise<TimeSlot[]>;
}
```

### Notification Service

```typescript
class NotificationService {
  async getNotifications(userId: string): Promise<Notification[]>;
  async markAsRead(notificationId: string): Promise<void>;
  async markAllAsRead(userId: string): Promise<void>;
  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void>;
  async scheduleReminder(appointmentId: string, sendAt: Date): Promise<void>;
  async registerPushToken(userId: string, token: string): Promise<void>;
}
```

### Waitlist Service

```typescript
class WaitlistService {
  async addToWaitlist(data: CreateWaitlistDto): Promise<WaitlistEntry>;
  async getWaitlistEntries(barbershopId: string): Promise<WaitlistEntry[]>;
  async notifyNextInLine(barberId: string, date: string, time: string): Promise<void>;
  async confirmFromWaitlist(entryId: string): Promise<Appointment>;
  async removeFromWaitlist(entryId: string): Promise<void>;
}
```

## Performance Optimizations

### Image Optimization
- Usar Expo Image con caché automático
- Comprimir imágenes antes de subir (max 1MB)
- Lazy loading para listas de imágenes
- Placeholders mientras cargan

### List Optimization
- FlatList con `windowSize` optimizado
- `getItemLayout` para listas de altura fija
- `removeClippedSubviews` para listas largas
- Paginación para más de 50 items

### Navigation Optimization
- Lazy loading de screens
- Preload de screens frecuentes
- Evitar re-renders innecesarios con `React.memo`

### Network Optimization
- Caché de queries con React Query
- Debounce en búsquedas (300ms)
- Optimistic updates para mejor UX
- Retry automático con backoff exponencial

### Bundle Optimization
- Code splitting por rol de usuario
- Tree shaking de librerías no usadas
- Minimizar dependencias pesadas
- Usar Hermes engine

## Security Considerations

### Authentication
- Tokens JWT con expiración corta (1 hora)
- Refresh tokens con rotación
- Almacenamiento seguro con Expo SecureStore
- Logout automático después de inactividad

### Data Protection
- HTTPS para todas las comunicaciones
- Encriptación de datos sensibles en AsyncStorage
- Validación de inputs en cliente y servidor
- Sanitización de datos antes de mostrar

### Authorization
- RLS policies en Supabase
- Verificación de permisos en cada request
- Tokens firmados para operaciones críticas
- Rate limiting en endpoints sensibles

### Privacy
- Política de privacidad accesible
- Consentimiento explícito para permisos
- Opción de eliminar cuenta y datos
- Cumplimiento con GDPR y leyes locales

## Deployment Strategy

### Environment Configuration
```typescript
// app.config.ts
export default {
  expo: {
    name: 'Barbershop Manager',
    slug: 'barbershop-manager',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#6366F1',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.barbershop.manager',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#6366F1',
      },
      package: 'com.barbershop.manager',
      permissions: [
        'CAMERA',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'NOTIFICATIONS',
      ],
    },
    plugins: [
      'expo-notifications',
      'expo-image-picker',
      'expo-location',
    ],
  },
};
```

### Build Process
1. Development: `expo start`
2. Preview: `eas build --profile preview`
3. Production: `eas build --profile production`
4. Submit: `eas submit -p android` / `eas submit -p ios`

### CI/CD Pipeline
- Automated tests on PR
- Build preview on merge to develop
- Production build on release tag
- Automated submission to stores

This design provides a solid foundation for building a professional, scalable barbershop management application with modern architecture and best practices.
