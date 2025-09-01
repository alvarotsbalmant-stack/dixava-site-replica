import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Gift, 
  Calendar, 
  Package, 
  Star, 
  Zap,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RedemptionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface RedemptionRecord {
  id: string;
  code: string;
  product_id: string;
  cost: number;
  status: 'pending' | 'redeemed';
  created_at: string;
  redeemed_at?: string;
  redeemed_by_admin?: string;
  coin_products: {
    name: string;
    description?: string;
    product_type: 'discount' | 'freebie' | 'exclusive_access' | 'physical_product';
    product_data: any;
    image_url?: string;
  };
}

export const RedemptionHistoryModal: React.FC<RedemptionHistoryModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      loadRedemptionHistory();
    }
  }, [isOpen, userId]);

  const loadRedemptionHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('redemption_codes')
        .select(`
          id,
          code,
          product_id,
          cost,
          status,
          created_at,
          redeemed_at,
          redeemed_by_admin,
          coin_products:product_id (
            name,
            description,
            product_type,
            product_data,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'redeemed',
        coin_products: {
          ...item.coin_products,
          product_type: item.coin_products?.product_type as 'discount' | 'freebie' | 'exclusive_access' | 'physical_product'
        }
      }));
      setRedemptions(formattedData as RedemptionRecord[]);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico de recompensas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'redeemed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'redeemed': return 'Resgatado';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'redeemed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Star className="w-5 h-5" />;
      case 'freebie': return <Gift className="w-5 h-5" />;
      case 'exclusive_access': return <Zap className="w-5 h-5" />;
      case 'physical_product': return <Package className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const copyRedemptionCode = (redemption: RedemptionRecord) => {
    navigator.clipboard.writeText(redemption.code);
    toast({
      title: 'Código copiado!',
      description: `Código ${redemption.code} copiado para a área de transferência`,
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <History className="w-6 h-6 text-purple-600" />
            Histórico de Recompensas
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <History className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
                <p className="text-lg">Carregando histórico...</p>
              </div>
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhuma recompensa resgatada
              </h3>
              <p className="text-gray-500">
                Você ainda não resgatou nenhuma recompensa com suas UTI Coins.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {redemptions.map((redemption, index) => (
                <Card key={redemption.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-purple-600">
                          {getProductIcon(redemption.coin_products.product_type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {redemption.coin_products.name}
                          </CardTitle>
                          {redemption.coin_products.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {redemption.coin_products.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(redemption.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(redemption.status)}
                          {getStatusLabel(redemption.status)}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Imagem do produto */}
                    {redemption.coin_products.image_url && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={redemption.coin_products.image_url}
                          alt={redemption.coin_products.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Informações do resgate */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Custo:</span>
                          <div className="flex items-center gap-1 font-semibold text-purple-600">
                            <Gift className="w-4 h-4" />
                            {redemption.cost.toLocaleString()} UTI Coins
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Data do resgate:</span>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(redemption.created_at)}
                          </div>
                        </div>

                        {redemption.redeemed_at && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Resgatado em:</span>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-4 h-4" />
                              {formatDate(redemption.redeemed_at)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Código de resgate */}
                      <div className="space-y-2">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Código de Resgate:
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyRedemptionCode(redemption)}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <code className="text-lg font-mono font-bold text-purple-600">
                            {redemption.code}
                          </code>
                        </div>

                        {redemption.status === 'pending' && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <span className="text-sm font-medium text-blue-700 block mb-1">
                              Instruções:
                            </span>
                            <p className="text-sm text-blue-600">
                              Leve este código em uma loja UTI Games para resgatar seu produto
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {index < redemptions.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

