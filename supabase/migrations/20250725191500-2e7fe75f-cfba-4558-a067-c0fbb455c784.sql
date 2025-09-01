-- Adicionar campo visual_config à tabela email_templates
ALTER TABLE email_templates 
ADD COLUMN visual_config JSONB;