import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Package, DollarSign, Image, Tag, Palette, Settings, Info, Eye, Plus, X } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Tag as TagType } from '@/hooks/useTags';
import { TagSelector } from './TagSelector';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

interface ProductFormProps {
  product?: Product | null;
  tags: TagType[];
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
}

const ProductFormNew: React.FC<ProductFormProps> = ({
  product,
  tags,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    additional_images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    tagIds: [] as string[],
    badge_text: '',
    badge_color: '#22c55e',
    badge_visible: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      console.log('Produto carregado para edição:', product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '0',
        image: product.image || '',
        additional_images: product.additional_images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        tagIds: product.tags?.map(tag => tag.id) || [],
        badge_text: product.badge_text || '',
        badge_color: product.badge_color || '#22c55e',
        badge_visible: product.badge_visible || false,
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: '',
        additional_images: [],
        sizes: [],
        colors: [],
        tagIds: [],
        badge_text: '',
        badge_color: '#22c55e',
        badge_visible: false,
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'sizes' | 'colors', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleTagChange = (tagId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tagIds: checked 
        ? [...prev.tagIds, tagId]
        : prev.tagIds.filter(id => id !== tagId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome do produto é obrigatório');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Preço deve ser maior que zero');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Enviando dados do produto com tags:', formData.tagIds);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        image: formData.image || null,
        additional_images: formData.additional_images,
        sizes: formData.sizes,
        colors: formData.colors,
        tagIds: formData.tagIds,
        badge_text: formData.badge_text?.trim() || null,
        badge_color: formData.badge_color || '#22c55e',
        badge_visible: formData.badge_visible,
      };

      console.log('Dados finais do produto:', productData);
      await onSubmit(productData);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const badgeColors = [
    { value: '#22c55e', label: 'Verde', preview: 'bg-green-500' },
    { value: '#3b82f6', label: 'Azul', preview: 'bg-blue-500' },
    { value: '#ef4444', label: 'Vermelho', preview: 'bg-red-500' },
    { value: '#f59e0b', label: 'Amarelo', preview: 'bg-yellow-500' },
    { value: '#8b5cf6', label: 'Roxo', preview: 'bg-purple-500' },
    { value: '#06b6d4', label: 'Ciano', preview: 'bg-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Lista de Produtos
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product ? 'Editar Produto' : 'Novo Produto'}
              </h1>
              <p className="text-gray-600 mt-1">
                {product ? 'Edite as informações do produto' : 'Preencha as informações do novo produto'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-3">
                <Info className="h-6 w-6 text-blue-600" />
                Informações Básicas
              </CardTitle>
              <CardDescription className="text-gray-600">
                Dados principais do produto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="Ex: PlayStation 5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700 font-medium">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="Descrição detalhada do produto..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-gray-700 font-medium">Preço *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-gray-700 font-medium">Estoque</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', e.target.value)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sizes" className="text-gray-700 font-medium">Tamanhos</Label>
                      <Input
                        id="sizes"
                        value={formData.sizes.join(', ')}
                        onChange={(e) => handleArrayInputChange('sizes', e.target.value)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        placeholder="P, M, G, GG"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="colors" className="text-gray-700 font-medium">Cores</Label>
                      <Input
                        id="colors"
                        value={formData.colors.join(', ')}
                        onChange={(e) => handleArrayInputChange('colors', e.target.value)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        placeholder="Azul, Vermelho, Verde"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-3">
                <Image className="h-6 w-6 text-blue-600" />
                Imagens do Produto
              </CardTitle>
              <CardDescription className="text-gray-600">
                Adicione imagens para o produto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ImageUpload
                    label="Imagem Principal *"
                    currentImage={formData.image}
                    onImageUploaded={(url) => handleInputChange('image', url)}
                    folder="products"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-gray-700 font-medium">Imagens Adicionais</Label>
                  <div className="space-y-3">
                    {formData.additional_images.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newImages = [...formData.additional_images];
                            newImages[index] = e.target.value;
                            handleInputChange('additional_images', newImages);
                          }}
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          placeholder="URL da imagem"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newImages = formData.additional_images.filter((_, i) => i !== index);
                            handleInputChange('additional_images', newImages);
                          }}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleInputChange('additional_images', [...formData.additional_images, '']);
                      }}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Imagem
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-3">
                <Tag className="h-6 w-6 text-purple-600" />
                Categorias e Tags
              </CardTitle>
              <CardDescription className="text-gray-600">
                Selecione as categorias do produto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <TagSelector
                tags={tags}
                selectedTagIds={formData.tagIds}
                onTagChange={handleTagChange}
              />
            </CardContent>
          </Card>

          {/* Badge Configuration */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-3">
                <Palette className="h-6 w-6 text-green-600" />
                Configuração da Badge
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure badges especiais para o produto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="badge_visible"
                    checked={formData.badge_visible}
                    onCheckedChange={(checked) => handleInputChange('badge_visible', checked)}
                  />
                  <Label htmlFor="badge_visible" className="text-gray-700 font-medium">
                    Exibir badge no produto
                  </Label>
                  {formData.badge_visible && (
                    <Badge 
                      style={{ backgroundColor: formData.badge_color }}
                      className="text-white"
                    >
                      {formData.badge_text || 'PREVIEW'}
                    </Badge>
                  )}
                </div>

                {formData.badge_visible && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                    <div className="space-y-2">
                      <Label htmlFor="badge_text" className="text-gray-700 font-medium">Texto da Badge</Label>
                      <Input
                        id="badge_text"
                        value={formData.badge_text}
                        onChange={(e) => handleInputChange('badge_text', e.target.value)}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        placeholder="Ex: PRE-OWNED BUNDLE DEAL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="badge_color" className="text-gray-700 font-medium">Cor da Badge</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {badgeColors.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleInputChange('badge_color', color.value)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                              formData.badge_color === color.value
                                ? 'border-gray-800 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-6 rounded ${color.preview} mb-1`}></div>
                            <span className="text-xs text-gray-600">{color.label}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Input
                          type="color"
                          value={formData.badge_color}
                          onChange={(e) => handleInputChange('badge_color', e.target.value)}
                          className="w-16 h-10 border-gray-300"
                        />
                        <Input
                          value={formData.badge_color}
                          onChange={(e) => handleInputChange('badge_color', e.target.value)}
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 flex-1"
                          placeholder="#22c55e"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações importantes */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p><strong>Dicas importantes:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Campos marcados com * são obrigatórios</li>
                  <li>Use imagens de alta qualidade (recomendado: 800x800px)</li>
                  <li>Separe tamanhos e cores por vírgula</li>
                  <li>O preço deve ser maior que zero</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Botões de ação */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              size="lg"
            >
              {isSubmitting ? 'Salvando...' : (product ? 'Atualizar Produto' : 'Criar Produto')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormNew;

