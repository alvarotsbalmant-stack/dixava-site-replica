import { useState } from 'react';
import { useBanners, Banner } from '@/hooks/useBanners';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Image, Info, Eye, Monitor, Smartphone, BarChart3, Settings, Palette } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

export const BannerManagerNew = () => {
  const { banners, loading, addBanner, updateBanner, deleteBanner } = useBanners();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    image_url: '',
    image_url_desktop: '',
    image_url_mobile: '',
    button_image_url: '',
    gradient: 'from-red-600 via-red-600 to-red-700',
    background_type: 'gradient',
    position: 1,
    is_active: true,
    button_link_desktop: '',
    button_link_mobile: '',
    device_type: 'desktop' as 'desktop' | 'mobile',
  });

  // Filtrar banners baseado na aba ativa
  const filteredBanners = banners.filter(banner => 
    (banner as any).device_type === activeTab || 
    (!((banner as any).device_type) && activeTab === 'desktop')
  );

  // Estatísticas dos banners
  const totalBanners = banners.length;
  const activeBanners = banners.filter(b => b.is_active).length;
  const desktopBanners = banners.filter(b => (b as any).device_type === 'desktop' || !(b as any).device_type).length;
  const mobileBanners = banners.filter(b => (b as any).device_type === 'mobile').length;

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      image_url: '',
      image_url_desktop: '',
      image_url_mobile: '',
      button_image_url: '',
      gradient: 'from-red-600 via-red-600 to-red-700',
      background_type: 'gradient',
      position: (filteredBanners.length + 1),
      is_active: true,
      button_link_desktop: '',
      button_link_mobile: '',
      device_type: activeTab,
    });
    setEditingBanner(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      image_url: banner.image_url || '',
      image_url_desktop: banner.image_url_desktop || '',
      image_url_mobile: banner.image_url_mobile || '',
      button_image_url: banner.button_image_url || '',
      gradient: banner.gradient,
      background_type: (banner as any).background_type || 'gradient',
      position: banner.position,
      is_active: banner.is_active,
      button_link_desktop: banner.button_link_desktop || '',
      button_link_mobile: banner.button_link_mobile || '',
      device_type: (banner as any).device_type || 'desktop',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.button_text && !formData.button_link && !formData.button_link_desktop && !formData.button_link_mobile) {
      alert('Se há texto do botão, o link é obrigatório para pelo menos uma versão (desktop ou mobile).');
      return;
    }

    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, formData);
      } else {
        await addBanner(formData);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este banner?')) {
      await deleteBanner(id);
    }
  };

  const backgroundOptions = [
    { value: 'gradient', label: 'Gradiente', icon: Palette },
    { value: 'image-only', label: 'Somente Imagem', icon: Image },
  ];

  const gradientOptions = [
    { value: 'from-purple-600 via-red-600 to-orange-500', label: 'Roxo para Laranja', preview: 'bg-gradient-to-r from-purple-600 via-red-600 to-orange-500' },
    { value: 'from-red-700 via-red-600 to-red-500', label: 'Vermelho Intenso', preview: 'bg-gradient-to-r from-red-700 via-red-600 to-red-500' },
    { value: 'from-blue-600 via-purple-600 to-red-600', label: 'Azul para Vermelho', preview: 'bg-gradient-to-r from-blue-600 via-purple-600 to-red-600' },
    { value: 'from-red-600 via-orange-500 to-yellow-500', label: 'Vermelho para Amarelo', preview: 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500' },
    { value: 'from-green-600 via-red-600 to-red-700', label: 'Verde para Vermelho', preview: 'bg-gradient-to-r from-green-600 via-red-600 to-red-700' },
    { value: 'from-gray-800 via-gray-700 to-gray-600', label: 'Tons de Cinza', preview: 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header com estatísticas aprimoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total de Banners</p>
                <p className="text-3xl font-bold">{totalBanners}</p>
                <p className="text-purple-100 text-xs mt-1">Todos os dispositivos</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Image className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Banners Ativos</p>
                <p className="text-3xl font-bold">{activeBanners}</p>
                <p className="text-green-100 text-xs mt-1">Visíveis no site</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Eye className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Desktop</p>
                <p className="text-3xl font-bold">{desktopBanners}</p>
                <p className="text-blue-100 text-xs mt-1">Banners desktop</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Monitor className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Mobile</p>
                <p className="text-3xl font-bold">{mobileBanners}</p>
                <p className="text-orange-100 text-xs mt-1">Banners mobile</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Smartphone className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card principal com design moderno */}
      <Card className="bg-white border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          {/* Abas Desktop/Mobile com design aprimorado */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'desktop'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Desktop
              <Badge variant="secondary" className="ml-2 bg-white bg-opacity-20 text-current">
                {desktopBanners}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'mobile'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile
              <Badge variant="secondary" className="ml-2 bg-white bg-opacity-20 text-current">
                {mobileBanners}
              </Badge>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800 text-2xl font-bold flex items-center gap-3">
                <Image className="h-7 w-7 text-red-600" />
                Gerenciar Banners do Carousel - {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Gerencie os banners rotativos exibidos na página inicial para {activeTab === 'desktop' ? 'desktop' : 'dispositivos móveis'}
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                  size="lg"
                  disabled={filteredBanners.length >= 5}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Banner {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-red-600 flex items-center gap-2">
                    <Image className="w-6 h-6" />
                    {editingBanner ? 'Editar' : 'Novo'} Banner {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações básicas */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Informações Básicas
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-700 font-medium">Título (Opcional)</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: PROMOÇÃO ESPECIAL"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-gray-700 font-medium">Posição no Carousel</Label>
                        <Input
                          id="position"
                          type="number"
                          min="1"
                          max="5"
                          value={formData.position}
                          onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="subtitle" className="text-gray-700 font-medium">Subtítulo (Opcional)</Label>
                      <Textarea
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Ex: Compre e Venda Seus Games na UTI DOS GAMES!"
                        rows={2}
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Upload de imagens */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Imagens do Banner
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {activeTab === 'desktop' && (
                        <ImageUpload
                          onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url_desktop: url }))}
                          currentImage={formData.image_url_desktop}
                          label="Imagem Desktop (1920x600px)"
                          folder="banners"
                        />
                      )}

                      {activeTab === 'mobile' && (
                        <ImageUpload
                          onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url_mobile: url }))}
                          currentImage={formData.image_url_mobile}
                          label="Imagem Mobile (750x400px)"
                          folder="banners"
                        />
                      )}
                    </div>
                  </div>

                  {/* Configurações de fundo */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Configurações de Fundo
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="background_type" className="text-gray-700 font-medium">Tipo de Fundo</Label>
                        <select
                          id="background_type"
                          value={formData.background_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, background_type: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                        >
                          {backgroundOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.background_type === 'gradient' && (
                        <div className="space-y-2">
                          <Label htmlFor="gradient" className="text-gray-700 font-medium">Gradiente</Label>
                          <select
                            id="gradient"
                            value={formData.gradient}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradient: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                          >
                            {gradientOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          
                          {/* Preview do gradiente */}
                          <div className="mt-2">
                            <div className={`h-8 rounded-lg ${gradientOptions.find(g => g.value === formData.gradient)?.preview}`}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configurações do botão */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Botão de Ação (Opcional)</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="button_text" className="text-gray-700 font-medium">Texto do Botão</Label>
                        <Input
                          id="button_text"
                          value={formData.button_text}
                          onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                          placeholder="Ex: Entre em Contato"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="button_link" className="text-gray-700 font-medium">Link Geral</Label>
                        <Input
                          id="button_link"
                          value={formData.button_link}
                          onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                          placeholder="Ex: /categoria/ofertas"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="button_link_desktop" className="text-gray-700 font-medium">Link Desktop</Label>
                        <Input
                          id="button_link_desktop"
                          value={formData.button_link_desktop}
                          onChange={(e) => setFormData(prev => ({ ...prev, button_link_desktop: e.target.value }))}
                          placeholder="Ex: /categoria/ofertas-desktop"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="button_link_mobile" className="text-gray-700 font-medium">Link Mobile</Label>
                        <Input
                          id="button_link_mobile"
                          value={formData.button_link_mobile}
                          onChange={(e) => setFormData(prev => ({ ...prev, button_link_mobile: e.target.value }))}
                          placeholder="Ex: /categoria/ofertas-mobile"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <ImageUpload
                        onImageUploaded={(url) => setFormData(prev => ({ ...prev, button_image_url: url }))}
                        currentImage={formData.button_image_url}
                        label="Imagem do Botão (Opcional)"
                        folder="buttons"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                      size="lg"
                    >
                      {editingBanner ? 'Atualizar' : 'Criar'} Banner
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      size="lg"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Informações e alertas */}
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p><strong>Tamanho recomendado:</strong> {activeTab === 'desktop' ? '1920x600px (proporção 16:5)' : '750x400px (proporção 15:8)'}</p>
                <p><strong>Limite:</strong> Máximo 5 banners rotativos por dispositivo</p>
                <p><strong>Formatos:</strong> JPG, PNG, WebP</p>
                <p><strong>Upload:</strong> Arraste e solte ou clique para selecionar</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Status dos banners */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                {filteredBanners.length}/5 banners criados para {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
              </div>
              
              {filteredBanners.length >= 5 && (
                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                  Limite atingido
                </Badge>
              )}
            </div>
          </div>

          {/* Lista de banners */}
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                <p className="text-gray-500 text-lg">Carregando banners...</p>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Nenhum banner {activeTab === 'desktop' ? 'desktop' : 'mobile'} criado ainda
                </h3>
                <p className="text-gray-500 mb-6">
                  Comece criando seu primeiro banner para {activeTab === 'desktop' ? 'desktop' : 'dispositivos móveis'}
                </p>
              </div>
            ) : (
              filteredBanners.map((banner) => (
                <Card key={banner.id} className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Preview do banner */}
                      <div className="flex-shrink-0">
                        <div className={`relative w-48 h-24 rounded-lg overflow-hidden ${
                          (banner as any).background_type === 'gradient' 
                            ? `bg-gradient-to-r ${banner.gradient}` 
                            : 'bg-gray-200'
                        }`}>
                          {(banner.image_url_desktop || banner.image_url_mobile || banner.image_url) && (
                            <img
                              src={activeTab === 'desktop' ? (banner.image_url_desktop || banner.image_url) : (banner.image_url_mobile || banner.image_url)}
                              alt={banner.title || 'Banner'}
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {/* Overlay com informações */}
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                          
                          {/* Badge de posição */}
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-white text-gray-800 border-0">
                              #{banner.position}
                            </Badge>
                          </div>
                          
                          {/* Badge de status */}
                          <div className="absolute top-2 right-2">
                            <Badge className={banner.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                              {banner.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Informações do banner */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {banner.title || 'Banner sem título'}
                            </h3>
                            {banner.subtitle && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {banner.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Detalhes do banner */}
                        <div className="space-y-2 text-sm text-gray-600">
                          {banner.button_text && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Botão:</span>
                              <Badge variant="outline" className="text-blue-700 border-blue-200">
                                {banner.button_text}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4">
                            <span className="font-medium">Tipo:</span>
                            <span className="capitalize">
                              {(banner as any).background_type === 'gradient' ? 'Gradiente' : 'Somente Imagem'}
                            </span>
                            
                            <span className="font-medium">Dispositivo:</span>
                            <Badge variant="outline" className={
                              (banner as any).device_type === 'mobile' 
                                ? 'text-orange-700 border-orange-200' 
                                : 'text-blue-700 border-blue-200'
                            }>
                              {(banner as any).device_type === 'mobile' ? 'Mobile' : 'Desktop'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(banner)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

