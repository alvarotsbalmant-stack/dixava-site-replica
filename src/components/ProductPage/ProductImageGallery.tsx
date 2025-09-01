import { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // For image loading

interface ProductImageGalleryProps {
  product: Product;
}

// **Radical Redesign based on GameStop reference and plan_transformacao_radical.md**
const ProductImageGallery = ({ product }: ProductImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Combine main and additional images, ensuring main image is first
  const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean) as string[];

  useEffect(() => {
    // Set initial image and reset loading state when product changes
    if (allImages.length > 0) {
      setCurrentImage(allImages[0]);
      setIsLoading(true); // Reset loading for new product image
    } else {
      setCurrentImage('/placeholder-image-error.webp'); // Fallback if no images
      setIsLoading(false);
    }
  }, [product.id]); // Depend on product ID to reset on product change

  const handleThumbnailClick = (image: string) => {
    if (image !== currentImage) {
      setIsLoading(true);
      setCurrentImage(image);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = '/placeholder-image-error.webp'; // Show error placeholder
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4"> {/* Thumbnails below on mobile, left on desktop */}
      {/* Thumbnails Column/Row */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[500px] pr-1 md:pr-0"> {/* Scrollable thumbnails */}
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(image)}
            className={cn(
              "flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all duration-200",
              image === currentImage
                ? 'border-uti-red ring-1 ring-uti-red/50'
                : 'border-border/50 hover:border-uti-gray-dark'
            )}
            aria-label={`Ver imagem ${index + 1}`}
          >
            <img
              src={image}
              alt={`${product.name} - miniatura ${index + 1}`}
              className="w-full h-full object-contain bg-white" // Use contain for thumbs
              loading="lazy"
              onError={(e) => { // Handle thumbnail errors gracefully
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-image-error.webp';
              }}
            />
          </button>
        ))}
      </div>

      {/* Main Image Display */}
      <div className="relative flex-1 aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center"> {/* Consistent aspect ratio */}
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          src={currentImage}
          alt={product.name}
          className={cn(
            "w-full h-full object-contain transition-opacity duration-300",
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;

