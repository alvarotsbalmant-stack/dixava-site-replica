-- Phase 1: Database - Create daily_bonus_config table and fix existing functions

-- Create daily_bonus_config table
CREATE TABLE IF NOT EXISTS public.daily_bonus_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_bonus_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view daily bonus config" 
ON public.daily_bonus_config 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage daily bonus config" 
ON public.daily_bonus_config 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Insert initial configuration
INSERT INTO public.daily_bonus_config (setting_key, setting_value, description) VALUES
  ('daily_bonus_enabled', 'true', 'Enable/disable the daily bonus system'),
  ('bonus_reset_hour', '20', 'Hour of day when bonus resets (Brasilia time)'),
  ('base_bonus_amount', '10', 'Base amount of coins for daily bonus'),
  ('max_streak_days', '30', 'Maximum streak days for bonus calculation'),
  ('streak_bonus_multiplier', '0.1', 'Additional multiplier per streak day')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_daily_bonus_config_updated_at
  BEFORE UPDATE ON public.daily_bonus_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();