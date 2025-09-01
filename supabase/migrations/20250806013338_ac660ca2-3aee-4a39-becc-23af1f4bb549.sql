-- Limpar e resetar dados corrompidos do storage_stats
-- Primeiro, fazer backup dos dados atuais em caso de necessidade
CREATE TABLE IF NOT EXISTS storage_stats_backup AS 
SELECT * FROM storage_stats;

-- Limpar dados atuais
DELETE FROM storage_stats;

-- Criar uma nova entrada com valores zerados para forçar um scan completo
INSERT INTO storage_stats (
  total_size_mb,
  total_images,
  webp_images,
  non_webp_images,
  last_scan,
  created_at,
  updated_at
) VALUES (
  0,
  0,
  0,
  0,
  NOW(),
  NOW(),
  NOW()
);

-- Adicionar índices para melhor performance se não existirem
CREATE INDEX IF NOT EXISTS idx_storage_stats_last_scan ON storage_stats(last_scan);
CREATE INDEX IF NOT EXISTS idx_storage_stats_updated_at ON storage_stats(updated_at);