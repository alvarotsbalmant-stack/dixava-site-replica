import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import ProductPageHeader from '@/components/ProductPage/ProductPageHeader';
import ProductImageGallery from '@/components/ProductPage/ProductImageGallery';
import ProductInfo from '@/components/ProductPage/ProductInfo';
import ProductOptions from '@/components/ProductPage/ProductOptions';
import ProductActions from '@/components/ProductPage/ProductActions';
import ProductTrustBadges from '@/components/ProductPage/ProductTrustBadges';
import ProductProPricing from './ProductProPricing';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'pre-owned' | 'digital'>('pre-owned');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (products.length > 0 && id) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
      
      if (foundProduct) {
        if (foundProduct.sizes && foundProduct.sizes.length > 0) {
          setSelectedSize(foundProduct.sizes[0]);
        }
        if (foundProduct.colors && foundProduct.colors.length > 0) {
          setSelectedColor(foundProduct.colors[0]);
        }
      }
    }
  }, [products, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
          <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
            Voltar à loja
          </Button>
        </div>
      </div>
    );
  }

  const getCurrentPrice = () => {
    const basePrice = (() => {
      switch (selectedCondition) {
        case 'new': return product.price + 1.71;
        case 'digital': return product.price + 6.65;
        default: return product.price;
      }
    })();

    return basePrice;
  };

  const handleAddToCart = async () => {
    for (let i = 0; i < quantity; i++) {
      await addToCart(
        product, 
        selectedSize || undefined, 
        selectedColor || undefined
      );
    }
  };

  const handleBackClick = () => {
    // Navigate back and let the browser's native scroll restoration handle the position
    navigate(-1);
  };

  const handleWhatsAppContact = () => {
    const message = `Olá! Gostaria de mais informações sobre:\n\n${product.name}\nPreço: R$ ${getCurrentPrice().toFixed(2)}\nCondição: ${selectedCondition === 'new' ? 'Novo' : selectedCondition === 'digital' ? 'Digital' : 'Usado'}`;
    const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductPageHeader onBackClick={handleBackClick} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Image Gallery */}
          <ProductImageGallery product={product} />

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <ProductInfo product={product} />

            <ProductProPricing 
              product={product}
              selectedCondition={selectedCondition}
              onConditionChange={setSelectedCondition}
            />

            <ProductOptions
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
              onSizeChange={setSelectedSize}
              onColorChange={setSelectedColor}
              onQuantityChange={setQuantity}
            />

            <ProductActions
              product={product}
              quantity={quantity}
              selectedCondition={selectedCondition}
              onAddToCart={handleAddToCart}
              onWhatsAppContact={handleWhatsAppContact}
            />

            <ProductTrustBadges />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

