import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Package, User, Clock, CheckCircle, XCircle, AlertCircle, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrderVerification, OrderVerificationData } from '@/hooks/useOrderVerification';
import { supabase } from '@/integrations/supabase/client';

const OrderVerifier = () => {
  const [searchCode, setSearchCode] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [productCashbacks, setProductCashbacks] = useState<{[key: string]: number}>({});
  const [productDiscounts, setProductDiscounts] = useState<{[key: string]: number}>({});
  const { loading, error, verifyCode, completeOrder } = useOrderVerification();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código para pesquisar",
        variant: "destructive"
      });
      return;
    }

    const result = await verifyCode(searchCode.trim());
    if (result) {
      setOrderData(result);
      // Buscar percentuais de cashback dos produtos
      await fetchProductCashbacks(result.order_data.items);
    } else {
      setOrderData(null);
    }
  };

  // FUNÇÃO CORRIGIDA: Buscar percentuais por NOME do produto (não ID)
  const fetchProductCashbacks = async (items: any[]) => {
    console.log('🔍 fetchProductCashbacks chamada com items:', items);
    
    const productNames = items
      .map(item => {
        console.log('📦 Item:', item, 'product_name:', item.product_name);
        return item.product_name;
      })
      .filter(name => {
        console.log('✅ Filtering name:', name, 'is valid:', !!name);
        return name;
      });

    console.log('🎯 Product Names extraídos:', productNames);

    if (productNames.length === 0) {
      console.log('❌ Nenhum product_name encontrado');
      return;
    }

    try {
      console.log('🔍 Fazendo query no Supabase para Names:', productNames);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, uti_coins_cashback_percentage, uti_coins_discount_percentage')
        .in('name', productNames);

      console.log('📊 Resultado da query:', { products, error });

      if (error) {
        console.error('❌ Erro ao buscar dados dos produtos:', error);
        return;
      }

      const cashbackMap: {[key: string]: number} = {};
      const discountMap: {[key: string]: number} = {};
      
      products?.forEach(product => {
        console.log('💰 Produto encontrado:', product.name, 'cashback:', product.uti_coins_cashback_percentage, 'discount:', product.uti_coins_discount_percentage);
        // Usar o NOME como chave ao invés do ID
        cashbackMap[product.name] = product.uti_coins_cashback_percentage || 0;
        discountMap[product.name] = product.uti_coins_discount_percentage || 0;
      });

      console.log('🗺️ Mapa final de cashbacks:', cashbackMap);
      console.log('🗺️ Mapa final de descontos:', discountMap);
      setProductCashbacks(cashbackMap);
      setProductDiscounts(discountMap);
    } catch (err) {
      console.error('💥 Erro ao buscar dados dos produtos:', err);
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderData?.order_data?.code) return;

    setProcessing(true);
    const result = await completeOrder(orderData.order_data.code);
    
    if (result) {
      toast({
        title: "Sucesso!",
        description: `Pedido finalizado com sucesso! ${result.coins_awarded} UTI coins foram creditados ao cliente.`,
      });
      
      // Atualizar dados
      setOrderData({
        ...orderData,
        order_data: {
          ...orderData.order_data,
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      });
    }
    setProcessing(false);
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
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Desconhecido</Badge>;
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

  // FUNÇÃO CORRIGIDA: Calcular cashback baseado nos dados reais do banco (por NOME)
  const calculateExpectedCashback = (items: any[]) => {
    let totalCashbackReais = 0;
    let hasProductsWithCashback = false;
    const itemsWithCashback: Array<{
      name: string;
      percentage: number;
      cashbackReais: number;
      cashbackCoins: number;
    }> = [];

    items.forEach(item => {
      const itemTotal = item.total || (item.price * item.quantity);
      
      // Buscar percentual real do banco de dados usando NOME do produto
      const cashbackPercentage = productCashbacks[item.product_name] || 0;
      
      console.log('🧮 Calculando cashback para:', item.product_name, 'percentual:', cashbackPercentage);
      
      if (cashbackPercentage > 0) {
        hasProductsWithCashback = true;
        const cashbackReais = itemTotal * (cashbackPercentage / 100);
        const cashbackCoins = Math.round(cashbackReais * 100); // 1 real = 100 UTI Coins
        
        totalCashbackReais += cashbackReais;
        
        itemsWithCashback.push({
          name: item.product_name,
          percentage: cashbackPercentage,
          cashbackReais,
          cashbackCoins
        });
      }
    });

    const utiCoinsFromCashback = Math.round(totalCashbackReais * 100);
    const defaultCoins = 20; // UTI coins padrão por compra
    const totalCoins = defaultCoins + utiCoinsFromCashback;

    console.log('💰 Resultado final do cálculo:', {
      totalCashbackReais,
      utiCoinsFromCashback,
      defaultCoins,
      totalCoins,
      hasProductsWithCashback,
      itemsWithCashback
    });

    return {
      cashbackReais: totalCashbackReais,
      cashbackCoins: utiCoinsFromCashback,
      defaultCoins,
      totalCoins,
      hasProductsWithCashback,
      itemsWithCashback
    };
  };

  // NOVA FUNÇÃO: Calcular uso de UTI Coins para desconto
  const calculateUTICoinsUsage = (items: any[], userBalance: number) => {
    let totalDiscountAmount = 0;
    let totalCoinsUsed = 0;
    let remainingBalance = userBalance;
    const itemsWithDiscount: Array<{
      name: string;
      percentage: number;
      maxDiscountAmount: number;
      coinsUsed: number;
      discountApplied: number;
    }> = [];

    items.forEach(item => {
      const itemTotal = item.total || (item.price * item.quantity);
      const discountPercentage = productDiscounts[item.product_name] || 0;
      
      if (discountPercentage > 0 && remainingBalance > 0) {
        // Calcular desconto máximo permitido
        const maxDiscountAmount = itemTotal * (discountPercentage / 100);
        
        // Calcular UTI Coins necessários para desconto máximo (100 coins = 1 real)
        const coinsNeeded = Math.round(maxDiscountAmount * 100);
        
        // Usar o que tem disponível (máximo disponível ou necessário)
        const coinsUsed = Math.min(remainingBalance, coinsNeeded);
        
        // Calcular desconto real baseado nas moedas usadas
        const discountApplied = coinsUsed / 100;
        
        totalDiscountAmount += discountApplied;
        totalCoinsUsed += coinsUsed;
        remainingBalance -= coinsUsed;
        
        itemsWithDiscount.push({
          name: item.product_name,
          percentage: discountPercentage,
          maxDiscountAmount,
          coinsUsed,
          discountApplied
        });
      }
    });

    const originalTotal = items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity)), 0);
    const finalCashAmount = originalTotal - totalDiscountAmount;

    return {
      originalTotal,
      totalDiscountAmount,
      totalCoinsUsed,
      finalCashAmount,
      itemsWithDiscount,
      hasDiscounts: totalCoinsUsed > 0
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            VERIFICADOR DE PEDIDO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Digite o código de verificação (25 dígitos)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              maxLength={25}
              className="font-mono"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {orderData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Detalhes do Pedido
              </CardTitle>
              {getStatusBadge(orderData.order_data.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">CÓDIGO DE VERIFICAÇÃO</h3>
                <p className="font-mono text-lg bg-gray-100 p-2 rounded">{orderData.order_data.code}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">VALOR TOTAL</h3>
                {/* Mostrar divisão de pagamento se houver desconto UTI Coins */}
                {(() => {
                  const userBalance = orderData.uti_coins_balance || 0;
                  const coinsUsage = calculateUTICoinsUsage(orderData.order_data.items, userBalance);
                  
                  if (coinsUsage.hasDiscounts) {
                    return (
                      <div className="space-y-2">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(orderData.order_data.total_amount)}</p>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-2">💰 DIVISÃO DO PAGAMENTO</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-700">Pagamento em Dinheiro:</span>
                              <span className="font-bold text-green-800">{formatCurrency(coinsUsage.finalCashAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-amber-700">Pagamento UTI Coins:</span>
                              <span className="font-bold text-amber-800">
                                {formatCurrency(coinsUsage.totalDiscountAmount)} ({coinsUsage.totalCoinsUsed.toLocaleString()} moedas)
                              </span>
                            </div>
                            <div className="border-t border-blue-300 pt-1 mt-2">
                              <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">DESCONTO APLICADO:</span>
                                <span className="font-bold text-blue-800">
                                  {((coinsUsage.totalDiscountAmount / coinsUsage.originalTotal) * 100).toFixed(1)}% usando UTI Coins
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return <p className="text-lg font-bold text-green-600">{formatCurrency(orderData.order_data.total_amount)}</p>;
                  }
                })()}
              </div>
            </div>

            {/* Informações do cliente */}
            {orderData.user_data && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  DADOS DO CLIENTE
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {orderData.user_data.name || 'Não informado'}</p>
                    <p><strong>Email:</strong> {orderData.user_data.email || 'Não informado'}</p>
                    <p><strong>ID do Usuário:</strong> {orderData.user_data.id}</p>
                  </div>
                  
                  {orderData.uti_coins_balance !== undefined && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">U</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Saldo UTI Coins</p>
                          <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                            {orderData.uti_coins_balance.toLocaleString()} moedas
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Itens do pedido */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3">ITENS DO PEDIDO</h3>
              <div className="space-y-3">
                {orderData.order_data.items.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.size && <span className="mr-3">Tamanho: {item.size}</span>}
                          {item.color && <span className="mr-3">Cor: {item.color}</span>}
                          <span>Quantidade: {item.quantity}</span>
                          {/* NOVO: Mostrar percentual de cashback e desconto real */}
                          {productCashbacks[item.product_name] && (
                            <span className="ml-3 text-amber-600 font-medium">
                              Cashback: {productCashbacks[item.product_name]}%
                            </span>
                          )}
                          {productDiscounts[item.product_name] && (
                            <span className="ml-3 text-blue-600 font-medium">
                              Desconto UTI Coins: {productDiscounts[item.product_name]}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.total)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)} cada</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-600 mb-1">CRIADO EM</h4>
                <p>{formatDate(orderData.order_data.created_at)}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600 mb-1">EXPIRA EM</h4>
                <p className={new Date(orderData.order_data.expires_at) < new Date() ? 'text-red-600' : ''}>
                  {formatDate(orderData.order_data.expires_at)}
                </p>
              </div>
              {orderData.order_data.completed_at && (
                <div>
                  <h4 className="font-semibold text-gray-600 mb-1">FINALIZADO EM</h4>
                  <p>{formatDate(orderData.order_data.completed_at)}</p>
                </div>
              )}
            </div>

            {/* Recompensas */}
            {orderData.order_data.rewards_given && Object.keys(orderData.order_data.rewards_given).length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  RECOMPENSAS CONCEDIDAS
                </h4>
                <p className="text-blue-700">
                  UTI Coins: {orderData.order_data.rewards_given.uti_coins || 0}
                </p>
              </div>
            )}

            {/* Previsão de Recompensas ANTES de finalizar */}
            {orderData.order_data.status === 'pending' && (() => {
              const expectedRewards = calculateExpectedCashback(orderData.order_data.items);
              
              return (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    🎯 RECOMPENSAS QUE SERÃO CONCEDIDAS
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700 dark:text-amber-300">UTI Coins padrão por compra:</span>
                      <span className="font-bold text-amber-900 dark:text-amber-100">
                        {expectedRewards.defaultCoins.toLocaleString()} moedas
                      </span>
                    </div>
                    
                    {expectedRewards.hasProductsWithCashback && (
                      <>
                        {/* NOVO: Mostrar cashback detalhado por produto */}
                        {expectedRewards.itemsWithCashback.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-amber-700 dark:text-amber-300">
                              Cashback ({item.percentage}%): {item.cashbackReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="font-bold text-amber-900 dark:text-amber-100">
                              {item.cashbackCoins.toLocaleString()} moedas
                            </span>
                          </div>
                        ))}
                        
                        <div className="border-t border-amber-200 dark:border-amber-700 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-800 dark:text-amber-200">TOTAL DE UTI COINS:</span>
                            <span className="text-xl font-bold text-amber-900 dark:text-amber-100">
                              🪙 {expectedRewards.totalCoins.toLocaleString()} moedas
                            </span>
                          </div>
                        </div>
                        
                        {expectedRewards.cashbackCoins >= 1000000 && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 rounded-lg border border-yellow-300 dark:border-yellow-700">
                            <p className="text-center text-yellow-800 dark:text-yellow-200 font-bold text-lg">
                              🎉 MEGA CASHBACK! Mais de 1 MILHÃO de UTI Coins! 🎉
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Ações */}
            {orderData.order_data.status === 'pending' && new Date(orderData.order_data.expires_at) > new Date() && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleCompleteOrder}
                  disabled={processing}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {processing ? 'Processando...' : 'MARCAR COMO CONCLUÍDA'}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  ⚠️ Esta ação não pode ser desfeita. O cliente receberá as recompensas e o estoque será atualizado.
                </p>
              </div>
            )}

            {orderData.order_data.status === 'expired' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700 font-medium">Este código expirou e não pode mais ser processado.</p>
              </div>
            )}

            {orderData.order_data.status === 'completed' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 font-medium">✅ Este pedido já foi finalizado com sucesso.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderVerifier;