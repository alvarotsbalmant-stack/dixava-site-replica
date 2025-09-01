-- FUNÇÕES RPC ENTERPRISE ADICIONAIS + CORREÇÃO DE SEGURANÇA

-- 3. HEATMAP ENTERPRISE - Dados granulares para visualização
CREATE OR REPLACE FUNCTION public.get_heatmap_enterprise_data(
    p_page_url text, 
    p_start_date date DEFAULT (CURRENT_DATE - INTERVAL '7 days'), 
    p_end_date date DEFAULT CURRENT_DATE,
    p_interaction_type text DEFAULT 'click'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result JSONB;
    v_heatmap_points JSONB;
    v_summary JSONB;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    -- Gerar pontos do heatmap
    SELECT jsonb_agg(
        jsonb_build_object(
            'coordinates', heatmap_data.coordinates,
            'intensity', heatmap_data.intensity,
            'element_selector', heatmap_data.element_selector,
            'conversion_correlation', heatmap_data.conversion_correlation,
            'avg_engagement_score', heatmap_data.avg_engagement_score
        )
    ) INTO v_heatmap_points
    FROM (
        SELECT 
            pi.coordinates,
            pi.element_selector,
            COUNT(*) as intensity,
            ROUND(AVG(
                CASE 
                    WHEN s.converted = true THEN 1.0 
                    ELSE 0.0 
                END
            ), 4) as conversion_correlation,
            ROUND(AVG(COALESCE(ra.engagement_score, 0)), 2) as avg_engagement_score
        FROM public.page_interactions pi
        LEFT JOIN public.user_sessions s ON pi.session_id = s.session_id
        LEFT JOIN public.realtime_activity ra ON pi.session_id = ra.session_id
        WHERE pi.page_url = p_page_url
        AND pi.interaction_type = p_interaction_type
        AND DATE(pi.timestamp_precise) BETWEEN p_start_date AND p_end_date
        AND pi.coordinates IS NOT NULL
        GROUP BY pi.coordinates, pi.element_selector
        HAVING COUNT(*) >= 3
    ) heatmap_data;

    -- Gerar resumo
    SELECT jsonb_build_object(
        'total_interactions', COALESCE(SUM((heatmap_point->>'intensity')::INTEGER), 0),
        'unique_elements', COUNT(DISTINCT (heatmap_point->>'element_selector')),
        'avg_conversion_rate', ROUND(AVG((heatmap_point->>'conversion_correlation')::NUMERIC), 4)
    ) INTO v_summary
    FROM jsonb_array_elements(COALESCE(v_heatmap_points, '[]'::jsonb)) AS heatmap_point;

    -- Construir resultado final
    v_result := jsonb_build_object(
        'page_url', p_page_url,
        'interaction_type', p_interaction_type,
        'date_range', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'heatmap_points', COALESCE(v_heatmap_points, '[]'::jsonb),
        'summary', COALESCE(v_summary, jsonb_build_object('total_interactions', 0))
    );

    RETURN v_result;
END;
$$;

-- 4. ANÁLISE DE ABANDONO POR SETOR
CREATE OR REPLACE FUNCTION public.get_abandonment_analysis_by_sector(
    p_start_date date DEFAULT (CURRENT_DATE - INTERVAL '30 days'), 
    p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category_data.category,
            'total_sessions', category_data.total_sessions,
            'abandoned_sessions', category_data.abandoned_sessions,
            'abandonment_rate', ROUND(
                CASE 
                    WHEN category_data.total_sessions > 0 
                    THEN (category_data.abandoned_sessions::NUMERIC / category_data.total_sessions::NUMERIC) * 100
                    ELSE 0 
                END, 2
            ),
            'avg_time_to_abandon', category_data.avg_time_to_abandon,
            'most_common_exit_point', category_data.most_common_exit_point
        )
    ) INTO v_result
    FROM (
        SELECT 
            CASE 
                WHEN j.page_url LIKE '%playstation%' OR j.page_url LIKE '%ps5%' OR j.page_url LIKE '%ps4%' THEN 'PlayStation'
                WHEN j.page_url LIKE '%xbox%' THEN 'Xbox'
                WHEN j.page_url LIKE '%nintendo%' OR j.page_url LIKE '%switch%' THEN 'Nintendo'
                WHEN j.page_url LIKE '%pc%' OR j.page_url LIKE '%steam%' THEN 'PC Gaming'
                ELSE 'Outros'
            END as category,
            COUNT(DISTINCT j.session_id) as total_sessions,
            COUNT(DISTINCT CASE WHEN j.exit_point = true THEN j.session_id END) as abandoned_sessions,
            ROUND(AVG(CASE WHEN j.exit_point = true THEN j.cumulative_time_seconds END), 0) as avg_time_to_abandon,
            MODE() WITHIN GROUP (ORDER BY CASE WHEN j.exit_point = true THEN j.page_url END) as most_common_exit_point
        FROM public.user_journey_detailed j
        WHERE DATE(j.step_start_time) BETWEEN p_start_date AND p_end_date
        GROUP BY 1
    ) category_data;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 5. ANÁLISE DE ROTAS DE CONVERSÃO
CREATE OR REPLACE FUNCTION public.get_conversion_routes_analysis(
    p_start_date date DEFAULT (CURRENT_DATE - INTERVAL '30 days'), 
    p_end_date date DEFAULT CURRENT_DATE,
    p_limit integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    WITH journey_routes AS (
        SELECT 
            j.session_id,
            string_agg(j.page_url, ' → ' ORDER BY j.step_number) as journey_path,
            COUNT(j.step_number) as step_count,
            MAX(j.cumulative_time_seconds) as total_journey_time
        FROM public.user_journey_detailed j
        WHERE DATE(j.step_start_time) BETWEEN p_start_date AND p_end_date
        GROUP BY j.session_id
        HAVING COUNT(j.step_number) >= 2
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'journey_path', route_stats.journey_path,
            'frequency_count', route_stats.frequency_count,
            'conversion_rate', route_stats.conversion_rate,
            'avg_journey_time', route_stats.avg_journey_time,
            'revenue_generated', route_stats.revenue_generated
        ) ORDER BY route_stats.conversion_rate DESC
    ) INTO v_result
    FROM (
        SELECT 
            jr.journey_path,
            COUNT(*) as frequency_count,
            ROUND(
                (COUNT(CASE WHEN s.converted = true THEN 1 END)::NUMERIC / 
                 COUNT(*)::NUMERIC) * 100, 2
            ) as conversion_rate,
            ROUND(AVG(jr.total_journey_time), 0) as avg_journey_time,
            COALESCE(SUM(s.purchase_value), 0) as revenue_generated
        FROM journey_routes jr
        LEFT JOIN public.user_sessions s ON jr.session_id = s.session_id
        GROUP BY jr.journey_path
        HAVING COUNT(*) >= 3
        ORDER BY 
            (COUNT(CASE WHEN s.converted = true THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) DESC,
            COUNT(*) DESC
        LIMIT p_limit
    ) route_stats;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 6. SEGMENTAÇÃO COMPORTAMENTAL AUTOMÁTICA
CREATE OR REPLACE FUNCTION public.get_behavioral_segmentation(
    p_start_date date DEFAULT (CURRENT_DATE - INTERVAL '30 days'), 
    p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    WITH user_behavior AS (
        SELECT 
            COALESCE(s.user_id::TEXT, s.session_id) as user_identifier,
            COUNT(DISTINCT s.session_id) as session_count,
            AVG(s.duration_seconds) as avg_duration,
            AVG(s.page_views) as avg_pages,
            AVG(COALESCE(ra.engagement_score, 0)) as avg_engagement,
            (COUNT(CASE WHEN s.converted = true THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100 as conversion_rate,
            AVG(CASE WHEN s.converted = true THEN s.purchase_value END) as avg_purchase_value,
            (COUNT(CASE WHEN s.page_views <= 1 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100 as bounce_rate
        FROM public.user_sessions s
        LEFT JOIN public.realtime_activity ra ON s.session_id = ra.session_id
        WHERE DATE(s.started_at) BETWEEN p_start_date AND p_end_date
        GROUP BY COALESCE(s.user_id::TEXT, s.session_id)
    ),
    segments AS (
        SELECT 
            CASE 
                WHEN avg_engagement > 70 AND conversion_rate > 5 THEN 'High-Value Converters'
                WHEN avg_engagement > 70 AND conversion_rate <= 5 THEN 'Engaged Browsers'
                WHEN avg_engagement BETWEEN 30 AND 70 AND session_count > 3 THEN 'Regular Researchers'
                WHEN avg_engagement BETWEEN 30 AND 70 AND session_count <= 3 THEN 'Casual Visitors'
                WHEN avg_engagement < 30 AND bounce_rate > 80 THEN 'Quick Bouncers'
                ELSE 'Undefined Behavior'
            END as segment,
            COUNT(*) as user_count,
            ROUND(AVG(avg_duration), 0) as avg_session_duration,
            ROUND(AVG(avg_pages), 1) as avg_pages_per_session,
            ROUND(AVG(conversion_rate), 2) as conversion_rate,
            ROUND(AVG(avg_purchase_value), 2) as avg_order_value,
            jsonb_build_object(
                'avg_engagement_score', ROUND(AVG(avg_engagement), 1),
                'avg_sessions_count', ROUND(AVG(session_count), 1),
                'avg_bounce_rate', ROUND(AVG(bounce_rate), 1)
            ) as characteristics
        FROM user_behavior
        GROUP BY 1
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'segment', s.segment,
            'user_count', s.user_count,
            'percentage', ROUND((s.user_count::NUMERIC / SUM(s.user_count) OVER ()) * 100, 2),
            'avg_session_duration', s.avg_session_duration,
            'avg_pages_per_session', s.avg_pages_per_session,
            'conversion_rate', s.conversion_rate,
            'avg_order_value', s.avg_order_value,
            'characteristics', s.characteristics
        )
    ) INTO v_result
    FROM segments s;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Corrigir RLS na tabela mv_realtime_dashboard
ALTER TABLE public.mv_realtime_dashboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage mv_realtime_dashboard" ON public.mv_realtime_dashboard FOR ALL USING (is_admin());