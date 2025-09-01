-- Inserir dados de exemplo para demonstração do sistema de analytics
-- Isso permitirá que o dashboard funcione mesmo sem dados reais

-- Limpar dados existentes (se houver)
DELETE FROM public.customer_events;
DELETE FROM public.user_sessions;
DELETE FROM public.product_analytics;
DELETE FROM public.period_analytics;

-- Inserir sessões de exemplo
INSERT INTO public.user_sessions (
  session_id, user_id, started_at, ended_at, duration_seconds, 
  page_views, events_count, traffic_source, device_type, browser, os,
  converted, purchase_value
) VALUES 
  ('demo_session_1', null, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 3600, 5, 12, 'google', 'desktop', 'Chrome', 'Windows', true, 199.90),
  ('demo_session_2', null, NOW() - INTERVAL '2 days', NOW() - INTERVAL '47 hours', 1800, 3, 8, 'social', 'mobile', 'Safari', 'iOS', false, 0),
  ('demo_session_3', null, NOW() - INTERVAL '3 days', NOW() - INTERVAL '71 hours', 2400, 4, 10, 'direct', 'desktop', 'Firefox', 'Linux', true, 299.90),
  ('demo_session_4', null, NOW() - INTERVAL '4 days', NOW() - INTERVAL '95 hours', 900, 2, 5, 'whatsapp', 'mobile', 'Chrome', 'Android', false, 0),
  ('demo_session_5', null, NOW() - INTERVAL '5 days', NOW() - INTERVAL '119 hours', 3000, 6, 15, 'google', 'tablet', 'Safari', 'iOS', true, 149.90);

-- Inserir eventos de exemplo
INSERT INTO public.customer_events (
  session_id, event_type, event_data, product_id, page_url, 
  user_agent, device_type, created_at
) VALUES 
  ('demo_session_1', 'page_view', '{"title": "Homepage"}', null, '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '1 day'),
  ('demo_session_1', 'product_view', '{"product_name": "Console Xbox"}', gen_random_uuid(), '/produto/xbox', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
  ('demo_session_1', 'add_to_cart', '{"quantity": 1, "price": 199.90}', gen_random_uuid(), '/produto/xbox', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'),
  ('demo_session_1', 'whatsapp_click', '{"context": "product_page"}', gen_random_uuid(), '/produto/xbox', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '1 day' + INTERVAL '12 minutes'),
  ('demo_session_1', 'purchase', '{"order_id": "demo_order_1", "value": 199.90}', gen_random_uuid(), '/checkout', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'),
  
  ('demo_session_2', 'page_view', '{"title": "Homepage"}', null, '/', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', 'mobile', NOW() - INTERVAL '2 days'),
  ('demo_session_2', 'product_view', '{"product_name": "PlayStation 5"}', gen_random_uuid(), '/produto/ps5', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', 'mobile', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes'),
  ('demo_session_2', 'whatsapp_click', '{"context": "product_page"}', gen_random_uuid(), '/produto/ps5', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', 'mobile', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
  
  ('demo_session_3', 'page_view', '{"title": "Homepage"}', null, '/', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '3 days'),
  ('demo_session_3', 'product_view', '{"product_name": "Nintendo Switch"}', gen_random_uuid(), '/produto/switch', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes'),
  ('demo_session_3', 'add_to_cart', '{"quantity": 1, "price": 299.90}', gen_random_uuid(), '/produto/switch', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '3 days' + INTERVAL '8 minutes'),
  ('demo_session_3', 'purchase', '{"order_id": "demo_order_2", "value": 299.90}', gen_random_uuid(), '/checkout', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'desktop', NOW() - INTERVAL '3 days' + INTERVAL '12 minutes');

-- Inserir analytics agregados por produto (simulando IDs de produtos existentes)
DO $$
DECLARE
  product_record RECORD;
  demo_date DATE;
BEGIN
  -- Buscar alguns produtos existentes para usar nos analytics
  FOR product_record IN 
    SELECT id FROM public.products WHERE is_active = true LIMIT 5
  LOOP
    -- Inserir dados para os últimos 7 dias
    FOR i IN 0..6 LOOP
      demo_date := CURRENT_DATE - i;
      
      INSERT INTO public.product_analytics (
        product_id, date, views_count, unique_views, add_to_cart_count,
        purchases_count, purchase_value, whatsapp_clicks, conversion_rate
      ) VALUES (
        product_record.id,
        demo_date,
        floor(random() * 50 + 10)::integer, -- 10-60 visualizações
        floor(random() * 30 + 5)::integer,  -- 5-35 visualizações únicas
        floor(random() * 10 + 1)::integer,  -- 1-11 adições ao carrinho
        floor(random() * 3)::integer,       -- 0-3 compras
        round((random() * 500 + 100)::numeric, 2), -- R$ 100-600
        floor(random() * 8 + 2)::integer,   -- 2-10 cliques WhatsApp
        round((random() * 8 + 2)::numeric, 2) -- 2-10% conversão
      ) ON CONFLICT (product_id, date) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Inserir analytics por período
INSERT INTO public.period_analytics (
  date, total_sessions, unique_visitors, total_page_views, total_events,
  total_purchases, total_revenue, conversion_rate, avg_session_duration,
  whatsapp_clicks
) VALUES 
  (CURRENT_DATE, 45, 38, 156, 234, 8, 1847.50, 17.78, 2100, 28),
  (CURRENT_DATE - 1, 52, 44, 189, 287, 12, 2156.80, 23.08, 1950, 32),
  (CURRENT_DATE - 2, 38, 31, 134, 201, 6, 1324.40, 15.79, 2300, 21),
  (CURRENT_DATE - 3, 41, 35, 147, 218, 9, 1789.70, 21.95, 2050, 25),
  (CURRENT_DATE - 4, 48, 40, 172, 256, 11, 2034.20, 22.92, 2150, 29),
  (CURRENT_DATE - 5, 35, 29, 118, 174, 5, 1156.50, 14.29, 1850, 18),
  (CURRENT_DATE - 6, 43, 37, 161, 241, 10, 1923.60, 23.26, 2000, 27);

-- Atualizar as sessões de demonstração para marcar como convertidas
UPDATE public.user_sessions 
SET converted = true
WHERE session_id IN ('demo_session_1', 'demo_session_3', 'demo_session_5');