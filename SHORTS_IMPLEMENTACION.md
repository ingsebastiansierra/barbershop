# Implementación de Shorts para Barberos

## Resumen
Se ha implementado una funcionalidad completa de "Shorts" (videos e imágenes cortas) para que los barberos puedan mostrar su trabajo, similar a TikTok/Instagram Reels.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    BARBER NAVIGATION                         │
│  ┌──────┬──────┬──────┬────────┬─────────┐                 │
│  │Agenda│Citas │Ventas│ SHORTS │ Perfil  │                 │
│  └──────┴──────┴──────┴────────┴─────────┘                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SHORTS SCREENS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │BarberShorts  │  │ UploadShort  │  │ ShortDetail  │     │
│  │   Screen     │  │   Screen     │  │   Screen     │     │
│  │              │  │              │  │              │     │
│  │ - Grid view  │  │ - Pick media │  │ - View/Edit  │     │
│  │ - Stats      │  │ - Add info   │  │ - Stats      │     │
│  │ - Delete     │  │ - Upload     │  │ - Toggle     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              shortsService.ts                         │  │
│  │  - CRUD operations                                    │  │
│  │  - Storage management                                 │  │
│  │  - Likes/Views tracking                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE BACKEND                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │barber_shorts │  │shorts_likes  │  │shorts_views  │     │
│  │              │  │              │  │              │     │
│  │ - Media info │  │ - User likes │  │ - View count │     │
│  │ - Metadata   │  │ - Timestamps │  │ - Analytics  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Storage: barber-shorts bucket                 │  │
│  │  - Videos (MP4, max 60s)                              │  │
│  │  - Images (JPG, 9:16 aspect)                          │  │
│  │  - Thumbnails                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Base de Datos

### Tablas Creadas

#### `barber_shorts`
- Almacena los shorts (videos/imágenes) de los barberos
- Campos principales:
  - `media_type`: 'video' o 'image'
  - `media_url`: URL del archivo multimedia
  - `thumbnail_url`: Miniatura (opcional)
  - `duration`: Duración en segundos (máximo 60 para videos)
  - `title`, `description`, `tags`: Metadatos opcionales
  - `views_count`, `likes_count`: Contadores de engagement
  - `is_active`: Estado de publicación

#### `shorts_likes`
- Registra los "me gusta" de los usuarios
- Relación única: un usuario solo puede dar like una vez por short

#### `shorts_views`
- Registra las visualizaciones de los shorts
- Permite tracking de vistas por usuario

### Storage Bucket
- **Bucket**: `barber-shorts`
- Estructura de carpetas: `{barber_id}/{timestamp}.{ext}`
- Políticas RLS configuradas para seguridad

### Triggers y Funciones
- Auto-actualización de contadores de likes y vistas
- Actualización automática de `updated_at`

## Funcionalidades Implementadas

### 1. Pantalla Principal de Shorts (`BarberShortsScreen`)
- Grid de 2 columnas mostrando todos los shorts del barbero
- Información visible:
  - Tipo de medio (video/imagen)
  - Duración (para videos)
  - Vistas y likes
  - Estado (activo/inactivo)
- Botón flotante para subir nuevo short
- Pull-to-refresh
- Botón de eliminar en cada short

### 2. Pantalla de Subida (`UploadShortScreen`)
- Selección de tipo de contenido:
  - **Imagen**: Desde galería con crop 9:16
  - **Video**: Máximo 60 segundos
- Formulario con campos opcionales:
  - Título (máx. 100 caracteres)
  - Descripción
  - Etiquetas (separadas por comas)
- Preview del contenido antes de publicar
- Indicador de progreso durante la subida

### 3. Pantalla de Detalle (`ShortDetailScreen`)
- Vista ampliada del short
- Estadísticas:
  - Vistas totales
  - Likes totales
  - Duración (para videos)
- Edición de metadatos:
  - Título
  - Descripción
  - Etiquetas
  - Estado activo/inactivo
- Modo de edición con botones de guardar/cancelar

### 4. Navegación
- Nuevo tab "Shorts" en el menú del barbero (icono de película)
- Reemplaza el tab "Historial" para mantener 5 tabs
- Rutas adicionales en el stack:
  - `UploadShort`: Subir nuevo short
  - `ShortDetail`: Ver/editar short existente

## Servicios Creados (`shortsService.ts`)

### Funciones Principales
- `getActiveShorts()`: Obtener shorts activos para feed
- `getShortsByBarberId()`: Shorts de un barbero específico
- `getShortsByBarbershopId()`: Shorts de una barbería
- `getShortById()`: Detalle de un short
- `createShort()`: Crear nuevo short
- `updateShort()`: Actualizar metadatos
- `deleteShort()`: Eliminar short
- `uploadShortMedia()`: Subir archivo a storage
- `deleteShortMedia()`: Eliminar archivo de storage
- `likeShort()` / `unlikeShort()`: Gestión de likes
- `isShortLikedByUser()`: Verificar si usuario dio like
- `recordShortView()`: Registrar visualización
- `getShortsWithLikeStatus()`: Shorts con estado de like del usuario

## Tipos TypeScript Agregados

### Enums
```typescript
export enum ShortMediaType {
  VIDEO = 'video',
  IMAGE = 'image',
}
```

### Interfaces
```typescript
export interface BarberShort {
  id: string;
  barber_id: string;
  barbershop_id: string;
  media_type: ShortMediaType;
  media_url: string;
  thumbnail_url?: string;
  duration?: number;
  title?: string;
  description?: string;
  tags?: string[];
  views_count: number;
  likes_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarberShortWithDetails extends BarberShort {
  barber: BarberWithUser;
  barbershop: Barbershop;
  is_liked_by_user?: boolean;
}
```

## Migración de Base de Datos

**Archivo**: `supabase/migrations/009_add_barber_shorts.sql`

Para aplicar la migración:
```bash
# Si usas Supabase CLI
supabase db push

# O ejecuta el SQL directamente en el dashboard de Supabase
```

## Permisos Requeridos

La app solicita permisos de galería cuando el usuario intenta:
- Subir una imagen
- Subir un video

## Características de Seguridad

### Row Level Security (RLS)
- ✅ Cualquiera puede ver shorts activos
- ✅ Barberos solo ven/editan sus propios shorts
- ✅ Usuarios autenticados pueden dar like
- ✅ Solo el dueño puede eliminar sus likes
- ✅ Cualquiera puede registrar vistas

### Storage Policies
- ✅ Lectura pública de archivos
- ✅ Solo el barbero dueño puede subir/modificar/eliminar

## Próximas Mejoras Sugeridas

### Funcionalidades Adicionales
1. **Feed público de shorts**: Pantalla para clientes donde vean shorts de todas las barberías
2. **Comentarios**: Permitir comentarios en los shorts
3. **Compartir**: Opción para compartir shorts en redes sociales
4. **Filtros y efectos**: Agregar filtros básicos para videos/imágenes
5. **Música de fondo**: Permitir agregar música a los videos
6. **Estadísticas avanzadas**: Gráficos de vistas por día, engagement rate, etc.
7. **Notificaciones**: Notificar al barbero cuando recibe likes/comentarios
8. **Búsqueda por tags**: Buscar shorts por etiquetas
9. **Shorts destacados**: Marcar shorts favoritos en el perfil
10. **Reproducción automática**: Auto-play en el feed estilo TikTok

### Optimizaciones Técnicas
1. **Compresión de video**: Comprimir videos antes de subir
2. **Generación de thumbnails**: Auto-generar miniaturas de videos
3. **Lazy loading**: Cargar shorts bajo demanda
4. **Cache**: Implementar cache de shorts visitados
5. **Paginación**: Implementar scroll infinito en el feed

## Ejemplos de Código

### Usar el componente ShortCard

```typescript
import { ShortCard } from '../../components/shorts';

// En un FlatList
<FlatList
  data={shorts}
  renderItem={({ item }) => (
    <ShortCard
      short={item}
      onPress={() => navigation.navigate('ShortDetail', { shortId: item.id })}
      showBarberInfo={true}
      width="48%"
    />
  )}
  numColumns={2}
/>
```

### Usar los hooks

```typescript
import { useBarberShorts, useToggleLike } from '../../hooks/useShorts';

function MyComponent() {
  const { data: shorts, isLoading } = useBarberShorts();
  const toggleLike = useToggleLike();

  const handleLike = (shortId: string, isLiked: boolean) => {
    toggleLike.mutate({ shortId, isLiked });
  };

  // ...
}
```

### Llamar al servicio directamente

```typescript
import { createShort, uploadShortMedia } from '../../services/shortsService';
import { ShortMediaType } from '../../types/models';

async function uploadNewShort(file: Blob, barberId: string, barbershopId: string) {
  // Upload media
  const mediaUrl = await uploadShortMedia(barberId, file, ShortMediaType.VIDEO);
  
  // Create short record
  const short = await createShort({
    barber_id: barberId,
    barbershop_id: barbershopId,
    media_type: ShortMediaType.VIDEO,
    media_url: mediaUrl,
    title: 'Mi nuevo corte',
    tags: ['fade', 'corte'],
  });
  
  return short;
}
```

## Uso

### Para Barberos

1. **Subir un Short**:
   - Ir al tab "Shorts"
   - Presionar el botón "+" flotante
   - Seleccionar imagen o video
   - Agregar título, descripción y tags (opcional)
   - Presionar "Publicar Short"

2. **Gestionar Shorts**:
   - Ver todos los shorts en el tab "Shorts"
   - Tocar un short para ver detalles y estadísticas
   - Editar metadatos o desactivar shorts
   - Eliminar shorts no deseados

3. **Estadísticas**:
   - Ver vistas y likes en cada short
   - Identificar contenido más popular
   - Ajustar estrategia de contenido

## Componentes Reutilizables

### ShortCard (`src/components/shorts/ShortCard.tsx`)
Componente de tarjeta para mostrar un short de forma compacta.

**Props**:
- `short`: Datos del short a mostrar
- `onPress`: Callback al tocar la tarjeta
- `onDelete`: Callback para eliminar (opcional)
- `showBarberInfo`: Mostrar info del barbero (default: false)
- `width`: Ancho de la tarjeta (default: '48%')

**Características**:
- Preview de imagen/video
- Indicador de tipo de medio
- Badge de duración para videos
- Badge de estado (activo/inactivo)
- Estadísticas (vistas y likes)
- Botón de eliminar (opcional)
- Info del barbero (opcional)

## Hooks Personalizados

### useShorts (`src/hooks/useShorts.ts`)

#### `useBarberShorts(includeInactive?)`
Hook para obtener los shorts de un barbero.
```typescript
const { data: shorts, isLoading } = useBarberShorts(true);
```

#### `useShortsFeed(limit?, offset?)`
Hook para obtener el feed de shorts activos.
```typescript
const { data: shorts } = useShortsFeed(20, 0);
```

#### `useToggleLike()`
Hook para dar/quitar like a un short.
```typescript
const toggleLike = useToggleLike();
toggleLike.mutate({ shortId: '123', isLiked: false });
```

#### `useRecordView()`
Hook para registrar una vista.
```typescript
const recordView = useRecordView();
recordView.mutate(shortId);
```

#### `useDeleteShort()`
Hook para eliminar un short.
```typescript
const deleteShort = useDeleteShort();
deleteShort.mutate(short);
```

## Archivos Modificados/Creados

### Nuevos Archivos
- `supabase/migrations/009_add_barber_shorts.sql` - Migración de base de datos
- `src/services/shortsService.ts` - Servicio de shorts
- `src/screens/barber/BarberShortsScreen.tsx` - Pantalla principal
- `src/screens/barber/UploadShortScreen.tsx` - Pantalla de subida
- `src/screens/barber/ShortDetailScreen.tsx` - Pantalla de detalle
- `src/hooks/useShorts.ts` - Hooks personalizados
- `src/components/shorts/ShortCard.tsx` - Componente de tarjeta
- `src/components/shorts/index.ts` - Exportaciones
- `SHORTS_IMPLEMENTACION.md` - Documentación

### Archivos Modificados
- `src/types/models.ts` - Agregados tipos de shorts
- `src/types/navigation.ts` - Agregadas rutas de shorts
- `src/navigation/BarberNavigator.tsx` - Agregado tab y rutas
- `src/screens/barber/index.ts` - Exportadas nuevas pantallas

## Notas Importantes

1. **Límite de duración**: Los videos están limitados a 60 segundos máximo
2. **Formato de video**: Se recomienda MP4 para mejor compatibilidad
3. **Aspect ratio**: Las imágenes se cropean a 9:16 (formato vertical)
4. **Tamaño de archivo**: No hay límite explícito, pero se recomienda optimizar archivos grandes
5. **Permisos**: Los barberos deben estar aprobados para acceder a esta funcionalidad

## Soporte

Para problemas o preguntas sobre esta funcionalidad, revisar:
- Logs de Supabase para errores de base de datos
- Console del navegador/app para errores de frontend
- Storage bucket para problemas de subida de archivos
