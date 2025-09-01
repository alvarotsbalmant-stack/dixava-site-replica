-- Corrigir função get_top_products_analytics
CREATE OR REPLACE FUNCTION public.get_top_products_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;

  -- Buscar dados de produtos agregados
  WITH product_stats AS (
    SELECT 
      pa.product_id,
      p.name as product_name,
      SUM(pa.views_count) as total_views,
      SUM(pa.purchases_count) as total_purchases,
      SUM(pa.purchase_value) as total_revenue,
      AVG(pa.conversion_rate) as avg_conversion_rate,
      SUM(pa.whatsapp_clicks) as whatsapp_clicks
    FROM public.product_analytics pa
    LEFT JOIN public.products p ON pa.product_id = p.id
    WHERE pa.date BETWEEN start_date AND end_date
    GROUP BY pa.product_id, p.name
    ORDER BY SUM(pa.purchase_value) DESC
    LIMIT limit_count
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_id', product_id,
      'product_name', COALESCE(product_name, 'Produto sem nome'),
      'total_views', COALESCE(total_views, 0),
      'total_purchases', COALESCE(total_purchases, 0),
      'total_revenue', COALESCE(total_revenue, 0),
      'avg_conversion_rate', COALESCE(avg_conversion_rate, 0),
      'whatsapp_clicks', COALESCE(whatsapp_clicks, 0)
    )
  ) INTO result
  FROM product_stats;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;