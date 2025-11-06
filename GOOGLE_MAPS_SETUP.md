# Configuración de Google Maps API

Esta guía te ayudará a configurar Google Maps para la funcionalidad de selección de ubicación en el mapa.

## ¿Por qué necesito Google Maps API?

La funcionalidad de "Seleccionar en Mapa" utiliza Google Maps para mostrar un mapa interactivo donde los administradores pueden seleccionar la ubicación exacta de su barbería tocando el mapa.

## Paso 1: Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Seleccionar un proyecto" en la parte superior
4. Haz clic en "Nuevo proyecto"
5. Ingresa un nombre: "Barbershop Manager"
6. Haz clic en "Crear"

## Paso 2: Habilitar las APIs Necesarias

1. En el menú lateral, ve a "APIs y servicios" → "Biblioteca"
2. Busca y habilita las siguientes APIs:

### Para Android:
- **Maps SDK for Android** (Requerido)
- **Geocoding API** (Opcional, para obtener direcciones)

### Para iOS:
- **Maps SDK for iOS** (Requerido)
- **Geocoding API** (Opcional, para obtener direcciones)

Para habilitar cada API:
1. Haz clic en el nombre de la API
2. Haz clic en "Habilitar"
3. Espera a que se active (puede tomar unos segundos)

## Paso 3: Crear una API Key

1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "Clave de API"
3. Se creará una nueva API Key
4. Copia la API Key (la necesitarás en el siguiente paso)

## Paso 4: Configurar la API Key en el Proyecto

### Opción A: Usando archivo .env (Recomendado)

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega la siguiente línea:

```env
GOOGLE_MAPS_API_KEY=AIzaSy...tu_api_key_completa_aqui
```

3. Guarda el archivo

### Opción B: Directamente en app.config.js

1. Abre el archivo `app.config.js`
2. Reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu API Key real
3. Guarda el archivo

**⚠️ Advertencia:** No subas tu API Key a repositorios públicos. Usa la Opción A y agrega `.env` a tu `.gitignore`.

## Paso 5: Restringir la API Key (Seguridad)

Es importante restringir tu API Key para evitar uso no autorizado:

1. En Google Cloud Console, ve a "Credenciales"
2. Haz clic en el nombre de tu API Key
3. En "Restricciones de aplicación", selecciona:

### Para Android:
- Selecciona "Aplicaciones de Android"
- Haz clic en "Agregar nombre de paquete y huella digital"
- Nombre del paquete: `com.barbershop.manager`
- Huella digital SHA-1: (obtén esto ejecutando `keytool` en tu keystore)

### Para iOS:
- Selecciona "Aplicaciones de iOS"
- Haz clic en "Agregar un identificador"
- Bundle ID: `com.barbershop.manager`

4. En "Restricciones de API", selecciona:
   - "Restringir clave"
   - Marca las APIs que habilitaste (Maps SDK for Android/iOS, Geocoding API)

5. Haz clic en "Guardar"

## Paso 6: Verificar la Configuración

### En Android:

1. Ejecuta la app en un dispositivo Android o emulador
2. Ve a Configuración → Información General → Ubicación del Negocio
3. Presiona "🗺️ Seleccionar en Mapa"
4. Deberías ver el mapa de Google Maps cargado

### En iOS:

1. Ejecuta la app en un dispositivo iOS o simulador
2. Ve a Configuración → Información General → Ubicación del Negocio
3. Presiona "🗺️ Seleccionar en Mapa"
4. Deberías ver el mapa de Apple Maps o Google Maps cargado

## Costos y Límites

### Crédito Gratuito Mensual

Google Maps ofrece **$200 USD de crédito gratuito cada mes**, que incluye:

- **28,000** cargas de mapa estático
- **28,500** cargas de mapa dinámico
- **40,000** solicitudes de geocoding

### Estimación de Uso

Para una barbería típica:
- **Administradores:** 1-5 personas
- **Uso del mapa:** 10-50 veces al mes (configuración inicial y actualizaciones)
- **Costo estimado:** $0 USD/mes (dentro del crédito gratuito)

### Monitoreo de Uso

1. Ve a Google Cloud Console
2. Navega a "APIs y servicios" → "Panel"
3. Verás gráficas de uso de cada API
4. Configura alertas si te acercas al límite gratuito

## Solución de Problemas

### El mapa no se muestra (pantalla gris)

**Posibles causas:**
1. API Key no configurada correctamente
2. APIs no habilitadas en Google Cloud
3. Restricciones de API Key muy estrictas

**Solución:**
1. Verifica que la API Key esté en el archivo `.env`
2. Verifica que las APIs estén habilitadas en Google Cloud Console
3. Temporalmente, quita las restricciones de la API Key para probar
4. Revisa los logs de la app para ver errores específicos

### Error: "This API project is not authorized to use this API"

**Solución:**
1. Ve a Google Cloud Console
2. Asegúrate de que Maps SDK for Android/iOS esté habilitado
3. Espera 5-10 minutos para que los cambios se propaguen
4. Reinicia la app

### Error: "The provided API key is invalid"

**Solución:**
1. Verifica que copiaste la API Key completa (sin espacios)
2. Verifica que la API Key esté en el formato correcto: `AIzaSy...`
3. Crea una nueva API Key si es necesario

### El mapa se muestra pero no puedo seleccionar ubicación

**Solución:**
1. Verifica que los permisos de ubicación estén otorgados
2. Verifica que el dispositivo tenga GPS activado
3. Intenta en un dispositivo físico (no emulador)

## Alternativas Sin Google Maps

Si no quieres usar Google Maps, puedes:

1. **Usar solo coordenadas manuales:**
   - Los usuarios ingresan lat/lng manualmente
   - Obtienen coordenadas desde Google Maps web
   - Usan el botón "Ubicación Actual"

2. **Usar OpenStreetMap:**
   - Implementar `react-native-maps` con proveedor OSM
   - Gratuito y sin límites
   - Menos funcionalidades que Google Maps

3. **Usar Apple Maps (solo iOS):**
   - No requiere API Key
   - Solo funciona en iOS
   - Configurar `PROVIDER_DEFAULT` en lugar de `PROVIDER_GOOGLE`

## Recursos Adicionales

- [Documentación de Google Maps Platform](https://developers.google.com/maps/documentation)
- [Precios de Google Maps](https://mapsplatform.google.com/pricing/)
- [Mejores prácticas de seguridad](https://developers.google.com/maps/api-security-best-practices)
- [react-native-maps GitHub](https://github.com/react-native-maps/react-native-maps)

## Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de la consola de desarrollo
2. Verifica el estado de las APIs en Google Cloud Console
3. Consulta la documentación oficial de Google Maps
4. Contacta al equipo de desarrollo con:
   - Captura de pantalla del error
   - Logs de la consola
   - Configuración de la API Key (sin mostrar la key completa)
