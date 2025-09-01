-- Fix the SQL syntax error in get_top_products_analytics function
CREATE OR REPLACE FUNCTION public.get_top_products_analytics(start_date date, end_date date, limit_count integer DEFAULT 10)
 RETURNS TABLE(product_id uuid, product_name text, total_views integer, total_purchases integer, total_revenue numeric, avg_conversion_rate numeric, whatsapp_clicks integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT 
    ce.product_id,
    COALESCE(
      MAX((ce.event_data->>'product_name')::TEXT),
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
$function$