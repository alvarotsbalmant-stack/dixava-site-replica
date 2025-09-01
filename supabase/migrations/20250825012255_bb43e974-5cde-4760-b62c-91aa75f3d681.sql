-- Corrigir função get_behavioral_segmentation
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
  WITH session_metrics AS (
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
      -- Calcular métricas básicas sem window functions primeiro
      CASE 
        WHEN us.duration_seconds > 0 THEN us.events_count::float / (us.duration_seconds / 60.0)
        ELSE 0 
      END as events_per_minute,
      CASE 
        WHEN us.page_views > 0 THEN us.duration_seconds::float / us.page_views
        ELSE 0 
      END as avg_time_per_page
    FROM user_sessions us
    WHERE us.started_at >= p_start_date 
      AND us.started_at <= p_end_date + INTERVAL '1 day'
  ),
  user_aggregates AS (
    SELECT 
      COALESCE(user_id, 'anonymous_' || session_id) as user_key,
      COUNT(*) as total_sessions,
      AVG(duration_seconds) as avg_session_duration,
      AVG(page_views) as avg_page_views,
      AVG(events_count) as avg_events_count,
      SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
      SUM(purchase_value) as total_purchase_value,
      AVG(events_per_minute) as avg_engagement_rate,
      AVG(avg_time_per_page) as avg_time_per_page,
      STRING_AGG(DISTINCT device_type, ',') as devices_used,
      STRING_AGG(DISTINCT traffic_source, ',') as traffic_sources
    FROM session_metrics
    GROUP BY COALESCE(user_id, 'anonymous_' || session_id)
  ),
  behavioral_segments AS (
    SELECT 
      user_key,
      total_sessions,
      avg_session_duration,
      avg_page_views,
      avg_events_count,
      conversions,
      total_purchase_value,
      avg_engagement_rate,
      avg_time_per_page,
      devices_used,
      traffic_sources,
      -- Classificação comportamental
      CASE 
        WHEN conversions > 0 AND total_purchase_value > 100 THEN 'High Value Converter'
        WHEN conversions > 0 THEN 'Converter'
        WHEN avg_session_duration > 300 AND avg_page_views > 3 THEN 'Engaged Browser'
        WHEN total_sessions > 3 AND avg_session_duration > 60 THEN 'Regular Visitor'
        WHEN avg_session_duration < 30 THEN 'Bouncer'
        ELSE 'Casual Browser'
      END as behavior_segment,
      -- Score de engajamento
      LEAST(100, 
        (avg_session_duration / 10) + 
        (avg_page_views * 5) + 
        (avg_engagement_rate * 10) +
        (conversions * 20)
      ) as engagement_score
    FROM user_aggregates
  )
  SELECT json_build_object(
    'segments', json_agg(
      json_build_object(
        'segment_name', behavior_segment,
        'user_count', count(*),
        'avg_engagement_score', ROUND(AVG(engagement_score), 2),
        'avg_session_duration', ROUND(AVG(avg_session_duration), 2),
        'avg_page_views', ROUND(AVG(avg_page_views), 2),
        'conversion_rate', ROUND((SUM(conversions)::float / SUM(total_sessions) * 100), 2),
        'avg_purchase_value', ROUND(AVG(total_purchase_value), 2)
      )
    ),
    'total_users', (SELECT COUNT(DISTINCT user_key) FROM behavioral_segments),
    'analysis_period', json_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date
    ),
    'top_segments', (
      SELECT json_agg(
        json_build_object(
          'segment', behavior_segment,
          'percentage', ROUND((count(*)::float / (SELECT COUNT(*) FROM behavioral_segments) * 100), 1)
        )
      )
      FROM behavioral_segments 
      GROUP BY behavior_segment 
      ORDER BY count(*) DESC 
      LIMIT 3
    )
  ) INTO result
  FROM behavioral_segments
  GROUP BY behavior_segment;

  RETURN result;
END;
$$;