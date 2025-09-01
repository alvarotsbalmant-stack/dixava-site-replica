-- Remover função existente e criar versão corrigida
DROP FUNCTION IF EXISTS get_behavioral_segmentation(DATE, DATE);

-- Criar nova função sem window functions problemáticas
CREATE OR REPLACE FUNCTION get_behavioral_segmentation(
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  WITH session_data AS (
    SELECT 
      us.user_id,
      us.session_id,
      us.duration_seconds,
      us.page_views,
      us.events_count,
      us.converted,
      us.purchase_value,
      us.device_type,
      us.traffic_source,
      -- Calcular métricas sem window functions
      CASE 
        WHEN us.duration_seconds > 0 THEN us.events_count::float / (us.duration_seconds / 60.0)
        ELSE 0 
      END as events_per_minute
    FROM user_sessions us
    WHERE us.started_at >= p_start_date 
      AND us.started_at <= p_end_date + INTERVAL '1 day'
  ),
  user_stats AS (
    SELECT 
      COALESCE(user_id, 'anon_' || session_id) as user_key,
      COUNT(*) as session_count,
      ROUND(AVG(duration_seconds), 2) as avg_duration,
      ROUND(AVG(page_views), 2) as avg_pages,
      ROUND(AVG(events_count), 2) as avg_events,
      SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
      ROUND(SUM(purchase_value), 2) as total_spent,
      ROUND(AVG(events_per_minute), 2) as avg_engagement
    FROM session_data
    GROUP BY COALESCE(user_id, 'anon_' || session_id)
  ),
  segments AS (
    SELECT 
      user_key,
      session_count,
      avg_duration,
      avg_pages,
      avg_events,
      conversions,
      total_spent,
      avg_engagement,
      -- Classificar comportamento
      CASE 
        WHEN conversions > 0 AND total_spent > 200 THEN 'High Value Converter'
        WHEN conversions > 0 THEN 'Converter'
        WHEN avg_duration > 300 AND avg_pages > 5 THEN 'Engaged Browser'
        WHEN session_count > 2 AND avg_duration > 120 THEN 'Regular Visitor'
        WHEN avg_duration < 30 THEN 'Bouncer'
        ELSE 'Casual Browser'
      END as segment_name
    FROM user_stats
  )
  SELECT json_build_object(
    'segments', (
      SELECT json_agg(
        json_build_object(
          'segment_name', segment_name,
          'user_count', COUNT(*),
          'avg_session_duration', ROUND(AVG(avg_duration), 2),
          'avg_page_views', ROUND(AVG(avg_pages), 2),
          'conversion_rate', ROUND(
            CASE 
              WHEN SUM(session_count) > 0 
              THEN (SUM(conversions)::float / SUM(session_count) * 100)
              ELSE 0 
            END, 2
          ),
          'avg_purchase_value', ROUND(AVG(total_spent), 2)
        )
      )
      FROM segments 
      GROUP BY segment_name
    ),
    'total_users', (SELECT COUNT(*) FROM segments),
    'analysis_period', json_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date
    )
  ) INTO result;

  RETURN result;
END;
$$;