import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Package, DollarSign, Image, Tag, Palette, Eye, ExternalLink, Settings, Plus, X } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Tag as TagType } from '@/hooks/useTags';
import { TagSelector } from './TagSelector';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ProductFormProps {
  product?: Product | null;
  tags: TagType[];
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  tags,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    pro_price: '',
    list_price: '',
    stock: '',
    image: '',
    additional_images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    tagIds: [] as string[],
    badge_text: '',
    badge_color: '#22c55e',
    badge_visible: false,
    specifications: [] as Array<{ label: string; value: string }>,
    technical_specs: {},
    product_features: {},
    shipping_weight: '',
    free_shipping: false,
    meta_title: '',
    meta_description: '',
    slug: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        pro_price: product.pro_price?.toString() || '',
        list_price: product.list_price?.toString() || '',
        stock: product.stock?.toString() || '0',
        image: product.image || '',
        additional_images: product.additional_images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        tagIds: product.tags?.map(tag => tag.id) || [],
        badge_text: product.badge_text || '',
        badge_color: product.badge_color || '#22c55e',
        badge_visible: product.badge_visible || false,
        specifications: product.specifications || [],
        technical_specs: product.technical_specs || {},
        product_features: product.product_features || {},
        shipping_weight: product.shipping_weight?.toString() || '',
        free_shipping: product.free_shipping || false,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        slug: product.slug || '',
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

  const handleSpecificationChange = (index: number, field: 'label' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { label: '', value: '' }]
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
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
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: parseFloat(formData.price),
        pro_price: formData.pro_price ? parseFloat(formData.pro_price) : null,
        list_price: formData.list_price ? parseFloat(formData.list_price) : null,
        stock: parseInt(formData.stock) || 0,
        image: formData.image || null,
        additional_images: formData.additional_images,
        sizes: formData.sizes,
        colors: formData.colors,
        tagIds: formData.tagIds,
        badge_text: formData.badge_text?.trim() || null,
        badge_color: formData.badge_color || '#22c55e',
        badge_visible: formData.badge_visible,
        specifications: formData.specifications.filter(spec => spec.label && spec.value),
        technical_specs: formData.technical_specs,
        product_features: formData.product_features,
        shipping_weight: formData.shipping_weight ? parseFloat(formData.shipping_weight) : null,
        free_shipping: formData.free_shipping,
        meta_title: formData.meta_title?.trim() || null,
        meta_description: formData.meta_description?.trim() || null,
        slug: formData.slug?.trim() || null,
      };

      await onSubmit(productData);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewProductUrl = product ? `/produto/${product.id}` : '#';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Lista
            </Button>
            
            <div className="flex gap-2">
              {product && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewProductUrl, '_blank')}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
              )}
              <Button
                type="submit"
                form="product-form"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product ? `Editando: ${product.name}` : 'Novo Produto'}
              </h1>
              <p className="text-gray-600 mt-1">
                {product ? 'Edite as informações e visualize na página premium' : 'Crie um novo produto para o site'}
              </p>
            </div>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-3">
                <Package className="h-6 w-6 text-blue-600" />
                Informações Básicas
              </CardTitle>
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
                      <Label htmlFor="pro_price" className="text-gray-700 font-medium">Preço PRO</Label>
                      <Input
                        id="pro_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pro_price}
                        onChange={(e) => handleInputChange('pro_price', e.target.value)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="list_price" className="text-gray-700 font-medium">Preço de Lista</Label>
                      <Input
                        id="list_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.list_price}
                        onChange={(e) => handleInputChange('list_price', e.target.value)}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        placeholder="0.00"
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
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Imagem
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags e Categorias */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-3">
                <Tag className="h-6 w-6 text-purple-600" />
                Categorias e Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <TagSelector
                tags={tags}
                selectedTagIds={formData.tagIds}
                onTagChange={handleTagChange}
              />
            </CardContent>
          </Card>

          {/* Especificações */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <CardTitle className="text-gray-800 text-xl font-bold flex items-center gap-3">
                <Settings className="h-6 w-6 text-green-600" />
                Especificações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="Nome da especificação"
                      value={spec.label}
                      onChange={(e) => handleSpecificationChange(index, 'label', e.target.value)}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                    <Input
                      placeholder="Valor"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSpecification}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Especificação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
              <CardTitle className="text-gray-800 text-xl font-bold">SEO e Metadados</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="meta_title" className="text-gray-700 font-medium">Título SEO</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Título para mecanismos de busca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description" className="text-gray-700 font-medium">Descrição SEO</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Descrição para mecanismos de busca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-gray-700 font-medium">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="url-amigavel-do-produto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {product && (
            <Alert className="border-blue-200 bg-blue-50">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-center justify-between">
                  <span>Produto conectado à página premium do site</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewProductUrl, '_blank')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver no Site
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductForm;