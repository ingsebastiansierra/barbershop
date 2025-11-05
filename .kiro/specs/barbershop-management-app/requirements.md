# Requirements Document

## Introduction

Este documento define los requisitos para una aplicación móvil multiplataforma de gestión de barberías construida con React Native y Expo SDK 54. El sistema permitirá la administración de múltiples barberías dentro de una plataforma unificada, con roles diferenciados para súper administradores, administradores de barbería, barberos y clientes. La aplicación incluirá funcionalidades de autenticación, agendamiento de citas, gestión de servicios, perfiles de usuario, notificaciones y dashboards con estadísticas en tiempo real.

## Glossary

- **Sistema**: La aplicación móvil completa de gestión de barberías
- **Supabase**: Plataforma backend que proporciona autenticación, base de datos PostgreSQL y almacenamiento
- **Usuario**: Cualquier persona que utiliza el Sistema
- **Súper Administrador**: Usuario con acceso total a todas las funcionalidades del Sistema
- **Administrador de Barbería**: Usuario que gestiona una barbería específica
- **Barbero**: Usuario que proporciona servicios en una barbería
- **Cliente**: Usuario que agenda y recibe servicios
- **Cita**: Reserva de un servicio con un barbero en una fecha y hora específica
- **Servicio**: Tratamiento ofrecido por una barbería (corte, barba, cejas, etc.)
- **Barbería**: Establecimiento registrado en el Sistema
- **Sesión**: Período de tiempo durante el cual un Usuario está autenticado
- **Rol**: Conjunto de permisos asignados a un Usuario
- **Estado de Cita**: Clasificación del progreso de una Cita (pendiente, confirmada, realizada, cancelada)
- **Horario**: Rango de tiempo en el que un Barbero está disponible
- **Lista de Espera**: Cola de Clientes esperando disponibilidad para un servicio

## Requirements

### Requirement 1: Autenticación de Usuarios

**User Story:** Como Usuario, quiero registrarme e iniciar sesión de forma segura, para que pueda acceder a las funcionalidades del Sistema según mi rol.

#### Acceptance Criteria

1. THE Sistema SHALL proporcionar una pantalla de registro que capture email y contraseña del Usuario
2. WHEN un Usuario completa el registro, THE Sistema SHALL enviar un email de verificación a través de Supabase Auth
3. THE Sistema SHALL validar que la contraseña contenga al menos 8 caracteres, una mayúscula, una minúscula y un número
4. WHEN un Usuario ingresa credenciales válidas, THE Sistema SHALL autenticar al Usuario mediante Supabase Auth y crear una Sesión
5. WHEN un Usuario cierra sesión, THE Sistema SHALL invalidar la Sesión actual y redirigir a la pantalla de login
6. THE Sistema SHALL mantener la Sesión activa hasta que el Usuario cierre sesión explícitamente o el token expire

### Requirement 2: Gestión de Roles y Permisos

**User Story:** Como Súper Administrador, quiero asignar roles específicos a los usuarios, para que cada uno tenga acceso únicamente a las funcionalidades correspondientes a su rol.

#### Acceptance Criteria

1. THE Sistema SHALL soportar cuatro roles: Súper Administrador, Administrador de Barbería, Barbero y Cliente
2. WHEN un Usuario inicia sesión, THE Sistema SHALL cargar los permisos asociados a su Rol desde la base de datos
3. THE Sistema SHALL restringir el acceso a pantallas y funcionalidades basándose en el Rol del Usuario autenticado
4. WHEN un Súper Administrador asigna un Rol a un Usuario, THE Sistema SHALL actualizar los permisos en la base de datos inmediatamente
5. THE Sistema SHALL permitir que un Súper Administrador acceda a todas las Barberías y funcionalidades del Sistema

### Requirement 3: Gestión de Barberías

**User Story:** Como Súper Administrador, quiero crear y gestionar múltiples barberías en el sistema, para que pueda expandir la plataforma a diferentes ubicaciones.

#### Acceptance Criteria

1. THE Sistema SHALL proporcionar una interfaz para crear una nueva Barbería con nombre, dirección, teléfono, logo y horarios
2. WHEN un Súper Administrador crea una Barbería, THE Sistema SHALL almacenar la información en Supabase PostgreSQL
3. THE Sistema SHALL permitir subir y almacenar el logo de la Barbería en Supabase Storage
4. WHEN un Administrador de Barbería inicia sesión, THE Sistema SHALL mostrar únicamente la información de su Barbería asignada
5. THE Sistema SHALL permitir que un Súper Administrador edite o desactive cualquier Barbería

### Requirement 4: Gestión de Servicios

**User Story:** Como Administrador de Barbería, quiero crear y gestionar los servicios ofrecidos, para que los clientes puedan seleccionarlos al agendar citas.

#### Acceptance Criteria

1. THE Sistema SHALL permitir crear servicios con nombre, descripción, duración y precio
2. WHEN un Administrador de Barbería crea un Servicio, THE Sistema SHALL asociarlo a su Barbería específica
3. THE Sistema SHALL permitir crear combos que incluyan múltiples Servicios con precio especial
4. THE Sistema SHALL validar que la duración del Servicio sea un múltiplo de 15 minutos
5. WHEN un Administrador de Barbería desactiva un Servicio, THE Sistema SHALL ocultarlo de la lista de servicios disponibles para nuevas Citas

### Requirement 5: Gestión de Barberos

**User Story:** Como Administrador de Barbería, quiero gestionar los barberos de mi establecimiento, para que puedan atender citas y los clientes puedan seleccionarlos.

#### Acceptance Criteria

1. THE Sistema SHALL permitir que un Administrador de Barbería registre nuevos Barberos con nombre, foto, especialidades y horarios
2. WHEN un Administrador de Barbería asigna un Barbero a su Barbería, THE Sistema SHALL crear un Usuario con Rol de Barbero
3. THE Sistema SHALL permitir subir y almacenar la foto del Barbero en Supabase Storage
4. THE Sistema SHALL permitir que un Administrador de Barbería configure los Horarios semanales de cada Barbero
5. WHEN un Barbero es desactivado, THE Sistema SHALL cancelar todas sus Citas futuras y notificar a los Clientes afectados

### Requirement 6: Agendamiento de Citas

**User Story:** Como Cliente, quiero agendar citas con barberos disponibles, para que pueda recibir servicios en el horario que me convenga.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar un calendario con la disponibilidad de cada Barbero basado en sus Horarios y Citas existentes
2. WHEN un Cliente selecciona un Servicio, fecha y Barbero, THE Sistema SHALL validar que el horario esté disponible antes de crear la Cita
3. THE Sistema SHALL crear la Cita con Estado "pendiente" y almacenarla en Supabase PostgreSQL
4. THE Sistema SHALL enviar una notificación al Barbero cuando se crea una nueva Cita
5. THE Sistema SHALL prevenir la creación de Citas que se solapen con Citas existentes del mismo Barbero
6. WHEN un Cliente intenta agendar fuera del Horario del Barbero, THE Sistema SHALL mostrar un mensaje de error y sugerir horarios disponibles

### Requirement 7: Gestión de Estados de Citas

**User Story:** Como Barbero, quiero actualizar el estado de mis citas, para que el sistema refleje el progreso de cada servicio.

#### Acceptance Criteria

1. THE Sistema SHALL permitir que un Barbero cambie el Estado de Cita entre "pendiente", "confirmada", "realizada" y "cancelada"
2. WHEN un Barbero marca una Cita como "confirmada", THE Sistema SHALL enviar una notificación al Cliente
3. WHEN una Cita es marcada como "realizada", THE Sistema SHALL registrar la fecha y hora de finalización
4. WHEN una Cita es cancelada con menos de 2 horas de anticipación, THE Sistema SHALL registrar la cancelación tardía
5. THE Sistema SHALL permitir que un Administrador de Barbería o Súper Administrador modifique el Estado de cualquier Cita

### Requirement 8: Lista de Espera

**User Story:** Como Cliente, quiero unirme a una lista de espera cuando no hay disponibilidad, para que pueda ser notificado si se libera un horario.

#### Acceptance Criteria

1. WHEN un Cliente intenta agendar y no hay disponibilidad, THE Sistema SHALL ofrecer la opción de unirse a la Lista de Espera
2. THE Sistema SHALL almacenar las solicitudes de Lista de Espera con fecha, hora preferida, Servicio y Barbero
3. WHEN una Cita es cancelada, THE Sistema SHALL notificar automáticamente al primer Cliente en la Lista de Espera
4. THE Sistema SHALL dar al Cliente notificado 30 minutos para confirmar antes de notificar al siguiente en la Lista de Espera
5. WHEN un Cliente confirma desde la Lista de Espera, THE Sistema SHALL crear la Cita y removerlo de la lista

### Requirement 9: Perfiles de Usuario

**User Story:** Como Usuario, quiero gestionar mi perfil personal, para que mi información esté actualizada en el sistema.

#### Acceptance Criteria

1. THE Sistema SHALL proporcionar una pantalla de perfil donde el Usuario pueda editar nombre, teléfono, email y foto
2. WHEN un Usuario actualiza su foto de perfil, THE Sistema SHALL almacenarla en Supabase Storage
3. THE Sistema SHALL validar el formato del email y número de teléfono antes de guardar cambios
4. WHEN un Barbero actualiza su perfil, THE Sistema SHALL permitir editar especialidades y descripción personal
5. THE Sistema SHALL permitir que un Usuario cambie su contraseña mediante verificación de la contraseña actual

### Requirement 10: Dashboard de Estadísticas

**User Story:** Como Administrador de Barbería, quiero ver estadísticas de mi negocio, para que pueda tomar decisiones informadas sobre la operación.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar un dashboard con total de Citas, ingresos, Clientes nuevos y tasa de cancelación del mes actual
2. THE Sistema SHALL calcular los ingresos sumando el precio de todas las Citas con Estado "realizada"
3. THE Sistema SHALL mostrar gráficos de tendencias de Citas e ingresos de los últimos 6 meses
4. WHEN un Súper Administrador accede al dashboard, THE Sistema SHALL mostrar estadísticas consolidadas de todas las Barberías
5. THE Sistema SHALL actualizar las estadísticas en tiempo real cuando se completan o cancelan Citas

### Requirement 11: Historial de Citas

**User Story:** Como Cliente, quiero ver el historial de mis citas pasadas, para que pueda revisar los servicios que he recibido.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar una lista de todas las Citas del Cliente ordenadas por fecha descendente
2. THE Sistema SHALL incluir en cada entrada del historial: fecha, Barbero, Servicio, precio y Estado
3. WHEN un Cliente selecciona una Cita del historial, THE Sistema SHALL mostrar los detalles completos incluyendo notas del Barbero
4. THE Sistema SHALL permitir que un Cliente filtre su historial por Estado de Cita o rango de fechas
5. WHEN un Barbero accede a su historial, THE Sistema SHALL mostrar todas las Citas que ha atendido

### Requirement 12: Sistema de Notificaciones

**User Story:** Como Usuario, quiero recibir notificaciones sobre eventos importantes, para que esté informado sobre cambios en mis citas y actividades.

#### Acceptance Criteria

1. THE Sistema SHALL enviar notificaciones push cuando se crea, confirma, modifica o cancela una Cita
2. THE Sistema SHALL enviar un recordatorio al Cliente 24 horas antes de su Cita
3. THE Sistema SHALL enviar un recordatorio al Barbero 1 hora antes de cada Cita
4. THE Sistema SHALL mantener un historial de notificaciones accesible desde una pantalla dedicada
5. THE Sistema SHALL permitir que el Usuario configure qué tipos de notificaciones desea recibir

### Requirement 13: Búsqueda de Barberías

**User Story:** Como Cliente, quiero buscar barberías cercanas, para que pueda encontrar opciones convenientes para agendar servicios.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar una lista de todas las Barberías activas con nombre, dirección, foto y calificación
2. THE Sistema SHALL permitir filtrar Barberías por nombre o ubicación
3. WHEN un Cliente selecciona una Barbería, THE Sistema SHALL mostrar sus Servicios, Barberos y horarios de atención
4. THE Sistema SHALL ordenar los resultados de búsqueda por distancia cuando el Cliente otorgue permisos de ubicación
5. THE Sistema SHALL mostrar el estado de disponibilidad de cada Barbería (abierta/cerrada) basado en el horario actual

### Requirement 14: Gestión de Horarios

**User Story:** Como Administrador de Barbería, quiero configurar los horarios de operación y de cada barbero, para que el sistema refleje la disponibilidad real.

#### Acceptance Criteria

1. THE Sistema SHALL permitir configurar horarios de apertura y cierre para cada día de la semana por Barbería
2. THE Sistema SHALL permitir que un Administrador de Barbería configure Horarios individuales para cada Barbero
3. THE Sistema SHALL validar que los Horarios del Barbero estén dentro de los Horarios de la Barbería
4. WHEN un Administrador de Barbería modifica un Horario, THE Sistema SHALL actualizar la disponibilidad en el calendario inmediatamente
5. THE Sistema SHALL permitir configurar días festivos o cierres especiales que bloqueen la agenda

### Requirement 15: Almacenamiento de Imágenes

**User Story:** Como Usuario, quiero subir imágenes de perfil y logos, para que mi perfil o barbería tenga una presentación visual profesional.

#### Acceptance Criteria

1. THE Sistema SHALL permitir subir imágenes en formatos JPG, PNG y WEBP con tamaño máximo de 5MB
2. WHEN un Usuario sube una imagen, THE Sistema SHALL comprimirla automáticamente antes de almacenarla en Supabase Storage
3. THE Sistema SHALL generar URLs públicas para las imágenes almacenadas
4. THE Sistema SHALL validar las dimensiones mínimas de 200x200 píxeles para fotos de perfil
5. WHEN una imagen es reemplazada, THE Sistema SHALL eliminar la imagen anterior de Supabase Storage

### Requirement 16: Diseño Responsivo y Temas

**User Story:** Como Usuario, quiero una interfaz moderna y adaptable, para que pueda usar la aplicación cómodamente en cualquier dispositivo y condición de luz.

#### Acceptance Criteria

1. THE Sistema SHALL implementar un diseño responsivo que se adapte a diferentes tamaños de pantalla
2. THE Sistema SHALL proporcionar temas claro y oscuro que el Usuario pueda alternar
3. THE Sistema SHALL persistir la preferencia de tema del Usuario en AsyncStorage
4. THE Sistema SHALL utilizar componentes reutilizables con estilos consistentes en toda la aplicación
5. THE Sistema SHALL implementar animaciones suaves con duración máxima de 300ms para transiciones

### Requirement 17: Validación y Manejo de Errores

**User Story:** Como Usuario, quiero recibir mensajes claros cuando algo sale mal, para que pueda entender y corregir errores fácilmente.

#### Acceptance Criteria

1. THE Sistema SHALL validar todos los campos de formulario antes de enviar datos al servidor
2. WHEN ocurre un error de red, THE Sistema SHALL mostrar un mensaje descriptivo y ofrecer reintentar la operación
3. THE Sistema SHALL mostrar mensajes de error en español con lenguaje claro y no técnico
4. THE Sistema SHALL registrar errores críticos para análisis posterior sin exponer información sensible al Usuario
5. WHEN un Usuario pierde conexión durante una operación, THE Sistema SHALL guardar el estado localmente y sincronizar cuando se recupere la conexión

### Requirement 18: Compatibilidad con Tiendas de Aplicaciones

**User Story:** Como Súper Administrador, quiero que la aplicación cumpla con las políticas de las tiendas, para que pueda ser publicada en Google Play Store y Apple App Store.

#### Acceptance Criteria

1. THE Sistema SHALL implementar una política de privacidad accesible desde la pantalla de configuración
2. THE Sistema SHALL solicitar permisos de ubicación, cámara y notificaciones con explicaciones claras
3. THE Sistema SHALL cumplir con las directrices de diseño de Material Design para Android
4. THE Sistema SHALL cumplir con las Human Interface Guidelines de Apple para iOS
5. THE Sistema SHALL implementar manejo seguro de datos personales conforme a GDPR y regulaciones locales

### Requirement 19: Optimización de Rendimiento

**User Story:** Como Usuario, quiero que la aplicación sea rápida y fluida, para que pueda completar mis tareas sin demoras ni interrupciones.

#### Acceptance Criteria

1. THE Sistema SHALL cargar la pantalla principal en menos de 2 segundos después de la autenticación
2. THE Sistema SHALL implementar paginación para listas con más de 20 elementos
3. THE Sistema SHALL cachear imágenes descargadas para reducir el uso de datos
4. THE Sistema SHALL implementar lazy loading para componentes pesados
5. THE Sistema SHALL mantener una tasa de frames por segundo superior a 50 FPS durante animaciones

### Requirement 20: Preparación para Integraciones de Pago

**User Story:** Como Administrador de Barbería, quiero que el sistema esté preparado para integrar pasarelas de pago, para que en el futuro pueda procesar pagos en línea.

#### Acceptance Criteria

1. THE Sistema SHALL incluir un campo de método de pago en el modelo de Cita (efectivo, tarjeta, transferencia)
2. THE Sistema SHALL almacenar el estado de pago de cada Cita (pendiente, pagado, reembolsado)
3. THE Sistema SHALL calcular el total de cada Cita incluyendo impuestos configurables por Barbería
4. THE Sistema SHALL proporcionar una estructura de datos extensible para agregar información de transacciones
5. THE Sistema SHALL incluir en el dashboard un reporte de Citas pagadas vs pendientes de pago
