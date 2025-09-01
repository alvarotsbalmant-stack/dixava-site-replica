import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Save, RotateCcw } from 'lucide-react';

interface SystemConfig {
  setting_key: string;
  setting_value: any;
  description?: string;
}

interface DailyBonusConfigProps {
  configs: SystemConfig[];
  onConfigUpdate: () => void;
}

const DailyBonusConfig: React.FC<DailyBonusConfigProps> = ({ configs, onConfigUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Estados para as configurações
  const [baseAmount, setBaseAmount] = useState(10);
  const [maxAmount, setMaxAmount] = useState(100);
  const [streakDays, setStreakDays] = useState(7);
  const [incrementType, setIncrementType] = useState<'calculated' | 'fixed'>('calculated');
  const [fixedIncrement, setFixedIncrement] = useState(10);

  // Carregar configurações iniciais
  useEffect(() => {
    const dailyConfigs = configs.filter(c => c.setting_key.startsWith('daily_bonus_'));
    
    dailyConfigs.forEach(config => {
      // Extrair valor do JSONB - pode ser um número, string, ou string com aspas
      let value = config.setting_value;
      if (typeof value === 'string' && (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1); // Remove aspas duplas
      }
        
      switch (config.setting_key) {
        case 'daily_bonus_base_amount':
          setBaseAmount(parseInt(value));
          break;
        case 'daily_bonus_max_amount':
          setMaxAmount(parseInt(value));
          break;
        case 'daily_bonus_streak_days':
          setStreakDays(parseInt(value));
          break;
        case 'daily_bonus_increment_type':
          setIncrementType(value);
          break;
        case 'daily_bonus_fixed_increment':
          setFixedIncrement(parseInt(value));
          break;
      }
    });
  }, [configs]);

  // Calcular preview da progressão
  const calculateProgression = () => {
    const progression = [];
    for (let day = 1; day <= streakDays; day++) {
      let amount;
      if (incrementType === 'fixed') {
        amount = Math.min(baseAmount + ((day - 1) * fixedIncrement), maxAmount);
      } else {
        if (streakDays > 1) {
          amount = baseAmount + Math.round(((maxAmount - baseAmount) * (day - 1)) / (streakDays - 1));
        } else {
          amount = baseAmount;
        }
      }
      progression.push({ day, amount });
    }
    return progression;
  };

  // Salvar configurações
  const saveConfigs = async () => {
    setLoading(true);
    try {
      const updates = [
        { setting_key: 'daily_bonus_base_amount', setting_value: JSON.stringify(baseAmount) },
        { setting_key: 'daily_bonus_max_amount', setting_value: JSON.stringify(maxAmount) },
        { setting_key: 'daily_bonus_streak_days', setting_value: JSON.stringify(streakDays) },
        { setting_key: 'daily_bonus_increment_type', setting_value: JSON.stringify(incrementType) },
        { setting_key: 'daily_bonus_fixed_increment', setting_value: JSON.stringify(fixedIncrement) }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('coin_system_config')
          .update({ 
            setting_value: update.setting_value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      toast({ title: 'Sucesso', description: 'Configurações do Daily Bonus salvas!' });
      onConfigUpdate();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao salvar configurações', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Resetar para valores padrão
  const resetToDefault = () => {
    setBaseAmount(10);
    setMaxAmount(100);
    setStreakDays(7);
    setIncrementType('calculated');
    setFixedIncrement(10);
  };

  const progression = calculateProgression();

  return (
    <div className="space-y-6">
      {/* Configurações principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="baseAmount">Valor Base (Dia 1)</Label>
          <Input
            id="baseAmount"
            type="number"
            value={baseAmount}
            onChange={(e) => setBaseAmount(parseInt(e.target.value) || 0)}
            min="1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade de moedas no primeiro dia do streak
          </p>
        </div>

        <div>
          <Label htmlFor="maxAmount">Valor Máximo</Label>
          <Input
            id="maxAmount"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(parseInt(e.target.value) || 0)}
            min="1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade máxima de moedas por dia
          </p>
        </div>

        <div>
          <Label htmlFor="streakDays">Dias do Ciclo</Label>
          <Input
            id="streakDays"
            type="number"
            value={streakDays}
            onChange={(e) => setStreakDays(parseInt(e.target.value) || 1)}
            min="1"
            max="30"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Quantos dias para completar um ciclo
          </p>
        </div>
      </div>

      {/* Tipo de incremento */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="incrementType">Tipo de Incremento</Label>
          <Select value={incrementType} onValueChange={(value: 'calculated' | 'fixed') => setIncrementType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calculated">Calculado (progressão linear)</SelectItem>
              <SelectItem value="fixed">Fixo (incremento constante)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {incrementType === 'calculated' 
              ? 'O valor aumenta gradualmente do valor base ao máximo'
              : 'O valor aumenta com um incremento fixo por dia'
            }
          </p>
        </div>

        {incrementType === 'fixed' && (
          <div>
            <Label htmlFor="fixedIncrement">Incremento Fixo</Label>
            <Input
              id="fixedIncrement"
              type="number"
              value={fixedIncrement}
              onChange={(e) => setFixedIncrement(parseInt(e.target.value) || 0)}
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Quantidade adicionada a cada dia
            </p>
          </div>
        )}
      </div>

      {/* Preview da progressão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Preview da Progressão
          </CardTitle>
          <CardDescription>
            Como será a progressão de moedas ao longo dos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {progression.map(({ day, amount }) => (
              <div key={day} className="text-center p-2 bg-muted rounded">
                <div className="text-sm font-medium">Dia {day}</div>
                <div className="text-lg font-bold text-primary">{amount}</div>
                <div className="text-xs text-muted-foreground">moedas</div>
              </div>
            ))}
          </div>
          
          {progression.length > 7 && (
            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Ciclo de {streakDays} dias:</strong> Após o último dia, o ciclo reinicia do dia 1.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-4">
        <Button onClick={saveConfigs} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
        
        <Button variant="outline" onClick={resetToDefault}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Valores Padrão
        </Button>
      </div>

      {/* Informações adicionais */}
      <div className="p-4 bg-amber-50 rounded border border-amber-200">
        <h4 className="font-medium text-amber-800 mb-2">⚠️ Informações Importantes</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• As alterações afetam apenas os próximos resgates de daily bonus</li>
          <li>• Streaks em andamento continuam com as configurações anteriores até serem quebrados</li>
          <li>• O horário de reset é das 20h às 20h (horário de Brasília)</li>
          <li>• Valores muito altos podem impactar a economia do sistema</li>
        </ul>
      </div>
    </div>
  );
};

export default DailyBonusConfig;