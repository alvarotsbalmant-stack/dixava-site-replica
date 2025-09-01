import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Settings, Save, X, ArrowUp, ArrowDown, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePrimePages, PrimePage, PrimePageInput, PrimePageLayoutInput, PrimePageWithLayout } from '@/hooks/usePrimePages';
import { useProductSections } from '@/hooks/useProductSections';
import { useSpecialSections } from '@/hooks/useSpecialSections';
import { useToast } from '@/components/ui/use-toast';
import { PrimePageBuilder } from './PrimePages/PrimePageBuilder';

const PrimePagesAdmin: React.FC = () => {
  const { toast } = useToast();
  const {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
    fetchPageWithLayout,
    addLayoutItem,
    updateLayoutItem,
    removeLayoutItem
  } = usePrimePages();
  
  const { sections } = useProductSections();
  const { sections: specialSections } = useSpecialSections();

  // Estados para modais e formulários
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PrimePage | null>(null);
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const [builderPageId, setBuilderPageId] = useState<string | null>(null);
  const [selectedPageWithLayout, setSelectedPageWithLayout] = useState<PrimePageWithLayout | null>(null);
  const [formData, setFormData] = useState<PrimePageInput>({
    title: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    is_active: true
  });

  // Estados para adicionar seções
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionData, setNewSectionData] = useState<PrimePageLayoutInput>({
    section_key: '',
    section_type: '',
    section_config: {},
    display_order: 0,
    is_visible: true
  });

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      meta_title: '',
      meta_description: '',
      is_active: true
    });
  };

  // Gerar slug automaticamente
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handlers para páginas
  const handleCreatePage = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    const result = await createPage(formData);
    if (result) {
      setShowCreateModal(false);
      resetForm();
      toast({ title: 'Sucesso', description: 'Página criada com sucesso!' });
    }
  };

  const handleEditPage = async () => {
    if (!selectedPage || !formData.title.trim()) {
      toast({ title: 'Erro', description: 'Dados inválidos', variant: 'destructive' });
      return;
    }

    const result = await updatePage({ ...formData, id: selectedPage.id });
    if (result) {
      setShowEditModal(false);
      setSelectedPage(null);
      resetForm();
      toast({ title: 'Sucesso', description: 'Página atualizada com sucesso!' });
    }
  };

  const handleDeletePage = async (page: PrimePage) => {
    if (window.confirm(`Tem certeza que deseja excluir a página "${page.title}"?`)) {
      const result = await deletePage(page.id);
      if (result) {
        toast({ title: 'Sucesso', description: 'Página excluída com sucesso!' });
      }
    }
  };

  // Handlers para layout
  const handleOpenLayoutModal = async (page: PrimePage) => {
    const pageWithLayout = await fetchPageWithLayout(page.id);
    if (pageWithLayout) {
      setSelectedPageWithLayout(pageWithLayout);
      setShowLayoutModal(true);
    }
  };

  const handleAddSection = async () => {
    if (!selectedPageWithLayout || !newSectionData.section_type) {
      toast({ title: 'Erro', description: 'Dados inválidos', variant: 'destructive' });
      return;
    }

    // Gerar section_key baseado no tipo
    let sectionKey = newSectionData.section_key;
    if (!sectionKey) {
      sectionKey = `${newSectionData.section_type}_${Date.now()}`;
    }

    const result = await addLayoutItem(selectedPageWithLayout.id, {
      ...newSectionData,
      section_key: sectionKey,
      display_order: selectedPageWithLayout.layout_items?.length || 0
    });

    if (result) {
      // Recarregar página com layout
      const updatedPage = await fetchPageWithLayout(selectedPageWithLayout.id);
      if (updatedPage) {
        setSelectedPageWithLayout(updatedPage);
      }
      setShowAddSectionModal(false);
      setNewSectionData({
        section_key: '',
        section_type: '',
        section_config: {},
        display_order: 0,
        is_visible: true
      });
      toast({ title: 'Sucesso', description: 'Seção adicionada com sucesso!' });
    }
  };

  const handleRemoveSection = async (itemId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta seção?')) {
      const result = await removeLayoutItem(itemId);
      if (result && selectedPageWithLayout) {
        // Recarregar página com layout
        const updatedPage = await fetchPageWithLayout(selectedPageWithLayout.id);
        if (updatedPage) {
          setSelectedPageWithLayout(updatedPage);
        }
      }
    }
  };

  const handleToggleSection = async (itemId: string, isVisible: boolean) => {
    const result = await updateLayoutItem(itemId, { is_visible: !isVisible });
    if (result && selectedPageWithLayout) {
      // Recarregar página com layout
      const updatedPage = await fetchPageWithLayout(selectedPageWithLayout.id);
      if (updatedPage) {
        setSelectedPageWithLayout(updatedPage);
      }
    }
  };

  // Tipos de seção disponíveis
  const sectionTypes = [
    { value: 'hero_banner', label: 'Banner Hero' },
    { value: 'hero_quick_links', label: 'Links Rápidos' },
    { value: 'promo_banner', label: 'Banner Promocional' },
    { value: 'custom_banner', label: 'Banner Customizado' },
    { value: 'product_section', label: 'Seção de Produtos' },
    { value: 'special_section', label: 'Seção Especial' },
    { value: 'specialized_services', label: 'Serviços Especializados' },
    { value: 'why_choose_us', label: 'Por que nos escolher' },
    { value: 'contact_help', label: 'Ajuda e Contato' },
    { value: 'custom_html', label: 'HTML Customizado' },
    { value: 'spacer', label: 'Espaçador' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PÁGINAS PRIME</h1>
          <p className="text-gray-600 mt-1">Gerencie páginas configuráveis do sistema</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Página
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Página Prime</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: generateSlug(title)
                      });
                    }}
                    placeholder="Título da página"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-da-pagina"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da página"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meta_title">Meta Título</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Título para SEO"
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Descrição</Label>
                  <Input
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Descrição para SEO"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Página ativa</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePage}>
                  <Save className="w-4 h-4 mr-2" />
                  Criar Página
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de páginas */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando páginas...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma página encontrada</p>
          </div>
        ) : (
          pages.map((page) => (
            <Card key={page.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{page.title}</h3>
                      <Badge variant={page.is_active ? 'default' : 'secondary'}>
                        {page.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Slug:</strong> /prime/{page.slug}
                    </p>
                    {page.description && (
                      <p className="text-sm text-gray-600 mb-2">{page.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Criada em: {new Date(page.created_at!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setBuilderPageId(page.id);
                        setShowPageBuilder(true);
                      }}
                    >
                      <Wrench className="w-4 h-4 mr-1" />
                      Construir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenLayoutModal(page)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Layout Antigo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPage(page);
                        setFormData({
                          title: page.title,
                          slug: page.slug,
                          description: page.description || '',
                          meta_title: page.meta_title || '',
                          meta_description: page.meta_description || '',
                          is_active: page.is_active
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePage(page)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Página Prime</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_title">Título *</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da página"
                />
              </div>
              <div>
                <Label htmlFor="edit_slug">Slug *</Label>
                <Input
                  id="edit_slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-da-pagina"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_description">Descrição</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da página"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_meta_title">Meta Título</Label>
                <Input
                  id="edit_meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="Título para SEO"
                />
              </div>
              <div>
                <Label htmlFor="edit_meta_description">Meta Descrição</Label>
                <Input
                  id="edit_meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Descrição para SEO"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Página ativa</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditPage}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de layout */}
      <Dialog open={showLayoutModal} onOpenChange={setShowLayoutModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Layout: {selectedPageWithLayout?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Seções da Página</h3>
              <Button onClick={() => setShowAddSectionModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Seção
              </Button>
            </div>

            {selectedPageWithLayout?.layout_items && selectedPageWithLayout.layout_items.length > 0 ? (
              <div className="space-y-2">
                {selectedPageWithLayout.layout_items.map((item, index) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{item.section_type}</Badge>
                            <span className="font-medium">{item.section_key}</span>
                            {!item.is_visible && (
                              <Badge variant="secondary">Oculta</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Ordem: {item.display_order}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleSection(item.id!, item.is_visible)}
                          >
                            {item.is_visible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSection(item.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma seção configurada
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de adicionar seção */}
      <Dialog open={showAddSectionModal} onOpenChange={setShowAddSectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Seção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section_type">Tipo de Seção *</Label>
              <Select
                value={newSectionData.section_type}
                onValueChange={(value) => setNewSectionData({ ...newSectionData, section_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de seção" />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newSectionData.section_type === 'product_section' && (
              <div>
                <Label htmlFor="product_section">Seção de Produtos</Label>
                <Select
                  value={newSectionData.section_key}
                  onValueChange={(value) => setNewSectionData({ ...newSectionData, section_key: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma seção de produtos" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={`product_section_${section.id}`}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newSectionData.section_type === 'special_section' && (
              <div>
                <Label htmlFor="special_section">Seção Especial</Label>
                <Select
                  value={newSectionData.section_key}
                  onValueChange={(value) => setNewSectionData({ ...newSectionData, section_key: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma seção especial" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialSections.map((section) => (
                      <SelectItem key={section.id} value={`special_section_${section.id}`}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="section_visible"
                checked={newSectionData.is_visible}
                onCheckedChange={(checked) => setNewSectionData({ ...newSectionData, is_visible: checked })}
              />
              <Label htmlFor="section_visible">Seção visível</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddSectionModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSection}>
                <Save className="w-4 h-4 mr-2" />
                Adicionar Seção
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prime Page Builder */}
      {showPageBuilder && builderPageId && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <PrimePageBuilder
            pageId={builderPageId}
            onBack={() => {
              setShowPageBuilder(false);
              setBuilderPageId(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PrimePagesAdmin;

