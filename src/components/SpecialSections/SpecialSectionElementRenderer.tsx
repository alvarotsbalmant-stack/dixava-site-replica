
import React from 'react';
import { SpecialSectionElement } from '@/types/specialSections';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
// Placeholder for product data fetching/display
// import ProductCard from '@/components/ProductCard'; 
// import { useProductsByIds } from '@/hooks/useProducts'; // Assuming a hook to fetch products by IDs

interface SpecialSectionElementRendererProps {
  element: SpecialSectionElement;
}

// Basic placeholder for ProductCard if not available
const PlaceholderProductCard = ({ productId }: { productId: string }) => (
  <div className="border rounded p-2 m-1 bg-gray-700 text-white text-sm">
    Product Placeholder<br/>ID: {productId.substring(0, 8)}...
  </div>
);

const SpecialSectionElementRenderer: React.FC<SpecialSectionElementRendererProps> = ({ element }) => {
  if (!element || !element.is_active) {
    return null; // Don't render inactive elements
  }

  const getElementStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      marginBottom: `${element.margin_bottom ?? 20}px`,
      borderRadius: `${element.border_radius ?? 0}px`,
      padding: `${element.padding ?? 0}px`,
      color: element.text_color ?? 'inherit',
      overflow: 'hidden', // Ensure content respects border radius
    };

    switch (element.background_type) {
      case 'color':
        style.backgroundColor = element.background_color || 'transparent';
        break;
      case 'image':
        style.backgroundImage = `url(${element.background_image_url})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        break;
      case 'gradient':
        style.background = element.background_gradient || 'transparent';
        break;
      case 'transparent':
      default:
        style.backgroundColor = 'transparent';
        break;
    }
    return style;
  };

  const renderContent = () => {
    switch (element.element_type) {
      case 'banner_full':
      case 'banner_medium': // Layout handled by parent
      case 'banner_small':
      case 'banner_product_highlight':
        return (
          <div style={getElementStyle()} className="relative w-full">
            {element.image_url && (
              <img src={element.image_url} alt={element.title || 'Banner'} className="w-full h-auto object-cover" />
            )}
            {/* Overlay content if needed, basic example */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 bg-black bg-opacity-30">
              {element.title && <h3 className="text-xl font-bold text-white">{element.title}</h3>}
              {element.subtitle && <p className="text-gray-200 mt-2">{element.subtitle}</p>}
              {element.link_url && element.link_text && (
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <Link to={element.link_url}>{element.link_text}</Link>
                </Button>
              )}
            </div>
             {/* Non-overlay link if no image or simple link needed */}
             {!element.image_url && element.link_url && (
                 <Link to={element.link_url} className="absolute inset-0" aria-label={element.title || 'Link'}></Link>
             )}
          </div>
        );

      case 'product_carousel':
        // TODO: Fetch actual products using element.content_type and element.content_ids
        // const { products, loading } = useProductsByIds(element.content_ids || []);
        const contentIds = element.content_ids;
        let productIds: string[] = [];
        
        // Safely handle the Json type for content_ids
        if (Array.isArray(contentIds)) {
          productIds = contentIds.filter(id => typeof id === 'string') as string[];
        } else if (typeof contentIds === 'string') {
          try {
            const parsed = JSON.parse(contentIds);
            if (Array.isArray(parsed)) {
              productIds = parsed.filter(id => typeof id === 'string');
            }
          } catch {
            // If parsing fails, treat as empty array
            productIds = [];
          }
        }
        
        return (
          <div style={getElementStyle()} className="w-full">
            {element.title && <h3 className="text-xl font-semibold mb-3 text-white">{element.title}</h3>}
            {/* Basic Grid Placeholder - Replace with actual Carousel */}
            <div className={`grid grid-cols-${element.visible_items_mobile} md:grid-cols-${element.visible_items_tablet} lg:grid-cols-${element.visible_items_desktop} gap-4`}>
              {productIds.length > 0 ? (
                productIds.map(id => <PlaceholderProductCard key={id} productId={id} />)
              ) : (
                <p className="text-gray-500 col-span-full text-center">Nenhum produto selecionado para este carrossel.</p>
              )}
            </div>
            {element.link_url && element.link_text && (
               <div className="text-right mt-4">
                 <Button asChild variant="link" className="text-blue-400">
                   <Link to={element.link_url}>{element.link_text}</Link>
                 </Button>
               </div>
            )}
          </div>
        );

      case 'text_block':
        return (
          <div style={getElementStyle()} className="prose prose-invert max-w-none">
            {element.title && <h3 className="text-xl font-semibold mb-2 text-white">{element.title}</h3>}
            {/* TODO: Render markdown content safely */}
            <p className="text-gray-300">{element.subtitle || 'Bloco de texto vazio.'}</p>
          </div>
        );

      default:
        return <div className="text-red-500">Tipo de elemento desconhecido: {element.element_type}</div>;
    }
  };

  return renderContent();
};

export default SpecialSectionElementRenderer;
