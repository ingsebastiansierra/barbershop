# 🌐 Página Web de Recuperación de Contraseña

Esta carpeta contiene la página web que maneja la redirección del enlace de recuperación de contraseña.

## 📁 Archivos

- `reset-password.html` - Página web que maneja el deep linking
- `vercel.json` - Configuración para deployment en Vercel

## 🚀 Deployment Rápido

### Opción 1: Vercel (RECOMENDADO)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde esta carpeta (public/)
cd public
vercel --prod

# Vercel te dará una URL como:
# https://barbershop-manager-xxxxx.vercel.app
```

### Opción 2: Netlify

1. Ve a [Netlify](https://netlify.com)
2. Arrastra esta carpeta a Netlify Drop
3. Obtendrás una URL como: `https://barbershop-manager-xxxxx.netlify.app`

### Opción 3: GitHub Pages

1. Sube esta carpeta a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona la rama y carpeta
4. Obtendrás una URL como: `https://tu-usuario.github.io/tu-repo`

## ⚙️ Configuración Post-Deployment

Después de subir la página, necesitas configurar Supabase:

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. En **"Redirect URLs"** agrega tu URL:
   ```
   https://TU-URL.vercel.app/reset-password.html
   https://TU-URL.vercel.app/reset-password
   com.barbershop.manager://reset-password
   ```
5. Guarda los cambios

## 🔧 Actualizar el Código de la App

En `src/screens/auth/ForgotPasswordScreen.tsx`, cambia:

```typescript
redirectTo: 'https://TU-URL.vercel.app/reset-password.html',
```

## 🧪 Probar Localmente

```bash
# Instalar servidor HTTP
npm install -g http-server

# Desde esta carpeta
http-server -p 8080

# Abrir en navegador
# http://localhost:8080/reset-password.html
```

Para probar con tokens de prueba:
```
http://localhost:8080/reset-password.html?access_token=test123&type=recovery
```

## 📱 Cómo Funciona

1. Usuario hace clic en el enlace del email
2. Supabase redirige a: `https://TU-URL.vercel.app/reset-password.html?access_token=...&type=recovery`
3. La página web recibe los tokens
4. Construye un deep link: `com.barbershop.manager://reset-password?access_token=...`
5. Intenta abrir la app automáticamente
6. Si no se abre, muestra un botón manual
7. La app recibe los tokens y permite cambiar la contraseña

## 🎨 Personalización

Puedes personalizar la página editando `reset-password.html`:

- Cambiar colores en la sección `<style>`
- Modificar textos e instrucciones
- Agregar tu logo
- Cambiar el gradiente de fondo

## 🔒 Seguridad

- Los tokens se pasan por URL (es seguro porque son de un solo uso)
- Los tokens expiran en 1 hora
- La página no almacena ningún dato
- Todo el procesamiento es del lado del cliente

## 📞 Soporte

Si tienes problemas:
1. Verifica que la URL esté configurada en Supabase
2. Revisa la consola del navegador para errores
3. Asegúrate de que la app esté instalada en el dispositivo
4. Prueba el deep link manualmente: `com.barbershop.manager://reset-password`

---

**Última actualización**: 2025-01-05
