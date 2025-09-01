import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Settings, Plus, Grid, Image, Type, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { usePrimePages, PrimePage, PrimePageLayoutInput } from '@/hooks/usePrimePages';
import { ProductSectionCreator } from './modals/ProductSectionCreator';
import { SpecialSectionCreator } from './modals/SpecialSectionCreator';
import { VisualBuilder } from './VisualBuilder';
import { PageStats } from './PageStats';
import { PreviewPanel } from './PreviewPanel';

interface PrimePageBuilderProps {
  pageId: string;
  onBack: () => void;
}

export const PrimePageBuilder: React.FC<PrimePageBuilderProps> = ({ pageId, onBack }) => {
  const { toast } = useToast();
  const { fetchPageWithLayout, addLayoutItem, updateLayoutItem, removeLayoutItem } = usePrimePages();
  
  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'products' | 'special' | 'settings' | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar dados da página
  useEffect(() => {
    loadPageData();
  }, [pageId]);

  const loadPageData = async () => {
    try {
      setLoading(true);
      const pageData = await fetchPageWithLayout(pageId);
      if (pageData) {
        setPage(pageData);
        setSections(pageData.layout_items || []);
      }
    } catch (error) {
      console.error('Error loading page data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados da página',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductSection = async (sectionData: any) => {
    try {
      const layoutInput: PrimePageLayoutInput = {
        section_key: `products_${Date.now()}`,
        section_type: 'product_section',
        section_config: sectionData,
        display_order: sections.length,
        is_visible: true
      };

      const success = await addLayoutItem(pageId, layoutInput);
      if (success) {
        await loadPageData();
        setActiveModal(null);
        setHasUnsavedChanges(true);
        toast({
          title: 'Sucesso',
          description: 'Seção de produtos adicionada!'
        });
      }
    } catch (error) {
      console.error('Error adding product section:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar seção de produtos',
        variant: 'destructive'
      });
    }
  };

  const handleAddSpecialSection = async (sectionData: any) => {
    try {
      const layoutInput: PrimePageLayoutInput = {
        section_key: `special_${Date.now()}`,
        section_type: sectionData.type,
        section_config: sectionData.config,
        display_order: sections.length,
        is_visible: true
      };

      const success = await addLayoutItem(pageId, layoutInput);
      if (success) {
        await loadPageData();
        setActiveModal(null);
        setHasUnsavedChanges(true);
        toast({
          title: 'Sucesso',
          description: 'Seção especial adicionada!'
        });
      }
    } catch (error) {
      console.error('Error adding special section:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar seção especial',
        variant: 'destructive'
      });
    }
  };

  const handleSectionUpdate = async (sectionId: string, updates: any) => {
    try {
      const success = await updateLayoutItem(sectionId, updates);
      if (success) {
        await loadPageData();
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleSectionDelete = async (sectionId: string) => {
    try {
      const success = await removeLayoutItem(sectionId);
      if (success) {
        await loadPageData();
        setHasUnsavedChanges(true);
        toast({
          title: 'Sucesso',
          description: 'Seção removida!'
        });
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleSectionReorder = (newOrder: any[]) => {
    setSections(newOrder);
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Página não encontrada</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{page.title}</h1>
              <Badge variant={page.is_active ? 'default' : 'secondary'}>
                {page.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Alterações não salvas
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              /prime/{page.slug}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Editor' : 'Preview'}
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Ferramentas */}
        <div className="lg:col-span-1 space-y-4">
          <PageStats page={page} sections={sections} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">ADICIONAR SEÇÕES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveModal('products')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Seção de Produtos
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveModal('special')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Banner Promocional
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveModal('special')}
              >
                <Image className="w-4 h-4 mr-2" />
                Carrossel Especial
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveModal('special')}
              >
                <Type className="w-4 h-4 mr-2" />
                Call to Action
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">CONFIGURAÇÕES</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveModal('settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Página
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {previewMode ? (
            <PreviewPanel page={page} sections={sections} />
          ) : (
            <VisualBuilder
              sections={sections}
              onSectionUpdate={handleSectionUpdate}
              onSectionDelete={handleSectionDelete}
              onSectionReorder={handleSectionReorder}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductSectionCreator
        open={activeModal === 'products'}
        pageId={pageId}
        onClose={() => setActiveModal(null)}
        onSectionCreated={handleAddProductSection}
      />

      <SpecialSectionCreator
        open={activeModal === 'special'}
        pageId={pageId}
        onClose={() => setActiveModal(null)}
        onSectionCreated={handleAddSpecialSection}
      />
    </div>
  );
};

export default PrimePageBuilder;