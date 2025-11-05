# Sistema de Autenticación

Este directorio contiene la implementación del servicio de autenticación para la aplicación de gestión de barberías.

## Descripción General

El sistema de autenticación está construido usando Supabase Auth con los siguientes componentes:

### Componentes

1. **Cliente Supabase** (`src/supabase/client.ts`)
   - Cliente Supabase configurado con AsyncStorage para persistencia de sesión
   - Auto-refresh de tokens habilitado
   - Variables de entorno para URL y anon key

2. **Definiciones de Tipos** (`src/supabase/types.ts`)
   - Tipos TypeScript completos para todas las tablas de la base de datos
   - Roles de usuario: `barbero`, `cliente`
   - Estados de citas, tipos de pago, y más

3. **AuthService** (`src/services/auth.service.ts`)
   - `login(email, password)` - Autenticar usuario
   - `register(email, password, nombre, telefono)` - Crear nueva cuenta de usuario
   - `logout()` - Cerrar sesión del usuario actual
   - `resetPassword(email)` - Enviar email de recuperación de contraseña
   - `updatePassword(newPassword)` - Actualizar contraseña del usuario
   - `getCurrentUser()` - Obtener usuario autenticado actual
   - `updateProfile(userId, updates)` - Actualizar perfil de usuario
   - `uploadAvatar(userId, imageUri)` - Subir avatar de usuario a Supabase Storage

4. **Auth Store** (`src/store/authStore.ts`)
   - Store de Zustand para estado global de autenticación
   - Sesión persistente con AsyncStorage
   - Auto-login al iniciar la app
   - Listener de cambios de estado de autenticación

5. **Hook useAuth** (`src/hooks/useAuth.ts`)
   - Hook de React para acceder al estado y métodos de autenticación
   - Helpers de verificación de roles (`hasRole`, `isBarber`, etc.)
   - Helpers de verificación de permisos (`canManageAppointments`, etc.)
   - Funciones de utilidad (`getUserDisplayName`, `getUserInitials`)

## Uso

### Autenticación Básica

```typescript
import { useAuth } from '../hooks/useAuth';

function LoginScreen() {
  const { login, isLoading, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('usuario@ejemplo.com', 'password123');
      // Usuario ahora está autenticado
    } catch (error) {
      console.error('Login falló:', error);
    }
  };

  return (
    // Tu UI aquí
  );
}
```

### Registro de Usuario

```typescript
import { useAuth } from '../hooks/useAuth';

function RegisterScreen() {
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    try {
      await register(
        'nuevo@ejemplo.com',
        'password123',
        'Juan Pérez',
        '+1234567890'
      );
      // Usuario registrado exitosamente
    } catch (error) {
      console.error('Registro falló:', error);
    }
  };

  return (
    // Tu UI aquí
  );
}
```

### Acceso Basado en Roles

```typescript
import { useAuth } from '../hooks/useAuth';

function BarberPanel() {
  const { user, isBarber, canManageAppointments } = useAuth();

  if (!isBarber()) {
    return <Text>Acceso Denegado</Text>;
  }

  return (
    // UI de barbero aquí
  );
}
```

### Actualización de Perfil

```typescript
import { useAuth } from '../hooks/useAuth';

function ProfileScreen() {
  const { user, updateProfile } = useAuth();

  const handleUpdate = async () => {
    try {
      await updateProfile({
        nombre: 'Nuevo Nombre',
        telefono: '+1234567890',
      });
      // Perfil actualizado
    } catch (error) {
      console.error('Actualización falló:', error);
    }
  };

  return (
    // Tu UI aquí
  );
}
```

## Variables de Entorno

Asegúrate de configurar tu archivo `.env` con las siguientes variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://bsvggmdntyimypntdmzo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Esquema de Base de Datos

### Tabla: usuarios

```sql
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL UNIQUE,
  telefono text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('barbero', 'cliente')),
  negocio_id uuid,
  avatar text,
  especialidad text,
  horario_inicio text,
  horario_fin text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

## Requisitos Cubiertos

- **1.1**: Registro e inicio de sesión de usuarios
- **1.2**: Verificación de email en registro
- **1.4**: Integración con Supabase Auth y gestión de sesiones
- **1.5**: Funcionalidad de recuperación de contraseña
- **1.6**: Sesión persistente con auto-login
- **2.2**: Control de acceso basado en roles
- **2.3**: Helpers de verificación de permisos
- **9.2**: Gestión de perfil y subida de avatar

## Roles de Usuario

### Barbero (`barbero`)
- Puede gestionar sus propias citas
- Tiene acceso a su horario y disponibilidad
- Puede ver la fila de espera
- Asociado a un negocio específico (`negocio_id`)

### Cliente (`cliente`)
- Puede reservar citas
- Puede ver su historial de citas
- Puede unirse a la fila de espera
- No está asociado a un negocio

## Próximos Pasos

1. Crear pantallas de autenticación (LoginScreen, RegisterScreen, etc.)
2. Implementar navegación basada en roles de usuario
3. Agregar UI de manejo de errores y validación
4. Configurar políticas de Row Level Security (RLS) en Supabase
5. Implementar bucket de Storage para avatares en Supabase

## Notas Técnicas

- El sistema de autenticación usa Supabase Auth integrado con AsyncStorage para persistencia de sesión
- Las sesiones se refrescan automáticamente y persisten entre reinicios de la app
- El sistema soporta dos roles de usuario: barbero y cliente
- Las subidas de avatar se manejan a través de Supabase Storage
- Todos los métodos de autenticación incluyen manejo apropiado de errores
- El auth store se sincroniza automáticamente con los cambios de estado de autenticación de Supabase
