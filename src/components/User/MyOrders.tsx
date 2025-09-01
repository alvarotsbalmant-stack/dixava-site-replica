import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Package, Copy, Eye } from 'lucide-react';
import { useOrderVerification } from '@/hooks/useOrderVerification';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { getUserOrders, loading } = useOrderVerification();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    const userOrders = await getUserOrders();
    setOrders(userOrders);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Finalizado</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Faça login para ver seus pedidos</h3>
          <p className="text-gray-600">Você precisa estar logado para visualizar o histórico de pedidos.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando seus pedidos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meus Pedidos</h2>
        <Button onClick={loadOrders} variant="outline" size="sm">
          Atualizar
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">Você ainda não fez nenhum pedido.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Pedido #{order.code.slice(-8)}
                  </CardTitle>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Código de verificação */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-1">CÓDIGO DE VERIFICAÇÃO</h4>
                      <p className="font-mono text-lg">{order.code}</p>
                    </div>
                    <Button
                      onClick={() => copyCode(order.code)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>

                {/* Informações do pedido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">VALOR TOTAL</h4>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">DATA DO PEDIDO</h4>
                    <p>{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">
                      {order.status === 'pending' ? 'EXPIRA EM' : 
                       order.status === 'completed' ? 'FINALIZADO EM' : 'EXPIROU EM'}
                    </h4>
                    <p className={order.status === 'pending' && new Date(order.expires_at) < new Date() ? 'text-red-600' : ''}>
                      {order.status === 'completed' 
                        ? formatDate(order.completed_at) 
                        : formatDate(order.expires_at)}
                    </p>
                  </div>
                </div>

                {/* Itens do pedido */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">ITENS DO PEDIDO</h4>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {item.size && `Tamanho: ${item.size} • `}
                            {item.color && `Cor: ${item.color} • `}
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total)}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)} cada</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recompensas */}
                {order.rewards_given && Object.keys(order.rewards_given).length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🪙 RECOMPENSAS RECEBIDAS</h4>
                    <p className="text-blue-700">
                      UTI Coins: +{order.rewards_given.uti_coins || 0}
                    </p>
                  </div>
                )}

                {/* Status específicos */}
                {order.status === 'pending' && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-700">
                      ⏳ Seu pedido está sendo processado. Você receberá uma confirmação em breve.
                    </p>
                  </div>
                )}

                {order.status === 'expired' && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-700">
                      ⏰ Este pedido expirou após 24 horas sem confirmação.
                    </p>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-700">
                      ✅ Pedido finalizado com sucesso! Suas recompensas foram creditadas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;