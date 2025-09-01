-- SISTEMA DE TRACKING ENTERPRISE - TABELAS CRÍTICAS
-- Implementação completa para capturar CADA ação do usuário

-- 1. PAGE_INTERACTIONS - Captura CADA micro-interação
CREATE TABLE IF NOT EXISTS public.page_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    user_id uuid,
    page_url text NOT NULL,
    page_title text,
    interaction_type text NOT NULL, -- click, hover, scroll, focus, blur, mousemove, touchstart, touchend
    element_selector text,
    element_text text,
    element_attributes jsonb,
    coordinates jsonb, -- {x, y, relativeX, relativeY}
    viewport_size jsonb, -- {width, height}
    scroll_position jsonb, -- {scrollX, scrollY, scrollDepth}
    duration_ms integer,
    sequence_number integer,
    context_data jsonb DEFAULT '{}',
    device_type text,
    browser_info jsonb,
    timestamp_precise timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 2. USER_JOURNEY_DETAILED - Jornada step-by-step completa
CREATE TABLE IF NOT EXISTS public.user_journey_detailed (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    user_id uuid,
    step_number integer NOT NULL,
    page_url text NOT NULL,
    page_title text,
    action_type text NOT NULL, -- page_view, click, scroll, search, add_to_cart, checkout_step, purchase
    action_details jsonb,
    element_interacted text,
    time_spent_seconds integer,
    cumulative_time_seconds integer,
    funnel_stage text, -- awareness, consideration, decision, purchase, retention
    conversion_step boolean DEFAULT false,
    exit_point boolean DEFAULT false,
    friction_detected boolean DEFAULT false,
    friction_type text, -- slow_load, rapid_clicks, long_pauses, back_forth_navigation, form_abandonment
    engagement_score numeric DEFAULT 0,
    predicted_next_action text,
    step_start_time timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. REALTIME_ACTIVITY - Status de usuários em tempo real
CREATE TABLE IF NOT EXISTS public.realtime_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL UNIQUE,
    user_id uuid,
    current_page text,
    activity_status text NOT NULL DEFAULT 'active', -- active, idle, engaged, leaving, converting
    last_heartbeat timestamp with time zone DEFAULT now(),
    engagement_score numeric DEFAULT 0,
    time_on_site_seconds integer DEFAULT 0,
    pages_visited integer DEFAULT 1,
    current_product_viewing uuid,
    cart_items_count integer DEFAULT 0,
    cart_value numeric DEFAULT 0,
    conversion_probability numeric DEFAULT 0,
    churn_risk_score numeric DEFAULT 0,
    real_time_intent text, -- browsing, researching, comparing, buying, leaving
    predicted_action text,
    intervention_triggered boolean DEFAULT false,
    device_info jsonb,
    location_data jsonb,
    traffic_source text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. MOUSE_TRACKING - Tracking contínuo do mouse
CREATE TABLE IF NOT EXISTS public.mouse_tracking (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    user_id uuid,
    page_url text NOT NULL,
    coordinates jsonb NOT NULL, -- {x, y}
    relative_coordinates jsonb, -- {relX, relY} percentage based
    viewport_size jsonb NOT NULL, -- {width, height}
    movement_type text, -- move, click, scroll, hover, drag
    velocity numeric,
    acceleration numeric,
    direction_angle numeric,
    target_element text,
    pause_duration_ms integer,
    heat_zone text, -- calculated zone for heatmap
    interaction_context jsonb DEFAULT '{}',
    timestamp_precise timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 5. SCROLL_BEHAVIOR - Comportamento detalhado de scroll
CREATE TABLE IF NOT EXISTS public.scroll_behavior (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    user_id uuid,
    page_url text NOT NULL,
    scroll_depth_percentage numeric,
    scroll_depth_pixels integer,
    scroll_direction text, -- up, down
    scroll_velocity numeric,
    time_to_scroll_seconds numeric,
    scroll_pauses_count integer,
    max_scroll_reached numeric,
    sections_viewed jsonb, -- array of sections scrolled through
    engagement_per_section jsonb,
    exit_scroll_depth numeric,
    scroll_pattern text, -- smooth, erratic, rapid, slow
    device_type text,
    timestamp_precise timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 6. SEARCH_BEHAVIOR_DETAILED - Análise completa de buscas
CREATE TABLE IF NOT EXISTS public.search_behavior_detailed (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    user_id uuid,
    search_query text NOT NULL,
    search_context text, -- header_search, category_filter, site_search
    filters_applied jsonb,
    sort_criteria text,
    results_count integer,
    results_shown integer,
    results_clicked integer,
    first_result_clicked_position integer,
    time_to_first_click_seconds numeric,
    time_spent_on_results_seconds numeric,
    search_refinements_count integer,
    search_refinements jsonb,
    search_success boolean, -- did user find what they wanted
    conversion_from_search boolean DEFAULT false,
    search_session_value numeric DEFAULT 0,
    search_intent text, -- product_specific, category_browse, price_compare, information_seeking
    created_at timestamp with time zone DEFAULT now()
);

-- 7. NAVIGATION_FLOW - Fluxo detalhado de navegação
CREATE TABLE IF NOT EXISTS public.navigation_flow (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    from_page text,
    to_page text,
    navigation_type text, -- link_click, back_button, forward_button, direct_url, bookmark
    time_on_previous_page_seconds integer,
    exit_intent_detected boolean DEFAULT false,
    transition_time timestamp with time zone DEFAULT now()
);

-- ÍNDICES PARA PERFORMANCE EXTREMA
CREATE INDEX IF NOT EXISTS idx_page_interactions_session_time ON public.page_interactions(session_id, timestamp_precise);
CREATE INDEX IF NOT EXISTS idx_page_interactions_page_type ON public.page_interactions(page_url, interaction_type);
CREATE INDEX IF NOT EXISTS idx_page_interactions_coordinates ON public.page_interactions USING gin(coordinates);

CREATE INDEX IF NOT EXISTS idx_journey_session_step ON public.user_journey_detailed(session_id, step_number);
CREATE INDEX IF NOT EXISTS idx_journey_funnel_stage ON public.user_journey_detailed(funnel_stage, conversion_step);
CREATE INDEX IF NOT EXISTS idx_journey_page_action ON public.user_journey_detailed(page_url, action_type);

CREATE INDEX IF NOT EXISTS idx_realtime_activity_session ON public.realtime_activity(session_id);
CREATE INDEX IF NOT EXISTS idx_realtime_activity_status ON public.realtime_activity(activity_status, last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_realtime_activity_user ON public.realtime_activity(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mouse_tracking_session_time ON public.mouse_tracking(session_id, timestamp_precise);
CREATE INDEX IF NOT EXISTS idx_mouse_tracking_page ON public.mouse_tracking(page_url);
CREATE INDEX IF NOT EXISTS idx_mouse_tracking_coordinates ON public.mouse_tracking USING gin(coordinates);

CREATE INDEX IF NOT EXISTS idx_scroll_behavior_session ON public.scroll_behavior(session_id, timestamp_precise);
CREATE INDEX IF NOT EXISTS idx_scroll_behavior_page_depth ON public.scroll_behavior(page_url, scroll_depth_percentage);

CREATE INDEX IF NOT EXISTS idx_search_behavior_session ON public.search_behavior_detailed(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_search_behavior_query ON public.search_behavior_detailed(search_query);
CREATE INDEX IF NOT EXISTS idx_search_behavior_success ON public.search_behavior_detailed(search_success, conversion_from_search);

CREATE INDEX IF NOT EXISTS idx_navigation_flow_session ON public.navigation_flow(session_id, transition_time);
CREATE INDEX IF NOT EXISTS idx_navigation_flow_pages ON public.navigation_flow(from_page, to_page);

-- ENABLE RLS
ALTER TABLE public.page_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mouse_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scroll_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_behavior_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_flow ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - Acesso admin + inserção pública para tracking
CREATE POLICY "Admins can manage page_interactions" ON public.page_interactions FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert page_interactions" ON public.page_interactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage user_journey_detailed" ON public.user_journey_detailed FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert user_journey_detailed" ON public.user_journey_detailed FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage realtime_activity" ON public.realtime_activity FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert realtime_activity" ON public.realtime_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update realtime_activity" ON public.realtime_activity FOR UPDATE USING (true);

CREATE POLICY "Admins can manage mouse_tracking" ON public.mouse_tracking FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert mouse_tracking" ON public.mouse_tracking FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage scroll_behavior" ON public.scroll_behavior FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert scroll_behavior" ON public.scroll_behavior FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage search_behavior_detailed" ON public.search_behavior_detailed FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert search_behavior_detailed" ON public.search_behavior_detailed FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage navigation_flow" ON public.navigation_flow FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert navigation_flow" ON public.navigation_flow FOR INSERT WITH CHECK (true);