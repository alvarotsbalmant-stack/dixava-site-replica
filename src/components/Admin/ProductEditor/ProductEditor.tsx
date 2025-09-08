import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, AlertCircle } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Tag as TagType } from '@/hooks/useTags';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import all tab components
import BasicInfoTab from './Tabs/BasicInfoTab';
import ImagesTab from './Tabs/ImagesTab';
import SpecificationsTab from './Tabs/SpecificationsTab';
import DescriptionTab from './Tabs/DescriptionTab';
import PricingTab from './Tabs/PricingTab';
import ShippingTab from './Tabs/ShippingTab';
import SEOTab from './Tabs/SEOTab';
import TagsTab from './Tabs/TagsTab';

export interface ProductEditorData {
  // Basic info
  name: string;
  description: string;
  brand?: string;
  category?: string;
  condition?: string;
  
  // Images and media
  image: string;
  images: string[];
  additional_images: string[];
  
  // Pricing
  price: number;
  list_price?: number;
  pro_price?: number;
  discount_percentage?: number;
  pix_discount_percentage?: number;
  uti_coins_cashback_percentage?: number;
  uti_coins_discount_percentage?: number;
  
  // Stock and availability
  stock?: number;
  is_active: boolean;
  is_featured: boolean;
  
  // Visual elements
  badge_text?: string;
  badge_color?: string;
  badge_visible: boolean;
  
  // Technical specifications
  specifications: Array<{
    category: string;
    label: string;
    value: string;
    highlight: boolean;
    order: number;
  }>;
  
  // Product details for modal
  features?: string[];
  highlights?: string[];
  
  // Shipping
  free_shipping: boolean;
  shipping_time_min?: number;
  shipping_time_max?: number;
  store_pickup_available: boolean;
  shipping_weight?: number;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  
  // Tags and categorization
  tagIds: string[];
  
  // System fields
  id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductEditorProps {
  product?: Product | null;
  tags: TagType[];
  onSubmit: (productData: ProductEditorData) => Promise<void>;
  onCancel: () => void;
}

const ProductEditor: React.FC<ProductEditorProps> = ({
  product,
  tags,
  onSubmit,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProductEditorData>({
    name: '',
    description: '',
    image: '',
    images: [],
    additional_images: [],
    price: 0,
    stock: 0,
    is_active: true,
    is_featured: false,
    badge_visible: false,
    badge_color: '#22c55e',
    specifications: [],
    free_shipping: false,
    store_pickup_available: true,
    tagIds: [],
  });

  // Load product data for editing
  useEffect(() => {
    if (product) {
      console.log('Loading product for editing:', product);
      
      // Convert old specification format to new format
      let specifications: ProductEditorData['specifications'] = [];
      
      if (product.specifications) {
        if (Array.isArray(product.specifications)) {
          // Old format: array of {label, value}
          specifications = product.specifications.map((spec: any, index: number) => ({
            category: 'Geral',
            label: spec.label || '',
            value: spec.value || '',
            highlight: spec.highlight || false,
            order: index + 1
          }));
        } else if (typeof product.specifications === 'object' && (product.specifications as any).categories) {
          // Extended format
          const specs = product.specifications as any;
          specifications = specs.categories.flatMap((cat: any, catIndex: number) => 
            cat.specs?.map((spec: any, specIndex: number) => ({
              category: cat.name || 'Geral',
              label: spec.label || '',
              value: spec.value || '',
              highlight: spec.highlight || false,
              order: (catIndex * 100) + specIndex + 1
            })) || []
          );
        }
      }

      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        category: product.category || '',
        condition: product.condition || 'Novo',
        image: product.image || '',
        images: product.images || [],
        additional_images: product.additional_images || [],
        price: product.price || 0,
        list_price: product.list_price,
        pro_price: product.pro_price,
        discount_percentage: product.discount_percentage,
        pix_discount_percentage: product.pix_discount_percentage || 5,
        uti_coins_cashback_percentage: product.uti_coins_cashback_percentage,
        uti_coins_discount_percentage: product.uti_coins_discount_percentage,
        stock: product.stock,
        is_active: product.is_active !== false,
        is_featured: product.is_featured || false,
        badge_text: product.badge_text || '',
        badge_color: product.badge_color || '#22c55e',
        badge_visible: product.badge_visible || false,
        specifications,
        features: (product as any).features || [],
        highlights: (product as any).highlights || [],
        free_shipping: product.free_shipping || false,
        shipping_time_min: product.shipping_time_min || 1,
        shipping_time_max: product.shipping_time_max || 3,
        store_pickup_available: product.store_pickup_available !== false,
        shipping_weight: product.shipping_weight,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        slug: product.slug || '',
        tagIds: product.tags?.map(tag => tag.id) || [],
        created_at: product.created_at,
        updated_at: product.updated_at,
      });
    }
  }, [product]);

  const handleFormDataChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Basic validations
      if (!formData.name.trim()) {
        toast({
          title: "Erro de validação",
          description: "Nome do produto é obrigatório",
          variant: "destructive",
        });
        setActiveTab('basic');
        return;
      }

      if (!formData.price || formData.price <= 0) {
        toast({
          title: "Erro de validação", 
          description: "Preço deve ser maior que zero",
          variant: "destructive",
        });
        setActiveTab('pricing');
        return;
      }

      console.log('Submitting product data:', formData);
      await onSubmit(formData);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Sucesso!",
        description: product ? "Produto atualizado com sucesso" : "Produto criado com sucesso",
      });
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const generateSlug = useCallback(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      handleFormDataChange('slug', slug);
    }
  }, [formData.name, handleFormDataChange]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {product ? `Editando: ${product.name}` : 'Novo Produto'}
              </h1>
              {hasUnsavedChanges && (
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Alterações não salvas</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/produto/${formData.slug || 'preview'}`, '_blank')}
                disabled={!formData.slug}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="images">Imagens</TabsTrigger>
                <TabsTrigger value="pricing">Preços</TabsTrigger>
                <TabsTrigger value="specs">Especificações</TabsTrigger>
                <TabsTrigger value="description">Descrição</TabsTrigger>
                <TabsTrigger value="shipping">Entrega</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <BasicInfoTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                />
              </TabsContent>

              <TabsContent value="images">
                <ImagesTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                />
              </TabsContent>

              <TabsContent value="pricing">
                <PricingTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                />
              </TabsContent>

              <TabsContent value="specs">
                <SpecificationsTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                />
              </TabsContent>

              <TabsContent value="description">
                <DescriptionTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                />
              </TabsContent>

              <TabsContent value="shipping">
                <ShippingTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                />
              </TabsContent>

              <TabsContent value="seo">
                <SEOTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                  onGenerateSlug={generateSlug}
                />
              </TabsContent>

              <TabsContent value="tags">
                <TagsTab 
                  formData={formData} 
                  onChange={handleFormDataChange}
                  tags={tags}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductEditor;