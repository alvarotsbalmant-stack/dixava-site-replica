import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProductsEnhanced } from '@/hooks/useProductsEnhanced';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Settings2, Save, RotateCcw } from 'lucide-react';
import { UTIProSettings } from './UTIProSettings';
import { SiteAppearanceSettings } from './SiteAppearanceSettings';
import { ProductManagementSettings } from './ProductManagementSettings';

export const SettingsManagerNew = () => {
  const { toast } = useToast();
  const { products, refreshProducts } = useProductsEnhanced();
  const { siteInfo, utiProSettings, updateSiteInfo, updateUTIProSettings, loading } = useSiteSettings();
  
  // Estados locais para o formulário
  const [utiProEnabled, setUtiProEnabled] = useState(utiProSettings.enabled);
  const [siteName, setSiteName] = useState(siteInfo.siteName);
  const [siteSubtitle, setSiteSubtitle] = useState(siteInfo.siteSubtitle);
  const [browserTitle, setBrowserTitle] = useState(siteInfo.browserTitle);
  const [selectedFont, setSelectedFont] = useState(siteInfo.selectedFont);
  const [logoUrl, setLogoUrl] = useState(siteInfo.logoUrl);
  const [headerLayoutType, setHeaderLayoutType] = useState(siteInfo.headerLayoutType);
  const [headerImageUrl, setHeaderImageUrl] = useState(siteInfo.headerImageUrl);
  const [disableHeaderImageCompression, setDisableHeaderImageCompression] = useState(siteInfo.disableHeaderImageCompression);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setSaving] = useState(false);

  // Atualizar estados locais quando as configurações mudarem
  React.useEffect(() => {
    setUtiProEnabled(utiProSettings.enabled);
    setSiteName(siteInfo.siteName);
    setSiteSubtitle(siteInfo.siteSubtitle);
    setBrowserTitle(siteInfo.browserTitle);
    setSelectedFont(siteInfo.selectedFont);
    setLogoUrl(siteInfo.logoUrl);
    setHeaderLayoutType(siteInfo.headerLayoutType);
    setHeaderImageUrl(siteInfo.headerImageUrl);
    setDisableHeaderImageCompression(siteInfo.disableHeaderImageCompression);
  }, [siteInfo, utiProSettings]);

  // Função para deletar produtos de forma segura, respeitando relacionamentos parent/child
  const deleteProductsSafely = useCallback(async (productIds: string[]) => {
    console.log('[SettingsManagerNew] Iniciando deleção segura de produtos:', productIds);
    
    try {
      // Primeiro, buscar todos os produtos para entender os relacionamentos
      const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('id, parent_product_id, is_master_product');

      if (fetchError) {
        console.error('[SettingsManagerNew] Erro ao buscar produtos:', fetchError);
        throw fetchError;
      }

      console.log('[SettingsManagerNew] Produtos encontrados:', allProducts?.length);

      // Separar produtos em grupos: filhos, pais e sem relacionamento
      const childProducts: string[] = [];
      const masterProducts: string[] = [];
      const standaloneProducts: string[] = [];

      productIds.forEach(id => {
        const product = allProducts?.find(p => p.id === id);
        if (!product) return;

        if (product.parent_product_id) {
          // É um produto filho
          childProducts.push(id);
        } else if (product.is_master_product) {
          // É um produto master
          masterProducts.push(id);
        } else {
          // É um produto standalone
          standaloneProducts.push(id);
        }
      });

      console.log('[SettingsManagerNew] Produtos filhos:', childProducts.length);
      console.log('[SettingsManagerNew] Produtos master:', masterProducts.length);
      console.log('[SettingsManagerNew] Produtos standalone:', standaloneProducts.length);

      // Para produtos master que serão deletados, incluir todos os seus filhos
      const allChildrenToDelete: string[] = [...childProducts];
      
      for (const masterId of masterProducts) {
        const children = allProducts?.filter(p => p.parent_product_id === masterId).map(p => p.id) || [];
        allChildrenToDelete.push(...children);
      }

      // Remover duplicatas
      const uniqueChildrenToDelete = [...new Set(allChildrenToDelete)];
      
      console.log('[SettingsManagerNew] Total de produtos filhos para deletar:', uniqueChildrenToDelete.length);

      // Passo 1: Deletar todos os produtos filhos primeiro
      if (uniqueChildrenToDelete.length > 0) {
        console.log('[SettingsManagerNew] Deletando produtos filhos...');
        
        // Deletar tags dos produtos filhos
        const { error: childTagsError } = await supabase
          .from('product_tags')
          .delete()
          .in('product_id', uniqueChildrenToDelete);

        if (childTagsError) {
          console.error('[SettingsManagerNew] Erro ao deletar tags dos produtos filhos:', childTagsError);
          throw childTagsError;
        }

        // Deletar produtos filhos
        const { error: childProductsError } = await supabase
          .from('products')
          .delete()
          .in('id', uniqueChildrenToDelete);

        if (childProductsError) {
          console.error('[SettingsManagerNew] Erro ao deletar produtos filhos:', childProductsError);
          throw childProductsError;
        }

        console.log('[SettingsManagerNew] Produtos filhos deletados com sucesso');
      }

      // Passo 2: Deletar produtos master e standalone
      const remainingProducts = [...masterProducts, ...standaloneProducts];
      
      if (remainingProducts.length > 0) {
        console.log('[SettingsManagerNew] Deletando produtos master e standalone...');
        
        // Deletar tags dos produtos restantes
        const { error: remainingTagsError } = await supabase
          .from('product_tags')
          .delete()
          .in('product_id', remainingProducts);

        if (remainingTagsError) {
          console.error('[SettingsManagerNew] Erro ao deletar tags dos produtos restantes:', remainingTagsError);
          throw remainingTagsError;
        }

        // Deletar produtos restantes
        const { error: remainingProductsError } = await supabase
          .from('products')
          .delete()
          .in('id', remainingProducts);

        if (remainingProductsError) {
          console.error('[SettingsManagerNew] Erro ao deletar produtos restantes:', remainingProductsError);
          throw remainingProductsError;
        }

        console.log('[SettingsManagerNew] Produtos master e standalone deletados com sucesso');
      }

      const totalDeleted = uniqueChildrenToDelete.length + remainingProducts.length;
      console.log('[SettingsManagerNew] Total de produtos deletados:', totalDeleted);
      
      return totalDeleted;

    } catch (error) {
      console.error('[SettingsManagerNew] Erro na deleção segura de produtos:', error);
      throw error;
    }
  }, []);

  // Deletar todos os produtos
  const handleDeleteAllProducts = useCallback(async () => {
    if (products.length === 0) {
      toast({
        title: "Nenhum produto encontrado",
        description: "Não há produtos para deletar.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const allProductIds = products.map(p => p.id);
      const totalDeleted = await deleteProductsSafely(allProductIds);

      await refreshProducts();
      
      toast({
        title: "Produtos deletados",
        description: `Todos os ${totalDeleted} produtos foram deletados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar todos os produtos:', error);
      toast({
        title: "Erro ao deletar produtos",
        description: "Ocorreu um erro ao deletar os produtos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  }, [products, deleteProductsSafely, refreshProducts, toast]);

  // Deletar produtos selecionados
  const handleDeleteSelectedProducts = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione os produtos que deseja deletar.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const totalDeleted = await deleteProductsSafely(selectedProducts);

      await refreshProducts();
      setSelectedProducts([]);
      
      toast({
        title: "Produtos deletados",
        description: `${totalDeleted} produtos foram deletados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar produtos selecionados:', error);
      toast({
        title: "Erro ao deletar produtos",
        description: "Ocorreu um erro ao deletar os produtos selecionados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProducts, deleteProductsSafely, refreshProducts, toast]);

  // Salvar configurações
  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      const siteInfoSuccess = await updateSiteInfo({
        siteName,
        siteSubtitle,
        browserTitle,
        selectedFont,
        logoUrl,
        headerLayoutType,
        headerImageUrl,
        disableHeaderImageCompression
      });

      const utiProSuccess = await updateUTIProSettings({
        enabled: utiProEnabled
      });

      if (siteInfoSuccess && utiProSuccess) {
        toast({
          title: "Configurações salvas",
          description: "As configurações foram salvas com sucesso no banco de dados.",
        });
      } else {
        throw new Error('Falha ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações no banco de dados.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [siteName, siteSubtitle, browserTitle, selectedFont, logoUrl, headerLayoutType, headerImageUrl, utiProEnabled, updateSiteInfo, updateUTIProSettings, toast]);

  const handleProductSelection = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const selectAllProducts = () => {
    setSelectedProducts(products.map(p => p.id));
  };

  const deselectAllProducts = () => {
    setSelectedProducts([]);
  };

  if (loading) {
    return <div className="text-center p-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="w-6 h-6 text-primary" />
        <h2 className="text-3xl font-bold text-foreground">Configurações Gerais</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UTIProSettings
          utiProEnabled={utiProEnabled}
          setUtiProEnabled={setUtiProEnabled}
        />

        <SiteAppearanceSettings
          siteName={siteName}
          setSiteName={setSiteName}
          siteSubtitle={siteSubtitle}
          setSiteSubtitle={setSiteSubtitle}
          browserTitle={browserTitle}
          setBrowserTitle={setBrowserTitle}
          selectedFont={selectedFont}
          setSelectedFont={setSelectedFont}
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          headerLayoutType={headerLayoutType}
          setHeaderLayoutType={setHeaderLayoutType}
          headerImageUrl={headerImageUrl}
          setHeaderImageUrl={setHeaderImageUrl}
          disableHeaderImageCompression={disableHeaderImageCompression}
          setDisableHeaderImageCompression={setDisableHeaderImageCompression}
        />
      </div>

      <ProductManagementSettings
        products={products}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        isDeleting={isDeleting}
        handleDeleteAllProducts={handleDeleteAllProducts}
        handleDeleteSelectedProducts={handleDeleteSelectedProducts}
        handleProductSelection={handleProductSelection}
        selectAllProducts={selectAllProducts}
        deselectAllProducts={deselectAllProducts}
        refreshProducts={refreshProducts}
      />

      {/* Salvar configurações */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Recarregar Página
        </Button>
      </div>
    </div>
  );
};
