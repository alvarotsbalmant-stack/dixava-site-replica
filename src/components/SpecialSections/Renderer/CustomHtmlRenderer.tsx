import React from 'react';
import type { SpecialSection } from '@/types/specialSections/core';
import { sanitizeHtml } from '@/lib/sanitizer';

interface CustomHtmlRendererProps {
  section: SpecialSection;
  className?: string;
}

export const CustomHtmlRenderer: React.FC<CustomHtmlRendererProps> = ({
  section,
  className = ''
}) => {
  const config = section.config as any;

  if (!config.htmlContent) {
    return null;
  }

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedHtml = sanitizeHtml(config.htmlContent);

  return (
    <section 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

