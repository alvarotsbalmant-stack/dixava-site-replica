-- Primeiro, fazer DROP da função existente
DROP FUNCTION IF EXISTS public.get_current_bonus_period_brasilia();

-- Recriar função com lógica corrigida para calcular corretamente as 20h do dia atual
CREATE OR REPLACE FUNCTION public.get_current_bonus_period_brasilia()
RETURNS TABLE(
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  next_reset TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  brasilia_now TIMESTAMP WITH TIME ZONE;
  today_20h TIMESTAMP WITH TIME ZONE;
  yesterday_20h TIMESTAMP WITH TIME ZONE;
  tomorrow_20h TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular horário atual em Brasília (GMT-3)
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Calcular 20h de hoje em Brasília
  today_20h := (DATE(brasilia_now) || ' 20:00:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
  
  -- Calcular 20h de ontem e amanhã
  yesterday_20h := today_20h - INTERVAL '1 day';
  tomorrow_20h := today_20h + INTERVAL '1 day';
  
  -- Lógica corrigida: 
  -- Se ainda não passou das 20h de hoje, o período atual é de ontem 20h até hoje 20h
  -- Se já passou das 20h de hoje, o período atual é de hoje 20h até amanhã 20h
  IF brasilia_now < today_20h THEN
    -- Ainda não passou das 20h de hoje
    RETURN QUERY SELECT 
      yesterday_20h as period_start,
      today_20h as period_end,
      today_20h as next_reset;
  ELSE
    -- Já passou das 20h de hoje
    RETURN QUERY SELECT 
      today_20h as period_start,
      tomorrow_20h as period_end,
      tomorrow_20h as next_reset;
  END IF;
END;
$function$;