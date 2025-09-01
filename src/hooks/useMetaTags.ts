import { useEffect } from 'react';

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export const useMetaTags = (options: MetaTagsOptions) => {
  useEffect(() => {
    const {
      title,
      description,
      image,
      url = window.location.href,
      type = 'website',
      siteName = 'UTI dos Games'
    } = options;

    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (isProperty) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', property);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    // Update basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaTag('og:title', title, true);
    }
    
    if (description) {
      updateMetaTag('og:description', description, true);
    }
    
    if (image) {
      updateMetaTag('og:image', image, true);
    }
    
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', siteName, true);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    
    if (title) {
      updateMetaTag('twitter:title', title);
    }
    
    if (description) {
      updateMetaTag('twitter:description', description);
    }
    
    if (image) {
      updateMetaTag('twitter:image', image);
    }

    // Cleanup function to reset to default values when component unmounts
    return () => {
      document.title = 'UTI dos Games - Sua loja de games favorita';
      
      // Reset to default meta description
      updateMetaTag('description', 'Descubra os melhores jogos para PlayStation, Xbox, Nintendo e PC na UTI dos Games. Ofertas imperdíveis e lançamentos exclusivos!');
      
      // Reset Open Graph tags
      updateMetaTag('og:title', 'UTI dos Games', true);
      updateMetaTag('og:description', 'Descubra os melhores jogos para PlayStation, Xbox, Nintendo e PC na UTI dos Games. Ofertas imperdíveis e lançamentos exclusivos!', true);
      updateMetaTag('og:type', 'website', true);
    };
  }, [options.title, options.description, options.image, options.url, options.type, options.siteName]);
};

export default useMetaTags;

