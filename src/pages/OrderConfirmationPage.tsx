
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Pedido Confirmado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Seu pedido #{orderId} foi confirmado com sucesso!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
