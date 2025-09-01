
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';

const FavoritesList: React.FC = () => {
  const { favorites, removeFromFavorites, isLoading } = useFavorites();
  const { addToCart } = useCart();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const navigate = useNavigate();

  // Load full product details for favorites
  const loadFavoriteProducts = async () => {
    if (favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    setProductsLoading(true);
    try {
      const productIds = favorites.map(fav => fav.product_id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (error) throw error;
      setFavoriteProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error loading favorite products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    await removeFromFavorites(productId);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  if (isLoading || productsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Minha Lista de Desejos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="h-16 w-16 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Minha Lista de Desejos ({favoriteProducts.length} itens)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Você ainda não tem produtos favoritos</p>
            <p className="text-sm">Adicione produtos aos seus favoritos para vê-los aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div 
                  className="h-16 w-16 bg-gray-100 rounded overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 
                    className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-1">
                    <span className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(product.price)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    onClick={() => handleRemoveFromFavorites(product.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoritesList;
