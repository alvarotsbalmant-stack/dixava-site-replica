-- Corrigir políticas RLS para navigation_items

-- Remover política existente limitada
DROP POLICY IF EXISTS "navigation_items_select_policy" ON navigation_items;

-- Criar política de leitura pública para itens visíveis e ativos
CREATE POLICY "navigation_items_public_select" ON navigation_items
  FOR SELECT 
  USING (is_visible = true AND is_active = true);

-- Criar política administrativa completa
CREATE POLICY "navigation_items_admin_policy" ON navigation_items
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );