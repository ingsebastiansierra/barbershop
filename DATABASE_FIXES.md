# Database Schema Fixes

## Issues Fixed

### 1. Table Name Mismatches
**Problem**: Services were querying `usuarios` table but the actual table name is `users`

**Fixed in**:
- `src/services/appointment.service.ts` - Changed `usuarios` to `users` in queries
- `src/services/auth.service.ts` - Changed `usuarios` to `users` in queries
- `src/supabase/types.ts` - Updated Database interface to use English table names

### 2. Field Name Mismatches
**Problem**: Code was using Spanish field names (`nombre`, `telefono`, `rol`) but schema uses English names (`full_name`, `phone`, `role`)

**Fixed in**:
- `src/services/auth.service.ts` - Updated register function to use `full_name` and `phone`
- `src/store/authStore.ts` - Updated register function parameters
- `src/hooks/useAuth.ts` - Added compatibility for both old and new field names
- `src/supabase/types.ts` - Updated Usuario interface with correct field names and legacy mappings

### 3. Missing Database Function
**Problem**: Auth service was calling `handle_new_user_registration` function that doesn't exist

**Fixed**: Updated register function to directly insert into `users` table instead of calling non-existent RPC function

## Changes Made

### src/services/appointment.service.ts
```typescript
// Changed from:
user:usuarios!barbers_id_fkey(*)
client:usuarios!appointments_client_id_fkey(*)

// To:
user:users!barbers_id_fkey(*)
client:users!appointments_client_id_fkey(*)
```

### src/services/auth.service.ts
```typescript
// Changed from:
async register(email, password, nombre, telefono)
await supabase.from('usuarios')...

// To:
async register(email, password, full_name, phone)
await supabase.from('users')...
```

### src/supabase/types.ts
```typescript
// Updated Database interface
Tables: {
  users: { ... }      // was: usuarios
  barbershops: { ... } // was: negocios
  services: { ... }    // was: servicios
  appointments: { ... } // was: citas
}

// Updated Usuario interface
interface Usuario {
  full_name: string;  // was: nombre
  phone: string | null; // was: telefono
  role: UserRole;     // was: rol
  // Added legacy field mappings for compatibility
}
```

### src/hooks/useAuth.ts
```typescript
// Added compatibility checks
const hasRole = (role: UserRole): boolean => {
  return user?.role === role || user?.rol === role;
};

const getUserDisplayName = (): string => {
  return user.full_name || user.nombre || user.email;
};
```

## Testing Recommendations

1. Test user registration with new field names
2. Test appointment queries to ensure barber and client data loads correctly
3. Test authentication flow end-to-end
4. Verify RLS policies are working correctly

## Notes

- The Usuario interface now includes both new (English) and legacy (Spanish) field names for backward compatibility
- The useAuth hook checks both field name variants to ensure smooth transition
- All database queries now use the correct English table and field names matching the schema
