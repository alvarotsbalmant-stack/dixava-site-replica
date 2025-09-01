-- Função para deletar produto mestre e seus SKUs em cascata
CREATE OR REPLACE FUNCTION public.delete_master_product_cascade(p_master_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_deleted_skus_count integer := 0;
  v_master_product_name text;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar nome do produto mestre
  SELECT name INTO v_master_product_name
  FROM products 
  WHERE id = p_master_product_id AND product_type = 'master';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Produto mestre não encontrado');
  END IF;
  
  -- Contar e deletar SKUs relacionados
  SELECT COUNT(*) INTO v_deleted_skus_count
  FROM products 
  WHERE parent_product_id = p_master_product_id AND product_type = 'sku';
  
  -- Deletar SKUs primeiro
  DELETE FROM products 
  WHERE parent_product_id = p_master_product_id AND product_type = 'sku';
  
  -- Deletar produto mestre
  DELETE FROM products 
  WHERE id = p_master_product_id AND product_type = 'master';
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Produto mestre e SKUs deletados com sucesso',
    'master_product_name', v_master_product_name,
    'deleted_skus_count', v_deleted_skus_count
  );
END;
$function$;