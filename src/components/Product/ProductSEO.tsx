
import { useEffect } from 'react';
import { Product } from '@/hooks/useProducts/types';

interface ProductSEOProps {
  product: Product;
}

const ProductSEO: React.FC<ProductSEOProps> = ({ product }) => {
  useEffect(() => {
    if (!product) return;

    console.log('ProductSEO: Using product meta data:', {
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      slug: product.slug
    });

    // Atualizar título da página usando meta_title se disponível
    const pageTitle = product.meta_title 
      ? `${product.meta_title} | UTI dos Games`
      : `${product.name} | UTI dos Games - A maior loja de games de Colatina`;
    
    document.title = pageTitle;

    // Atualizar meta description usando meta_description se disponível
    const metaDescContent = product.meta_description 
      ? product.meta_description
      : `Compre ${product.name} na UTI dos Games. R$ ${product.price.toFixed(2)} com entrega rápida e garantia. A loja de games mais tradicional de Colatina-ES.`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metaDescContent);
    }

    // Open Graph tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const ogTitle = product.meta_title ? product.meta_title : `${product.name} | UTI dos Games`;
    const ogDescription = product.meta_description 
      ? product.meta_description
      : `Compre ${product.name} por R$ ${product.price.toFixed(2)} na UTI dos Games. Entrega rápida e produto original.`;

    updateOrCreateMeta('og:title', ogTitle);
    updateOrCreateMeta('og:description', ogDescription);
    updateOrCreateMeta('og:image', product.image);
    updateOrCreateMeta('og:url', window.location.href);
    updateOrCreateMeta('og:type', 'product');

    // Twitter Card tags
    const updateOrCreateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateTwitterMeta('twitter:card', 'summary_large_image');
    updateOrCreateTwitterMeta('twitter:title', `${product.name} | UTI dos Games`);
    updateOrCreateTwitterMeta('twitter:description', 
      `Compre ${product.name} por R$ ${product.price.toFixed(2)} na UTI dos Games.`
    );
    updateOrCreateTwitterMeta('twitter:image', product.image);

    // Schema.org JSON-LD
    const schemaScript = document.querySelector('#product-schema');
    if (schemaScript) {
      schemaScript.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `${product.name} disponível na UTI dos Games`,
        "image": product.image,
        "brand": {
          "@type": "Brand",
          "name": "UTI dos Games"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "BRL",
          "price": product.price,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "UTI dos Games"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127"
        }
      });
    } else {
      const script = document.createElement('script');
      script.id = 'product-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `${product.name} disponível na UTI dos Games`,
        "image": product.image,
        "brand": {
          "@type": "Brand",
          "name": "UTI dos Games"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "BRL",
          "price": product.price,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "UTI dos Games"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127"
        }
      });
      document.head.appendChild(script);
    }

    return () => {
      // Limpeza ao desmontar o componente
      document.title = "UTI dos Games - A maior loja de games de Colatina";
      const schema = document.querySelector('#product-schema');
      if (schema) {
        schema.remove();
      }
    };
  }, [product]);

  return null; // Este componente não renderiza nada
};

export default ProductSEO;
