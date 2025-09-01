-- Corrigir produtos que deveriam ter UTI PRO habilitado
UPDATE products 
SET uti_pro_enabled = true 
WHERE (
  uti_pro_value IS NOT NULL AND uti_pro_value > 0
) OR (
  uti_pro_custom_price IS NOT NULL AND uti_pro_custom_price > 0
) OR (
  pro_price IS NOT NULL AND pro_price > 0
);

-- Função para atualizar automaticamente uti_pro_enabled ao inserir/atualizar produtos
CREATE OR REPLACE FUNCTION auto_update_uti_pro_enabled()
RETURNS TRIGGER AS $$
BEGIN
  -- Ativar UTI PRO se há valor de desconto, preço customizado ou pro_price
  NEW.uti_pro_enabled := (
    (NEW.uti_pro_value IS NOT NULL AND NEW.uti_pro_value > 0) OR
    (NEW.uti_pro_custom_price IS NOT NULL AND NEW.uti_pro_custom_price > 0) OR
    (NEW.pro_price IS NOT NULL AND NEW.pro_price > 0)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para aplicar automaticamente
DROP TRIGGER IF EXISTS trigger_auto_uti_pro_enabled ON products;
CREATE TRIGGER trigger_auto_uti_pro_enabled
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_uti_pro_enabled();