# Guía de Configuración de Ubicación del Negocio

## Descripción

La funcionalidad de ubicación permite a los administradores de barbería configurar las coordenadas geográficas de su negocio. Esto permite que los clientes puedan:

- Encontrar la barbería en el mapa
- Ver la distancia desde su ubicación actual
- Obtener direcciones para llegar al negocio

## Ubicación en la App

**Ruta:** Administrador → Configuración → Información General → Ubicación del Negocio

## Características Implementadas

### 1. Seleccionar en Mapa (Recomendado) 🗺️

El botón **"🗺️ Seleccionar en Mapa"** abre un mapa interactivo donde puedes:

**Cómo usar:**
1. Presiona el botón "🗺️ Seleccionar en Mapa"
2. Se abrirá un mapa interactivo a pantalla completa
3. Toca en cualquier punto del mapa para seleccionar la ubicación
4. Arrastra el mapa para explorar diferentes áreas
5. Usa el botón 📍 en la esquina inferior derecha para ir a tu ubicación actual
6. Las coordenadas se actualizan en tiempo real en la parte inferior
7. Presiona "Confirmar Ubicación" para guardar

**Características del mapa:**
- Zoom con pellizco (pinch)
- Desplazamiento táctil
- Marcador rojo indica la ubicación seleccionada
- Muestra tu ubicación actual (punto azul)
- Brújula para orientación
- Escala del mapa

### 2. Obtener Ubicación Actual

El botón **"📍 Ubicación Actual"** permite obtener automáticamente las coordenadas GPS del dispositivo.

**Cómo usar:**
1. Asegúrate de estar físicamente en el negocio
2. Presiona el botón "📍 Usar Ubicación Actual"
3. Otorga permisos de ubicación si se solicitan
4. Las coordenadas se llenarán automáticamente
5. Si no tienes dirección configurada, se intentará obtener automáticamente

**Permisos requeridos:**
- iOS: Permiso de ubicación "Mientras se usa la app"
- Android: Permiso de ubicación precisa

### 2. Ingresar Coordenadas Manualmente

Puedes ingresar las coordenadas manualmente si las conoces:

**Campos:**
- **Latitud:** Valor entre -90 y 90 (ej: 19.432608)
- **Longitud:** Valor entre -180 y 180 (ej: -99.133209)

**Cómo obtener coordenadas desde Google Maps:**
1. Abre Google Maps en tu navegador
2. Busca tu negocio o haz clic derecho en el mapa
3. Selecciona "¿Qué hay aquí?"
4. Copia las coordenadas que aparecen (formato: lat, lng)
5. Pega los valores en los campos correspondientes

### 3. Ver en Mapa

El botón **"🗺️ Ver en Mapa"** abre la ubicación en la aplicación de mapas del dispositivo:

- **iOS:** Abre Apple Maps
- **Android:** Abre Google Maps
- **Fallback:** Abre Google Maps en el navegador

### 4. Validación de Coordenadas

El sistema valida automáticamente que:
- La latitud esté entre -90 y 90
- La longitud esté entre -180 y 180
- Los valores sean números válidos

Si hay un error, se mostrará un mensaje indicando el problema.

## Flujo de Uso Recomendado

### Opción 1: Mapa Interactivo (Más Fácil) 🗺️

1. Navega a Configuración → Información General → Ubicación del Negocio
2. Presiona "🗺️ Seleccionar en Mapa"
3. Busca tu negocio en el mapa (desplaza y haz zoom)
4. Toca en la ubicación exacta de tu negocio
5. Verifica las coordenadas en la parte inferior
6. Presiona "Confirmar Ubicación"
7. La dirección se llenará automáticamente (si está disponible)
8. Guarda los cambios

### Opción 2: Desde el Negocio

1. Ve físicamente al negocio
2. Abre la app en tu dispositivo móvil
3. Navega a Configuración → Información General
4. Presiona "📍 Ubicación Actual"
5. Verifica que las coordenadas sean correctas
6. Presiona "Ver en Mapa" para confirmar
7. Guarda los cambios

### Opción 3: Desde Google Maps

1. Busca tu negocio en Google Maps
2. Obtén las coordenadas (clic derecho → "¿Qué hay aquí?")
3. Copia las coordenadas
4. Pégalas en los campos de Latitud y Longitud
5. Presiona "Ver en Mapa" para confirmar
6. Guarda los cambios

## Configuración de Google Maps API

Para que el mapa interactivo funcione correctamente, necesitas configurar una API Key de Google Maps:

### 1. Obtener API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API (opcional, para direcciones)
4. Ve a "Credenciales" y crea una API Key
5. Restringe la API Key por aplicación (recomendado)

### 2. Configurar en el Proyecto

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 3. Restricciones de Seguridad (Recomendado)

En Google Cloud Console:
- **Android:** Restringe por nombre del paquete (`com.barbershop.manager`)
- **iOS:** Restringe por Bundle ID (`com.barbershop.manager`)

### 4. Costos

Google Maps ofrece $200 USD de crédito mensual gratuito, que incluye:
- 28,000 cargas de mapa estático
- 28,500 cargas de mapa dinámico
- 40,000 solicitudes de geocoding

Para la mayoría de barberías, esto es más que suficiente y no generará costos.

## Implementación Técnica

### Base de Datos

La tabla `barbershops` incluye los siguientes campos:

```sql
latitude DOUBLE PRECISION
longitude DOUBLE PRECISION
location GEOGRAPHY(POINT, 4326) -- PostGIS point para consultas espaciales
```

El campo `location` se actualiza automáticamente mediante un trigger cuando se modifican `latitude` y `longitude`.

### Servicios Implementados

#### BarbershopService
- `updateBarbershop()`: Actualiza las coordenadas del negocio
- `getNearbyBarbershops()`: Busca barberías cercanas usando PostGIS

#### GeocodingService (Nuevo)
- `geocodeAddress()`: Convierte dirección a coordenadas
- `reverseGeocode()`: Convierte coordenadas a dirección
- `calculateDistance()`: Calcula distancia entre dos puntos
- `formatDistance()`: Formatea distancia para mostrar

### Permisos Requeridos

El archivo `app.json` debe incluir:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Permite a la app acceder a tu ubicación para encontrar barberías cercanas."
        }
      ]
    ]
  }
}
```

## Funcionalidades Futuras

### Búsqueda por Dirección
Permitir buscar una dirección y obtener automáticamente las coordenadas.

### Mapa Interactivo
Mostrar un mapa interactivo donde el administrador pueda arrastrar un pin para seleccionar la ubicación.

### Radio de Servicio
Configurar un radio de servicio para mostrar el área de cobertura del negocio.

### Múltiples Ubicaciones
Soporte para cadenas de barberías con múltiples sucursales.

## Solución de Problemas

### "Permiso Denegado"
**Solución:** Ve a Configuración del dispositivo → Aplicaciones → Barbershop Manager → Permisos → Ubicación → Permitir

### "Error al obtener la ubicación"
**Posibles causas:**
- GPS desactivado
- Señal GPS débil (intenta al aire libre)
- Permisos no otorgados
- Modo avión activado

**Solución:** Verifica que el GPS esté activado y que tengas buena señal.

### "Coordenadas inválidas"
**Solución:** Verifica que:
- La latitud esté entre -90 y 90
- La longitud esté entre -180 y 180
- No haya letras o caracteres especiales
- Uses punto (.) como separador decimal, no coma (,)

### La ubicación no es precisa
**Solución:**
- Espera unos segundos para que el GPS se estabilice
- Intenta obtener la ubicación al aire libre
- Usa la opción manual con Google Maps para mayor precisión

## Ejemplos de Coordenadas

### Ciudad de México
- Latitud: 19.432608
- Longitud: -99.133209

### Guadalajara
- Latitud: 20.659699
- Longitud: -103.349609

### Monterrey
- Latitud: 25.686613
- Longitud: -100.316116

## Notas Importantes

1. **Precisión:** Las coordenadas se guardan con 6 decimales de precisión (~0.1 metros)
2. **Privacidad:** La ubicación solo se usa para mostrar el negocio en el mapa, no se rastrea al usuario
3. **Actualización:** Puedes actualizar la ubicación en cualquier momento
4. **Opcional:** La ubicación es opcional, pero recomendada para mejorar la experiencia del cliente

## Soporte

Si tienes problemas con la configuración de ubicación, contacta al soporte técnico con:
- Captura de pantalla del error
- Modelo de dispositivo
- Versión del sistema operativo
- Descripción del problema
