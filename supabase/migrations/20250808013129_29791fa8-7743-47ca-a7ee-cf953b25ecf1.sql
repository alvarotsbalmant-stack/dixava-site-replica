-- Função para buscar analytics do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_analytics(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_sessions INTEGER,
  total_purchases INTEGER,
  avg_conversion_rate NUMERIC,
  avg_order_value NUMERIC,
  cart_abandonment_rate NUMERIC,
  whatsapp_clicks INTEGER,
  period_data JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  period_stats JSONB;
BEGIN
  -- Buscar dados agregados do período
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN ce.event_type = 'purchase' 
        THEN (ce.event_data->>'value')::NUMERIC 
        ELSE 0 
      END
    ), 0) AS revenue,
    COUNT(DISTINCT ce.session_id) AS sessions,
    COUNT(
      CASE 
        WHEN ce.event_type = 'purchase' 
        THEN 1 
      END
    ) AS purchases,
    COUNT(
      CASE 
        WHEN ce.event_type = 'whatsapp_click' 
        THEN 1 
      END
    ) AS whatsapp_clicks
  INTO total_revenue, total_sessions, total_purchases, whatsapp_clicks
  FROM customer_events ce
  WHERE ce.created_at::DATE BETWEEN start_date AND end_date;

  -- Calcular métricas derivadas
  IF total_sessions > 0 THEN
    avg_conversion_rate := (total_purchases::NUMERIC / total_sessions::NUMERIC) * 100;
  ELSE
    avg_conversion_rate := 0;
  END IF;

  IF total_purchases > 0 THEN
    avg_order_value := total_revenue / total_purchases;
  ELSE
    avg_order_value := 0;
  END IF;

  -- Calcular taxa de abandono de carrinho (mock por enquanto)
  cart_abandonment_rate := 68.5;

  -- Buscar dados por período (agrupados por dia)
  SELECT JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'date', period_date,
      'revenue', daily_revenue,
      'sessions', daily_sessions,
      'purchases', daily_purchases,
      'conversion_rate', 
      CASE 
        WHEN daily_sessions > 0 
        THEN ROUND((daily_purchases::NUMERIC / daily_sessions::NUMERIC) * 100, 2)
        ELSE 0 
      END
    )
  )
  INTO period_stats
  FROM (
    SELECT 
      ce.created_at::DATE AS period_date,
      COALESCE(SUM(
        CASE 
          WHEN ce.event_type = 'purchase' 
          THEN (ce.event_data->>'value')::NUMERIC 
          ELSE 0 
        END
      ), 0) AS daily_revenue,
      COUNT(DISTINCT ce.session_id) AS daily_sessions,
      COUNT(
        CASE 
          WHEN ce.event_type = 'purchase' 
          THEN 1 
        END
      ) AS daily_purchases
    FROM customer_events ce
    WHERE ce.created_at::DATE BETWEEN start_date AND end_date
    GROUP BY ce.created_at::DATE
    ORDER BY ce.created_at::DATE
  ) daily_stats;

  period_data := COALESCE(period_stats, '[]'::JSONB);

  RETURN QUERY SELECT 
    get_dashboard_analytics.total_revenue,
    get_dashboard_analytics.total_sessions,
    get_dashboard_analytics.total_purchases,
    get_dashboard_analytics.avg_conversion_rate,
    get_dashboard_analytics.avg_order_value,
    get_dashboard_analytics.cart_abandonment_rate,
    get_dashboard_analytics.whatsapp_clicks,
    get_dashboard_analytics.period_data;
END;
$$;

-- Função para buscar analytics dos top produtos
CREATE OR REPLACE FUNCTION get_top_products_analytics(
  start_date DATE,
  end_date DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  total_views INTEGER,
  total_purchases INTEGER,
  total_revenue NUMERIC,
  avg_conversion_rate NUMERIC,
  whatsapp_clicks INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    ce.product_id,
    COALESCE(
      (ce.event_data->>'product_name')::TEXT,
      'Produto ' || ce.product_id::TEXT
    ) AS product_name,
    COUNT(
      CASE 
        WHEN ce.event_type = 'product_view' 
        THEN 1 
      END
    )::INTEGER AS total_views,
    COUNT(
      CASE 
        WHEN ce.event_type = 'purchase' 
        THEN 1 
      END
    )::INTEGER AS total_purchases,
    COALESCE(SUM(
      CASE 
        WHEN ce.event_type = 'purchase' 
        THEN (ce.event_data->>'value')::NUMERIC 
        ELSE 0 
      END
    ), 0) AS total_revenue,
    CASE 
      WHEN COUNT(
        CASE 
          WHEN ce.event_type = 'product_view' 
          THEN 1 
        END
      ) > 0 
      THEN ROUND(
        (COUNT(
          CASE 
            WHEN ce.event_type = 'purchase' 
            THEN 1 
          END
        )::NUMERIC / COUNT(
          CASE 
            WHEN ce.event_type = 'product_view' 
            THEN 1 
          END
        )::NUMERIC) * 100, 
        2
      )
      ELSE 0 
    END AS avg_conversion_rate,
    COUNT(
      CASE 
        WHEN ce.event_type = 'whatsapp_click' 
        THEN 1 
      END
    )::INTEGER AS whatsapp_clicks
  FROM customer_events ce
  WHERE ce.created_at::DATE BETWEEN start_date AND end_date
    AND ce.product_id IS NOT NULL
  GROUP BY ce.product_id
  ORDER BY total_purchases DESC, total_views DESC
  LIMIT limit_count;
END;
$$;