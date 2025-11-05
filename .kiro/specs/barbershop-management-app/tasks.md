# Implementation Plan

Este plan de implementación desglosa el desarrollo de la aplicación de barberías en tareas incrementales y manejables. Cada tarea construye sobre las anteriores y está diseñada para ser ejecutada por un agente de código con acceso a los documentos de requisitos y diseño.

## Tasks

- [x] 1. Configurar proyecto base y estructura de carpetas





  - Inicializar proyecto con Expo SDK 54 usando TypeScript
  - Crear estructura completa de carpetas según diseño (src/components, src/screens, src/services, etc.)
  - Configurar TypeScript con tsconfig.json estricto
  - Instalar dependencias principales: React Navigation, Supabase, Zustand, React Query, NativeWind, date-fns, AsyncStorage
  - Configurar NativeWind (Tailwind) con tailwind.config.js
  - Crear archivo de constantes globales en src/utils/constants.ts
  - _Requirements: 18.3, 18.4_

- [ ] 2. Implementar sistema de diseño y tema
  - [ ] 2.1 Crear definiciones de colores y tipografía
    - Implementar paletas de colores para tema claro y oscuro en src/styles/colors.ts
    - Definir sistema de tipografía con tamaños y pesos en src/styles/theme.ts
    - Crear constantes de spacing, borderRadius y shadows
    - _Requirements: 16.2, 16.4_

  - [ ] 2.2 Implementar ThemeProvider y store de tema
    - Crear themeStore.ts con Zustand para gestionar tema actual
    - Implementar ThemeProvider que envuelva la app
    - Agregar persistencia de preferencia de tema en AsyncStorage
    - _Requirements: 16.2, 16.3_

  - [ ] 2.3 Crear componentes base reutilizables
    - Implementar Button component con variantes (primary, secondary, outline, ghost)
    - Implementar Input component con validación y estados de error
    - Implementar Card component con variantes (elevated, outlined, filled)
    - Implementar Avatar component con soporte para imágenes y fallback
    - Implementar Modal component con acciones personalizables
    - _Requirements: 16.1, 16.4_

- [ ] 3. Configurar Supabase y servicios de autenticación
  - [ ] 3.1 Configurar cliente de Supabase
    - Crear archivo src/supabase/client.ts con configuración del cliente
    - Definir tipos TypeScript para tablas en src/supabase/types.ts
    - Configurar variables de entorno para URL y anon key de Supabase
    - _Requirements: 1.4_

  - [ ] 3.2 Implementar AuthService
    - Crear src/services/auth.service.ts con métodos login, register, logout
    - Implementar resetPassword y updatePassword
    - Implementar getCurrentUser y updateProfile
    - Implementar uploadAvatar con Supabase Storage
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 9.2_

  - [ ] 3.3 Crear authStore con Zustand
    - Implementar src/store/authStore.ts con estado de usuario y sesión
    - Agregar acciones para login, register, logout
    - Implementar persistencia de sesión con AsyncStorage
    - Agregar lógica de auto-login al iniciar app
    - _Requirements: 1.4, 1.6_

  - [ ] 3.4 Implementar hook useAuth
    - Crear src/hooks/useAuth.ts que consuma authStore
    - Exponer métodos y estado de autenticación
    - Agregar helpers para verificar roles y permisos
    - _Requirements: 2.2, 2.3_

- [ ] 4. Crear pantallas de autenticación
  - [ ] 4.1 Implementar LoginScreen
    - Crear src/screens/auth/LoginScreen.tsx con formulario de login
    - Agregar validación de email y contraseña
    - Implementar manejo de errores con mensajes claros
    - Agregar enlaces a registro y recuperación de contraseña
    - _Requirements: 1.1, 1.4, 17.1, 17.3_

  - [ ] 4.2 Implementar RegisterScreen
    - Crear src/screens/auth/RegisterScreen.tsx con formulario de registro
    - Validar email, contraseña (8+ caracteres, mayúscula, minúscula, número) y nombre completo
    - Implementar envío de email de verificación
    - Mostrar mensaje de éxito y redirigir a verificación
    - _Requirements: 1.1, 1.2, 1.3, 17.1_

  - [ ] 4.3 Implementar ForgotPasswordScreen
    - Crear src/screens/auth/ForgotPasswordScreen.tsx
    - Implementar formulario para solicitar reset de contraseña
    - Mostrar confirmación de email enviado
    - _Requirements: 9.5_

  - [ ] 4.4 Configurar AuthNavigator
    - Crear src/navigation/AuthNavigator.tsx con stack de pantallas de auth
    - Configurar transiciones y opciones de navegación
    - _Requirements: 1.1_

- [ ] 5. Implementar navegación principal basada en roles
  - [ ] 5.1 Crear RootNavigator con lógica de roles
    - Implementar src/navigation/RootNavigator.tsx que determine navegador según rol
    - Agregar lógica para mostrar AuthNavigator si no hay sesión
    - Redirigir a navegador apropiado según rol del usuario
    - _Requirements: 2.3, 2.5_

  - [ ] 5.2 Crear ClientNavigator
    - Implementar src/navigation/ClientNavigator.tsx con tabs y stack
    - Configurar tabs: Home, Search, Appointments, Profile
    - Agregar screens: BarbershopDetail, BarberDetail, BookAppointment, AppointmentDetail, Notifications
    - _Requirements: 2.3_

  - [ ] 5.3 Crear BarberNavigator
    - Implementar src/navigation/BarberNavigator.tsx con tabs y stack
    - Configurar tabs: Schedule, Appointments, History, Profile
    - Agregar screens: AppointmentDetail, ClientProfile, Notifications
    - _Requirements: 2.3_

  - [ ] 5.4 Crear AdminNavigator
    - Implementar src/navigation/AdminNavigator.tsx con tabs y stack
    - Configurar tabs: Dashboard, Appointments, Barbers, Services, Profile
    - Agregar screens: BarbershopSettings, AddBarber, EditBarber, AddService, EditService, Statistics
    - _Requirements: 2.3_

  - [ ] 5.5 Crear SuperAdminNavigator
    - Implementar src/navigation/SuperAdminNavigator.tsx con tabs y stack
    - Configurar tabs: Dashboard, Barbershops, Users, Statistics, Settings
    - Agregar screens: AddBarbershop, EditBarbershop, BarbershopDetail, UserManagement, GlobalSettings
    - _Requirements: 2.3, 2.5_


- [ ] 6. Implementar modelos de datos y servicios de Supabase
  - [ ] 6.1 Crear scripts de base de datos
    - Crear archivo SQL para tabla users con campos y RLS policies
    - Crear tabla barbershops con relaciones y policies
    - Crear tabla barbers con schedule JSON y policies
    - Crear tabla services con soporte para combos y policies
    - Crear tabla appointments con estados y policies
    - Crear tabla waitlist con estados y policies
    - Crear tabla notifications con tipos y policies
    - Crear tabla admin_assignments para asignaciones de admins
    - _Requirements: 2.1, 2.2, 2.4, 3.2, 4.2, 5.2, 6.3, 7.1, 8.2, 12.4_

  - [ ] 6.2 Definir tipos TypeScript para modelos
    - Crear interfaces en src/types/models.ts para User, Barbershop, Barber, Service, Appointment, WaitlistEntry, Notification
    - Definir tipos para OpeningHours, BarberSchedule, TimeRange, TimeSlot
    - Exportar enums para roles, estados de cita, métodos de pago
    - _Requirements: 2.1_

  - [ ] 6.3 Implementar BarbershopService
    - Crear src/services/barbershop.service.ts con métodos CRUD
    - Implementar getBarbershops, getBarbershopById, getNearbyBarbershops
    - Implementar createBarbershop, updateBarbershop, deleteBarbershop
    - Implementar uploadLogo con Supabase Storage
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 13.1, 15.2, 15.3_

  - [ ] 6.4 Implementar BarberService
    - Crear src/services/barber.service.ts con métodos para gestionar barberos
    - Implementar getBarbers, getBarberById, createBarber, updateBarber
    - Implementar métodos para gestionar schedule de barberos
    - Implementar uploadPhoto con Supabase Storage
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 14.2, 14.3_

  - [ ] 6.5 Implementar ServiceService
    - Crear src/services/service.service.ts para gestión de servicios
    - Implementar getServices, getServiceById, createService, updateService, deleteService
    - Agregar lógica para manejar combos de servicios
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Implementar sistema de citas y disponibilidad
  - [ ] 7.1 Crear AppointmentService
    - Implementar src/services/appointment.service.ts con métodos CRUD
    - Implementar getAppointments con filtros por usuario y rol
    - Implementar createAppointment con validación de disponibilidad
    - Implementar updateAppointment, cancelAppointment, confirmAppointment, completeAppointment
    - Agregar método getAvailableSlots que calcule horarios disponibles
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 7.2 Implementar lógica de cálculo de disponibilidad
    - Crear src/utils/availability.ts con funciones para calcular slots disponibles
    - Implementar función que considere horarios del barbero, citas existentes y duración del servicio
    - Validar que slots estén dentro del horario de la barbería
    - Generar slots en intervalos de 15 minutos
    - _Requirements: 6.1, 6.6, 14.1, 14.3, 14.4_

  - [ ] 7.3 Crear hooks para citas
    - Implementar src/hooks/useAppointments.ts con React Query
    - Crear hook useAvailability para obtener slots disponibles
    - Implementar mutations para crear, actualizar y cancelar citas
    - Agregar invalidación de queries apropiada
    - _Requirements: 6.1, 6.2, 6.3, 7.1_

  - [ ] 7.4 Implementar componentes de calendario y selección de horario
    - Crear CalendarPicker component en src/components/appointment/
    - Implementar TimeSlotPicker component con grid de horarios
    - Crear AppointmentCard component para mostrar citas
    - Agregar estados visuales para disponibilidad
    - _Requirements: 6.1, 6.6_

- [ ] 8. Crear pantallas de cliente
  - [ ] 8.1 Implementar ClientHomeScreen
    - Crear src/screens/client/ClientHomeScreen.tsx
    - Mostrar header con avatar y nombre del usuario
    - Agregar barra de búsqueda
    - Implementar sección "Barberías Cercanas" con FlatList horizontal
    - Mostrar sección "Próximas Citas" con lista vertical
    - _Requirements: 13.1, 13.5_

  - [ ] 8.2 Implementar SearchScreen
    - Crear src/screens/client/SearchScreen.tsx
    - Implementar búsqueda con debounce de 300ms
    - Agregar filtros por nombre y ubicación
    - Mostrar resultados con BarbershopCard components
    - Implementar ordenamiento por distancia si hay permisos de ubicación
    - _Requirements: 13.1, 13.2, 13.4_

  - [ ] 8.3 Implementar BarbershopDetailScreen
    - Crear src/screens/client/BarbershopDetailScreen.tsx
    - Mostrar hero image con logo de barbería
    - Implementar tabs: Servicios, Barberos, Reseñas
    - Agregar botón flotante "Agendar Cita"
    - Mostrar horarios de atención y estado (abierta/cerrada)
    - _Requirements: 13.3, 13.5_

  - [ ] 8.4 Implementar BookAppointmentScreen
    - Crear src/screens/client/BookAppointmentScreen.tsx con stepper
    - Implementar paso 1: Selección de servicio
    - Implementar paso 2: Selección de barbero
    - Implementar paso 3: Selección de fecha y hora con CalendarPicker y TimeSlotPicker
    - Implementar paso 4: Confirmación con resumen
    - Agregar validación en cada paso
    - Mostrar opción de lista de espera si no hay disponibilidad
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 8.1_

  - [ ] 8.5 Implementar ClientAppointmentsScreen
    - Crear src/screens/client/ClientAppointmentsScreen.tsx
    - Mostrar lista de citas con tabs: Próximas, Pasadas, Canceladas
    - Implementar AppointmentCard con acciones (ver detalle, cancelar)
    - Agregar pull-to-refresh
    - _Requirements: 11.1, 11.2_

  - [ ] 8.6 Implementar AppointmentDetailScreen para cliente
    - Crear src/screens/client/AppointmentDetailScreen.tsx
    - Mostrar detalles completos de la cita
    - Agregar botón para cancelar cita (si está pendiente o confirmada)
    - Mostrar información del barbero y barbería
    - _Requirements: 11.3_

  - [ ] 8.7 Implementar ClientProfileScreen
    - Crear src/screens/client/ClientProfileScreen.tsx
    - Mostrar avatar con opción de cambiar foto
    - Implementar formulario para editar nombre, teléfono, email
    - Agregar opción para cambiar contraseña
    - Implementar toggle de tema claro/oscuro
    - Agregar botón de cerrar sesión
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 16.2_


- [ ] 9. Crear pantallas de barbero
  - [ ] 9.1 Implementar BarberScheduleScreen
    - Crear src/screens/barber/BarberScheduleScreen.tsx
    - Mostrar calendario mensual con indicadores de citas
    - Implementar lista de citas del día seleccionado
    - Agregar filtros por estado (todas, pendientes, confirmadas)
    - Mostrar acciones rápidas: confirmar, completar, cancelar
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 9.2 Implementar BarberAppointmentsScreen
    - Crear src/screens/barber/BarberAppointmentsScreen.tsx
    - Mostrar lista de todas las citas del barbero
    - Implementar filtros por fecha y estado
    - Agregar búsqueda por nombre de cliente
    - _Requirements: 7.1, 11.5_

  - [ ] 9.3 Implementar AppointmentDetailScreen para barbero
    - Crear src/screens/barber/AppointmentDetailScreen.tsx
    - Mostrar detalles completos de la cita
    - Agregar botones para cambiar estado (confirmar, completar, cancelar)
    - Mostrar información del cliente
    - Permitir agregar notas a la cita
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 11.3_

  - [ ] 9.4 Implementar BarberHistoryScreen
    - Crear src/screens/barber/BarberHistoryScreen.tsx
    - Mostrar historial de citas completadas
    - Implementar filtros por rango de fechas
    - Mostrar estadísticas básicas (total de citas, ingresos generados)
    - _Requirements: 11.5_

  - [ ] 9.5 Implementar BarberProfileScreen
    - Crear src/screens/barber/BarberProfileScreen.tsx
    - Mostrar y permitir editar foto, nombre, teléfono
    - Agregar sección para editar especialidades y bio
    - Mostrar horarios de trabajo (solo lectura, editables por admin)
    - Implementar toggle de tema y botón de cerrar sesión
    - _Requirements: 9.1, 9.2, 9.4_

- [ ] 10. Crear pantallas de administrador de barbería
  - [ ] 10.1 Implementar AdminDashboardScreen
    - Crear src/screens/admin/AdminDashboardScreen.tsx
    - Mostrar cards con métricas: total de citas, ingresos del mes, clientes nuevos, tasa de cancelación
    - Implementar gráfico de tendencias de últimos 6 meses
    - Mostrar lista de citas recientes
    - Agregar accesos rápidos a gestión de barberos y servicios
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

  - [ ] 10.2 Implementar AdminAppointmentsScreen
    - Crear src/screens/admin/AdminAppointmentsScreen.tsx
    - Mostrar todas las citas de la barbería
    - Implementar filtros por barbero, estado y fecha
    - Permitir modificar estado de cualquier cita
    - _Requirements: 7.5_

  - [ ] 10.3 Implementar BarbersManagementScreen
    - Crear src/screens/admin/BarbersManagementScreen.tsx
    - Mostrar lista de barberos de la barbería
    - Agregar botón para añadir nuevo barbero
    - Implementar acciones: editar, activar/desactivar
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ] 10.4 Implementar AddBarberScreen y EditBarberScreen
    - Crear src/screens/admin/AddBarberScreen.tsx
    - Crear src/screens/admin/EditBarberScreen.tsx
    - Implementar formulario para nombre, email, teléfono, foto, especialidades
    - Agregar configuración de horarios semanales
    - Validar que horarios estén dentro de horarios de barbería
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 14.2, 14.3_

  - [ ] 10.5 Implementar ServicesManagementScreen
    - Crear src/screens/admin/ServicesManagementScreen.tsx
    - Mostrar lista de servicios de la barbería
    - Agregar botón para crear nuevo servicio
    - Implementar acciones: editar, activar/desactivar
    - _Requirements: 4.1, 4.5_

  - [ ] 10.6 Implementar AddServiceScreen y EditServiceScreen
    - Crear src/screens/admin/AddServiceScreen.tsx
    - Crear src/screens/admin/EditServiceScreen.tsx
    - Implementar formulario para nombre, descripción, duración, precio
    - Agregar opción para crear combos seleccionando múltiples servicios
    - Validar que duración sea múltiplo de 15 minutos
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 10.7 Implementar BarbershopSettingsScreen
    - Crear src/screens/admin/BarbershopSettingsScreen.tsx
    - Permitir editar información de la barbería (nombre, dirección, teléfono)
    - Implementar cambio de logo
    - Configurar horarios de apertura y cierre por día
    - Agregar gestión de días festivos/cierres especiales
    - _Requirements: 3.3, 14.1, 14.4, 14.5_

  - [ ] 10.8 Implementar StatisticsScreen
    - Crear src/screens/admin/StatisticsScreen.tsx
    - Mostrar gráficos detallados de ingresos, citas y clientes
    - Implementar filtros por período (semana, mes, año)
    - Agregar comparativas con períodos anteriores
    - Mostrar top barberos por ingresos y cantidad de citas
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 11. Crear pantallas de súper administrador
  - [ ] 11.1 Implementar SuperAdminDashboardScreen
    - Crear src/screens/superadmin/SuperAdminDashboardScreen.tsx
    - Mostrar métricas consolidadas de todas las barberías
    - Implementar tabla con estadísticas por barbería
    - Agregar gráficos comparativos entre barberías
    - Mostrar alertas de barberías con problemas
    - _Requirements: 2.5, 10.4_

  - [ ] 11.2 Implementar BarbershopsManagementScreen
    - Crear src/screens/superadmin/BarbershopsManagementScreen.tsx
    - Mostrar lista de todas las barberías
    - Agregar botón para crear nueva barbería
    - Implementar acciones: ver detalle, editar, activar/desactivar
    - _Requirements: 3.1, 3.5_

  - [ ] 11.3 Implementar AddBarbershopScreen y EditBarbershopScreen
    - Crear src/screens/superadmin/AddBarbershopScreen.tsx
    - Crear src/screens/superadmin/EditBarbershopScreen.tsx
    - Implementar formulario completo para barbería
    - Agregar selección de ubicación en mapa
    - Permitir subir logo
    - Configurar horarios de operación
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 11.4 Implementar UserManagementScreen
    - Crear src/screens/superadmin/UserManagementScreen.tsx
    - Mostrar lista de todos los usuarios del sistema
    - Implementar filtros por rol y barbería
    - Permitir asignar/cambiar roles de usuarios
    - Agregar búsqueda por nombre o email
    - _Requirements: 2.1, 2.4_

  - [ ] 11.5 Implementar GlobalSettingsScreen
    - Crear src/screens/superadmin/GlobalSettingsScreen.tsx
    - Configurar parámetros globales del sistema
    - Gestionar políticas de privacidad y términos
    - Configurar tasas de impuestos por defecto
    - _Requirements: 18.1, 20.3_


- [ ] 12. Implementar sistema de lista de espera
  - [ ] 12.1 Crear WaitlistService
    - Implementar src/services/waitlist.service.ts
    - Crear métodos addToWaitlist, getWaitlistEntries, removeFromWaitlist
    - Implementar notifyNextInLine que notifique al siguiente cliente
    - Agregar confirmFromWaitlist que cree cita desde lista de espera
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 12.2 Integrar lista de espera en BookAppointmentScreen
    - Modificar BookAppointmentScreen para mostrar opción de lista de espera cuando no hay disponibilidad
    - Implementar modal para confirmar unión a lista de espera
    - Mostrar mensaje de confirmación
    - _Requirements: 8.1_

  - [ ] 12.3 Crear WaitlistManagementScreen para admins
    - Crear src/screens/admin/WaitlistManagementScreen.tsx
    - Mostrar lista de clientes en espera
    - Implementar notificación manual del siguiente en línea
    - Agregar opción para remover de lista de espera
    - _Requirements: 8.2, 8.3_

- [ ] 13. Implementar sistema de notificaciones
  - [ ] 13.1 Configurar Expo Notifications
    - Configurar permisos de notificaciones en app.json
    - Crear src/services/notification.service.ts
    - Implementar registerPushToken para guardar token del dispositivo
    - Crear función para solicitar permisos de notificaciones
    - _Requirements: 12.1, 18.2_

  - [ ] 13.2 Implementar envío de notificaciones
    - Crear funciones para enviar notificaciones push
    - Implementar sendPushNotification en NotificationService
    - Agregar scheduleReminder para recordatorios programados
    - Crear listeners para notificaciones recibidas
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 13.3 Integrar notificaciones en flujo de citas
    - Agregar notificación cuando se crea nueva cita
    - Enviar notificación cuando se confirma cita
    - Implementar recordatorio 24 horas antes para cliente
    - Implementar recordatorio 1 hora antes para barbero
    - Notificar cuando se cancela o modifica cita
    - _Requirements: 12.1, 12.2, 12.3, 6.4_

  - [ ] 13.4 Crear NotificationsScreen
    - Crear src/screens/common/NotificationsScreen.tsx
    - Mostrar lista de notificaciones con iconos según tipo
    - Implementar marcar como leída al tocar
    - Agregar botón "Marcar todas como leídas"
    - Mostrar badge con contador de no leídas en tab
    - _Requirements: 12.4_

  - [ ] 13.5 Implementar notificationStore
    - Crear src/store/notificationStore.ts con Zustand
    - Mantener lista de notificaciones en memoria
    - Implementar contador de no leídas
    - Agregar acciones para marcar como leída y limpiar
    - _Requirements: 12.4, 12.5_

- [ ] 14. Implementar gestión de imágenes
  - [ ] 14.1 Configurar Expo Image Picker
    - Configurar permisos de cámara y galería en app.json
    - Crear src/utils/imagePicker.ts con funciones helper
    - Implementar función para seleccionar imagen con validaciones
    - Agregar compresión automática de imágenes
    - _Requirements: 15.1, 15.2, 18.2_

  - [ ] 14.2 Implementar StorageService
    - Crear src/services/storage.service.ts para Supabase Storage
    - Implementar uploadImage que suba y retorne URL pública
    - Agregar deleteImage para limpiar imágenes antiguas
    - Validar dimensiones mínimas y tamaño máximo
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 14.3 Integrar carga de imágenes en perfiles
    - Agregar funcionalidad de cambio de avatar en ProfileScreens
    - Implementar preview de imagen antes de subir
    - Mostrar loading state durante carga
    - Manejar errores de carga con mensajes claros
    - _Requirements: 9.2, 15.2_

  - [ ] 14.4 Implementar caché de imágenes
    - Configurar Expo Image con caché automático
    - Implementar placeholders mientras cargan imágenes
    - Agregar lazy loading en listas de imágenes
    - _Requirements: 19.1_

- [ ] 15. Implementar validaciones y manejo de errores
  - [ ] 15.1 Crear utilidades de validación
    - Implementar src/utils/validation.ts con funciones de validación
    - Agregar validateEmail, validatePhone, validatePassword
    - Crear validateRequired, validateMinLength, validateMaxLength
    - Implementar validateTimeRange para horarios
    - _Requirements: 1.3, 17.1_

  - [ ] 15.2 Crear sistema de manejo de errores
    - Implementar src/utils/errorHandler.ts con tipos de error
    - Crear función parseError que convierta errores de Supabase a mensajes claros
    - Implementar logger para errores críticos
    - Agregar función showError que muestre toast con mensaje
    - _Requirements: 17.2, 17.3, 17.4_

  - [ ] 15.3 Implementar ErrorBoundary
    - Crear src/components/common/ErrorBoundary.tsx
    - Capturar errores de React y mostrar UI de fallback
    - Registrar errores para análisis
    - Agregar botón para reintentar
    - _Requirements: 17.4_

  - [ ] 15.4 Agregar validación inline en formularios
    - Actualizar Input component para mostrar errores inline
    - Implementar validación en tiempo real con debounce
    - Mostrar mensajes de error claros en español
    - Prevenir envío de formularios con errores
    - _Requirements: 17.1, 17.3_

  - [ ] 15.5 Implementar manejo de errores de red
    - Agregar interceptor en servicios para detectar errores de red
    - Mostrar toast "Sin conexión a internet" cuando aplique
    - Implementar botón de reintentar en pantallas con error
    - Guardar operaciones pendientes para sincronización posterior
    - _Requirements: 17.2, 17.5_


- [ ] 16. Implementar búsqueda y filtrado de barberías
  - [ ] 16.1 Crear hook useBarbershops
    - Implementar src/hooks/useBarbershops.ts con React Query
    - Agregar query para obtener todas las barberías
    - Implementar query para barberías cercanas con geolocalización
    - Agregar búsqueda con debounce de 300ms
    - _Requirements: 13.1, 13.2, 13.4_

  - [ ] 16.2 Implementar geolocalización
    - Configurar Expo Location
    - Crear src/utils/location.ts con funciones helper
    - Implementar solicitud de permisos de ubicación
    - Calcular distancia entre coordenadas
    - _Requirements: 13.4, 18.2_

  - [ ] 16.3 Crear componentes de búsqueda
    - Implementar SearchBar component con debounce
    - Crear FilterModal component para filtros avanzados
    - Implementar BarbershopCard con información de distancia
    - Agregar indicador de estado (abierta/cerrada)
    - _Requirements: 13.1, 13.2, 13.5_

- [ ] 17. Implementar historial de citas
  - [ ] 17.1 Crear HistoryScreen para clientes
    - Implementar src/screens/client/HistoryScreen.tsx
    - Mostrar lista de citas pasadas ordenadas por fecha descendente
    - Agregar filtros por estado y rango de fechas
    - Implementar búsqueda por barbería o barbero
    - _Requirements: 11.1, 11.2, 11.4_

  - [ ] 17.2 Agregar detalles en historial
    - Mostrar información completa de cada cita en el historial
    - Incluir fecha, barbero, servicio, precio, estado
    - Agregar notas del barbero si existen
    - Permitir ver perfil del barbero desde historial
    - _Requirements: 11.2, 11.3_

- [ ] 18. Implementar estadísticas y reportes
  - [ ] 18.1 Crear StatisticsService
    - Implementar src/services/statistics.service.ts
    - Crear función para calcular ingresos por período
    - Implementar cálculo de total de citas y tasa de cancelación
    - Agregar función para obtener clientes nuevos
    - Crear queries para top barberos
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 18.2 Crear componentes de gráficos
    - Implementar LineChart component para tendencias
    - Crear BarChart component para comparativas
    - Implementar PieChart component para distribución
    - Agregar StatCard component para métricas
    - _Requirements: 10.3_

  - [ ] 18.3 Integrar estadísticas en dashboards
    - Actualizar AdminDashboardScreen con gráficos
    - Implementar actualización en tiempo real de métricas
    - Agregar filtros por período en StatisticsScreen
    - Mostrar comparativas con períodos anteriores
    - _Requirements: 10.1, 10.3, 10.5_

- [ ] 19. Implementar preparación para pagos
  - [ ] 19.1 Agregar campos de pago en modelo de citas
    - Actualizar Appointment model con payment_status y payment_method
    - Agregar campo total_price con cálculo de impuestos
    - Crear estructura extensible para información de transacciones
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

  - [ ] 19.2 Implementar UI para gestión de pagos
    - Agregar selector de método de pago en BookAppointmentScreen
    - Mostrar estado de pago en AppointmentCard
    - Implementar filtro por estado de pago en dashboards
    - Agregar reporte de citas pagadas vs pendientes
    - _Requirements: 20.1, 20.2, 20.5_

- [ ] 20. Optimización de rendimiento
  - [ ] 20.1 Optimizar listas y renderizado
    - Implementar FlatList con windowSize optimizado en todas las listas
    - Agregar getItemLayout para listas de altura fija
    - Implementar removeClippedSubviews en listas largas
    - Agregar paginación para listas con más de 50 items
    - _Requirements: 19.2_

  - [ ] 20.2 Implementar lazy loading
    - Agregar lazy loading de screens con React.lazy
    - Implementar preload de screens frecuentes
    - Usar React.memo en componentes pesados
    - Optimizar re-renders con useMemo y useCallback
    - _Requirements: 19.3, 19.4_

  - [ ] 20.3 Optimizar caché y queries
    - Configurar staleTime y cacheTime apropiados en React Query
    - Implementar prefetching de datos críticos
    - Agregar optimistic updates para mejor UX
    - Configurar retry con backoff exponencial
    - _Requirements: 19.4_

  - [ ] 20.4 Optimizar bundle y assets
    - Configurar code splitting por rol de usuario
    - Minimizar dependencias no utilizadas
    - Optimizar imágenes y assets
    - Configurar Hermes engine
    - _Requirements: 19.5_

- [ ] 21. Configuración para producción
  - [ ] 21.1 Configurar app.json para producción
    - Completar configuración de app.json con todos los metadatos
    - Configurar splash screen y app icon
    - Agregar permisos necesarios para Android e iOS
    - Configurar plugins de Expo
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ] 21.2 Implementar política de privacidad
    - Crear PrivacyPolicyScreen con texto completo
    - Agregar enlace en configuración y registro
    - Implementar TermsOfServiceScreen
    - Agregar aceptación de términos en registro
    - _Requirements: 18.1, 18.5_

  - [ ] 21.3 Configurar variables de entorno
    - Crear archivos .env para development, staging y production
    - Configurar URLs de Supabase por ambiente
    - Agregar claves de API necesarias
    - Documentar variables requeridas
    - _Requirements: 1.4_

  - [ ] 21.4 Preparar para build
    - Configurar eas.json con perfiles de build
    - Crear scripts de build en package.json
    - Documentar proceso de build y deployment
    - Preparar assets para tiendas (screenshots, descripción)
    - _Requirements: 18.3, 18.4_

- [ ]* 22. Testing y calidad de código
  - [ ]* 22.1 Escribir tests unitarios
    - Crear tests para funciones de validación
    - Implementar tests para dateHelpers y formatters
    - Agregar tests para utilidades de disponibilidad
    - Alcanzar 80% de cobertura en utils
    - _Requirements: 17.1_

  - [ ]* 22.2 Escribir tests de integración
    - Crear tests para AuthService
    - Implementar tests para AppointmentService
    - Agregar tests para hooks personalizados
    - Alcanzar 70% de cobertura en services y hooks
    - _Requirements: 1.4, 6.1_

  - [ ]* 22.3 Configurar linting y formatting
    - Configurar ESLint con reglas estrictas
    - Agregar Prettier para formateo automático
    - Configurar pre-commit hooks con Husky
    - Agregar scripts de lint en package.json
    - _Requirements: 18.3_

  - [ ]* 22.4 Realizar testing manual
    - Probar en múltiples dispositivos Android
    - Probar en dispositivos iOS
    - Verificar temas claro y oscuro
    - Probar flujos sin conexión
    - Verificar notificaciones push
    - Probar todos los roles de usuario
    - _Requirements: 18.3, 18.4_

- [ ] 23. Documentación y entrega
  - [ ] 23.1 Crear README completo
    - Documentar requisitos del sistema
    - Agregar instrucciones de instalación
    - Documentar configuración de Supabase
    - Incluir guía de desarrollo
    - _Requirements: 18.3_

  - [ ] 23.2 Documentar arquitectura
    - Crear diagrama de arquitectura actualizado
    - Documentar estructura de carpetas
    - Explicar flujo de datos
    - Documentar decisiones técnicas importantes
    - _Requirements: 18.3_

  - [ ] 23.3 Crear guía de usuario
    - Documentar funcionalidades por rol
    - Agregar capturas de pantalla
    - Crear guía de troubleshooting
    - Documentar preguntas frecuentes
    - _Requirements: 18.3_

## Notes

- Cada tarea debe ser ejecutada en orden secuencial
- Las tareas marcadas con * son opcionales y se enfocan en testing y documentación
- Todas las tareas referencian requisitos específicos del documento de requirements.md
- El diseño completo está disponible en design.md para consulta durante la implementación
- Se recomienda hacer commits frecuentes después de completar cada tarea
- Probar cada funcionalidad inmediatamente después de implementarla

- [ ] 16. Implementar optimizaciones de rendimiento
  - [ ] 16.1 Optimizar listas con FlatList
    - Configurar windowSize óptimo en FlatLists
    - Implementar getItemLayout para listas de altura fija
    - Agregar removeClippedSubviews en listas largas
    - Implementar paginación para listas con más de 50 items
    - _Requirements: 19.2_

  - [ ] 16.2 Implementar lazy loading y code splitting
    - Configurar lazy loading de screens con React.lazy
    - Implementar preload de screens frecuentes
    - Usar React.memo en componentes que re-renderizan frecuentemente
    - _Requirements: 19.5_

  - [ ] 16.3 Configurar React Query para caché óptimo
    - Definir queryKeys structure en src/utils/queryKeys.ts
    - Configurar staleTime y cacheTime apropiados
    - Implementar invalidación de queries después de mutations
    - Agregar optimistic updates para mejor UX
    - _Requirements: 19.1_

  - [ ] 16.4 Implementar debounce en búsquedas
    - Agregar debounce de 300ms en SearchScreen
    - Implementar debounce en validaciones de formularios
    - Optimizar re-renders innecesarios
    - _Requirements: 19.4_

- [ ] 17. Implementar funcionalidades de preparación para pagos
  - [ ] 17.1 Agregar campos de pago en modelo de citas
    - Actualizar Appointment model con payment_status y payment_method
    - Agregar campo total_price calculado con impuestos
    - Crear estructura extensible para información de transacciones
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

  - [ ] 17.2 Implementar reporte de pagos en dashboard
    - Agregar sección de pagos en AdminDashboardScreen
    - Mostrar citas pagadas vs pendientes
    - Implementar filtros por método de pago
    - Calcular totales con impuestos configurables
    - _Requirements: 20.3, 20.5_

  - [ ] 17.3 Agregar selección de método de pago en citas
    - Actualizar BookAppointmentScreen para incluir método de pago
    - Mostrar total con impuestos antes de confirmar
    - Guardar método de pago seleccionado
    - _Requirements: 20.1, 20.3_

- [ ] 18. Configurar app para producción
  - [ ] 18.1 Configurar app.json para stores
    - Completar configuración de app.json con todos los metadatos
    - Configurar permisos necesarios (cámara, ubicación, notificaciones)
    - Agregar splash screen y iconos adaptativos
    - Configurar bundleIdentifier y package name
    - _Requirements: 18.2, 18.3, 18.4_

  - [ ] 18.2 Crear política de privacidad
    - Crear archivo de política de privacidad
    - Agregar pantalla PrivacyPolicyScreen accesible desde settings
    - Implementar aceptación de términos en registro
    - _Requirements: 18.1, 18.5_

  - [ ] 18.3 Configurar variables de entorno
    - Crear archivos .env para development, staging y production
    - Configurar URLs de Supabase por ambiente
    - Agregar configuración de API keys
    - Documentar variables necesarias en README
    - _Requirements: 1.4_

  - [ ] 18.4 Optimizar bundle y assets
    - Configurar Hermes engine para mejor rendimiento
    - Optimizar imágenes y assets
    - Implementar code splitting por rol
    - Configurar tree shaking
    - _Requirements: 19.5_

  - [ ] 18.5 Crear documentación del proyecto
    - Crear README.md con instrucciones de instalación y ejecución
    - Documentar estructura de carpetas
    - Agregar guía de contribución
    - Documentar scripts de base de datos
    - _Requirements: N/A_

- [ ]* 19. Testing y validación final
  - [ ]* 19.1 Escribir tests unitarios para utilidades
    - Crear tests para validation.ts
    - Crear tests para dateHelpers.ts
    - Crear tests para formatters.ts
    - Alcanzar 80% de cobertura en utilidades
    - _Requirements: 17.1_

  - [ ]* 19.2 Escribir tests de integración para servicios
    - Crear tests para AuthService
    - Crear tests para AppointmentService
    - Crear tests para hooks principales
    - Alcanzar 70% de cobertura en servicios
    - _Requirements: 1.4, 6.2_

  - [ ]* 19.3 Realizar testing manual en dispositivos
    - Probar en al menos 3 dispositivos Android de diferentes tamaños
    - Probar en al menos 2 dispositivos iOS
    - Verificar funcionamiento de temas claro y oscuro
    - Probar todos los flujos de cada rol
    - _Requirements: 18.3, 18.4, 16.1_

  - [ ]* 19.4 Validar cumplimiento de requisitos
    - Revisar que todos los requisitos estén implementados
    - Verificar políticas de privacidad y permisos
    - Validar manejo de errores en todos los flujos
    - Confirmar optimizaciones de rendimiento
    - _Requirements: 18.1, 18.5, 17.2, 19.1_

## Notas de Implementación

### Orden Recomendado
1. Comenzar con tareas 1-5 para establecer la base del proyecto
2. Continuar con tareas 6-7 para implementar la lógica de negocio core
3. Implementar pantallas por rol (tareas 8-11) de forma incremental
4. Agregar funcionalidades complementarias (tareas 12-15)
5. Optimizar y preparar para producción (tareas 16-18)
6. Testing y validación final (tarea 19 - opcional)

### Consideraciones Importantes
- Cada tarea debe probarse manualmente antes de continuar a la siguiente
- Mantener commits pequeños y descriptivos
- Consultar documentos de requisitos y diseño frecuentemente
- Las tareas marcadas con * son opcionales y se enfocan en testing
- Priorizar funcionalidad core sobre características secundarias

### Dependencias Críticas
- Supabase debe estar configurado antes de implementar servicios
- Sistema de autenticación debe funcionar antes de crear pantallas de roles
- Modelos de datos deben estar definidos antes de crear servicios
- Componentes base deben existir antes de crear pantallas complejas
