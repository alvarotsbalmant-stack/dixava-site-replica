-- Fix Security Definer Functions - Add search_path protection to all functions
-- This prevents search path injection attacks

-- Fix function search paths to prevent security vulnerabilities
ALTER FUNCTION public.has_admin_users() SET search_path = 'public';
ALTER FUNCTION public.is_admin_user() SET search_path = 'public';
ALTER FUNCTION public.sync_usuarios_with_profiles() SET search_path = 'public';
ALTER FUNCTION public.log_security_event(text, uuid, jsonb) SET search_path = 'public';
ALTER FUNCTION public.process_daily_login(uuid) SET search_path = 'public';
ALTER FUNCTION public.create_admin_link(integer) SET search_path = 'public';
ALTER FUNCTION public.is_user_admin() SET search_path = 'public';
ALTER FUNCTION public.redeem_coin_product(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.validate_admin_token(text, text) SET search_path = 'public';
ALTER FUNCTION public.promote_user_to_admin(text) SET search_path = 'public';
ALTER FUNCTION public.test_admin_access() SET search_path = 'public';
ALTER FUNCTION public.generate_redemption_code(uuid, uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.redeem_code_admin(text, uuid) SET search_path = 'public';
ALTER FUNCTION public.verify_redemption_code(text) SET search_path = 'public';
ALTER FUNCTION public.cleanup_unconfirmed_accounts() SET search_path = 'public';
ALTER FUNCTION public.create_admin_link_secure(integer) SET search_path = 'public';
ALTER FUNCTION public.get_user_role(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_admin() SET search_path = 'public';
ALTER FUNCTION public.has_active_subscription(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_active_subscription(uuid) SET search_path = 'public';
ALTER FUNCTION public.auto_update_uti_pro_enabled() SET search_path = 'public';
ALTER FUNCTION public.adicionar_meses_assinatura(uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.cleanup_old_security_logs() SET search_path = 'public';
ALTER FUNCTION public.is_user_flagged(uuid) SET search_path = 'public';
ALTER FUNCTION public.earn_coins(uuid, text, integer, text, jsonb) SET search_path = 'public';
ALTER FUNCTION public.cleanup_old_invalidated_sessions() SET search_path = 'public';
ALTER FUNCTION public.get_user_total_savings(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_email_confirmed() SET search_path = 'public';
ALTER FUNCTION public.remover_meses_assinatura(uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.cancelar_assinatura(uuid) SET search_path = 'public';
ALTER FUNCTION public.redeem_pro_code(uuid, uuid, timestamp with time zone) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- Add RLS policies for tables that have RLS enabled but no policies
-- Table: redemption_codes (assuming it exists and needs RLS policies)
CREATE POLICY "Users can view their own redemption codes" 
ON public.redemption_codes 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all redemption codes" 
ON public.redemption_codes 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert redemption codes" 
ON public.redemption_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage redemption codes" 
ON public.redemption_codes 
FOR ALL 
USING (is_admin());

-- Add policies for user_streaks table if it exists
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own streaks" 
ON public.user_streaks 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can manage user streaks" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add policies for uti_coins table if it exists
CREATE POLICY "Users can view their own coins" 
ON public.uti_coins 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage user coins" 
ON public.uti_coins 
FOR ALL 
USING (user_id = auth.uid() OR is_admin());

-- Add policies for user_subscriptions table if it exists
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

-- Add policies for subscription_plans table if it exists
CREATE POLICY "Everyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (is_admin());

-- Add policies for user_savings table if it exists
CREATE POLICY "Users can view their own savings" 
ON public.user_savings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage user savings" 
ON public.user_savings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add policies for security_logs table if it exists
CREATE POLICY "Admins can view all security logs" 
ON public.security_logs 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (true);

-- Add policies for security_flags table if it exists
CREATE POLICY "Admins can manage security flags" 
ON public.security_flags 
FOR ALL 
USING (is_admin());

CREATE POLICY "System can create security flags" 
ON public.security_flags 
FOR INSERT 
WITH CHECK (true);

-- Add policies for usuarios table if it exists
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