-- Sistema de Análise de Comportamento do Cliente
-- Criando estrutura otimizada para rastreamento e análise

-- Tabela principal de eventos de rastreamento
CREATE TABLE public.customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- NULL para visitantes anônimos
  session_id TEXT NOT NULL, -- ID único da sessão
  event_type TEXT NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'checkout_abandon', 'purchase', 'whatsapp_click'
  event_data JSONB NOT NULL DEFAULT '{}', -- Dados específicos do evento
  product_id UUID, -- ID do produto relacionado (se aplicável)
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  location_data JSONB, -- Dados de geolocalização
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices otimizados para consultas frequentes
CREATE INDEX idx_customer_events_user_id ON public.customer_events(user_id);
CREATE INDEX idx_customer_events_session_id ON public.customer_events(session_id);
CREATE INDEX idx_customer_events_event_type ON public.customer_events(event_type);
CREATE INDEX idx_customer_events_product_id ON public.customer_events(product_id);
CREATE INDEX idx_customer_events_created_at ON public.customer_events(created_at);
CREATE INDEX idx_customer_events_composite ON public.customer_events(event_type, created_at, product_id);

-- Tabela de sessões de usuário
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID, -- NULL para visitantes anônimos
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  traffic_source TEXT, -- 'google', 'social', 'direct', 'whatsapp', 'email'
  utm_campaign TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  location_data JSONB,
  converted BOOLEAN DEFAULT FALSE,
  purchase_value NUMERIC DEFAULT 0
);

-- Índices para sessões
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX idx_user_sessions_traffic_source ON public.user_sessions(traffic_source);

-- Tabela de métricas agregadas por produto
CREATE TABLE public.product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  add_to_cart_count INTEGER DEFAULT 0,
  remove_from_cart_count INTEGER DEFAULT 0,
  checkout_starts INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  purchase_value NUMERIC DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  whatsapp_conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  cart_abandonment_rate NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, date)
);

-- Índices para analytics
CREATE INDEX idx_product_analytics_product_id ON public.product_analytics(product_id);
CREATE INDEX idx_product_analytics_date ON public.product_analytics(date);
CREATE INDEX idx_product_analytics_composite ON public.product_analytics(product_id, date);

-- Tabela de métricas agregadas por período
CREATE TABLE public.period_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_sessions INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  new_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  cart_abandonment_rate NUMERIC DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  whatsapp_conversions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para rastreamento de carrinho abandonado
CREATE TABLE public.cart_abandonment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  cart_items JSONB NOT NULL,
  cart_value NUMERIC NOT NULL,
  abandoned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checkout_step TEXT, -- Em que etapa parou
  time_in_checkout_seconds INTEGER,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMPTZ
);

-- Tabela para análise de fluxo de navegação
CREATE TABLE public.navigation_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  from_page TEXT,
  to_page TEXT,
  transition_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_on_previous_page_seconds INTEGER
);

-- Tabela para customer lifetime value
CREATE TABLE public.customer_ltv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  first_purchase_date DATE,
  last_purchase_date DATE,
  total_purchases INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  purchase_frequency NUMERIC DEFAULT 0, -- Compras por mês
  lifetime_value NUMERIC DEFAULT 0,
  churn_risk_score NUMERIC DEFAULT 0, -- 0-1 score
  segment TEXT, -- 'new', 'active', 'at_risk', 'lost'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para análise de produtos relacionados/cross-selling
CREATE TABLE public.product_affinity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_a_id UUID NOT NULL,
  product_b_id UUID NOT NULL,
  co_purchase_count INTEGER DEFAULT 0,
  co_view_count INTEGER DEFAULT 0,
  affinity_score NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_a_id, product_b_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_abandonment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_ltv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_affinity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Admins podem ver tudo
CREATE POLICY "Admins can manage customer_events" ON public.customer_events
FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage user_sessions" ON public.user_sessions
FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage product_analytics" ON public.product_analytics
FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage period_analytics" ON public.period_analytics
FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage cart_abandonment" ON public.cart_abandonment
FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage navigation_flow" ON public.navigation_flow
FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage customer_ltv" ON public.customer_ltv
FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage product_affinity" ON public.product_affinity
FOR ALL USING (is_admin());

-- Políticas para inserção de eventos (público pode inserir)
CREATE POLICY "Anyone can insert customer_events" ON public.customer_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert user_sessions" ON public.user_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert cart_abandonment" ON public.cart_abandonment
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert navigation_flow" ON public.navigation_flow
FOR INSERT WITH CHECK (true);

-- Função para processar eventos em lote
CREATE OR REPLACE FUNCTION public.process_analytics_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  process_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Processar métricas por produto
  INSERT INTO public.product_analytics (
    product_id, date, views_count, unique_views, add_to_cart_count,
    remove_from_cart_count, checkout_starts, purchases_count, purchase_value,
    whatsapp_clicks, conversion_rate, cart_abandonment_rate
  )
  SELECT 
    e.product_id,
    process_date,
    COUNT(*) FILTER (WHERE e.event_type = 'product_view') as views_count,
    COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_type = 'product_view') as unique_views,
    COUNT(*) FILTER (WHERE e.event_type = 'add_to_cart') as add_to_cart_count,
    COUNT(*) FILTER (WHERE e.event_type = 'remove_from_cart') as remove_from_cart_count,
    COUNT(*) FILTER (WHERE e.event_type = 'checkout_start') as checkout_starts,
    COUNT(*) FILTER (WHERE e.event_type = 'purchase') as purchases_count,
    COALESCE(SUM((e.event_data->>'value')::numeric) FILTER (WHERE e.event_type = 'purchase'), 0) as purchase_value,
    COUNT(*) FILTER (WHERE e.event_type = 'whatsapp_click') as whatsapp_clicks,
    CASE 
      WHEN COUNT(*) FILTER (WHERE e.event_type = 'product_view') > 0 
      THEN (COUNT(*) FILTER (WHERE e.event_type = 'purchase')::numeric / COUNT(*) FILTER (WHERE e.event_type = 'product_view')::numeric) * 100
      ELSE 0 
    END as conversion_rate,
    CASE 
      WHEN COUNT(*) FILTER (WHERE e.event_type = 'add_to_cart') > 0 
      THEN ((COUNT(*) FILTER (WHERE e.event_type = 'add_to_cart') - COUNT(*) FILTER (WHERE e.event_type = 'purchase'))::numeric / COUNT(*) FILTER (WHERE e.event_type = 'add_to_cart')::numeric) * 100
      ELSE 0 
    END as cart_abandonment_rate
  FROM public.customer_events e
  WHERE DATE(e.created_at) = process_date
    AND e.product_id IS NOT NULL
  GROUP BY e.product_id
  ON CONFLICT (product_id, date) 
  DO UPDATE SET
    views_count = EXCLUDED.views_count,
    unique_views = EXCLUDED.unique_views,
    add_to_cart_count = EXCLUDED.add_to_cart_count,
    remove_from_cart_count = EXCLUDED.remove_from_cart_count,
    checkout_starts = EXCLUDED.checkout_starts,
    purchases_count = EXCLUDED.purchases_count,
    purchase_value = EXCLUDED.purchase_value,
    whatsapp_clicks = EXCLUDED.whatsapp_clicks,
    conversion_rate = EXCLUDED.conversion_rate,
    cart_abandonment_rate = EXCLUDED.cart_abandonment_rate,
    updated_at = NOW();

  -- Processar métricas por período
  INSERT INTO public.period_analytics (
    date, total_sessions, unique_visitors, total_page_views, total_events,
    total_purchases, total_revenue, conversion_rate, avg_session_duration,
    whatsapp_clicks
  )
  SELECT 
    process_date,
    COUNT(DISTINCT s.session_id) as total_sessions,
    COUNT(DISTINCT COALESCE(s.user_id::text, s.session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE e.event_type = 'page_view') as total_page_views,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE e.event_type = 'purchase') as total_purchases,
    COALESCE(SUM((e.event_data->>'value')::numeric) FILTER (WHERE e.event_type = 'purchase'), 0) as total_revenue,
    CASE 
      WHEN COUNT(DISTINCT s.session_id) > 0 
      THEN (COUNT(*) FILTER (WHERE e.event_type = 'purchase')::numeric / COUNT(DISTINCT s.session_id)::numeric) * 100
      ELSE 0 
    END as conversion_rate,
    COALESCE(AVG(s.duration_seconds), 0) as avg_session_duration,
    COUNT(*) FILTER (WHERE e.event_type = 'whatsapp_click') as whatsapp_clicks
  FROM public.customer_events e
  LEFT JOIN public.user_sessions s ON e.session_id = s.session_id
  WHERE DATE(e.created_at) = process_date
  ON CONFLICT (date) 
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    unique_visitors = EXCLUDED.unique_visitors,
    total_page_views = EXCLUDED.total_page_views,
    total_events = EXCLUDED.total_events,
    total_purchases = EXCLUDED.total_purchases,
    total_revenue = EXCLUDED.total_revenue,
    conversion_rate = EXCLUDED.conversion_rate,
    avg_session_duration = EXCLUDED.avg_session_duration,
    whatsapp_clicks = EXCLUDED.whatsapp_clicks,
    updated_at = NOW();

END;
$$;

-- Função para obter dashboard analytics
CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;

  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(total_revenue), 0),
    'total_sessions', COALESCE(SUM(total_sessions), 0),
    'total_purchases', COALESCE(SUM(total_purchases), 0),
    'avg_conversion_rate', COALESCE(AVG(conversion_rate), 0),
    'avg_order_value', CASE 
      WHEN SUM(total_purchases) > 0 
      THEN SUM(total_revenue) / SUM(total_purchases) 
      ELSE 0 
    END,
    'cart_abandonment_rate', COALESCE(AVG(cart_abandonment_rate), 0),
    'whatsapp_clicks', COALESCE(SUM(whatsapp_clicks), 0),
    'period_data', jsonb_agg(
      jsonb_build_object(
        'date', date,
        'revenue', total_revenue,
        'sessions', total_sessions,
        'purchases', total_purchases,
        'conversion_rate', conversion_rate
      ) ORDER BY date
    )
  ) INTO result
  FROM public.period_analytics
  WHERE date BETWEEN start_date AND end_date;

  RETURN COALESCE(result, jsonb_build_object('error', 'Nenhum dado encontrado'));
END;
$$;

-- Função para obter top produtos
CREATE OR REPLACE FUNCTION public.get_top_products_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'product_id', pa.product_id,
      'product_name', p.name,
      'total_views', SUM(pa.views_count),
      'total_purchases', SUM(pa.purchases_count),
      'total_revenue', SUM(pa.purchase_value),
      'avg_conversion_rate', AVG(pa.conversion_rate),
      'whatsapp_clicks', SUM(pa.whatsapp_clicks)
    ) ORDER BY SUM(pa.purchase_value) DESC
  ) INTO result
  FROM public.product_analytics pa
  LEFT JOIN public.products p ON pa.product_id = p.id
  WHERE pa.date BETWEEN start_date AND end_date
  GROUP BY pa.product_id, p.name
  LIMIT limit_count;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;