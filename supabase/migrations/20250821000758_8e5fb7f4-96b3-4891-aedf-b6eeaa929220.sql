-- Add bicolor title columns to product_sections table
ALTER TABLE product_sections ADD COLUMN IF NOT EXISTS title_part1 TEXT;
ALTER TABLE product_sections ADD COLUMN IF NOT EXISTS title_part2 TEXT;
ALTER TABLE product_sections ADD COLUMN IF NOT EXISTS title_color1 TEXT DEFAULT '#000000';
ALTER TABLE product_sections ADD COLUMN IF NOT EXISTS title_color2 TEXT DEFAULT '#A4A4A4';