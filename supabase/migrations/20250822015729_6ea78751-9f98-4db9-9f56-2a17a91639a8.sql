-- CORREÇÃO: Remover RLS incorreto e completar funções enterprise

-- Dropar a tabela problemática e recriar sem RLS (é apenas para dados agregados)
DROP TABLE IF EXISTS public.mv_realtime_dashboard;

-- Recriar como tabela normal para dados agregados
CREATE TABLE public.realtime_dashboard_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type text NOT NULL,
    metric_value numeric,
    metric_data jsonb,
    period_start timestamp with time zone,
    period_end timestamp with time zone,
    last_updated timestamp with time zone DEFAULT now()
);

-- 7. PREDIÇÃO DE SCORE DE CONVERSÃO
CREATE OR REPLACE FUNCTION public.get_predictive_conversion_score(p_session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result JSONB;
    v_engagement_score NUMERIC := 0;
    v_journey_progress NUMERIC := 0;
    v_interaction_quality NUMERIC := 0;
    v_time_spent NUMERIC := 0;
    v_conversion_indicators NUMERIC := 0;
    v_final_score NUMERIC := 0;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    -- Calcular engagement score atual
    SELECT COALESCE(engagement_score, 0) INTO v_engagement_score
    FROM public.realtime_activity
    WHERE session_id = p_session_id;

    -- Calcular progresso na jornada (baseado em funnel stages)
    SELECT COALESCE(MAX(
        CASE 
            WHEN funnel_stage = 'purchase' THEN 100
            WHEN funnel_stage = 'decision' THEN 80
            WHEN funnel_stage = 'consideration' THEN 60
            WHEN funnel_stage = 'awareness' THEN 40
            ELSE 20 
        END
    ), 20) INTO v_journey_progress
    FROM public.user_journey_detailed
    WHERE session_id = p_session_id;

    -- Calcular qualidade das interações
    SELECT LEAST(100, 
        COUNT(*) * 2 + 
        COUNT(CASE WHEN interaction_type = 'click' THEN 1 END) * 3 +
        COUNT(CASE WHEN interaction_type = 'hover' AND duration_ms > 2000 THEN 1 END) * 2
    ) INTO v_interaction_quality
    FROM public.page_interactions
    WHERE session_id = p_session_id;

    -- Calcular tempo gasto (normalizado)
    SELECT LEAST(100, COALESCE(SUM(time_spent_seconds), 0) / 60 * 10) INTO v_time_spent
    FROM public.user_journey_detailed
    WHERE session_id = p_session_id;

    -- Detectar indicadores de conversão
    SELECT 
        (CASE WHEN COUNT(*) FILTER (WHERE action_type = 'add_to_cart') > 0 THEN 30 ELSE 0 END) +
        (CASE WHEN COUNT(*) FILTER (WHERE action_type = 'checkout_step') > 0 THEN 40 ELSE 0 END) +
        (CASE WHEN COUNT(*) FILTER (WHERE page_url LIKE '%checkout%') > 0 THEN 20 ELSE 0 END) +
        (CASE WHEN COUNT(*) FILTER (WHERE page_url LIKE '%payment%') > 0 THEN 30 ELSE 0 END)
    INTO v_conversion_indicators
    FROM public.user_journey_detailed
    WHERE session_id = p_session_id;

    -- Calcular score final (média ponderada)
    v_final_score := LEAST(100, 
        (v_engagement_score * 0.25) +
        (v_journey_progress * 0.20) +
        (v_interaction_quality * 0.20) +
        (v_time_spent * 0.15) +
        (v_conversion_indicators * 0.20)
    );

    -- Construir resultado
    v_result := jsonb_build_object(
        'session_id', p_session_id,
        'conversion_probability', ROUND(v_final_score / 100, 3),
        'score_breakdown', jsonb_build_object(
            'engagement_score', v_engagement_score,
            'journey_progress', v_journey_progress,
            'interaction_quality', v_interaction_quality,
            'time_spent_score', v_time_spent,
            'conversion_indicators', v_conversion_indicators
        ),
        'final_score', ROUND(v_final_score, 1),
        'recommendation', CASE 
            WHEN v_final_score >= 80 THEN 'High conversion probability - Consider proactive assistance'
            WHEN v_final_score >= 60 THEN 'Medium conversion probability - Monitor closely'
            WHEN v_final_score >= 40 THEN 'Low-medium probability - Provide incentives'
            ELSE 'Low probability - Focus on engagement'
        END,
        'calculated_at', NOW()
    );

    RETURN v_result;
END;
$$;

-- 8. PONTOS DE FRICÇÃO DETALHADOS
CREATE OR REPLACE FUNCTION public.get_friction_points_analysis(
    p_start_date date DEFAULT (CURRENT_DATE - INTERVAL '7 days'), 
    p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result JSONB;
    v_friction_points JSONB;
    v_summary JSONB;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    -- Identificar pontos de fricção
    SELECT jsonb_agg(
        jsonb_build_object(
            'page_url', friction_data.page_url,
            'friction_type', friction_data.friction_type,
            'severity_score', friction_data.severity_score,
            'affected_sessions', friction_data.affected_sessions,
            'impact_on_conversion', friction_data.impact_on_conversion,
            'recommended_actions', friction_data.recommended_actions
        ) ORDER BY friction_data.severity_score DESC
    ) INTO v_friction_points
    FROM (
        SELECT 
            j.page_url,
            COALESCE(j.friction_type, 'general_friction') as friction_type,
            COUNT(DISTINCT j.session_id) as affected_sessions,
            ROUND(
                CASE 
                    WHEN j.friction_type = 'rapid_clicks' THEN 80
                    WHEN j.friction_type = 'long_pauses' THEN 60
                    WHEN j.friction_type = 'back_forth_navigation' THEN 70
                    WHEN j.friction_type = 'form_abandonment' THEN 85
                    ELSE 50
                END, 0
            ) as severity_score,
            ROUND(
                (COUNT(DISTINCT CASE WHEN s.converted = false THEN j.session_id END)::NUMERIC / 
                 COUNT(DISTINCT j.session_id)::NUMERIC) * 100, 2
            ) as impact_on_conversion,
            CASE 
                WHEN j.friction_type = 'rapid_clicks' THEN 
                    jsonb_build_array('Improve button responsiveness', 'Add loading indicators', 'Review UI feedback')
                WHEN j.friction_type = 'long_pauses' THEN 
                    jsonb_build_array('Simplify navigation', 'Add help tooltips', 'Improve content clarity')
                WHEN j.friction_type = 'back_forth_navigation' THEN 
                    jsonb_build_array('Improve information architecture', 'Add breadcrumbs', 'Enhance search functionality')
                WHEN j.friction_type = 'form_abandonment' THEN 
                    jsonb_build_array('Simplify forms', 'Add progress indicators', 'Improve validation messages')
                ELSE 
                    jsonb_build_array('General UX review needed')
            END as recommended_actions
        FROM public.user_journey_detailed j
        LEFT JOIN public.user_sessions s ON j.session_id = s.session_id
        WHERE j.friction_detected = true
        AND DATE(j.step_start_time) BETWEEN p_start_date AND p_end_date
        GROUP BY j.page_url, j.friction_type
        HAVING COUNT(DISTINCT j.session_id) >= 5
    ) friction_data;

    -- Gerar resumo
    SELECT jsonb_build_object(
        'total_friction_points', COUNT(*),
        'high_severity_count', COUNT(CASE WHEN (friction_point->>'severity_score')::INTEGER >= 70 THEN 1 END),
        'avg_conversion_impact', ROUND(AVG((friction_point->>'impact_on_conversion')::NUMERIC), 2)
    ) INTO v_summary
    FROM jsonb_array_elements(COALESCE(v_friction_points, '[]'::jsonb)) AS friction_point;

    -- Construir resultado final
    v_result := jsonb_build_object(
        'analysis_period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'friction_points', COALESCE(v_friction_points, '[]'::jsonb),
        'summary', COALESCE(v_summary, jsonb_build_object('total_friction_points', 0))
    );

    RETURN v_result;
END;
$$;

-- 9. ALERTAS EM TEMPO REAL
CREATE OR REPLACE FUNCTION public.get_real_time_alerts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result JSONB;
    v_alerts JSONB := '[]'::jsonb;
    v_current_users INTEGER := 0;
    v_conversion_rate NUMERIC := 0;
    v_avg_performance NUMERIC := 0;
    v_error_rate NUMERIC := 0;
    v_current_metrics JSONB;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('error', 'Acesso negado');
    END IF;

    -- Verificar usuários ativos
    SELECT COUNT(*) INTO v_current_users
    FROM public.realtime_activity
    WHERE last_heartbeat > NOW() - INTERVAL '5 minutes';

    -- Verificar taxa de conversão das últimas 24h
    SELECT COALESCE(
        ROUND(
            (COUNT(CASE WHEN converted = true THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(*), 0)::NUMERIC) * 100, 2
        ), 0
    ) INTO v_conversion_rate
    FROM public.user_sessions
    WHERE started_at > NOW() - INTERVAL '24 hours';

    -- Verificar performance média
    SELECT COALESCE(ROUND(AVG(performance_score), 1), 100) INTO v_avg_performance
    FROM public.performance_vitals
    WHERE measurement_timestamp > NOW() - INTERVAL '1 hour';

    -- Verificar taxa de erros
    SELECT COALESCE(
        ROUND(
            (COUNT(CASE WHEN jsonb_array_length(COALESCE(javascript_errors, '[]'::jsonb)) > 0 THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(*), 0)::NUMERIC) * 100, 2
        ), 0
    ) INTO v_error_rate
    FROM public.performance_vitals
    WHERE measurement_timestamp > NOW() - INTERVAL '1 hour';

    -- Gerar alertas baseados em thresholds
    
    -- Alerta de tráfego alto
    IF v_current_users > 100 THEN
        v_alerts := v_alerts || jsonb_build_object(
            'type', 'traffic_spike',
            'severity', 'medium',
            'message', format('Tráfego alto detectado: %s usuários ativos', v_current_users),
            'value', v_current_users,
            'threshold', 100,
            'action_required', 'Monitor server performance',
            'timestamp', NOW()
        );
    END IF;

    -- Alerta de conversão baixa
    IF v_conversion_rate < 1.0 THEN
        v_alerts := v_alerts || jsonb_build_object(
            'type', 'low_conversion',
            'severity', 'high',
            'message', format('Taxa de conversão baixa: %s%%', v_conversion_rate),
            'value', v_conversion_rate,
            'threshold', 1.0,
            'action_required', 'Investigar problemas no funil de conversão',
            'timestamp', NOW()
        );
    END IF;

    -- Alerta de performance
    IF v_avg_performance < 70 THEN
        v_alerts := v_alerts || jsonb_build_object(
            'type', 'poor_performance',
            'severity', 'medium',
            'message', format('Performance baixa detectada: %s pontos', v_avg_performance),
            'value', v_avg_performance,
            'threshold', 70,
            'action_required', 'Otimizar performance das páginas',
            'timestamp', NOW()
        );
    END IF;

    -- Alerta de erros
    IF v_error_rate > 5 THEN
        v_alerts := v_alerts || jsonb_build_object(
            'type', 'high_error_rate',
            'severity', 'high',
            'message', format('Taxa de erros alta: %s%%', v_error_rate),
            'value', v_error_rate,
            'threshold', 5,
            'action_required', 'Investigar e corrigir erros JavaScript',
            'timestamp', NOW()
        );
    END IF;

    -- Métricas atuais
    v_current_metrics := jsonb_build_object(
        'active_users', v_current_users,
        'conversion_rate_24h', v_conversion_rate,
        'avg_performance_1h', v_avg_performance,
        'error_rate_1h', v_error_rate
    );

    -- Construir resultado final
    v_result := jsonb_build_object(
        'alerts', v_alerts,
        'alert_count', jsonb_array_length(v_alerts),
        'current_metrics', v_current_metrics,
        'generated_at', NOW()
    );

    RETURN v_result;
END;
$$;