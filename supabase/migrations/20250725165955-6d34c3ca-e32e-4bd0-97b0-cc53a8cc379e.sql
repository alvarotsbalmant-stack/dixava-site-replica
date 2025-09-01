-- Remove duplicate email_config entries, keeping only the most recent one
DELETE FROM email_config 
WHERE id NOT IN (
  SELECT id 
  FROM email_config 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Create unique constraint using a partial unique index to ensure only one row
CREATE UNIQUE INDEX email_config_single_row_idx ON email_config ((1));