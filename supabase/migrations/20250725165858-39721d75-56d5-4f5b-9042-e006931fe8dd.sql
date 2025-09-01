-- Remove duplicate email_config entries, keeping only the most recent one
DELETE FROM email_config 
WHERE id NOT IN (
  SELECT id 
  FROM email_config 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE email_config 
ADD CONSTRAINT email_config_single_row_check 
CHECK ((SELECT COUNT(*) FROM email_config) <= 1);