
import { useState } from 'react';
import { useBanners, Banner } from '@/hooks/useBanners';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Image, Info } from 'lucide-react';
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

export const BannerManager = () => {
  const { banners, loading, addBanner, updateBanner, deleteBanner } = useBanners();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    image_url: '', // Mantido para compatibilidade ou fallback
    image_url_desktop: '', // Novo campo
    image_url_mobile: '', // Novo campo
    button_image_url: '',
    gradient: 'from-red-600 via-red-600 to-red-700',
    background_type: 'gradient',
    position: 1,
    is_active: true,
    button_link_desktop: '', // Novo campo
    button_link_mobile: '', // Novo campo
    device_type: 'desktop' as 'desktop' | 'mobile', // Novo campo
  });

  // Filtrar banners baseado na aba ativa
  const filteredBanners = banners.filter(banner => 
    (banner as any).device_type === activeTab || 
    (!((banner as any).device_type) && activeTab === 'desktop') // Fallback para banners antigos
  );

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
      device_type: activeTab, // Define automaticamente baseado na aba ativa
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
      device_type: (banner as any).device_type || 'desktop', // Novo campo
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // A validação de campos obrigatórios será removida no Supabase pela Lovable.
    // A validação de link do botão ainda é mantida se o texto do botão existir.
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
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este banner?')) {
      await deleteBanner(id);
    }
  };

  const backgroundOptions = [
    { value: 'gradient', label: 'Gradiente' },
    { value: 'image-only', label: 'Somente Imagem' },
  ];

  const gradientOptions = [
    { value: 'from-purple-600 via-red-600 to-orange-500', label: 'Roxo para Laranja' },
    { value: 'from-red-700 via-red-600 to-red-500', label: 'Vermelho Intenso' },
    { value: 'from-blue-600 via-purple-600 to-red-600', label: 'Azul para Vermelho' },
    { value: 'from-red-600 via-orange-500 to-yellow-500', label: 'Vermelho para Amarelo' },
    { value: 'from-green-600 via-red-600 to-red-700', label: 'Verde para Vermelho' },
    { value: 'from-gray-800 via-gray-700 to-gray-600', label: 'Tons de Cinza' },
  ];

  return (
    <Card className="bg-white border-2 border-red-200">
      <CardHeader>
        {/* Abas Desktop/Mobile */}
        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'desktop'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Desktop
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'mobile'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mobile
          </button>
        </div>

        <CardTitle className="text-xl text-red-600 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Gerenciar Banners do Carousel - {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
        </CardTitle>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tamanho recomendado:</strong> {activeTab === 'desktop' ? '1920x600px (proporção 16:5)' : '750x400px (proporção 15:8)'}<br />
            <strong>Limite:</strong> Máximo 5 banners rotativos por dispositivo<br />
            <strong>Formatos:</strong> JPG, PNG, WebP<br />
            <strong>Upload:</strong> Arraste e solte ou clique para selecionar
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {filteredBanners.length}/5 banners criados para {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={filteredBanners.length >= 5}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Banner {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl text-red-600">
                  {editingBanner ? 'Editar' : 'Novo'} Banner {activeTab === 'desktop' ? 'Desktop' : 'Mobile'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título (Opcional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: PROMOÇÃO ESPECIAL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Posição</Label>
                    <Input
                      id="position"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Ex: Compre e Venda Seus Games na UTI DOS GAMES!"
                    rows={2}
                  />
                </div>

                {/* Seção de Upload de Imagem para Desktop */}
                <ImageUpload
                  onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url_desktop: url }))}
                  currentImage={formData.image_url_desktop}
                  label="Imagem do Banner (Desktop)"
                  folder="banners"
                />

                {/* Seção de Upload de Imagem para Mobile */}
                <ImageUpload
                  onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url_mobile: url }))}
                  currentImage={formData.image_url_mobile}
                  label="Imagem do Banner (Mobile)"
                  folder="banners"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="background_type">Tipo de Fundo</Label>
                    <select
                      id="background_type"
                      value={formData.background_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, background_type: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
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
                      <Label htmlFor="gradient">Cor do Fundo</Label>
                      <select
                        id="gradient"
                        value={formData.gradient}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {gradientOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Botão (Opcional)</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="button_text">Texto do Botão</Label>
                      <Input
                        id="button_text"
                        value={formData.button_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                        placeholder="Ex: Entre em Contato"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="button_link">Link do Botão (Geral)</Label>
                      <Input
                        id="button_link"
                        value={formData.button_link}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                        placeholder="Ex: /categoria/ofertas ou https://wa.me/5527996882090"
                      />
                    </div>
                  </div>

                  {/* Novos campos para links de botão específicos para Desktop e Mobile */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="button_link_desktop">Link do Botão (Desktop)</Label>
                      <Input
                        id="button_link_desktop"
                        value={formData.button_link_desktop}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_link_desktop: e.target.value }))}
                        placeholder="Ex: /categoria/ofertas-desktop"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="button_link_mobile">Link do Botão (Mobile)</Label>
                      <Input
                        id="button_link_mobile"
                        value={formData.button_link_mobile}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_link_mobile: e.target.value }))}
                        placeholder="Ex: /categoria/ofertas-mobile"
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
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {editingBanner ? 'Atualizar' : 'Criar'} Banner
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Carregando banners...
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nenhum banner {activeTab === 'desktop' ? 'desktop' : 'mobile'} criado ainda.
            </div>
          ) : (
            filteredBanners.map((banner) => (
              <Card key={banner.id} className="border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className={`relative text-white p-4 rounded-lg mb-4 ${
                    (banner as any).background_type === 'image-only' 
                      ? 'bg-gray-800' 
                      : `bg-gradient-to-br ${banner.gradient}`
                  }`}>
                    {/* Renderiza a imagem desktop ou mobile dependendo do dispositivo */}
                    {banner.image_url_desktop && !banner.image_url_mobile && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center rounded-lg hidden md:block"
                        style={{ backgroundImage: `url(${banner.image_url_desktop})` }}
                      />
                    )}
                    {banner.image_url_mobile && !banner.image_url_desktop && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center rounded-lg md:hidden"
                        style={{ backgroundImage: `url(${banner.image_url_mobile})` }}
                      />
                    )}
                    {banner.image_url_desktop && banner.image_url_mobile && (
                      <>
                        <div 
                          className="absolute inset-0 bg-cover bg-center rounded-lg hidden md:block"
                          style={{ backgroundImage: `url(${banner.image_url_desktop})` }}
                        />
                        <div 
                          className="absolute inset-0 bg-cover bg-center rounded-lg md:hidden"
                          style={{ backgroundImage: `url(${banner.image_url_mobile})` }}
                        />
                      </>
                    )}
                    {/* Fallback para image_url se as específicas não existirem e background_type for image-only */}
                    {(!banner.image_url_desktop && !banner.image_url_mobile && banner.image_url && (banner as any).background_type === 'image-only') && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: `url(${banner.image_url})` }}
                      />
                    )}

                    <div className="relative text-center">
                      {banner.title && (
                        <div className="bg-black/30 backdrop-blur-sm text-white font-semibold mb-2 px-2 py-1 rounded text-xs inline-block border border-white/20">
                          ♦ {banner.title}
                        </div>
                      )}
                      {banner.subtitle && (
                        <h3 className="font-bold mb-2 text-sm">{banner.subtitle}</h3>
                      )}
                      {/* Exibe o link do botão apropriado para desktop/mobile ou o geral */}
                      {(banner.button_text && (banner.button_link || banner.button_link_desktop || banner.button_link_mobile)) && (
                        <div className="bg-white text-gray-900 px-3 py-1 rounded text-xs inline-flex items-center gap-1">
                          {banner.button_image_url && (
                            <img src={banner.button_image_url} alt="" className="w-3 h-3" />
                          )}
                          {banner.button_text}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Posição:</strong> {banner.position}</div>
                    <div><strong>Tipo:</strong> {(banner as any).background_type === 'image-only' ? 'Somente Imagem' : 'Gradiente'}</div>
                    {banner.button_link && <div><strong>Link Geral:</strong> {banner.button_link}</div>}
                    {banner.button_link_desktop && <div><strong>Link Desktop:</strong> {banner.button_link_desktop}</div>}
                    {banner.button_link_mobile && <div><strong>Link Mobile:</strong> {banner.button_link_mobile}</div>}
                    {banner.image_url_desktop && <div><strong>Imagem Desktop:</strong> Configurada</div>}
                    {banner.image_url_mobile && <div><strong>Imagem Mobile:</strong> Configurada</div>}
                    {banner.image_url && <div><strong>Imagem (Fallback):</strong> Configurada</div>}
                    <Badge className={banner.is_active ? "bg-green-600" : "bg-gray-600"}>
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleEdit(banner)}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      onClick={() => handleDelete(banner.id)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};


