# Integración Pendiente: n8n y Supabase

Este documento detalla los pasos necesarios para completar la integración real con n8n y Supabase en la aplicación de monitoreo de subvenciones.

## 🔧 Estado Actual de la Integración

### ✅ **Implementado (Simulado)**
- Interfaz completa de usuario
- Componentes de configuración para n8n y Supabase
- Servicios con estructura de API completa
- Manejo de errores y estados de carga
- Notificaciones en tiempo real (simuladas)
- Dashboard de workflows (con datos mock)

### ❌ **Pendiente (Integración Real)**
- Configuración real de credenciales
- Conexión efectiva con APIs
- Webhooks funcionales
- Sincronización de datos en tiempo real
- Autenticación y autorización

## 🚀 Pasos para Completar la Integración

### 1. **Configuración de n8n**

#### 1.1 Instalación y Configuración de n8n
```bash
# Instalar n8n globalmente
npm install n8n -g

# O usar Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

#### 1.2 Configurar API Key
1. Acceder a n8n en `http://localhost:5678`
2. Ir a Settings > API
3. Generar una nueva API Key
4. Actualizar en el archivo `index.html`:

```javascript
const N8N_CONFIG = {
    baseUrl: 'http://localhost:5678', // ✅ Ya configurado
    webhookUrl: 'http://localhost:5678/webhook/boe-search', // ❌ Crear webhook
    apiKey: 'TU_API_KEY_AQUI', // ❌ Configurar API key real
};
```

#### 1.3 Crear Workflows Necesarios

**Workflow 1: Búsqueda de Subvenciones BOE**
- Trigger: Webhook (`/webhook/boe-search`)
- Nodos:
  - HTTP Request para scraping BOE
  - Procesamiento de datos
  - Evaluación con IA (OpenAI/Claude)
  - Inserción en Supabase
  - Notificación

**Workflow 2: Monitoreo Automático**
- Trigger: Cron (cada hora/día)
- Funcionalidad: Búsqueda automática de nuevas subvenciones

**Workflow 3: Evaluación con IA**
- Trigger: Webhook
- Funcionalidad: Evaluar relevancia de subvenciones

### 2. **Configuración de Supabase**

#### 2.1 Crear Proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Obtener URL y API keys

#### 2.2 Configurar Credenciales
Actualizar en `index.html`:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co', // ❌ URL real del proyecto
    anonKey: 'tu-clave-anonima-real', // ❌ Clave anónima real
    tableName: 'subvenciones_wavext' // ✅ Ya configurado
};
```

#### 2.3 Crear Estructura de Base de Datos

**Tabla: `subvenciones_wavext`**
```sql
CREATE TABLE subvenciones_wavext (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL,
    url TEXT,
    deadline DATE,
    amount_min DECIMAL,
    amount_max DECIMAL,
    location TEXT[],
    sectors TEXT[],
    company_types TEXT[],
    ai_score DECIMAL,
    ai_evaluation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tabla: `workflow_executions`**
```sql
CREATE TABLE workflow_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success', 'error', 'running'
    duration DECIMAL,
    items_processed INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tabla: `notifications`**
```sql
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'new_grant', 'deadline_warning', 'workflow_status'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    user_id UUID, -- Para futuro sistema de usuarios
    related_grant_id UUID REFERENCES subvenciones_wavext(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.4 Configurar Row Level Security (RLS)
```sql
-- Habilitar RLS
ALTER TABLE subvenciones_wavext ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
CREATE POLICY "Allow read access" ON subvenciones_wavext FOR SELECT USING (true);
CREATE POLICY "Allow insert access" ON subvenciones_wavext FOR INSERT WITH CHECK (true);
```

### 3. **Modificaciones de Código Necesarias**

#### 3.1 Actualizar Servicio de n8n

**Función `triggerWorkflow` - Hacer llamada real:**
```javascript
async triggerWorkflow(searchParams) {
    try {
        // ❌ Verificar que N8N_CONFIG.apiKey esté configurado
        if (!N8N_CONFIG.apiKey) {
            throw new Error('API Key de n8n no configurada');
        }
        
        const response = await fetch(N8N_CONFIG.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': N8N_CONFIG.apiKey // ❌ Añadir autenticación
            },
            body: JSON.stringify(searchParams)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error triggering n8n workflow:', error);
        throw error;
    }
}
```

#### 3.2 Actualizar Servicio de Supabase

**Instalar cliente de Supabase:**
```html
<!-- Añadir antes del script principal -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

**Inicializar cliente:**
```javascript
// ❌ Reemplazar configuración mock
const supabaseClient = supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

const supabaseService = {
    async getGrants(filters = {}) {
        try {
            let query = supabaseClient
                .from(SUPABASE_CONFIG.tableName)
                .select('*');
            
            // Aplicar filtros
            if (filters.dateFrom) {
                query = query.gte('deadline', filters.dateFrom);
            }
            if (filters.dateTo) {
                query = query.lte('deadline', filters.dateTo);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching grants from Supabase:', error);
            throw error;
        }
    },
    
    async insertGrant(grantData) {
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.tableName)
                .insert([grantData])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error inserting grant to Supabase:', error);
            throw error;
        }
    }
};
```

### 4. **Configurar Webhooks y Tiempo Real**

#### 4.1 Webhook de n8n para Notificaciones
Crear endpoint en n8n que envíe notificaciones a la aplicación:

```javascript
// ❌ Implementar en la aplicación
const setupWebhookListener = () => {
    // Escuchar cambios en tiempo real de Supabase
    const subscription = supabaseClient
        .channel('subvenciones_changes')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'subvenciones_wavext' },
            (payload) => {
                // Crear notificación automática
                const newNotification = {
                    id: Date.now(),
                    type: 'new_grant',
                    title: 'Nueva subvención encontrada',
                    message: `Se ha encontrado: ${payload.new.title}`,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                
                setNotifications(prev => [newNotification, ...prev]);
            }
        )
        .subscribe();
    
    return () => subscription.unsubscribe();
};
```

### 5. **Testing y Validación**

#### 5.1 Tests de Conexión
```javascript
// ❌ Implementar funciones de test
const testConnections = async () => {
    try {
        // Test n8n
        const n8nResponse = await fetch(`${N8N_CONFIG.baseUrl}/healthz`);
        console.log('n8n Status:', n8nResponse.ok ? 'OK' : 'ERROR');
        
        // Test Supabase
        const { data, error } = await supabaseClient
            .from('subvenciones_wavext')
            .select('count')
            .limit(1);
        console.log('Supabase Status:', error ? 'ERROR' : 'OK');
        
    } catch (error) {
        console.error('Connection test failed:', error);
    }
};
```

### 6. **Configuración de Producción**

#### 6.1 Variables de Entorno
Crear archivo `.env` (no incluir en git):
```env
N8N_BASE_URL=https://tu-n8n-instance.com
N8N_API_KEY=tu-api-key-segura
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima
```

#### 6.2 Seguridad
- Configurar CORS en n8n
- Implementar autenticación de usuarios
- Configurar RLS en Supabase
- Usar HTTPS en producción

## 📋 Checklist de Integración

### n8n
- [ ] Instalar y configurar n8n
- [ ] Generar API Key
- [ ] Crear workflow de búsqueda BOE
- [ ] Crear workflow de monitoreo automático
- [ ] Configurar webhooks
- [ ] Probar ejecución de workflows

### Supabase
- [ ] Crear proyecto en Supabase
- [ ] Configurar base de datos
- [ ] Crear tablas necesarias
- [ ] Configurar RLS
- [ ] Obtener credenciales
- [ ] Probar conexión

### Código
- [ ] Actualizar configuraciones con credenciales reales
- [ ] Implementar cliente de Supabase
- [ ] Añadir manejo de errores robusto
- [ ] Configurar subscripciones en tiempo real
- [ ] Implementar tests de conexión
- [ ] Añadir logging detallado

### Testing
- [ ] Probar flujo completo de búsqueda
- [ ] Verificar inserción de datos
- [ ] Comprobar notificaciones en tiempo real
- [ ] Validar dashboard de workflows
- [ ] Probar manejo de errores

## 🔍 Próximos Pasos Recomendados

1. **Configurar n8n localmente** y crear el workflow básico
2. **Configurar Supabase** y crear las tablas
3. **Actualizar credenciales** en el código
4. **Probar conexiones** básicas
5. **Implementar flujo completo** paso a paso
6. **Añadir monitoreo** y logging
7. **Preparar para producción**

## 💡 Consideraciones Adicionales

- **Escalabilidad**: Considerar rate limiting y caching
- **Monitoreo**: Implementar alertas para fallos de workflows
- **Backup**: Configurar respaldos automáticos de Supabase
- **Documentación**: Mantener documentación de workflows actualizada
- **Seguridad**: Revisar periódicamente permisos y accesos

---

**Nota**: Este documento debe actualizarse conforme se vayan completando las integraciones.