-- Add header layout options to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN header_layout_type VARCHAR(20) DEFAULT 'logo_title',
ADD COLUMN header_image_url TEXT;

-- Add comment to explain the header_layout_type values
COMMENT ON COLUMN public.site_settings.header_layout_type IS 'Options: logo_title, single_image';
COMMENT ON COLUMN public.site_settings.header_image_url IS 'URL for the single header image when header_layout_type is single_image';