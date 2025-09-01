-- CORREÇÃO DA TABELA SCROLL_BEHAVIOR + FUNÇÕES RPC ENTERPRISE

-- Primeiro, deletar e recriar a tabela scroll_behavior com estrutura correta
DROP TABLE IF EXISTS public.scroll_behavior CASCADE;

CREATE TABLE public.scroll_behavior (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    user_id uuid,
    page_url text NOT NULL,
    scroll_depth_percentage numeric,
    scroll_depth_pixels integer,
    scroll_direction text, -- up, down
    scroll_velocity numeric,
    time_to_scroll_seconds numeric,
    scroll_pauses_count integer,
    max_scroll_reached numeric,
    sections_viewed jsonb, -- array of sections scrolled through
    engagement_per_section jsonb,
    exit_scroll_depth numeric,
    scroll_pattern text, -- smooth, erratic, rapid, slow
    device_type text,
    timestamp_precise timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Recriar índices
CREATE INDEX idx_scroll_behavior_session ON public.scroll_behavior(session_id, timestamp_precise);
CREATE INDEX idx_scroll_behavior_page_depth ON public.scroll_behavior(page_url, scroll_depth_percentage);

-- Enable RLS e policies
ALTER TABLE public.scroll_behavior ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage scroll_behavior" ON public.scroll_behavior FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert scroll_behavior" ON public.scroll_behavior FOR INSERT WITH CHECK (true);

-- TABELA ADICIONAL PARA MATERIALIZED VIEWS
CREATE TABLE IF NOT EXISTS public.mv_realtime_dashboard (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type text NOT NULL,
    metric_value numeric,
    metric_data jsonb,
    period_start timestamp with time zone,
    period_end timestamp with time zone,
    last_updated timestamp with time zone DEFAULT now()
);

-- FUNÇÕES RPC ENTERPRISE - TRACKING COMPLETO

-- 1. DASHBOARD TEMPO REAL - Nível Amazon/Google
CREATE OR REPLACE FUNCTION public.get_realtime_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_active_users integer;
    v_current_sessions integer;
    v_conversion_rate numeric;
    v_avg_engagement numeric;
    v_revenue_today numeric;
    v_top_pages jsonb;
    v_traffic_sources jsonb;
    v_device_breakdown jsonb;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    -- Usuários ativos (últimos 5 minutos)
    SELECT COUNT(DISTINCT session_id) INTO v_active_users
    FROM public.realtime_activity
    WHERE last_heartbeat > NOW() - INTERVAL '5 minutes';

    -- Sessões ativas hoje
    SELECT COUNT(DISTINCT session_id) INTO v_current_sessions
    FROM public.user_sessions
    WHERE started_at >= CURRENT_DATE;

    -- Taxa de conversão hoje
    SELECT COALESCE(
        ROUND(
            (COUNT(CASE WHEN converted = true THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(*), 0)::NUMERIC) * 100, 2
        ), 0
    ) INTO v_conversion_rate
    FROM public.user_sessions
    WHERE started_at >= CURRENT_DATE;

    -- Engagement médio atual
    SELECT COALESCE(ROUND(AVG(engagement_score), 1), 0) INTO v_avg_engagement
    FROM public.realtime_activity
    WHERE last_heartbeat > NOW() - INTERVAL '1 hour';

    -- Revenue hoje
    SELECT COALESCE(SUM(purchase_value), 0) INTO v_revenue_today
    FROM public.user_sessions
    WHERE started_at >= CURRENT_DATE AND converted = true;

    -- Top páginas em tempo real
    SELECT jsonb_agg(
        jsonb_build_object(
            'page_url', page_data.page_url,
            'active_users', page_data.active_users,
            'avg_engagement', page_data.avg_engagement
        ) ORDER BY page_data.active_users DESC
    ) INTO v_top_pages
    FROM (
        SELECT 
            current_page as page_url,
            COUNT(DISTINCT session_id) as active_users,
            ROUND(AVG(engagement_score), 1) as avg_engagement
        FROM public.realtime_activity
        WHERE last_heartbeat > NOW() - INTERVAL '10 minutes'
        AND current_page IS NOT NULL
        GROUP BY current_page
        ORDER BY active_users DESC
        LIMIT 10
    ) page_data;

    -- Fontes de tráfego
    SELECT jsonb_agg(
        jsonb_build_object(
            'source', traffic_data.traffic_source,
            'users', traffic_data.user_count,
            'conversion_rate', traffic_data.conversion_rate
        )
    ) INTO v_traffic_sources
    FROM (
        SELECT 
            COALESCE(traffic_source, 'direct') as traffic_source,
            COUNT(DISTINCT session_id) as user_count,
            ROUND(
                (COUNT(CASE WHEN converted = true THEN 1 END)::NUMERIC / 
                 NULLIF(COUNT(*), 0)::NUMERIC) * 100, 2
            ) as conversion_rate
        FROM public.user_sessions
        WHERE started_at >= CURRENT_DATE
        GROUP BY traffic_source
        ORDER BY user_count DESC
        LIMIT 5
    ) traffic_data;

    -- Breakdown por device
    SELECT jsonb_agg(
        jsonb_build_object(
            'device', device_data.device_type,
            'count', device_data.device_count,
            'percentage', device_data.percentage
        )
    ) INTO v_device_breakdown
    FROM (
        SELECT 
            device_type,
            COUNT(*) as device_count,
            ROUND(
                (COUNT(*)::NUMERIC / 
                 (SELECT COUNT(*) FROM public.user_sessions WHERE started_at >= CURRENT_DATE)::NUMERIC) * 100, 1
            ) as percentage
        FROM public.user_sessions
        WHERE started_at >= CURRENT_DATE
        GROUP BY device_type
    ) device_data;

    -- Construir resultado final
    v_result := jsonb_build_object(
        'realtime_metrics', jsonb_build_object(
            'active_users', v_active_users,
            'current_sessions', v_current_sessions,
            'conversion_rate', v_conversion_rate,
            'avg_engagement', v_avg_engagement,
            'revenue_today', v_revenue_today
        ),
        'top_pages', COALESCE(v_top_pages, '[]'::jsonb),
        'traffic_sources', COALESCE(v_traffic_sources, '[]'::jsonb),
        'device_breakdown', COALESCE(v_device_breakdown, '[]'::jsonb),
        'timestamp', NOW()
    );

    RETURN v_result;
END;
$$;

-- 2. JORNADA COMPLETA DO USUÁRIO - Replay detalhado
CREATE OR REPLACE FUNCTION public.get_user_complete_journey(p_session_id text, p_include_interactions boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_journey_steps JSONB;
    v_interactions JSONB;
    v_session_summary JSONB;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    -- Obter dados da sessão
    SELECT jsonb_build_object(
        'session_id', s.session_id,
        'user_id', s.user_id,
        'started_at', s.started_at,
        'ended_at', s.ended_at,
        'duration_seconds', s.duration_seconds,
        'device_type', s.device_type,
        'browser', s.browser,
        'traffic_source', s.traffic_source,
        'converted', s.converted,
        'purchase_value', s.purchase_value
    ) INTO v_session_summary
    FROM public.user_sessions s
    WHERE s.session_id = p_session_id;

    -- Obter jornada detalhada
    SELECT jsonb_agg(
        jsonb_build_object(
            'step_number', j.step_number,
            'page_url', j.page_url,
            'page_title', j.page_title,
            'action_type', j.action_type,
            'action_details', j.action_details,
            'time_spent_seconds', j.time_spent_seconds,
            'cumulative_time_seconds', j.cumulative_time_seconds,
            'funnel_stage', j.funnel_stage,
            'engagement_score', j.engagement_score,
            'friction_detected', j.friction_detected,
            'conversion_step', j.conversion_step,
            'predicted_next_action', j.predicted_next_action,
            'step_start_time', j.step_start_time
        ) ORDER BY j.step_number
    ) INTO v_journey_steps
    FROM public.user_journey_detailed j
    WHERE j.session_id = p_session_id;

    -- Obter interações se solicitado
    IF p_include_interactions THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'interaction_type', pi.interaction_type,
                'element_selector', pi.element_selector,
                'coordinates', pi.coordinates,
                'timestamp', pi.timestamp_precise,
                'page_url', pi.page_url,
                'sequence_number', pi.sequence_number
            ) ORDER BY pi.timestamp_precise
        ) INTO v_interactions
        FROM public.page_interactions pi
        WHERE pi.session_id = p_session_id;
    ELSE
        v_interactions := '[]'::jsonb;
    END IF;

    -- Construir resultado final
    v_result := jsonb_build_object(
        'session_summary', COALESCE(v_session_summary, '{}'::jsonb),
        'journey_steps', COALESCE(v_journey_steps, '[]'::jsonb),
        'interactions', v_interactions,
        'total_steps', COALESCE(jsonb_array_length(v_journey_steps), 0),
        'total_interactions', COALESCE(jsonb_array_length(v_interactions), 0)
    );

    RETURN v_result;
END;
$$;