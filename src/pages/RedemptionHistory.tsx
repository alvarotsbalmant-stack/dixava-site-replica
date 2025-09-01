import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  History, 
  Package, 
  Copy, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Calendar,
  Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import Footer from '@/components/Footer';

interface RedemptionCode {
  id: string;
  code: string;
  status: 'pending' | 'redeemed';
  cost: number;
  created_at: string;
  redeemed_at?: string;
  product: {
    name: string;
    product_type: string;
    image_url?: string;
  };
}

const RedemptionHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [redemptions, setRedemptions] = useState<RedemptionCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRedemptions();
    }
  }, [user]);

  const loadRedemptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('redemption_codes')
        .select(`
          *,
          product:coin_products(name, product_type, image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'redeemed'
      }));
      setRedemptions(formattedData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar histórico de resgates', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copiado!', description: 'Código copiado para a área de transferência' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <ProfessionalHeader onCartOpen={() => {}} onAuthOpen={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-gray-600">Faça login para ver seu histórico de resgates.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProfessionalHeader onCartOpen={() => {}} onAuthOpen={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <History className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">Histórico de Resgates</h1>
                <p className="text-gray-600">Acompanhe todos os seus códigos de resgate</p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando histórico...</p>
            </div>
          )}

          {/* Lista de Resgates */}
          {!loading && (
            <div className="space-y-4">
              {redemptions.length > 0 ? (
                redemptions.map((redemption) => (
                  <Card key={redemption.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          {/* Imagem do produto ou ícone */}
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {redemption.product.image_url ? (
                              <img 
                                src={redemption.product.image_url} 
                                alt={redemption.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          
                          {/* Info do produto */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {redemption.product.name}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize mb-2">
                              {redemption.product.product_type.replace('_', ' ')}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(redemption.created_at)}
                              </span>
                              <span>{redemption.cost} UTI Coins</span>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <Badge 
                          variant={redemption.status === 'redeemed' ? 'default' : 'secondary'}
                          className={`${
                            redemption.status === 'redeemed' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          {redemption.status === 'redeemed' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resgatado
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pendente
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Código de resgate */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Código de Resgate:
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(redemption.code)}
                            className="h-8 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <code className="text-lg font-mono font-bold text-gray-900 tracking-wider">
                          {redemption.code}
                        </code>
                      </div>

                      {/* Info adicional */}
                      {redemption.status === 'redeemed' && redemption.redeemed_at && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            ✅ Resgatado em {formatDate(redemption.redeemed_at)}
                          </p>
                        </div>
                      )}

                      {redemption.status === 'pending' && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            📍 Leve este código em uma loja UTI Games para resgatar seu produto
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                      Nenhum resgate ainda
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Você ainda não resgatou nenhum produto com seus UTI Coins.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/coins'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Ir para Loja de Recompensas
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RedemptionHistory;