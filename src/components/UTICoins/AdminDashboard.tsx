import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Coins, 
  AlertTriangle, 
  Settings, 
  TrendingUp,
  RefreshCw,
  Shield
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalTransactions: number;
  securityFlags: number;
}

interface SystemConfig {
  system_enabled: boolean;
  
  scroll_amount: number;
  max_scroll_per_day: number;
  scroll_cooldown_minutes: number;
  max_streak_multiplier: number;
  streak_multiplier_increment: number;
  security_flag_threshold: number;
  suspicious_action_window_minutes: number;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalTransactions: 0,
    securityFlags: 0
  });
  const [config, setConfig] = useState<SystemConfig>({
    system_enabled: true,
    
    scroll_amount: 2,
    max_scroll_per_day: 50,
    scroll_cooldown_minutes: 1,
    max_streak_multiplier: 3.0,
    streak_multiplier_increment: 0.1,
    security_flag_threshold: 10,
    suspicious_action_window_minutes: 5
  });
  const [saving, setSaving] = useState(false);

  // Carregar estatísticas do sistema
  const loadStats = async () => {
    try {
      // Total de usuários com UTI Coins
      const { count: totalUsers } = await supabase
        .from('uti_coins')
        .select('*', { count: 'exact', head: true });

      // Usuários ativos (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabase
        .from('daily_actions')
        .select('user_id', { count: 'exact', head: true })
        .gte('last_performed_at', sevenDaysAgo.toISOString());

      // Estatísticas de moedas
      const { data: coinStats } = await supabase
        .from('uti_coins')
        .select('balance, total_earned, total_spent');

      const totalCoinsEarned = coinStats?.reduce((sum, item) => sum + (item.total_earned || 0), 0) || 0;
      const totalCoinsSpent = coinStats?.reduce((sum, item) => sum + (item.total_spent || 0), 0) || 0;

      // Total de transações
      const { count: totalTransactions } = await supabase
        .from('coin_transactions')
        .select('*', { count: 'exact', head: true });

      // Flags de segurança ativas
      const { count: securityFlags } = await supabase
        .from('security_flags')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalCoinsEarned,
        totalCoinsSpent,
        totalTransactions: totalTransactions || 0,
        securityFlags: securityFlags || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar estatísticas do sistema',
        variant: 'destructive'
      });
    }
  };

  // Carregar configurações do sistema
  const loadConfig = async () => {
    try {
      const { data: configData } = await supabase
        .from('coin_system_config')
        .select('setting_key, setting_value');

      if (configData) {
        const configMap: any = {};
        configData.forEach(item => {
          const key = item.setting_key;
          let value = item.setting_value;
          
          // Parse valores conforme o tipo
          if (key === 'system_enabled') {
            value = value === 'true' || value === true;
          } else if (typeof value === 'string' && !isNaN(Number(value))) {
            value = Number(value);
          }
          
          configMap[key] = value;
        });

        setConfig(prev => ({ ...prev, ...configMap }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações do sistema',
        variant: 'destructive'
      });
    }
  };

  // Salvar configurações
  const saveConfig = async () => {
    setSaving(true);
    try {
      // Preparar dados para salvar
      const updates = Object.entries(config).map(([key, value]) => ({
        setting_key: key,
        setting_value: value.toString(),
        updated_at: new Date().toISOString()
      }));

      // Fazer upsert de todas as configurações
      const { error } = await supabase
        .from('coin_system_config')
        .upsert(updates, { onConflict: 'setting_key' });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Executar limpeza de dados antigos
  const runCleanup = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_uti_coins_data');
      
      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Limpeza de dados executada com sucesso!'
      });
      
      // Recarregar estatísticas
      await loadStats();
    } catch (error) {
      console.error('Erro na limpeza:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao executar limpeza de dados',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadConfig()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Carregando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UTI Coins Dashboard</h2>
          <p className="text-muted-foreground">Gerenciamento e estatísticas do sistema</p>
        </div>
        <Button 
          onClick={() => Promise.all([loadStats(), loadConfig()])}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} ativos nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moedas Circulando</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalCoinsEarned - stats.totalCoinsSpent).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCoinsEarned.toLocaleString()} emitidas | {stats.totalCoinsSpent.toLocaleString()} gastas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Todas as transações registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flags de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.securityFlags}
              {stats.securityFlags > 0 && (
                <AlertTriangle className="inline w-5 h-5 ml-2 text-yellow-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Alertas de segurança ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configurações */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system-enabled">Sistema Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar/desativar todo o sistema UTI Coins
                  </p>
                </div>
                <Switch
                  id="system-enabled"
                  checked={config.system_enabled}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, system_enabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Recompensas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <Label htmlFor="scroll-amount">Moedas por Scroll</Label>
                  <Input
                    id="scroll-amount"
                    type="number"
                    value={config.scroll_amount}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, scroll_amount: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="max-scroll">Máximo Scrolls por Dia</Label>
                  <Input
                    id="max-scroll"
                    type="number"
                    value={config.max_scroll_per_day}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, max_scroll_per_day: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="scroll-cooldown">Cooldown Scroll (minutos)</Label>
                  <Input
                    id="scroll-cooldown"
                    type="number"
                    value={config.scroll_cooldown_minutes}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, scroll_cooldown_minutes: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="max-multiplier">Multiplicador Máximo de Streak</Label>
                  <Input
                    id="max-multiplier"
                    type="number"
                    step="0.1"
                    value={config.max_streak_multiplier}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, max_streak_multiplier: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="multiplier-increment">Incremento por Dia</Label>
                  <Input
                    id="multiplier-increment"
                    type="number"
                    step="0.01"
                    value={config.streak_multiplier_increment}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, streak_multiplier_increment: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="security-threshold">Limite de Ações Suspeitas</Label>
                  <Input
                    id="security-threshold"
                    type="number"
                    value={config.security_flag_threshold}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, security_flag_threshold: parseInt(e.target.value) || 0 }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de ações antes de ser flaggado como suspeito
                  </p>
                </div>

                <div>
                  <Label htmlFor="window-minutes">Janela de Detecção (minutos)</Label>
                  <Input
                    id="window-minutes"
                    type="number"
                    value={config.suspicious_action_window_minutes}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, suspicious_action_window_minutes: parseInt(e.target.value) || 0 }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Janela de tempo para detectar atividade suspeita
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manutenção do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Limpeza de Dados Antigos</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Remove logs de segurança (+30 dias), flags resolvidos (+90 dias) e ações antigas (+1 ano)
                </p>
                <Button onClick={runCleanup} variant="outline">
                  Executar Limpeza
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={saveConfig} 
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;