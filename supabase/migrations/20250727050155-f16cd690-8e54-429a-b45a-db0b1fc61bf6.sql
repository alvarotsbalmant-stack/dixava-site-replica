-- Add RLS policies for tables that have RLS enabled but no policies

-- Table: security_logs
CREATE POLICY "Admins can view all security logs" 
ON public.security_logs 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (true);

-- Table: security_flags  
CREATE POLICY "Admins can manage security flags" 
ON public.security_flags 
FOR ALL 
USING (is_admin());

CREATE POLICY "System can create security flags" 
ON public.security_flags 
FOR INSERT 
WITH CHECK (true);

-- Table: service_cards
CREATE POLICY "Everyone can view service cards" 
ON public.service_cards 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage service cards" 
ON public.service_cards 
FOR ALL 
USING (is_admin());

-- Table: site_settings
CREATE POLICY "Everyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (is_admin());

-- Table: special_section_elements
CREATE POLICY "Everyone can view special section elements" 
ON public.special_section_elements 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage special section elements" 
ON public.special_section_elements 
FOR ALL 
USING (is_admin());

-- Table: special_section_grid_layouts
CREATE POLICY "Everyone can view special section grid layouts" 
ON public.special_section_grid_layouts 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage special section grid layouts" 
ON public.special_section_grid_layouts 
FOR ALL 
USING (is_admin());

-- Table: special_sections
CREATE POLICY "Everyone can view special sections" 
ON public.special_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage special sections" 
ON public.special_sections 
FOR ALL 
USING (is_admin());

-- Table: storage_stats
CREATE POLICY "Admins can view storage stats" 
ON public.storage_stats 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage storage stats" 
ON public.storage_stats 
FOR ALL 
USING (is_admin());

-- Table: subscription_plans
CREATE POLICY "Everyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (is_admin());

-- Table: tags
CREATE POLICY "Everyone can view tags" 
ON public.tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tags" 
ON public.tags 
FOR ALL 
USING (is_admin());

-- Table: top_deal_items
CREATE POLICY "Everyone can view top deal items" 
ON public.top_deal_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage top deal items" 
ON public.top_deal_items 
FOR ALL 
USING (is_admin());

-- Table: top_deal_sections
CREATE POLICY "Everyone can view top deal sections" 
ON public.top_deal_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage top deal sections" 
ON public.top_deal_sections 
FOR ALL 
USING (is_admin());

-- Table: user_favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites" 
ON public.user_favorites 
FOR ALL 
USING (user_id = auth.uid());

-- Table: user_savings
CREATE POLICY "Users can view their own savings" 
ON public.user_savings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage user savings" 
ON public.user_savings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Table: user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (is_admin());

CREATE POLICY "System can manage user subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR is_admin());

-- Table: usuarios
CREATE POLICY "Users can view their own usuario record" 
ON public.usuarios 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Admins can manage all usuarios" 
ON public.usuarios 
FOR ALL 
USING (is_admin());

CREATE POLICY "System can manage usuario records" 
ON public.usuarios 
FOR ALL 
USING (id = auth.uid() OR is_admin());

-- Table: uti_coins
CREATE POLICY "Users can view their own coins" 
ON public.uti_coins 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage user coins" 
ON public.uti_coins 
FOR ALL 
USING (user_id = auth.uid() OR is_admin());