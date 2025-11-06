# Campo de Género en Perfil de Usuario

## 📋 Implementación Completa

### 1. Base de Datos

**Migración:** `supabase/migrations/007_add_gender_to_users.sql`

Se agregó un nuevo campo `gender` a la tabla `users` con las siguientes opciones:

```sql
CREATE TYPE user_gender AS ENUM (
  'male',                -- Masculino
  'female',              -- Femenino
  'other',               -- Otro
  'prefer_not_to_say'    -- Prefiero no decir
);
```

**Valor por defecto:** `prefer_not_to_say`

### 2. Tipos TypeScript

**Archivo:** `src/types/models.ts`

Se agregó el enum `UserGender`:

```typescript
export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}
```

Y se actualizó la interfaz `User`:

```typescript
export interface User {
  // ... otros campos
  gender?: UserGender;
}
```

### 3. Pantalla de Perfil

**Archivo:** `src/screens/client/ClientProfileScreen.tsx`

#### Visualización del Género

En la sección de "Información Personal" se muestra el género con iconos:

- 👨 Masculino
- 👩 Femenino
- 🧑 Otro
- 🤷 Prefiero no decir

#### Selector de Género

En el modal de edición de perfil, se agregó un selector visual con botones:

- Diseño con chips/pills seleccionables
- Cambio de color al seleccionar
- Interfaz intuitiva y moderna
- Responsive y accesible

### 4. Cómo Aplicar la Migración

Para aplicar los cambios en la base de datos:

```bash
# Opción 1: Usando Supabase CLI
supabase db push

# Opción 2: Ejecutar manualmente en Supabase Dashboard
# Ve a SQL Editor y ejecuta el contenido de:
# supabase/migrations/007_add_gender_to_users.sql
```

### 5. Uso del Campo de Género

Este campo puede ser utilizado para:

#### ✅ Personalización de Experiencia

- Mostrar contenido relevante según el género
- Recomendaciones de servicios específicos
- Filtros de búsqueda personalizados

#### ✅ Estadísticas y Analytics

- Análisis demográfico de clientes
- Reportes segmentados por género
- Insights de negocio

#### ✅ Marketing Dirigido

- Promociones específicas
- Comunicaciones personalizadas
- Ofertas segmentadas

### 6. Privacidad

- El campo es **opcional**
- Valor por defecto: "Prefiero no decir"
- El usuario puede cambiar su selección en cualquier momento
- Se respeta la privacidad del usuario

### 7. Próximas Mejoras Sugeridas

1. **Filtros en Búsqueda**
   - Permitir buscar barberos/servicios según preferencias de género

2. **Recomendaciones Personalizadas**
   - Sugerir servicios populares según el género del usuario

3. **Estadísticas para Admins**
   - Dashboard con distribución demográfica
   - Análisis de preferencias por género

4. **Servicios Específicos**
   - Marcar servicios como "Unisex", "Para hombres", "Para mujeres"
   - Filtrar servicios según el género del cliente

### 8. Ejemplo de Uso en Código

```typescript
// Obtener el género del usuario
const userGender = user?.gender;

// Verificar si es masculino
if (userGender === UserGender.MALE) {
  // Mostrar servicios para hombres
}

// Verificar si es femenino
if (userGender === UserGender.FEMALE) {
  // Mostrar servicios para mujeres
}

// Personalizar saludo
const greeting = userGender === UserGender.MALE 
  ? 'Bienvenido' 
  : userGender === UserGender.FEMALE 
    ? 'Bienvenida' 
    : 'Bienvenid@';
```

---

## 🎯 Resumen

Se implementó exitosamente el campo de género en el perfil del usuario con:

- ✅ Migración de base de datos
- ✅ Tipos TypeScript actualizados
- ✅ UI moderna y accesible
- ✅ Selector visual intuitivo
- ✅ Respeto a la privacidad del usuario
- ✅ Listo para personalización futura
