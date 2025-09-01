-- Criar tabela para rastrear sessões invalidadas
CREATE TABLE public.invalidated_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  invalidated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.invalidated_sessions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias sessões invalidadas
CREATE POLICY "Users can view their own invalidated sessions" 
ON public.invalidated_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias sessões invalidadas
CREATE POLICY "Users can insert their own invalidated sessions" 
ON public.invalidated_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas as sessões invalidadas
CREATE POLICY "Admins can view all invalidated sessions" 
ON public.invalidated_sessions 
FOR SELECT 
USING (is_admin());

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_invalidated_sessions_session_id ON public.invalidated_sessions(session_id);
CREATE INDEX idx_invalidated_sessions_user_id ON public.invalidated_sessions(user_id);

-- Função para limpar sessões invalidadas antigas (opcional, para manutenção)
CREATE OR REPLACE FUNCTION public.cleanup_old_invalidated_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove sessões invalidadas com mais de 30 dias
  DELETE FROM public.invalidated_sessions 
  WHERE invalidated_at < NOW() - INTERVAL '30 days';
END;
$$;