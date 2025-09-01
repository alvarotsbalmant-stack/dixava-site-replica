import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  Package, 
  User, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CodeData {
  code: string;
  status: 'pending' | 'redeemed';
  cost: number;
  created_at: string;
  redeemed_at?: string;
  product_name: string;
  product_type: string;
  user_name: string;
  user_email: string;
  redeemed_by_admin?: string;
}

const CodeVerifier = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchCode, setSearchCode] = useState('');
  const [codeData, setCodeData] = useState<CodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const searchCodeData = async () => {
    if (!searchCode.trim()) {
      toast({ title: 'Erro', description: 'Digite um código para buscar', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_redemption_code', {
        p_code: searchCode.trim().toUpperCase()
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        setCodeData(result.code_data);
      } else {
        toast({ title: 'Código não encontrado', description: result.message, variant: 'destructive' });
        setCodeData(null);
      }
    } catch (error) {
      console.error('Erro ao buscar código:', error);
      toast({ title: 'Erro', description: 'Erro ao buscar código', variant: 'destructive' });
      setCodeData(null);
    } finally {
      setLoading(false);
    }
  };

  const markAsRedeemed = async () => {
    if (!codeData || !user) return;

    if (codeData.status === 'redeemed') {
      toast({ title: 'Aviso', description: 'Este código já foi resgatado', variant: 'destructive' });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja marcar o código ${codeData.code} como resgatado?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('redeem_code_admin', {
        p_code: codeData.code,
        p_admin_id: user.id
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast({ title: 'Sucesso', description: 'Código marcado como resgatado!' });
        // Atualizar dados localmente
        setCodeData(prev => prev ? {
          ...prev,
          status: 'redeemed' as const,
          redeemed_at: new Date().toISOString(),
          redeemed_by_admin: user.email || 'Admin'
        } : null);
      } else {
        toast({ title: 'Erro', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erro ao marcar código como resgatado:', error);
      toast({ title: 'Erro', description: 'Erro ao processar resgate', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Verificador de Código de Recompensa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-code">Código de Resgate</Label>
              <Input
                id="search-code"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Digite o código (ex: ABC12345)"
                maxLength={8}
                className="font-mono"
                onKeyPress={(e) => e.key === 'Enter' && searchCodeData()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchCodeData}
                disabled={loading || !searchCode.trim()}
                className="whitespace-nowrap"
              >
                {loading ? 'Buscando...' : 'Buscar Código'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {codeData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Dados do Código: {codeData.code}
              </CardTitle>
              <Badge 
                variant={codeData.status === 'redeemed' ? 'default' : 'secondary'}
                className={`${
                  codeData.status === 'redeemed' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}
              >
                {codeData.status === 'redeemed' ? (
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações do Produto */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Produto
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{codeData.product_name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      Tipo: {codeData.product_type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Custo: {codeData.cost} UTI Coins
                    </p>
                  </div>
                </div>

                {/* Informações do Cliente */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Cliente
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{codeData.user_name || 'Nome não informado'}</p>
                    <p className="text-sm text-gray-600">{codeData.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Informações de Data e Status */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Histórico
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div>
                      <p className="text-sm font-medium">Código gerado:</p>
                      <p className="text-sm text-gray-600">{formatDate(codeData.created_at)}</p>
                    </div>
                    
                    {codeData.status === 'redeemed' && codeData.redeemed_at && (
                      <div>
                        <p className="text-sm font-medium">Resgatado em:</p>
                        <p className="text-sm text-gray-600">{formatDate(codeData.redeemed_at)}</p>
                        {codeData.redeemed_by_admin && (
                          <p className="text-sm text-gray-600">
                            Por: {codeData.redeemed_by_admin}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ação de Resgate */}
                {codeData.status === 'pending' && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Ações
                    </h4>
                    <Button
                      onClick={markAsRedeemed}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {processing ? 'Processando...' : 'Marcar como Resgatado'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Esta ação não pode ser desfeita. Confirme que o produto foi entregue ao cliente.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {codeData.status === 'redeemed' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Este código já foi resgatado e não pode mais ser usado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeVerifier;