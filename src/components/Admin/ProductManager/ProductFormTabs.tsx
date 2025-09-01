import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, AlertCircle } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Tag as TagType } from '@/hooks/useTags';
import { ProductTab, TabConfig, ProductFormData } from '@/types/product-extended';
import { useToast } from '@/hooks/use-toast';

// Importar componentes das abas
import BasicInfoTab from './Tabs/BasicInfoTab';
import MediaTab from './Tabs/MediaTab';
import HighlightsTab from './Tabs/HighlightsTab';
import SpecificationsTab from './Tabs/SpecificationsTab';
import FAQTab from './Tabs/FAQTab';
import ReviewsTab from './Tabs/ReviewsTab';
import TrustIndicatorsTab from './Tabs/TrustIndicatorsTab';
import RelatedProductsTab from './Tabs/RelatedProductsTab';
import DeliveryTab from './Tabs/DeliveryTab';
import DisplayTab from './Tabs/DisplayTab';
import NavigationTab from './Tabs/NavigationTab';
import TagsTab from './Tabs/TagsTab';

interface ProductFormTabsProps {
  product?: Product | null;
  tags: TagType[];
  onSubmit: (productData: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'basic',
    label: 'Informações Básicas',
    icon: 'Package',
    description: 'Nome, descrição, preços e dados fundamentais'
  },
  {
    id: 'media',
    label: 'Mídia e Imagens',
    icon: 'Image',
    description: 'Imagens, vídeos e galeria do produto'
  },
  {
    id: 'highlights',
    label: 'Características',
    icon: 'Star',
    description: 'Destaques e características principais'
  },
  {
    id: 'specs',
    label: 'Especificações',
    icon: 'FileText',
    description: 'Especificações técnicas detalhadas'
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: 'HelpCircle',
    description: 'Perguntas frequentes específicas'
  },
  {
    id: 'reviews',
    label: 'Avaliações',
    icon: 'MessageSquare',
    description: 'Configurações de reviews e ratings'
  },
  {
    id: 'trust',
    label: 'Garantias',
    icon: 'Shield',
    description: 'Indicadores de confiança e garantias'
  },
  {
    id: 'related',
    label: 'Relacionados',
    icon: 'Link',
    description: 'Produtos relacionados e sugestões'
  },
  {
    id: 'delivery',
    label: 'Entrega',
    icon: 'Truck',
    description: 'Configurações de frete e entrega'
  },
  {
    id: 'display',
    label: 'Exibição',
    icon: 'Monitor',
    description: 'Controles de exibição e contadores'
  },
  {
    id: 'navigation',
    label: 'Navegação',
    icon: 'Navigation',
    description: 'Breadcrumb e navegação personalizada'
  },
  {
    id: 'tags',
    label: 'Tags e SEO',
    icon: 'Tag',
    description: 'Tags, categorias e otimização SEO'
  }
];

const ProductFormTabs: React.FC<ProductFormTabsProps> = ({
  product,
  tags,
  onSubmit,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<ProductTab>('basic');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    additional_images: [],
    sizes: [],
    colors: [],
    badge_text: '',
    badge_color: '#22c55e',
    badge_visible: false,
    specifications: { categories: [] },
    product_features: [],
    meta_title: '',
    meta_description: '',
    slug: '',
    is_active: true,
    is_featured: false,
    tagIds: [],
    
    // Novos campos expandidos
    product_videos: [],
    product_faqs: [],
    product_highlights: [],
    reviews_config: {
      enabled: true,
      show_rating: true,
      show_count: true,
      allow_reviews: true,
      custom_rating: {
        value: 0,
        count: 0,
        use_custom: false
      }
    },
    trust_indicators: [],
    manual_related_products: [],
    breadcrumb_config: {
      custom_path: [],
      use_custom: false,
      show_breadcrumb: true
    },
    product_descriptions: {
      short: '',
      detailed: '',
      technical: '',
      marketing: ''
    },
    delivery_config: {
      custom_shipping_time: '',
      shipping_regions: [],
      express_available: false,
      pickup_locations: [],
      shipping_notes: ''
    },
    display_config: {
      show_stock_counter: true,
      show_view_counter: false,
      custom_view_count: 0,
      show_urgency_banner: false,
      urgency_text: '',
      show_social_proof: false,
      social_proof_text: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Carregar dados do produto para edição
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        pro_price: product.pro_price,
        list_price: product.list_price,
        stock: product.stock || 0,
        image: product.image || '',
        additional_images: product.additional_images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        badge_text: product.badge_text || '',
        badge_color: product.badge_color || '#22c55e',
        badge_visible: product.badge_visible || false,
        specifications: Array.isArray(product.specifications) 
          ? { categories: [{ name: 'Especificações', specs: product.specifications.map((spec: any) => ({...spec, highlight: spec.highlight || false})) }] }
          : product.specifications || { categories: [] },
        product_features: product.product_features || [],
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        slug: product.slug || '',
        is_active: product.is_active !== false,
        is_featured: product.is_featured || false,
        tagIds: product.tags?.map(tag => tag.id) || [],
        
        // Novos campos expandidos
        product_videos: product.product_videos || [],
        product_faqs: product.product_faqs || [],
        product_highlights: product.product_highlights || [],
        reviews_config: product.reviews_config || {
          enabled: true,
          show_rating: true,
          show_count: true,
          allow_reviews: true,
          custom_rating: {
            value: 0,
            count: 0,
            use_custom: false
          }
        },
        trust_indicators: product.trust_indicators || [],
        manual_related_products: product.manual_related_products || [],
        breadcrumb_config: product.breadcrumb_config || {
          custom_path: [],
          use_custom: false,
          show_breadcrumb: true
        },
        product_descriptions: product.product_descriptions || {
          short: '',
          detailed: '',
          technical: '',
          marketing: ''
        },
        delivery_config: product.delivery_config || {
          custom_shipping_time: '',
          shipping_regions: [],
          express_available: false,
          pickup_locations: [],
          shipping_notes: ''
        },
        display_config: product.display_config || {
          show_stock_counter: true,
          show_view_counter: false,
          custom_view_count: 0,
          show_urgency_banner: false,
          urgency_text: '',
          show_social_proof: false,
          social_proof_text: ''
        }
      });
    }
  }, [product]);

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validações básicas
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
        setActiveTab('basic');
        return;
      }

      // Preparar dados completos para envio
      const dataToSubmit = {
        ...formData,
        // Garantir que todos os campos JSONB estejam presentes
        product_videos: formData.product_videos || [],
        product_faqs: formData.product_faqs || [],
        product_highlights: formData.product_highlights || [],
        reviews_config: formData.reviews_config || {
          enabled: true,
          show_rating: true,
          show_count: true,
          allow_reviews: true,
          custom_rating: { value: 0, count: 0, use_custom: false }
        },
        trust_indicators: formData.trust_indicators || [],
        manual_related_products: formData.manual_related_products || [],
        breadcrumb_config: formData.breadcrumb_config || {
          custom_path: [],
          use_custom: false,
          show_breadcrumb: true
        },
        product_descriptions: formData.product_descriptions || {
          short: '',
          detailed: '',
          technical: '',
          marketing: ''
        },
        delivery_config: formData.delivery_config || {
          custom_shipping_time: '',
          shipping_regions: [],
          express_available: false,
          pickup_locations: [],
          shipping_notes: ''
        },
        display_config: formData.display_config || {
          show_stock_counter: true,
          show_view_counter: false,
          custom_view_count: 0,
          show_urgency_banner: false,
          urgency_text: '',
          show_social_proof: false,
          social_proof_text: ''
        },
        specifications: formData.specifications || { categories: [] }
      };

      console.log('[ProductFormTabs] Dados sendo enviados:', dataToSubmit);

      await onSubmit(dataToSubmit);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Sucesso!",
        description: product ? "Produto atualizado com sucesso" : "Produto criado com sucesso",
      });
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
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

  const renderTabContent = () => {
    const commonProps = {
      formData,
      onChange: handleFormDataChange,
      tags
    };

    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab {...commonProps} />;
      case 'media':
        return <MediaTab {...commonProps} />;
      case 'highlights':
        return <HighlightsTab {...commonProps} />;
      case 'specs':
        return <SpecificationsTab {...commonProps} />;
      case 'faq':
        return <FAQTab {...commonProps} />;
      case 'reviews':
        return <ReviewsTab {...commonProps} />;
      case 'trust':
        return <TrustIndicatorsTab {...commonProps} />;
      case 'related':
        return <RelatedProductsTab {...commonProps} />;
      case 'delivery':
        return <DeliveryTab {...commonProps} />;
      case 'display':
        return <DisplayTab {...commonProps} />;
      case 'navigation':
        return <NavigationTab {...commonProps} />;
      case 'tags':
        return <TagsTab {...commonProps} />;
      default:
        return <BasicInfoTab {...commonProps} />;
    }
  };

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
        <div className="flex gap-8">
          {/* Sidebar com abas */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {TAB_CONFIGS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-4 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                      }`}
                    >
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {TAB_CONFIGS.find(tab => tab.id === activeTab)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormTabs;

