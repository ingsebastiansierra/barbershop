# Guía de Ubicación del Negocio (Versión Simplificada)

## Descripción

La funcionalidad de ubicación permite a los administradores configurar las coordenadas GPS de su barbería usando dos métodos simples:

1. **GPS Automático:** Obtener ubicación actual del dispositivo
2. **Manual:** Ingresar coordenadas desde Google Maps

## Ubicaciones en la App

### 1. Configuración del Negocio
**Ruta:** Administrador → Configuración → Información General → Ubicación del Negocio

Aquí puedes:
- Obtener ubicación actual con GPS
- Ingresar coordenadas manualmente
- Ver la ubicación en el mapa externo
- Guardar los cambios

### 2. Perfil del Administrador
**Ruta:** Administrador → Perfil → Mi Barbería

Aquí puedes:
- Ver la información del negocio
- Ver las coordenadas configuradas
- Abrir la ubicación en el mapa
- Ver advertencia si no hay ubicación configurada

## Características Implementadas

### 1. Obtener Ubicación Actual (GPS) 📍

**Cómo usar:**
1. Ve físicamente al negocio
2. Presiona "📍 Obtener Ubicación Actual (GPS)"
3. Otorga permisos de ubicación si se solicitan
4. Las coordenadas se llenarán automáticamente
5. Si no tienes dirección, se intentará obtener automáticamente
6. Presiona "Guardar Cambios"

**Permisos requeridos:**
- iOS: Permiso de ubicación "Mientras se usa la app"
- Android: Permiso de ubicación precisa

**Ventajas:**
- ✅ Muy preciso (GPS)
- ✅ Rápido y fácil
- ✅ Obtiene dirección automáticamente
- ✅ No requiere conocimientos técnicos

### 2. Ingresar Coordenadas Manualmente ⌨️

**Campos:**
- **Latitud:** Valor entre -90 y 90 (ej: 19.432608)
- **Longitud:** Valor entre -180 y 180 (ej: -99.133209)

**Cómo obtener coordenadas desde Google Maps:**

#### Opción A: Desde el navegador
1. Abre [Google Maps](https://www.google.com/maps) en tu navegador
2. Busca tu negocio o navega hasta él
3. Haz clic derecho en la ubicación exacta
4. Selecciona "¿Qué hay aquí?"
5. Las coordenadas aparecerán en la parte inferior (formato: lat, lng)
6. Haz clic en las coordenadas para copiarlas
7. Pega los valores en los campos de la app

#### Opción B: Desde la app de Google Maps
1. Abre Google Maps en tu teléfono
2. Busca tu negocio
3. Mantén presionado en la ubicación exacta
4. Aparecerá un pin rojo
5. Desliza hacia arriba la tarjeta inferior
6. Toca las coordenadas para copiarlas
7. Pega en la app

**Ventajas:**
- ✅ No requiere estar en el negocio
- ✅ Puedes hacerlo desde casa
- ✅ Muy preciso si seleccionas bien el punto

### 3. Ver en Mapa 🗺️

Una vez que tengas coordenadas configuradas, puedes:

**Desde Configuración:**
- Presiona "🗺️ Ver en Mapa"
- Se abrirá la app de mapas nativa
- Verifica que la ubicación sea correcta

**Desde Perfil:**
- Ve a "Mi Barbería"
- Presiona "🗺️ Ver Ubicación en Mapa"
- Se abrirá la app de mapas nativa

**Apps que se abren:**
- **iOS:** Apple Maps
- **Android:** Google Maps
- **Fallback:** Google Maps en navegador

### 4. Validación Automática ✓

El sistema valida que:
- La latitud esté entre -90 y 90
- La longitud esté entre -180 y 180
- Los valores sean números válidos
- No haya caracteres inválidos

Si hay un error, verás un mensaje claro indicando el problema.

## Flujos de Uso

### Flujo 1: Desde el Negocio (Recomendado)

```
1. Ve al negocio físicamente
2. Abre la app
3. Ve a Configuración → Información General
4. Presiona "📍 Obtener Ubicación Actual (GPS)"
5. Otorga permisos si se solicitan
6. Verifica las coordenadas
7. Presiona "🗺️ Ver en Mapa" para confirmar
8. Presiona "Guardar Cambios"
9. ¡Listo! ✓
```

### Flujo 2: Desde Casa con Google Maps

```
1. Abre Google Maps en tu navegador
2. Busca tu negocio
3. Haz clic derecho → "¿Qué hay aquí?"
4. Copia las coordenadas
5. Abre la app
6. Ve a Configuración → Información General
7. Pega latitud y longitud
8. Presiona "🗺️ Ver en Mapa" para confirmar
9. Presiona "Guardar Cambios"
10. ¡Listo! ✓
```

### Flujo 3: Verificar Ubicación desde Perfil

```
1. Ve a Perfil
2. Busca la sección "Mi Barbería"
3. Verifica las coordenadas
4. Presiona "🗺️ Ver Ubicación en Mapa"
5. Confirma que sea correcta
```

## Base de Datos

Los campos en la tabla `barbershops`:

```sql
latitude DOUBLE PRECISION        -- Latitud (-90 a 90)
longitude DOUBLE PRECISION       -- Longitud (-180 a 180)
location GEOGRAPHY(POINT, 4326)  -- PostGIS (se actualiza automáticamente)
```

El campo `location` se actualiza automáticamente mediante un trigger cuando cambias `latitude` o `longitude`.

## Beneficios para los Clientes

Una vez configurada la ubicación, los clientes podrán:

1. **Ver barberías cercanas** - Búsqueda por proximidad
2. **Calcular distancia** - "A 2.5 km de ti"
3. **Obtener direcciones** - Navegación directa
4. **Filtrar por ubicación** - Encontrar la más cercana

## Solución de Problemas

### "Permiso Denegado"

**Problema:** La app no puede acceder al GPS

**Solución:**
1. Ve a Configuración del dispositivo
2. Busca la app "Barbershop Manager"
3. Ve a Permisos
4. Activa "Ubicación"
5. Selecciona "Mientras se usa la app"

### "Error al obtener la ubicación"

**Posibles causas:**
- GPS desactivado
- Señal GPS débil
- Modo avión activado
- Estás en interior sin señal

**Solución:**
1. Activa el GPS en tu dispositivo
2. Sal al exterior para mejor señal
3. Espera unos segundos
4. Intenta de nuevo
5. Si no funciona, usa el método manual

### "Coordenadas inválidas"

**Problema:** Las coordenadas no se guardan

**Solución:**
1. Verifica que la latitud esté entre -90 y 90
2. Verifica que la longitud esté entre -180 y 180
3. Usa punto (.) como separador decimal, no coma (,)
4. No incluyas letras o símbolos
5. Ejemplo correcto: `19.432608` y `-99.133209`

### La ubicación no es precisa

**Solución:**
1. Si usaste GPS:
   - Espera a que el GPS se estabilice (30-60 segundos)
   - Intenta al aire libre
   - Reinicia el GPS del dispositivo

2. Si ingresaste manual:
   - Verifica en Google Maps que las coordenadas sean correctas
   - Haz zoom en Google Maps para mayor precisión
   - Copia las coordenadas exactas

### No aparece la ubicación en el perfil

**Problema:** El perfil no muestra la ubicación

**Solución:**
1. Verifica que hayas guardado los cambios en Configuración
2. Cierra y vuelve a abrir la app
3. Verifica que las coordenadas estén en la base de datos
4. Si ves la advertencia "⚠️ No hay ubicación configurada", ve a Configuración

## Ejemplos de Coordenadas (México)

### Ciudad de México (Centro)
- Latitud: `19.432608`
- Longitud: `-99.133209`

### Guadalajara (Centro)
- Latitud: `20.659699`
- Longitud: `-103.349609`

### Monterrey (Centro)
- Latitud: `25.686613`
- Longitud: `-100.316116`

### Cancún
- Latitud: `21.161908`
- Longitud: `-86.851528`

### Tijuana
- Latitud: `32.514948`
- Longitud: `-117.038208`

## Notas Importantes

1. **Precisión:** Las coordenadas se guardan con 6 decimales (~0.1 metros de precisión)
2. **Privacidad:** Solo se guarda la ubicación del negocio, no se rastrea a los usuarios
3. **Actualización:** Puedes cambiar la ubicación en cualquier momento
4. **Opcional:** La ubicación es opcional pero muy recomendada
5. **Sin costo:** No hay cargos por usar GPS o guardar coordenadas

## Preguntas Frecuentes

### ¿Necesito estar en el negocio para configurar la ubicación?

No necesariamente. Puedes:
- **Opción 1:** Ir al negocio y usar GPS (más fácil)
- **Opción 2:** Usar Google Maps desde casa (más flexible)

### ¿Puedo cambiar la ubicación después?

Sí, puedes actualizar la ubicación en cualquier momento desde Configuración.

### ¿Qué pasa si no configuro la ubicación?

La app funcionará normalmente, pero:
- Los clientes no podrán ver tu negocio en búsquedas por ubicación
- No aparecerás en "barberías cercanas"
- Los clientes no podrán calcular la distancia

### ¿Los clientes pueden ver mis coordenadas exactas?

Sí, pero solo para:
- Encontrar tu negocio en el mapa
- Calcular distancia
- Obtener direcciones

No se usa para rastreo ni otros propósitos.

### ¿Puedo tener múltiples ubicaciones?

En esta versión, cada barbería tiene una ubicación. Si tienes múltiples sucursales, necesitas crear una barbería separada para cada una.

## Soporte

Si tienes problemas:

1. Revisa esta guía
2. Verifica los permisos de ubicación
3. Intenta el método alternativo (GPS vs Manual)
4. Contacta al soporte con:
   - Captura de pantalla
   - Descripción del problema
   - Modelo de dispositivo
   - Sistema operativo

---

**Última actualización:** Noviembre 2024
**Versión:** 1.0.0
