# Interfaz de Monitoreo de Subvenciones con n8n

Esta aplicación web proporciona una interfaz completa para monitorear y gestionar subvenciones utilizando workflows de n8n y almacenamiento en Supabase.

## Características Principales

### 🔍 **Monitoreo de Subvenciones**
- Dashboard principal con visualización de subvenciones disponibles
- Filtros avanzados por categoría, región, fecha límite y monto
- Búsqueda en tiempo real
- Estadísticas y métricas del dashboard

### 🔔 **Notificaciones en Tiempo Real**
- Centro de notificaciones con campana en el header
- Notificaciones automáticas para:
  - Nuevas subvenciones encontradas
  - Fechas límite próximas
  - Actualizaciones de workflows
- Gestión de notificaciones (marcar como leídas, dismissar)

### ⚙️ **Configuración de n8n**
- Panel de configuración para conectar con instancia de n8n
- Gestión de credenciales y endpoints
- Prueba de conexión

### 📊 **Dashboard de Workflows**
- Monitoreo del estado de workflows en tiempo real
- Métricas de ejecución y rendimiento
- Historial de ejecuciones
- Logs detallados

### 🔧 **Control de Workflows**
- Pausar/reanudar workflows
- Ejecutar workflows manualmente
- Configuración de parámetros

### 🗄️ **Gestión de Datos Supabase**
- Visualización de datos almacenados
- Filtros y búsqueda
- Exportación de datos

### 🤖 **Control de Prompts de IA**
- Configuración de prompts para evaluación de subvenciones
- Ajuste de parámetros de IA
- Pruebas de prompts

## Estructura de Componentes

### Componentes Principales

1. **Header**: Navegación principal con botones de acceso a todas las funcionalidades
2. **DashboardStats**: Estadísticas generales del sistema
3. **FilterSidebar**: Filtros laterales para subvenciones
4. **GrantCard**: Tarjetas individuales de subvenciones
5. **NotificationCenter**: Centro de notificaciones en tiempo real

### Modales y Paneles

1. **N8NConfigModal**: Configuración de conexión con n8n
2. **SupabaseDataModal**: Visualización de datos de Supabase
3. **AIPromptModal**: Configuración de prompts de IA
4. **WorkflowControlPanel**: Control de workflows
5. **WorkflowDashboard**: Dashboard de monitoreo
6. **AdvancedFilters**: Filtros avanzados

## Configuración Inicial

### 1. Configurar n8n
1. Abrir el modal de configuración de n8n (botón "⚙️ n8n Config")
2. Introducir la URL de tu instancia de n8n
3. Configurar las credenciales de acceso
4. Probar la conexión

### 2. Configurar Supabase
1. Asegurarse de que las credenciales de Supabase estén configuradas
2. Verificar la conexión en el modal de datos de Supabase

### 3. Configurar Workflows
1. Acceder al panel de control de workflows
2. Configurar los workflows necesarios para el monitoreo
3. Activar los workflows automáticos

## Uso de la Aplicación

### Dashboard Principal
- **Vista General**: El dashboard muestra todas las subvenciones disponibles
- **Filtros**: Utiliza la barra lateral para filtrar por diferentes criterios
- **Búsqueda**: Usa la barra de búsqueda en el header para encontrar subvenciones específicas
- **Estadísticas**: Las tarjetas superiores muestran métricas importantes

### Notificaciones
- **Campana de Notificaciones**: Haz clic en la campana del header para ver notificaciones
- **Tipos de Notificaciones**:
  - 🆕 Nuevas subvenciones (verde)
  - ⚠️ Fechas límite próximas (amarillo)
  - ⚙️ Actualizaciones de workflows (azul)
- **Gestión**: Puedes dismissar notificaciones individuales o marcar todas como leídas

### Filtros Avanzados
1. Haz clic en "🔍 Filtros" en el header
2. Configura filtros por:
   - Categorías específicas
   - Regiones geográficas
   - Rangos de fechas
   - Montos mínimos y máximos
3. Aplica los filtros para refinar los resultados

### Monitoreo de Workflows
1. Accede al "📊 Dashboard" para ver métricas en tiempo real
2. Usa "🔧 Workflows" para controlar la ejecución
3. Revisa logs y historial de ejecuciones

## Arquitectura Técnica

### Frontend
- **React**: Componentes funcionales con hooks
- **Tailwind CSS**: Estilos y diseño responsivo
- **Estado Local**: Gestión con useState y useEffect

### Integración n8n
- **API REST**: Comunicación con workflows de n8n
- **Webhooks**: Recepción de datos en tiempo real
- **Autenticación**: Gestión segura de credenciales

### Base de Datos
- **Supabase**: Almacenamiento de subvenciones y configuraciones
- **Tiempo Real**: Actualizaciones automáticas de datos

## Flujo de Datos

1. **Recolección**: Los workflows de n8n recopilan datos de fuentes externas
2. **Procesamiento**: Los datos se procesan y evalúan con IA
3. **Almacenamiento**: Se guardan en Supabase
4. **Notificación**: Se generan notificaciones para nuevas subvenciones
5. **Visualización**: Los datos se muestran en la interfaz web

## Personalización

### Añadir Nuevos Filtros
1. Modifica el componente `AdvancedFilters`
2. Actualiza la lógica de filtrado en `handleFilterChange`
3. Añade los nuevos campos al estado `currentFilters`

### Personalizar Notificaciones
1. Modifica los tipos de notificación en el estado `notifications`
2. Actualiza la lógica de generación automática en el `useEffect`
3. Personaliza los estilos en el componente `NotificationCenter`

### Añadir Nuevas Métricas
1. Actualiza el componente `DashboardStats`
2. Añade nuevos cálculos basados en los datos de subvenciones
3. Integra con los workflows de n8n para métricas en tiempo real

## Solución de Problemas

### Problemas de Conexión
- Verificar que n8n esté ejecutándose y accesible
- Comprobar las credenciales de Supabase
- Revisar la configuración de CORS si es necesario

### Notificaciones No Aparecen
- Verificar que los workflows estén activos
- Comprobar la conexión con Supabase
- Revisar los logs del navegador para errores

### Filtros No Funcionan
- Verificar que los datos tengan los campos esperados
- Comprobar la lógica de filtrado en `handleFilterChange`
- Revisar la estructura de datos en Supabase

## Desarrollo Futuro

### Mejoras Planificadas
- Autenticación de usuarios
- Roles y permisos
- Exportación de datos en múltiples formatos
- Integración con calendarios
- Alertas por email/SMS
- Dashboard personalizable
- API pública para integraciones

### Contribuir
Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Añade tests si es necesario
5. Crea un pull request

## Soporte

Para soporte técnico o preguntas:
- Revisa la documentación de n8n: https://docs.n8n.io/
- Consulta la documentación de Supabase: https://supabase.com/docs
- Abre un issue en el repositorio del proyecto

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025