import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, List } from 'lucide-react';
import { ProductEditorData } from '../ProductEditor';

interface DescriptionTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
}

const DescriptionTab: React.FC<DescriptionTabProps> = ({ formData, onChange }) => {
  const generateDescription = () => {
    const productName = formData.name.toLowerCase();
    let generatedDescription = '';

    if (productName.includes('controller') || productName.includes('controle')) {
      generatedDescription = `Leve sua experiência de gaming para o próximo nível com o ${formData.name}. 
      Desfrute de precisão aprimorada com controles de movimento intuitivos que dão vida aos seus jogos. 
      A funcionalidade integrada permite uma integração perfeita com seus personagens favoritos, 
      enquanto o botão de captura permite compartilhar seus momentos épicos sem esforço. 
      Com botões programáveis, você pode personalizar sua jogabilidade para se adequar ao seu estilo.`;
    } else if (productName.includes('headset') || productName.includes('fone')) {
      generatedDescription = `Mergulhe completamente no mundo dos games com o ${formData.name}. 
      Experimente áudio de alta qualidade com som surround que coloca você no centro da ação. 
      O design confortável permite longas sessões de jogo, enquanto o microfone de alta qualidade 
      garante comunicação cristalina com sua equipe. Compatível com múltiplas plataformas.`;
    } else if (productName.includes('console')) {
      generatedDescription = `Descubra uma nova geração de gaming com o ${formData.name}. 
      Gráficos impressionantes, carregamento ultrarrápido e uma biblioteca vasta de jogos 
      aguardam por você. Com retrocompatibilidade e recursos de streaming integrados, 
      este console oferece entretenimento ilimitado para toda a família.`;
    } else {
      generatedDescription = `O ${formData.name} representa o que há de melhor em tecnologia gaming. 
      Desenvolvido com materiais premium e tecnologia de ponta, oferece desempenho excepcional 
      e durabilidade incomparável. Ideal para gamers que exigem o máximo de qualidade e performance.`;
    }

    onChange('description', generatedDescription.trim());
  };

  const addHighlight = () => {
    const currentHighlights = formData.highlights || [];
    onChange('highlights', [...currentHighlights, '']);
  };

  const updateHighlight = (index: number, value: string) => {
    const currentHighlights = [...(formData.highlights || [])];
    currentHighlights[index] = value;
    onChange('highlights', currentHighlights);
  };

  const removeHighlight = (index: number) => {
    const currentHighlights = formData.highlights || [];
    const updatedHighlights = currentHighlights.filter((_, i) => i !== index);
    onChange('highlights', updatedHighlights);
  };

  const addFeature = () => {
    const currentFeatures = formData.features || [];
    onChange('features', [...currentFeatures, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const currentFeatures = [...(formData.features || [])];
    currentFeatures[index] = value;
    onChange('features', currentFeatures);
  };

  const removeFeature = (index: number) => {
    const currentFeatures = formData.features || [];
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    onChange('features', updatedFeatures);
  };

  return (
    <div className="space-y-6">
      {/* Descrição principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Descrição Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Descrição do Produto</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={!formData.name}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Automaticamente
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Descrição detalhada do produto que aparecerá na página..."
              className="min-h-32"
            />
            <p className="text-sm text-gray-500 mt-1">
              Esta descrição aparecerá na seção principal do produto. Use o botão "Gerar Automaticamente" 
              para criar uma descrição baseada no nome do produto.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Destaques do produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Destaques do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Pontos de Destaque</Label>
            <p className="text-sm text-gray-500 mb-3">
              Características principais que serão exibidas em destaque na página do produto.
            </p>
            
            <div className="space-y-2">
              {(formData.highlights || []).map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="Ex: Áudio surround 7.1 para imersão total"
                    className="flex-1 min-h-12"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addHighlight}
                className="w-full"
              >
                + Adicionar Destaque
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Características e recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Recursos e Características
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Lista de Recursos</Label>
            <p className="text-sm text-gray-500 mb-3">
              Lista de características e recursos que serão exibidos em formato de lista.
            </p>
            
            <div className="space-y-2">
              {(formData.features || []).map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Ex: Compatível com PC, PS5 e Xbox Series X"
                    className="flex-1 min-h-12"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addFeature}
                className="w-full"
              >
                + Adicionar Recurso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {(formData.description || (formData.highlights && formData.highlights.length > 0) || (formData.features && formData.features.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview da Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              {formData.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {formData.description}
                  </p>
                </div>
              )}

              {formData.highlights && formData.highlights.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Destaques</h4>
                  <div className="space-y-2">
                    {formData.highlights.filter(h => h.trim()).map((highlight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.features && formData.features.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recursos</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {formData.features.filter(f => f.trim()).map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DescriptionTab;