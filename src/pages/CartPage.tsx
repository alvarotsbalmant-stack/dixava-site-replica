
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CartPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Seu Carrinho</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Seu carrinho está vazio.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;
