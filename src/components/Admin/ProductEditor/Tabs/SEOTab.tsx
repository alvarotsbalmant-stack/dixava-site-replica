import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Globe, Wand2 } from 'lucide-react';
import { ProductEditorData } from '../ProductEditor';

interface SEOTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
  onGenerateSlug: () => void;
}

const SEOTab: React.FC<SEOTabProps> = ({ formData, onChange, onGenerateSlug }) => {
  const generateMetaTitle = () => {
    const title = `${formData.name} - UTI Gamer Shop`;
    onChange('meta_title', title);
  };

  const generateMetaDescription = () => {
    let description = `Compre ${formData.name} na UTI Gamer Shop`;
    
    if (formData.price) {
      description += ` por apenas R$ ${formData.price.toFixed(2).replace('.', ',')}`;
    }
    
    if (formData.free_shipping) {
      description += ' com frete grátis';
    }
    
    description += '. Produto original, garantia e entrega rápida. Melhor preço do mercado!';
    
    onChange('meta_description', description);
  };

  const metaTitleLength = formData.meta_title?.length || 0;
  const metaDescriptionLength = formData.meta_description?.length || 0;

  return (
    <div className="space-y-6">
      {/* SEO Básico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Básico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="meta_title">
                Título Meta ({metaTitleLength}/60)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateMetaTitle}
                disabled={!formData.name}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Gerar
              </Button>
            </div>
            <Input
              id="meta_title"
              value={formData.meta_title || ''}
              onChange={(e) => onChange('meta_title', e.target.value)}
              placeholder="Título que aparecerá nos resultados de busca"
              maxLength={60}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">
                Título otimizado para mecanismos de busca
              </p>
              <span className={`text-xs ${metaTitleLength > 60 ? 'text-red-500' : metaTitleLength > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                {metaTitleLength > 60 ? 'Muito longo' : metaTitleLength > 50 ? 'Quase no limite' : 'Bom'}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="meta_description">
                Descrição Meta ({metaDescriptionLength}/160)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateMetaDescription}
                disabled={!formData.name}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Gerar
              </Button>
            </div>
            <Textarea
              id="meta_description"
              value={formData.meta_description || ''}
              onChange={(e) => onChange('meta_description', e.target.value)}
              placeholder="Descrição que aparecerá nos resultados de busca"
              maxLength={160}
              className="min-h-20"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">
                Descrição otimizada para mecanismos de busca
              </p>
              <span className={`text-xs ${metaDescriptionLength > 160 ? 'text-red-500' : metaDescriptionLength > 140 ? 'text-yellow-500' : 'text-green-500'}`}>
                {metaDescriptionLength > 160 ? 'Muito longo' : metaDescriptionLength > 140 ? 'Quase no limite' : 'Bom'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL e Slug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URL do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="slug">Slug da URL</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateSlug}
                disabled={!formData.name}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Gerar do Nome
              </Button>
            </div>
            <Input
              id="slug"
              value={formData.slug || ''}
              onChange={(e) => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
              placeholder="url-amigavel-do-produto"
            />
            {formData.slug && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <span className="text-gray-500">URL completa:</span><br />
                <span className="font-mono text-blue-600">
                  https://utishop.com.br/produto/{formData.slug}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              URL amigável para o produto. Use apenas letras minúsculas, números e hífens.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview do resultado de busca */}
      {(formData.meta_title || formData.meta_description) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview nos Resultados de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="bg-white p-4 rounded border">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {formData.meta_title || formData.name || 'Título do Produto'}
                </div>
                <div className="text-green-700 text-sm mt-1">
                  https://utishop.com.br/produto/{formData.slug || 'produto'}
                </div>
                <div className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {formData.meta_description || 'Descrição do produto aparecerá aqui...'}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este é um preview de como seu produto aparecerá nos resultados do Google
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas de SEO */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <span className="font-medium">Título Meta:</span> Inclua o nome do produto e da loja. Mantenha entre 50-60 caracteres.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <span className="font-medium">Descrição Meta:</span> Seja descritivo e inclua benefícios. Mantenha entre 140-160 caracteres.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <span className="font-medium">URL/Slug:</span> Use palavras-chave relevantes separadas por hífens. Evite números desnecessários.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">💡</span>
              <div>
                <span className="font-medium">Dica:</span> Use os botões "Gerar" para criar conteúdo otimizado automaticamente baseado nas informações do produto.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOTab;