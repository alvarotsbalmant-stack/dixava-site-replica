-- CORREÇÃO FINAL: Usar DROP MATERIALIZED VIEW e criar sistema de tracking

-- Dropar materialized view corretamente
DROP MATERIALIZED VIEW IF EXISTS public.mv_realtime_dashboard;

-- Criar tabela normal para cache de dados
CREATE TABLE IF NOT EXISTS public.realtime_dashboard_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type text NOT NULL,
    metric_value numeric,
    metric_data jsonb,
    period_start timestamp with time zone,
    period_end timestamp with time zone,
    last_updated timestamp with time zone DEFAULT now()
);

-- 10. PREDIÇÃO DE CHURN COM MACHINE LEARNING BÁSICO
CREATE OR REPLACE FUNCTION public.get_churn_prediction(
    p_user_id uuid DEFAULT NULL,
    p_risk_threshold numeric DEFAULT 0.7
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
            s.user_id,
            MAX(s.started_at) as last_activity,
            EXTRACT(DAYS FROM (NOW() - MAX(s.started_at))) as days_since_last_activity,
            LEAST(1.0, EXTRACT(DAYS FROM (NOW() - MAX(s.started_at))) / 30.0) as days_inactive,
            LEAST(1.0, GREATEST(0, 1 - (AVG(COALESCE(ra.engagement_score, 0)) / 70.0))) as engagement_decline,
            LEAST(1.0, GREATEST(0, 1 - (COUNT(DISTINCT DATE(s.started_at)) / 30.0))) as session_frequency_decline,
            LEAST(1.0, GREATEST(0, 1 - (COUNT(CASE WHEN s.converted = true THEN 1 END) / 5.0))) as purchase_decline
        FROM public.user_sessions s
        LEFT JOIN public.realtime_activity ra ON s.session_id = ra.session_id
        WHERE s.user_id IS NOT NULL
        AND (p_user_id IS NULL OR s.user_id = p_user_id)
        AND s.started_at > NOW() - INTERVAL '90 days'
        GROUP BY s.user_id
    ),
    churn_analysis AS (
        SELECT 
            user_id,
            last_activity,
            days_since_last_activity,
            LEAST(1.0, 
                (days_inactive * 0.3) +
                (engagement_decline * 0.25) +
                (session_frequency_decline * 0.25) +
                (purchase_decline * 0.2)
            ) as churn_risk_score,
            jsonb_build_object(
                'engagement_decline', engagement_decline,
                'session_frequency_decline', session_frequency_decline,
                'purchase_decline', purchase_decline
            ) as behavior_changes
        FROM user_behavior
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'user_id', ca.user_id,
            'churn_risk_score', ROUND(ca.churn_risk_score, 3),
            'risk_level', CASE 
                WHEN ca.churn_risk_score >= 0.8 THEN 'Critical'
                WHEN ca.churn_risk_score >= 0.6 THEN 'High'
                WHEN ca.churn_risk_score >= 0.4 THEN 'Medium'
                ELSE 'Low'
            END,
            'last_activity', ca.last_activity,
            'days_since_last_activity', ca.days_since_last_activity,
            'behavior_changes', ca.behavior_changes,
            'recommended_actions', CASE 
                WHEN ca.churn_risk_score >= 0.8 THEN 
                    jsonb_build_array('Send re-engagement email', 'Offer special discount', 'Personal outreach')
                WHEN ca.churn_risk_score >= 0.6 THEN 
                    jsonb_build_array('Improve content relevance', 'Personalize recommendations', 'A/B test new features')
                WHEN ca.churn_risk_score >= 0.4 THEN 
                    jsonb_build_array('Offer loyalty rewards', 'Send product recommendations', 'Provide purchase incentives')
                ELSE 
                    jsonb_build_array('Monitor behavior', 'Maintain regular communication')
            END,
            'intervention_priority', CASE 
                WHEN ca.churn_risk_score >= 0.8 THEN 1
                WHEN ca.churn_risk_score >= 0.6 THEN 2
                ELSE 3
            END
        ) ORDER BY ca.churn_risk_score DESC
    ) INTO v_result
    FROM churn_analysis ca
    WHERE ca.churn_risk_score >= p_risk_threshold;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;