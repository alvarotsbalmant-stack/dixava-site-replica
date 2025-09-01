import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Eye, EyeOff, Smartphone, Monitor, Palette } from 'lucide-react';

interface PromotionalRibbonConfig {
  id?: string;
  device_type: 'mobile' | 'desktop';
  is_active: boolean;
  text: string;
  background_color: string;
  text_color: string;
  link_url?: string;
  background_type?: 'solid' | 'gradient';
  gradient_colors?: string;
}

// Gradientes pré-definidos inspirados na GameStop
const PRESET_GRADIENTS = [
  {
    name: 'GameStop Purple',
    value: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #A855F7 100%)',
    colors: '#6B46C1,#9333EA,#A855F7'
  },
  {
    name: 'Ocean Blue',
    value: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #6366F1 100%)',
    colors: '#0EA5E9,#3B82F6,#6366F1'
  },
  {
    name: 'Sunset Orange',
    value: 'linear-gradient(135deg, #F97316 0%, #EF4444 50%, #DC2626 100%)',
    colors: '#F97316,#EF4444,#DC2626'
  },
  {
    name: 'Forest Green',
    value: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
    colors: '#059669,#10B981,#34D399'
  },
  {
    name: 'Royal Gold',
    value: 'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%)',
    colors: '#D97706,#F59E0B,#FCD34D'
  },
  {
    name: 'Dark Gaming',
    value: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)',
    colors: '#1F2937,#374151,#4B5563'
  }
];

// Componente de formulário isolado para evitar re-renderizações
const RibbonConfigForm = React.memo(({ 
  config, 
  onConfigChange, 
  deviceType, 
  icon 
}: { 
  config: PromotionalRibbonConfig; 
  onConfigChange: (field: keyof PromotionalRibbonConfig, value: any) => void;
  deviceType: string;
  icon: React.ReactNode;
}) => {
  
  // Função para obter o estilo de fundo
  const getBackgroundStyle = useMemo(() => {
    if (config.background_type === 'gradient' && config.gradient_colors) {
      const colors = config.gradient_colors.split(',').map(color => color.trim());
      if (colors.length >= 2) {
        return `linear-gradient(135deg, ${colors.join(', ')})`;
      }
    }
    return config.background_color;
  }, [config.background_type, config.gradient_colors, config.background_color]);

  return (
    <div className="space-y-6">
      {/* Preview da fita */}
      <div className="space-y-2">
        <Label>Preview da Fita {deviceType}</Label>
        <div 
          className="w-full h-[40px] flex items-center justify-center text-sm font-medium rounded border"
          style={{
            background: getBackgroundStyle,
            color: config.text_color,
            opacity: config.is_active ? 1 : 0.5
          }}
        >
          {config.text || `Texto da fita promocional ${deviceType.toLowerCase()}`}
        </div>
      </div>

      <Separator />

      {/* Configurações */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`is_active_${config.device_type}`}
            checked={config.is_active}
            onCheckedChange={(checked) => onConfigChange('is_active', !!checked)}
          />
          <Label htmlFor={`is_active_${config.device_type}`} className="flex items-center gap-2">
            {config.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {icon}
            Ativar fita {deviceType.toLowerCase()}
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`text_${config.device_type}`}>Texto da Promoção</Label>
          <Textarea
            id={`text_${config.device_type}`}
            value={config.text}
            onChange={(e) => onConfigChange('text', e.target.value)}
            placeholder={`Ex: ${deviceType === 'Mobile' ? '📱 Baixe nosso app!' : '🎮 Frete Grátis acima de R$ 150'}`}
            rows={2}
          />
        </div>

        {/* Tipo de fundo */}
        <div className="space-y-2">
          <Label>Tipo de Fundo</Label>
          <Select 
            value={config.background_type || 'solid'} 
            onValueChange={(value) => onConfigChange('background_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de fundo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Cor Sólida</SelectItem>
              <SelectItem value="gradient">Gradiente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Configuração de cor sólida */}
        {config.background_type === 'solid' && (
          <div className="space-y-2">
            <Label htmlFor={`background_color_${config.device_type}`}>Cor de Fundo</Label>
            <div className="flex gap-2">
              <Input
                id={`background_color_${config.device_type}`}
                type="color"
                value={config.background_color}
                onChange={(e) => onConfigChange('background_color', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={config.background_color}
                onChange={(e) => onConfigChange('background_color', e.target.value)}
                placeholder="#6B46C1"
              />
            </div>
          </div>
        )}

        {/* Configuração de gradiente */}
        {config.background_type === 'gradient' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gradientes Pré-definidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_GRADIENTS.map((gradient) => (
                  <Button
                    key={gradient.name}
                    variant="outline"
                    className="h-12 p-2 flex items-center gap-2"
                    onClick={() => onConfigChange('gradient_colors', gradient.colors)}
                  >
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ background: gradient.value }}
                    />
                    <span className="text-xs">{gradient.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Cores do Gradiente (separadas por vírgula)</Label>
              <Input
                value={config.gradient_colors || ''}
                onChange={(e) => onConfigChange('gradient_colors', e.target.value)}
                placeholder="Ex: #6B46C1,#9333EA,#A855F7"
              />
              <p className="text-xs text-gray-500">
                Digite as cores em formato hex separadas por vírgula
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`text_color_${config.device_type}`}>Cor do Texto</Label>
          <div className="flex gap-2">
            <Input
              id={`text_color_${config.device_type}`}
              type="color"
              value={config.text_color}
              onChange={(e) => onConfigChange('text_color', e.target.value)}
              className="w-16 h-10 p-1 border rounded"
            />
            <Input
              value={config.text_color}
              onChange={(e) => onConfigChange('text_color', e.target.value)}
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`link_url_${config.device_type}`}>Link de Destino (opcional)</Label>
          <Input
            id={`link_url_${config.device_type}`}
            value={config.link_url || ''}
            onChange={(e) => onConfigChange('link_url', e.target.value)}
            placeholder="Ex: /categoria/ofertas ou https://exemplo.com"
          />
        </div>
      </div>
    </div>
  );
});

const PromotionalRibbonManager: React.FC = () => {
  const [mobileConfig, setMobileConfig] = useState<PromotionalRibbonConfig>({
    device_type: 'mobile',
    is_active: false,
    text: '📱 Ofertas especiais no app!',
    background_color: '#6B46C1',
    text_color: '#FFFFFF',
    link_url: '',
    background_type: 'solid',
    gradient_colors: ''
  });

  const [desktopConfig, setDesktopConfig] = useState<PromotionalRibbonConfig>({
    device_type: 'desktop',
    is_active: false,
    text: '🎮 Frete Grátis acima de R$ 150 - Aproveite nossas ofertas especiais!',
    background_color: '#6B46C1',
    text_color: '#FFFFFF',
    link_url: '/categoria/ofertas',
    background_type: 'solid',
    gradient_colors: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Funções de atualização estabilizadas
  const handleMobileConfigChange = useCallback((field: keyof PromotionalRibbonConfig, value: any) => {
    setMobileConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDesktopConfigChange = useCallback((field: keyof PromotionalRibbonConfig, value: any) => {
    setDesktopConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  // Carregar configurações existentes
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_ribbon_config')
        .select('*');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        data.forEach((config) => {
          const configWithDefaults = {
            ...config,
            background_type: (config.background_type as 'solid' | 'gradient') || 'solid',
            gradient_colors: config.gradient_colors || ''
          };
          
          if (config.device_type === 'mobile') {
            setMobileConfig({
              ...configWithDefaults,
              device_type: 'mobile' as const,
              background_type: (configWithDefaults.background_type as 'solid' | 'gradient') || 'solid'
            });
          } else if (config.device_type === 'desktop') {
            setDesktopConfig({
              ...configWithDefaults,
              device_type: 'desktop' as const,
              background_type: (configWithDefaults.background_type as 'solid' | 'gradient') || 'solid'
            });
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da fita:', error);
      toast({
        title: 'Erro ao carregar configuração',
        description: 'Não foi possível carregar as configurações da fita promocional.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfigs = async () => {
    setSaving(true);
    try {
      // Salvar configuração mobile
      const { error: mobileError } = await supabase
        .from('promotional_ribbon_config')
        .upsert(mobileConfig, { onConflict: 'device_type' });

      if (mobileError) throw mobileError;

      // Salvar configuração desktop
      const { error: desktopError } = await supabase
        .from('promotional_ribbon_config')
        .upsert(desktopConfig, { onConflict: 'device_type' });

      if (desktopError) throw desktopError;

      toast({
        title: 'Configurações salvas!',
        description: 'As configurações da fita promocional foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎀 Fita Promocional
          <Palette className="h-5 w-5" />
          <div className="flex gap-2">
            <Badge variant={mobileConfig.is_active ? "default" : "secondary"}>
              📱 Mobile {mobileConfig.is_active ? "Ativa" : "Inativa"}
            </Badge>
            <Badge variant={desktopConfig.is_active ? "default" : "secondary"}>
              🖥️ Desktop {desktopConfig.is_active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mobile" className="mt-6">
            <RibbonConfigForm 
              config={mobileConfig}
              onConfigChange={handleMobileConfigChange}
              deviceType="Mobile"
              icon={<Smartphone className="h-4 w-4" />}
            />
          </TabsContent>
          
          <TabsContent value="desktop" className="mt-6">
            <RibbonConfigForm 
              config={desktopConfig}
              onConfigChange={handleDesktopConfigChange}
              deviceType="Desktop"
              icon={<Monitor className="h-4 w-4" />}
            />
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Botão de salvar */}
        <Button 
          onClick={saveConfigs} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PromotionalRibbonManager;

