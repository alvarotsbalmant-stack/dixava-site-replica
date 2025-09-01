import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProductsEnhanced } from '@/hooks/useProductsEnhanced';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Settings2, Globe, Palette, Upload, Save, RotateCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export { SettingsManagerNew as SettingsManager } from './Settings/SettingsManagerNew';

export const SettingsManagerLegacy = () => {
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
  }, [siteInfo, utiProSettings]);

  const fonts = [
    { value: 'Inter', label: 'Inter (Padrão)' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Oswald', label: 'Oswald' },
  ];

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
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      // Também deletar as tags associadas
      await supabase
        .from('product_tags')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await refreshProducts();
      
      toast({
        title: "Produtos deletados",
        description: `Todos os ${products.length} produtos foram deletados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar produtos:', error);
      toast({
        title: "Erro ao deletar produtos",
        description: "Ocorreu um erro ao deletar os produtos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  }, [products, refreshProducts, toast]);

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
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) throw error;

      // Também deletar as tags associadas
      await supabase
        .from('product_tags')
        .delete()
        .in('product_id', selectedProducts);

      await refreshProducts();
      setSelectedProducts([]);
      
      toast({
        title: "Produtos deletados",
        description: `${selectedProducts.length} produtos foram deletados com sucesso.`,
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
  }, [selectedProducts, refreshProducts, toast]);

  // Salvar configurações
  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      // Salvar configurações do site
      const siteInfoSuccess = await updateSiteInfo({
        siteName,
        siteSubtitle,
        browserTitle,
        selectedFont,
        logoUrl,
        headerLayoutType: 'logo_title', // Sempre usar logo_title no legacy
        headerImageUrl: '',
        disableHeaderImageCompression: false
      });

      // Salvar configurações do UTI PRO
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
  }, [siteName, siteSubtitle, browserTitle, selectedFont, logoUrl, utiProEnabled, updateSiteInfo, updateUTIProSettings, toast]);


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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="w-6 h-6 text-primary" />
        <h2 className="text-3xl font-bold text-foreground">Configurações Gerais</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema UTI PRO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Sistema UTI PRO
            </CardTitle>
            <CardDescription>
              Ativar ou desativar o sistema de preços UTI PRO no site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="uti-pro-enabled"
                checked={utiProEnabled}
                onCheckedChange={setUtiProEnabled}
              />
              <Label htmlFor="uti-pro-enabled">
                UTI PRO {utiProEnabled ? 'Ativado' : 'Desativado'}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Quando ativado, os preços especiais para membros UTI PRO serão exibidos no site.
            </p>
          </CardContent>
        </Card>

        {/* Configurações Visuais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Aparência do Site
            </CardTitle>
            <CardDescription>
              Configure a aparência e identidade visual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nome do Site</Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="UTI dos Games"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-subtitle">Subtítulo</Label>
              <Input
                id="site-subtitle"
                value={siteSubtitle}
                onChange={(e) => setSiteSubtitle(e.target.value)}
                placeholder="Sua loja de games favorita"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="browser-title">Título do Navegador</Label>
              <Input
                id="browser-title"
                value={browserTitle}
                onChange={(e) => setBrowserTitle(e.target.value)}
                placeholder="UTI dos Games - Sua loja de games favorita"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-family">Fonte do Site</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-url">URL do Logo</Label>
              <Input
                id="logo-url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/lovable-uploads/..."
              />
              {logoUrl && (
                <div className="flex items-center gap-2">
                  <img 
                    src={logoUrl} 
                    alt="Preview do logo" 
                    className="h-10 w-auto rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Preview</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Gerenciamento de Produtos
          </CardTitle>
          <CardDescription>
            Deletar produtos em massa ou individualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deletar todos os produtos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isDeleting || products.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar Todos os Produtos ({products.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar todos os produtos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os {products.length} produtos serão permanentemente removidos do banco de dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAllProducts} className="bg-destructive hover:bg-destructive/90">
                      {isDeleting ? 'Deletando...' : 'Deletar Todos'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Separator />

          {/* Seleção de produtos para deletar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Deletar Produtos Selecionados</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllProducts}>
                  Selecionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllProducts}>
                  Limpar Seleção
                </Button>
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {selectedProducts.length} produto(s) selecionado(s)
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Selecionados
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar produtos selecionados?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. {selectedProducts.length} produto(s) serão permanentemente removidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelectedProducts} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? 'Deletando...' : 'Deletar Selecionados'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Lista de produtos */}
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum produto encontrado</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleProductSelection(product.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor={`product-${product.id}`}
                      className="flex-1 text-sm cursor-pointer hover:text-primary"
                    >
                      {product.name} - R$ {product.price}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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