
import { useState } from 'react';
import { useServiceCards, ServiceCard } from '@/hooks/useServiceCards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Settings, Info, Link as LinkIcon, Image as ImageIcon, Type, Hash, Palette, ToggleLeft } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

export const ServiceCardManager = () => {
  const { serviceCards, loading, addServiceCard, updateServiceCard, deleteServiceCard } = useServiceCards();
  const [editingCard, setEditingCard] = useState<ServiceCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 1,
    is_active: true,
    background_image_url: '',
    shadow_color: '#ef4444',
    shadow_enabled: true,
    icon_filter_enabled: false,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      position: (serviceCards.length + 1),
      is_active: true,
      background_image_url: '',
      shadow_color: '#ef4444',
      shadow_enabled: true,
      icon_filter_enabled: false,
    });
    setEditingCard(null);
  };

  const handleEdit = (card: ServiceCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      description: card.description,
      image_url: card.image_url,
      link_url: card.link_url,
      position: card.position,
      is_active: card.is_active,
      background_image_url: card.background_image_url || '',
      shadow_color: card.shadow_color || '#ef4444',
      shadow_enabled: card.shadow_enabled ?? true,
      icon_filter_enabled: card.icon_filter_enabled ?? false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.image_url || !formData.link_url) {
      alert('Campos obrigatórios: título, descrição, ícone e link de destino.');
      return;
    }

    try {
      if (editingCard) {
        await updateServiceCard(editingCard.id, formData);
      } else {
        await addServiceCard(formData);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este card de serviço?')) {
      await deleteServiceCard(id);
    }
  };

  return (
    <Card className="bg-[#2C2C44] border-[#343A40]">
      <CardHeader className="border-b border-[#343A40] pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="w-6 h-6 text-[#007BFF]" />
          Gerenciar Cards de Serviços
        </CardTitle>
        
        <Alert className="mt-3 bg-[#1A1A2E] border-[#343A40] text-gray-300">
          <Info className="h-4 w-4 text-[#007BFF]" />
          <AlertDescription>
            <strong>Tamanho recomendado:</strong> 400x300px (proporção 4:3)<br />
            <strong>Formatos:</strong> JPG, PNG, WebP<br />
            <strong>Cards padrão:</strong> Consoles, Assistência Técnica, Avaliação, Serviços Gerais<br />
            <strong>Upload:</strong> Arraste e solte ou clique para selecionar
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-400">
            {serviceCards.length} cards de serviços
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Card
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl bg-[#2C2C44] border-[#343A40] text-white">
              <DialogHeader className="border-b border-[#343A40] pb-4 mb-4">
                <DialogTitle className="text-white">
                  {editingCard ? 'Editar Card de Serviço' : 'Novo Card de Serviço'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300 flex items-center">
                      <Type className="mr-2 h-4 w-4" />
                      Título *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Consoles"
                      required
                      className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-gray-300 flex items-center">
                      <Hash className="mr-2 h-4 w-4" />
                      Posição
                    </Label>
                    <Input
                      id="position"
                      type="number"
                      min="1"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                      className="bg-[#1A1A2E] border-[#343A40] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300 flex items-center">
                    <Type className="mr-2 h-4 w-4" />
                    Descrição *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: PlayStation, Xbox, Nintendo e mais"
                    rows={2}
                    required
                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Imagem do Card *
                  </Label>
                  <ImageUpload
                    onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    currentImage={formData.image_url}
                    label="Upload Imagem"
                    folder="service-cards"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link_url" className="text-gray-300 flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link de Destino *
                  </Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                    placeholder="Ex: /categoria/consoles"
                    required
                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Imagem de Fundo (Opcional)
                  </Label>
                  <ImageUpload
                    onImageUploaded={(url) => setFormData(prev => ({ ...prev, background_image_url: url }))}
                    currentImage={formData.background_image_url}
                    label="Upload Fundo"
                    folder="service-cards-bg"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shadow_color" className="text-gray-300 flex items-center">
                      <Palette className="mr-2 h-4 w-4" />
                      Cor da Sombra
                    </Label>
                    <Input
                      id="shadow_color"
                      type="color"
                      value={formData.shadow_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, shadow_color: e.target.value }))}
                      className="bg-[#1A1A2E] border-[#343A40] h-10 w-full"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300 flex items-center">
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        Efeito Sombra
                      </Label>
                      <Switch
                        checked={formData.shadow_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shadow_enabled: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300 flex items-center">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Filtro Branco no Ícone
                      </Label>
                      <Switch
                        checked={formData.icon_filter_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, icon_filter_enabled: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white"
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
                  >
                    {editingCard ? 'Atualizar' : 'Criar'} Card
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              Carregando cards de serviços...
            </div>
          ) : serviceCards.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              Nenhum card de serviço criado ainda.
            </div>
          ) : (
            serviceCards.map((card) => (
              <Card key={card.id} className="bg-[#343A40] border-[#495057] hover:bg-[#3A3A50] transition-colors">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-32 object-cover rounded-lg border border-[#495057]"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop';
                      }}
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${card.is_active ? "bg-[#28A745] text-white" : "bg-[#6C757D] text-white"}`}
                    >
                      {card.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{card.description}</p>
                  
                  <div className="space-y-1 text-xs text-gray-400 mb-4">
                    <div><strong>Posição:</strong> {card.position}</div>
                    <div><strong>Link:</strong> {card.link_url}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(card)}
                      size="sm"
                      className="flex-1 bg-[#FFC107] hover:bg-[#E0A800] text-black"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      onClick={() => handleDelete(card.id)}
                      size="sm"
                      className="flex-1 bg-[#DC3545] hover:bg-[#C82333] text-white"
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
