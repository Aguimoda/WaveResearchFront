-- Esquema de Base de Datos para SubvencionesAI
-- Supabase PostgreSQL Schema

-- Tabla principal de subvenciones
CREATE TABLE grants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    source VARCHAR(100) NOT NULL, -- 'BOE', 'EUROPA', 'CDTI', 'REGIONAL'
    source_url VARCHAR(1000),
    source_id VARCHAR(200), -- ID original en la fuente
    
    -- Información financiera
    amount_min DECIMAL(15,2),
    amount_max DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Información temporal
    publication_date DATE,
    deadline_date DATE,
    start_date DATE,
    end_date DATE,
    
    -- Clasificación
    sector VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Información geográfica
    geographic_scope VARCHAR(50), -- 'NACIONAL', 'REGIONAL', 'PROVINCIAL', 'LOCAL', 'EUROPEO'
    regions TEXT[], -- Array de regiones aplicables
    provinces TEXT[], -- Array de provincias aplicables
    municipalities TEXT[], -- Array de municipios aplicables
    
    -- Criterios de elegibilidad
    target_company_size VARCHAR(50), -- 'MICRO', 'PEQUEÑA', 'MEDIANA', 'GRANDE', 'TODAS'
    target_sectors TEXT[], -- Array de sectores objetivo
    requirements TEXT,
    exclusions TEXT,
    
    -- Scoring y evaluación
    relevance_score DECIMAL(3,2), -- 0.00 a 10.00
    urgency_score DECIMAL(3,2), -- 0.00 a 10.00
    feasibility_score DECIMAL(3,2), -- 0.00 a 10.00
    overall_score DECIMAL(3,2), -- 0.00 a 10.00
    
    -- Metadatos
    keywords TEXT[], -- Array de palabras clave extraídas
    language VARCHAR(5) DEFAULT 'es',
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'DRAFT', 'CANCELLED'
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by VARCHAR(100) -- ID del workflow que procesó
);

-- Tabla de perfiles de usuario/empresa
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL, -- ID del usuario en el sistema de auth
    company_name VARCHAR(200),
    
    -- Información de la empresa
    company_size VARCHAR(20), -- 'MICRO', 'PEQUEÑA', 'MEDIANA', 'GRANDE'
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    founding_year INTEGER,
    
    -- Ubicación
    country VARCHAR(50) DEFAULT 'España',
    region VARCHAR(100),
    province VARCHAR(100),
    municipality VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Sectores de interés
    primary_sector VARCHAR(100),
    secondary_sectors TEXT[],
    
    -- Preferencias de búsqueda
    keywords_of_interest TEXT[],
    excluded_keywords TEXT[],
    min_grant_amount DECIMAL(15,2),
    max_grant_amount DECIMAL(15,2),
    preferred_regions TEXT[],
    
    -- Configuración de notificaciones
    notification_frequency VARCHAR(20) DEFAULT 'DAILY', -- 'REAL_TIME', 'DAILY', 'WEEKLY'
    notification_email VARCHAR(200),
    notification_enabled BOOLEAN DEFAULT true,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de búsquedas guardadas
CREATE TABLE saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Criterios de búsqueda
    search_criteria JSONB NOT NULL,
    
    -- Configuración
    is_active BOOLEAN DEFAULT true,
    auto_execute BOOLEAN DEFAULT false,
    execution_frequency VARCHAR(20), -- 'HOURLY', 'DAILY', 'WEEKLY'
    last_executed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alertas y notificaciones
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
    
    -- Contenido de la notificación
    type VARCHAR(50) NOT NULL, -- 'NEW_GRANT', 'DEADLINE_REMINDER', 'SCORE_UPDATE'
    title VARCHAR(200) NOT NULL,
    message TEXT,
    
    -- Estado
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de ejecuciones de workflows
CREATE TABLE workflow_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id VARCHAR(100) NOT NULL,
    workflow_name VARCHAR(200),
    
    -- Parámetros de entrada
    input_parameters JSONB,
    
    -- Resultados
    status VARCHAR(20) NOT NULL, -- 'RUNNING', 'SUCCESS', 'ERROR', 'CANCELLED'
    grants_found INTEGER DEFAULT 0,
    grants_processed INTEGER DEFAULT 0,
    grants_stored INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    
    -- Metadatos
    triggered_by VARCHAR(100), -- 'USER', 'SCHEDULE', 'WEBHOOK'
    n8n_execution_id VARCHAR(100)
);

-- Tabla de métricas de rendimiento
CREATE TABLE performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4),
    metric_unit VARCHAR(20),
    
    -- Contexto
    workflow_execution_id UUID REFERENCES workflow_executions(id),
    source VARCHAR(50), -- 'BOE', 'EUROPA', 'CDTI', etc.
    
    -- Timestamp
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_grants_source ON grants(source);
CREATE INDEX idx_grants_deadline ON grants(deadline_date);
CREATE INDEX idx_grants_score ON grants(overall_score DESC);
CREATE INDEX idx_grants_status ON grants(status);
CREATE INDEX idx_grants_regions ON grants USING GIN(regions);
CREATE INDEX idx_grants_sectors ON grants USING GIN(target_sectors);
CREATE INDEX idx_grants_keywords ON grants USING GIN(keywords);
CREATE INDEX idx_grants_created_at ON grants(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_profile_id);
CREATE INDEX idx_notifications_unread ON notifications(user_profile_id, is_read) WHERE is_read = false;

CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_started ON workflow_executions(started_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON grants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular urgency_score basado en deadline
CREATE OR REPLACE FUNCTION calculate_urgency_score(deadline_date DATE)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    days_remaining INTEGER;
    urgency_score DECIMAL(3,2);
BEGIN
    IF deadline_date IS NULL THEN
        RETURN 5.00; -- Score neutro si no hay deadline
    END IF;
    
    days_remaining := deadline_date - CURRENT_DATE;
    
    CASE
        WHEN days_remaining <= 0 THEN urgency_score := 0.00; -- Expirado
        WHEN days_remaining <= 7 THEN urgency_score := 10.00; -- Muy urgente
        WHEN days_remaining <= 30 THEN urgency_score := 8.00; -- Urgente
        WHEN days_remaining <= 60 THEN urgency_score := 6.00; -- Moderado
        WHEN days_remaining <= 90 THEN urgency_score := 4.00; -- Bajo
        ELSE urgency_score := 2.00; -- Muy bajo
    END CASE;
    
    RETURN urgency_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular urgency_score automáticamente
CREATE OR REPLACE FUNCTION update_urgency_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.urgency_score := calculate_urgency_score(NEW.deadline_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_grants_urgency BEFORE INSERT OR UPDATE ON grants
    FOR EACH ROW EXECUTE FUNCTION update_urgency_score();

-- Vista para grants activos con scoring
CREATE VIEW active_grants_with_scores AS
SELECT 
    g.*,
    CASE 
        WHEN g.deadline_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'CRÍTICA'
        WHEN g.deadline_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'ALTA'
        WHEN g.deadline_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'MEDIA'
        ELSE 'BAJA'
    END as urgency_level,
    CASE
        WHEN g.overall_score >= 8.0 THEN 'EXCELENTE'
        WHEN g.overall_score >= 6.0 THEN 'BUENA'
        WHEN g.overall_score >= 4.0 THEN 'REGULAR'
        ELSE 'BAJA'
    END as relevance_level
FROM grants g
WHERE g.status = 'ACTIVE'
    AND (g.deadline_date IS NULL OR g.deadline_date > CURRENT_DATE);

-- Función para búsqueda de texto completo
CREATE OR REPLACE FUNCTION search_grants(
    search_query TEXT,
    user_profile_id UUID DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE(
    grant_id UUID,
    title VARCHAR(500),
    description TEXT,
    overall_score DECIMAL(3,2),
    urgency_score DECIMAL(3,2),
    deadline_date DATE,
    amount_max DECIMAL(15,2),
    source VARCHAR(100),
    relevance_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.title,
        g.description,
        g.overall_score,
        g.urgency_score,
        g.deadline_date,
        g.amount_max,
        g.source,
        ts_rank(to_tsvector('spanish', g.title || ' ' || COALESCE(g.description, '')), plainto_tsquery('spanish', search_query)) as relevance_rank
    FROM grants g
    WHERE g.status = 'ACTIVE'
        AND (g.deadline_date IS NULL OR g.deadline_date > CURRENT_DATE)
        AND to_tsvector('spanish', g.title || ' ' || COALESCE(g.description, '')) @@ plainto_tsquery('spanish', search_query)
    ORDER BY relevance_rank DESC, g.overall_score DESC, g.urgency_score DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para user_profiles: usuarios solo pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Política para saved_searches: usuarios solo pueden ver sus búsquedas
CREATE POLICY "Users can manage own searches" ON saved_searches
    FOR ALL USING (
        user_profile_id IN (
            SELECT id FROM user_profiles WHERE user_id = auth.uid()::text
        )
    );

-- Política para notifications: usuarios solo pueden ver sus notificaciones
CREATE POLICY "Users can view own notifications" ON notifications
    FOR ALL USING (
        user_profile_id IN (
            SELECT id FROM user_profiles WHERE user_id = auth.uid()::text
        )
    );

-- Grants son públicos (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view grants" ON grants
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo el sistema puede insertar/actualizar grants
CREATE POLICY "System can manage grants" ON grants
    FOR ALL USING (auth.role() = 'service_role');

-- Comentarios para documentación
COMMENT ON TABLE grants IS 'Tabla principal que almacena todas las subvenciones encontradas';
COMMENT ON TABLE user_profiles IS 'Perfiles de usuario/empresa para personalización';
COMMENT ON TABLE saved_searches IS 'Búsquedas guardadas por los usuarios';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones para usuarios';
COMMENT ON TABLE workflow_executions IS 'Log de ejecuciones de workflows de n8n';
COMMENT ON TABLE performance_metrics IS 'Métricas de rendimiento del sistema';

COMMENT ON FUNCTION search_grants IS 'Función de búsqueda de texto completo con ranking de relevancia';
COMMENT ON FUNCTION calculate_urgency_score IS 'Calcula score de urgencia basado en días hasta deadline';

-- Datos de ejemplo para testing
INSERT INTO grants (title, description, source, amount_min, amount_max, deadline_date, sector, geographic_scope, target_company_size, overall_score, urgency_score) VALUES
('Programa de Digitalización PYME 2024', 'Ayudas para la digitalización de pequeñas y medianas empresas', 'BOE', 5000, 50000, '2024-12-31', 'Tecnología', 'NACIONAL', 'PEQUEÑA', 8.5, 6.0),
('Subvención I+D+i Comunidad de Madrid', 'Apoyo a proyectos de investigación, desarrollo e innovación', 'REGIONAL', 10000, 200000, '2024-11-15', 'Innovación', 'REGIONAL', 'TODAS', 7.8, 8.5),
('Fondos Europeos Next Generation', 'Financiación para proyectos de transformación digital y sostenibilidad', 'EUROPA', 50000, 2000000, '2024-10-30', 'Sostenibilidad', 'EUROPEO', 'MEDIANA', 9.2, 9.0);