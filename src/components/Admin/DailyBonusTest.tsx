import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestData {
  canClaim: boolean;
  currentStreak: number;
  nextBonusAmount: number;
  secondsUntilNextClaim: number;
  testMode: boolean;
  totalStreakDays: number;
  lastClaim?: string;
  nextReset?: string;
}

const DailyBonusTest: React.FC = () => {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[TEST] Loading daily bonus test data...');
      
      const { data, error } = await supabase.functions.invoke('secure-coin-actions', {
        body: { action: 'can_claim_daily_bonus_brasilia' }
      });

      if (error) {
        console.error('[TEST] Error loading test data:', error);
        setError('Erro ao carregar dados de teste');
        toast.error('Erro ao carregar dados de teste');
        return;
      }

      if (data?.success) {
        console.log('[TEST] Test data loaded successfully:', data);
        setTestData({
          canClaim: data.canClaim,
          currentStreak: data.currentStreak || 1,
          nextBonusAmount: data.nextBonusAmount || 10,
          secondsUntilNextClaim: data.secondsUntilNextClaim || 0,
          testMode: data.testMode || false,
          totalStreakDays: data.totalStreakDays || 7,
          lastClaim: data.lastClaim,
          nextReset: data.nextReset
        });
      } else {
        console.error('[TEST] Failed to load test data:', data);
        setError(data?.message || 'Falha ao carregar dados');
        toast.error(data?.message || 'Falha ao carregar dados');
      }
    } catch (err) {
      console.error('[TEST] Exception loading test data:', err);
      setError('Erro interno');
      toast.error('Erro interno');
    } finally {
      setLoading(false);
    }
  };

  const claimBonus = async () => {
    setClaimLoading(true);
    
    try {
      console.log('[TEST] Claiming daily bonus...');
      
      const { data, error } = await supabase.functions.invoke('secure-coin-actions', {
        body: { action: 'process_daily_login_brasilia' }
      });

      if (error) {
        console.error('[TEST] Error claiming bonus:', error);
        toast.error('Erro ao resgatar bônus');
        return;
      }

      if (data?.success) {
        console.log('[TEST] Bonus claimed successfully:', data);
        toast.success(`Bônus resgatado! +${data.coins_earned} moedas. Streak: ${data.streak_day}/${data.total_streak_days}`);
        
        // Recarregar dados após resgate
        setTimeout(() => {
          loadTestData();
        }, 1000);
      } else {
        console.log('[TEST] Bonus claim blocked:', data);
        toast.warning(data?.message || 'Não foi possível resgatar o bônus');
      }
    } catch (err) {
      console.error('[TEST] Exception claiming bonus:', err);
      toast.error('Erro interno');
    } finally {
      setClaimLoading(false);
    }
  };

  useEffect(() => {
    loadTestData();
  }, []);

  useEffect(() => {
    // Auto-refresh a cada 5 segundos se estiver em modo teste
    if (testData?.testMode) {
      const interval = setInterval(() => {
        loadTestData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [testData?.testMode]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste do Bônus Diário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={loadTestData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? 'Carregando...' : 'Atualizar Dados'}
          </Button>
          
          {testData?.canClaim && (
            <Button 
              onClick={claimBonus}
              disabled={claimLoading}
              size="sm"
            >
              {claimLoading ? 'Resgatando...' : 'Resgatar Bônus'}
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}

        {testData && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={testData.testMode ? "default" : "secondary"}>
                {testData.testMode ? 'MODO TESTE' : 'MODO PRODUÇÃO'}
              </Badge>
              <Badge variant={testData.canClaim ? "default" : "secondary"}>
                {testData.canClaim ? 'PODE RESGATAR' : 'NÃO PODE RESGATAR'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Streak Atual:</strong> {testData.currentStreak}/{testData.totalStreakDays}
              </div>
              <div>
                <strong>Próximo Bônus:</strong> {testData.nextBonusAmount} moedas
              </div>
              <div>
                <strong>Próxima Chance:</strong> {testData.secondsUntilNextClaim > 0 ? formatTime(testData.secondsUntilNextClaim) : 'Agora'}
              </div>
              <div>
                <strong>Modo:</strong> {testData.testMode ? '10s' : '24h'}
              </div>
            </div>

            {testData.lastClaim && (
              <div className="text-xs text-gray-600">
                <strong>Último Resgate:</strong> {new Date(testData.lastClaim).toLocaleString('pt-BR')}
              </div>
            )}

            {testData.nextReset && (
              <div className="text-xs text-gray-600">
                <strong>Próximo Reset:</strong> {new Date(testData.nextReset).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Como testar:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Ative o modo teste no painel admin</li>
            <li>Resgate um bônus para iniciar streak</li>
            <li>Aguarde 10 segundos e resgate novamente para aumentar streak</li>
            <li>Para testar perda de streak: aguarde mais de 20 segundos sem resgatar</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyBonusTest;