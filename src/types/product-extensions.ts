// Global type extensions to fix interface mismatches

// Product Modal Props
export interface ProductModalProps {
  product?: any;
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get product image from either image or image_url
export const getProductImage = (product: any): string => {
  return product?.image || product?.image_url || '/placeholder-product.jpg';
};

// Helper to get section name
export const getSectionName = (section: any): string => {
  return section?.name || section?.title || 'Seção';
};

// Helper to get section key
export const getSectionKey = (section: any): string => {
  return section?.key || section?.id || '';
};