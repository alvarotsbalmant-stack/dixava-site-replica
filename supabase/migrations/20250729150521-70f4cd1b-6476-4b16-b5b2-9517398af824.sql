-- Corrigir categorias que foram incorretamente categorizadas como fallback
UPDATE product_specifications 
SET category = CASE 
  WHEN label = 'Tamanho Base' THEN '💾 Armazenamento e Instalação'
  WHEN label = 'Modo Multiplayer' THEN '🌐 Recursos Online'
  ELSE category
END
WHERE product_id = (
  SELECT id FROM products 
  WHERE name = 'TESTE JSON CORRETO - 20250729_105720'
) AND label IN ('Tamanho Base', 'Modo Multiplayer');