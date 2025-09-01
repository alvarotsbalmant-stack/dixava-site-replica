import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Tag as TagIcon, 
  Package as PackageIcon, 
  Layers, 
  Link as LinkIcon,
  Eye,
  EyeOff,
  Search,
  Filter,
  Save,
  X,
  ChevronRight,
  Settings,
  Palette,
  Type,
  Grid3X3,
  ArrowUpDown,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogTrigger, 
  DialogClose 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { useProductSections, ProductSection, ProductSectionInput, SectionItemType } from '@/hooks/useProductSections';
import { ProductSectionFormData } from '@/types/productSectionForm';
import { asExtendedProductSection } from '@/types/admin-temp-fixes';
import { useProducts, Product } from '@/hooks/useProducts';
import { useTags, Tag } from '@/hooks/useTags';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

// Helper to get item names for display
const getItemName = (itemId: string, type: SectionItemType, products: Product[], tags: Tag[]): string => {
  if (type === 'product') {
    const product = products.find(p => p.id === itemId);
    return product?.name || itemId;
  } else {
    const tag = tags.find(t => t.id === itemId);
    return tag?.name || itemId;
  }
};

// Helper to get item image for display
const getItemImage = (itemId: string, type: SectionItemType, products: Product[]): string | null => {
  if (type === 'product') {
    const product = products.find(p => p.id === itemId);
    return product?.image || null;
  }
  return null;
};

// Helper to get item price for display
const getItemPrice = (itemId: string, type: SectionItemType, products: Product[]): string | null => {
  if (type === 'product') {
    const product = products.find(p => p.id === itemId);
    return product?.price ? `R$ ${product.price}` : null;
  }
  return null;
};

const ProductSectionManagerUltraSimple: React.FC = () => {
  const { toast } = useToast();
  const { sections, loading: sectionsLoading, error: sectionsError, createSection, updateSection, deleteSection, fetchSections } = useProductSections();
  const { products, loading: productsLoading } = useProducts();
  const { tags, loading: tagsLoading } = useTags();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<ProductSection | null>(null);
  const [formData, setFormData] = useState<ProductSectionFormData>({ 
    title: '', 
    title_part1: '',
    title_part2: '',
    title_color1: '#000000',
    title_color2: '#A4A4A4',
    view_all_link: '' 
  });
  const [selectedItems, setSelectedItems] = useState<{ type: SectionItemType; id: string }[]>([]);
  const [itemTypeToAdd, setItemTypeToAdd] = useState<SectionItemType>('product');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'tag'>('all');
  const [previewMode, setPreviewMode] = useState(false);
  
  // Estados para o sistema de adição de produtos
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  const isLoading = sectionsLoading || productsLoading || tagsLoading;

  // Filter sections based on search and type
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase());
      const sectionType = section.items?.[0]?.item_type;
      const matchesFilter = filterType === 'all' || filterType === sectionType;
      return matchesSearch && matchesFilter;
    });
  }, [sections, searchTerm, filterType]);

  // Filter products/tags for selection
  const filteredProductsForSelection = useMemo(() => {
    if (itemTypeToAdd === 'product') {
      let filtered = products.filter(product => 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      
      if (showOnlyAvailable) {
        filtered = filtered.filter(product => 
          !selectedItems.some(item => item.id === product.id && item.type === 'product')
        );
      }
      
      return filtered.slice(0, 50); // Limitar para performance
    } else {
      let filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      
      if (showOnlyAvailable) {
        filtered = filtered.filter(tag => 
          !selectedItems.some(item => item.id === tag.id && item.type === 'tag')
        );
      }
      
      return filtered.slice(0, 50);
    }
  }, [itemTypeToAdd, products, tags, productSearchTerm, selectedItems, showOnlyAvailable]);

  const handleEditClick = (section: ProductSection) => {
    setCurrentSection(section);
    const extendedSection = asExtendedProductSection(section);
    setFormData({ 
      title: extendedSection.title, 
      title_part1: extendedSection.title_part1 || '',
      title_part2: extendedSection.title_part2 || '',
      title_color1: extendedSection.title_color1 || '#000000',
      title_color2: extendedSection.title_color2 || '#A4A4A4',
      view_all_link: extendedSection.view_all_link || '' 
    });
    setSelectedItems(section.items?.map(item => ({ type: item.item_type, id: item.item_id })) || []);
    setItemTypeToAdd(section.items?.[0]?.item_type || 'product');
    setProductSearchTerm('');
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setCurrentSection(null);
    setFormData({ 
      title: '', 
      title_part1: '',
      title_part2: '',
      title_color1: '#000000',
      title_color2: '#A4A4A4',
      view_all_link: '' 
    });
    setSelectedItems([]);
    setItemTypeToAdd('product');
    setProductSearchTerm('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    const confirmed = confirm('Tem certeza que deseja remover esta seção? Ela também será removida do layout da página inicial.');
    if (confirmed) {
      await deleteSection(id);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasSimpleTitle = formData.title && formData.title.trim() !== '';
    const hasBicolorTitle = (formData.title_part1 && formData.title_part1.trim() !== '') || 
                           (formData.title_part2 && formData.title_part2.trim() !== '');
    
    if (!hasSimpleTitle && !hasBicolorTitle) {
      toast({ 
        title: 'Erro', 
        description: 'É obrigatório ter um título simples OU pelo menos uma parte do título bicolor.', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (selectedItems.length === 0) {
        toast({ title: 'Erro', description: 'Adicione pelo menos um produto ou tag à seção.', variant: 'destructive' });
        return;
    }

    const sectionInput = {
      id: currentSection?.id,
      title: formData.title || '',
      title_part1: formData.title_part1,
      title_part2: formData.title_part2,
      title_color1: formData.title_color1,
      title_color2: formData.title_color2,
      view_all_link: formData.view_all_link || null,
      items: selectedItems,
    } as ProductSectionInput;

    let success = false;
    if (currentSection) {
      const result = await updateSection(sectionInput);
      success = !!result;
    } else {
      const result = await createSection(sectionInput);
      success = !!result;
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleItemTypeChange = (value: string) => {
    setSelectedItems([]);
    setItemTypeToAdd(value as SectionItemType);
    setProductSearchTerm('');
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.some(item => item.id === itemId && item.type === itemTypeToAdd)) {
        return prev;
      }
      return [...prev, { type: itemTypeToAdd, id: itemId }];
    });
  };

  const handleItemRemove = (itemIdToRemove: string, typeToRemove: SectionItemType) => {
    setSelectedItems(prev => prev.filter(item => !(item.id === itemIdToRemove && item.type === typeToRemove)));
  };

  // Preview title component
  const TitlePreview = ({ section }: { section: ProductSection }) => {
    const extended = asExtendedProductSection(section);
    if (extended.title_part1 || extended.title_part2) {
      return (
        <div className="flex items-center gap-1">
          {extended.title_part1 && (
            <span className="text-gray-900">
              {extended.title_part1}
            </span>
          )}
          {extended.title_part2 && (
            <span className="text-gray-600">
              {extended.title_part2}
            </span>
          )}
        </div>
      );
    }
    return <span>{section.title}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-white text-2xl">
                <Layers className="w-7 h-7 text-[#007BFF]" />
                Seções de Produtos
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Gerencie as seções que exibem produtos na página inicial do site
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white"
              >
                {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Lista' : 'Preview'}
              </Button>
              <Button 
                onClick={handleAddNewClick} 
                disabled={isLoading} 
                className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Seção
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar seções por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-[#1A1A2E] border-[#343A40] text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C44] border-[#343A40] text-white">
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="product">Por produtos</SelectItem>
                <SelectItem value="tag">Por tags</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-[#2C2C44] border-[#343A40]">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-3 bg-[#343A40]" />
                <Skeleton className="h-4 w-1/2 mb-2 bg-[#343A40]" />
                <Skeleton className="h-20 w-full bg-[#343A40]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {sectionsError && (
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertDescription className="text-red-200">
            Erro ao carregar seções: {sectionsError}
          </AlertDescription>
        </Alert>
      )}

      {/* Sections Grid/List */}
      {!isLoading && !sectionsError && (
        <>
          {filteredSections.length > 0 ? (
            <div className={previewMode ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
              {filteredSections.map((section) => (
                <Card key={section.id} className="bg-[#2C2C44] border-[#343A40] hover:border-[#007BFF]/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-lg mb-2 truncate">
                          <TitlePreview section={section} />
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {section.items?.[0]?.item_type === 'product' ? (
                            <Badge className="bg-[#007BFF] text-white hover:bg-[#0056B3]">
                              <PackageIcon className="h-3 w-3 mr-1"/>
                              Produtos ({section.items?.length || 0})
                            </Badge>
                          ) : (
                            <Badge className="bg-[#6F42C1] text-white hover:bg-[#5A2D91]">
                              <TagIcon className="h-3 w-3 mr-1"/>
                              Tags ({section.items?.length || 0})
                            </Badge>
                          )}
                          {section.view_all_link && (
                            <Badge variant="outline" className="border-[#28A745] text-[#28A745]">
                              <LinkIcon className="h-3 w-3 mr-1"/>
                              Link
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#FFC107] hover:bg-[#FFC107]/20 hover:text-[#FFC107] p-2"
                          onClick={() => handleEditClick(section)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#DC3545] hover:bg-[#DC3545]/20 hover:text-[#DC3545] p-2"
                          onClick={() => handleDeleteClick(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {previewMode ? (
                      <div className="space-y-3">
                        {/* Preview dos itens */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {section.items?.slice(0, 8).map((item, index) => (
                            <div key={`${item.item_id}-${index}`} className="bg-[#1A1A2E] rounded-lg p-2 text-center">
                              {item.item_type === 'product' && (
                                <div className="aspect-square bg-[#343A40] rounded mb-1 flex items-center justify-center">
                                  {getItemImage(item.item_id, item.item_type, products) ? (
                                    <img 
                                      src={getItemImage(item.item_id, item.item_type, products)!} 
                                      alt=""
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <PackageIcon className="w-6 h-6 text-gray-500" />
                                  )}
                                </div>
                              )}
                              <p className="text-xs text-gray-300 truncate">
                                {getItemName(item.item_id, item.item_type, products, tags)}
                              </p>
                            </div>
                          ))}
                          {section.items && section.items.length > 8 && (
                            <div className="bg-[#1A1A2E] rounded-lg p-2 text-center flex items-center justify-center">
                              <span className="text-xs text-gray-400">+{section.items.length - 8}</span>
                            </div>
                          )}
                        </div>
                        {section.view_all_link && (
                          <div className="text-center">
                            <Badge variant="outline" className="border-[#28A745] text-[#28A745]">
                              Ver Todos: {section.view_all_link}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {section.items?.slice(0, 3).map((item, index) => (
                            <Badge key={`${item.item_id}-${index}`} className="bg-[#495057] text-white hover:bg-[#6C757D] text-xs">
                              {getItemName(item.item_id, item.item_type, products, tags)}
                            </Badge>
                          ))}
                          {section.items && section.items.length > 3 && (
                            <Badge className="bg-[#6C757D] text-white hover:bg-[#5A6268] text-xs">
                              +{section.items.length - 3}
                            </Badge>
                          )}
                        </div>
                        {section.view_all_link && (
                          <p className="text-xs text-gray-400 truncate">
                            <LinkIcon className="w-3 h-3 inline mr-1" />
                            {section.view_all_link}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-[#2C2C44] border-[#343A40]">
              <CardContent className="p-12 text-center">
                <Layers className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchTerm || filterType !== 'all' ? 'Nenhuma seção encontrada' : 'Nenhuma seção cadastrada'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Crie sua primeira seção de produtos para começar.'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button onClick={handleAddNewClick} className="bg-[#007BFF] hover:bg-[#0056B3] text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Criar Primeira Seção
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add/Edit Modal - SISTEMA COMPLETAMENTE REFORMULADO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] bg-[#2C2C44] border-[#343A40] text-white overflow-hidden">
          <DialogHeader className="border-b border-[#343A40] pb-4">
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              {currentSection ? (
                <>
                  <Edit className="w-5 h-5 text-[#FFC107]" />
                  Editar Seção
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 text-[#007BFF]" />
                  Nova Seção
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure o título, aparência e conteúdo da seção de produtos.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <Tabs defaultValue="title" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#1A1A2E]">
                  <TabsTrigger value="title" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                    <Type className="w-4 h-4 mr-2" />
                    Título
                  </TabsTrigger>
                  <TabsTrigger value="content" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Conteúdo
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="title" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#343A40]">
                      <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Título Simples
                      </h4>
                      <Input 
                        value={formData.title} 
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} 
                        className="bg-[#2C2C44] border-[#343A40] text-white placeholder:text-gray-500" 
                        placeholder="Ex: Produtos em Destaque"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Use este campo OU configure um título bicolor abaixo
                      </p>
                    </div>

                     <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#343A40]">
                       <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
                         <Palette className="w-4 h-4" />
                         Título Bicolor (Opcional)
                       </h4>
                       <p className="text-xs text-gray-400 mb-3">Configure um título em duas partes com cores diferentes, como na GameStop</p>
                       <div className="space-y-3">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <Label className="text-gray-300 text-xs">Primeira Parte do Título</Label>
                             <Input 
                               value={formData.title_part1 || ''} 
                               onChange={(e) => setFormData(prev => ({ ...prev, title_part1: e.target.value }))}
                               className="bg-[#2C2C44] border-[#343A40] text-white placeholder:text-gray-500" 
                               placeholder="Ex: Most Popular"
                             />
                           </div>
                           <div>
                             <Label className="text-gray-300 text-xs">Segunda Parte do Título</Label>
                             <Input 
                               value={formData.title_part2 || ''} 
                               onChange={(e) => setFormData(prev => ({ ...prev, title_part2: e.target.value }))}
                               className="bg-[#2C2C44] border-[#343A40] text-white placeholder:text-gray-500" 
                               placeholder="Ex: Trading Cards"
                             />
                           </div>
                           <div>
                             <Label className="text-gray-300 text-xs">Cor da Primeira Parte</Label>
                             <div className="flex gap-2 mt-1">
                               <input
                                 type="color"
                                 value={formData.title_color1 || '#000000'}
                                 onChange={(e) => setFormData(prev => ({ ...prev, title_color1: e.target.value }))}
                                 className="w-16 h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                                 title="Cor da primeira parte"
                               />
                               <Input
                                 value={formData.title_color1 || '#000000'}
                                 onChange={(e) => setFormData(prev => ({ ...prev, title_color1: e.target.value }))}
                                 placeholder="#000000"
                                 className="flex-1 bg-[#2C2C44] border-[#343A40] text-white"
                               />
                             </div>
                           </div>
                           <div>
                             <Label className="text-gray-300 text-xs">Cor da Segunda Parte</Label>
                             <div className="flex gap-2 mt-1">
                               <input
                                 type="color"
                                 value={formData.title_color2 || '#A4A4A4'}
                                 onChange={(e) => setFormData(prev => ({ ...prev, title_color2: e.target.value }))}
                                 className="w-16 h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                                 title="Cor da segunda parte"
                               />
                               <Input
                                 value={formData.title_color2 || '#A4A4A4'}
                                 onChange={(e) => setFormData(prev => ({ ...prev, title_color2: e.target.value }))}
                                 placeholder="#A4A4A4"
                                 className="flex-1 bg-[#2C2C44] border-[#343A40] text-white"
                               />
                             </div>
                           </div>
                         </div>
                       </div>
                       
                       {/* Preview do título bicolor */}
                       {(formData.title_part1 || formData.title_part2) && (
                         <div className="mt-4 p-4 bg-[#2C2C44] rounded-lg">
                           <Label className="text-gray-300 mb-2 block text-xs">Preview do Título Bicolor:</Label>
                           <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                             <h2 className="text-xl md:text-2xl font-semibold leading-tight tracking-tight">
                               {formData.title_part1 && (
                                 <span style={{ color: formData.title_color1 || '#000000' }} className="font-semibold block sm:inline">
                                   {formData.title_part1}
                                 </span>
                               )}
                               {formData.title_part1 && formData.title_part2 && <span className="hidden sm:inline"> </span>}
                               {formData.title_part2 && (
                                 <span style={{ color: formData.title_color2 || '#A4A4A4' }} className="font-normal block sm:inline">
                                   {formData.title_part2}
                                 </span>
                               )}
                             </h2>
                           </div>
                         </div>
                       )}
                     </div>
                  </div>
                </TabsContent>

                {/* ABA CONTEÚDO - SISTEMA COMPLETAMENTE REFORMULADO */}
                <TabsContent value="content" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coluna Esquerda - Seleção */}
                    <div className="space-y-4">
                      <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#343A40]">
                        <h4 className="text-sm font-medium text-green-300 mb-3 flex items-center gap-2">
                          <Grid3X3 className="w-4 h-4" />
                          Tipo de Conteúdo
                        </h4>
                        <Select 
                          value={itemTypeToAdd}
                          onValueChange={handleItemTypeChange}
                          disabled={selectedItems.length > 0}
                        >
                          <SelectTrigger className="bg-[#2C2C44] border-[#343A40] text-white">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2C2C44] border-[#343A40] text-white">
                            <SelectItem value="product">
                              <div className="flex items-center gap-2">
                                <PackageIcon className="w-4 h-4" />
                                Produtos Específicos
                              </div>
                            </SelectItem>
                            <SelectItem value="tag">
                              <div className="flex items-center gap-2">
                                <TagIcon className="w-4 h-4" />
                                Produtos por Tag
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {selectedItems.length > 0 && (
                          <p className="text-xs text-amber-400 mt-2">
                            ⚠️ Para alterar o tipo, remova todos os itens selecionados primeiro
                          </p>
                        )}
                      </div>

                      {/* Sistema de Busca Ultra Simples */}
                      <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#343A40]">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-blue-300 flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Buscar {itemTypeToAdd === 'product' ? 'Produtos' : 'Tags'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showOnlyAvailable}
                              onCheckedChange={setShowOnlyAvailable}
                              className="data-[state=checked]:bg-[#007BFF]"
                            />
                            <span className="text-xs text-gray-400">Apenas disponíveis</span>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder={`Digite para buscar ${itemTypeToAdd === 'product' ? 'produtos' : 'tags'}...`}
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="pl-10 bg-[#2C2C44] border-[#343A40] text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>

                      {/* Lista Visual de Produtos/Tags */}
                      <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#343A40]">
                        <h4 className="text-sm font-medium text-orange-300 mb-3 flex items-center gap-2">
                          {itemTypeToAdd === 'product' ? <PackageIcon className="w-4 h-4" /> : <TagIcon className="w-4 h-4" />}
                          {itemTypeToAdd === 'product' ? 'Produtos Disponíveis' : 'Tags Disponíveis'}
                          <Badge variant="outline" className="border-[#007BFF] text-[#007BFF] ml-2">
                            {filteredProductsForSelection.length}
                          </Badge>
                        </h4>
                        
                        <ScrollArea className="h-80 pr-2">
                          {filteredProductsForSelection.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                              {productSearchTerm ? 'Nenhum item encontrado' : `Nenhum${itemTypeToAdd === 'product' ? ' produto' : 'a tag'} disponível`}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredProductsForSelection.map((item: any) => (
                                <div 
                                  key={item.id} 
                                  className="flex items-center gap-3 p-3 bg-[#2C2C44] rounded border border-[#343A40] hover:border-[#007BFF]/50 transition-colors cursor-pointer"
                                  onClick={() => handleItemSelect(item.id)}
                                >
                                  {itemTypeToAdd === 'product' && (
                                    <div className="w-12 h-12 bg-[#343A40] rounded flex items-center justify-center flex-shrink-0">
                                      {item.image ? (
                                        <img 
                                          src={item.image} 
                                          alt=""
                                          className="w-full h-full object-cover rounded"
                                        />
                                      ) : (
                                        <PackageIcon className="w-6 h-6 text-gray-500" />
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                      {item.name}
                                    </p>
                                    {itemTypeToAdd === 'product' && item.price && (
                                      <p className="text-xs text-green-400">
                                        R$ {item.price}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-[#007BFF] hover:bg-[#0056B3] text-white flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemSelect(item.id);
                                    }}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>

                    {/* Coluna Direita - Itens Selecionados */}
                    <div className="space-y-4">
                      <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#343A40]">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-purple-300 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Itens Selecionados
                          </h4>
                          <Badge variant="outline" className="border-[#28A745] text-[#28A745]">
                            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}
                          </Badge>
                        </div>
                        
                        <ScrollArea className="h-96 pr-2">
                          {selectedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                              <Grid3X3 className="w-12 h-12 mb-3 opacity-50" />
                              <p className="text-sm">Nenhum item selecionado</p>
                              <p className="text-xs mt-1">Adicione produtos ou tags da lista ao lado</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {selectedItems.map((item, index) => {
                                const itemData = itemTypeToAdd === 'product' 
                                  ? products.find(p => p.id === item.id)
                                  : tags.find(t => t.id === item.id);
                                
                                return (
                                  <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-3 bg-[#2C2C44] rounded border border-[#343A40]">
                                    <div className="w-8 h-8 bg-[#007BFF] rounded-full text-white text-sm flex items-center justify-center flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    
                                    {item.type === 'product' && itemData && (
                                      <div className="w-10 h-10 bg-[#343A40] rounded flex items-center justify-center flex-shrink-0">
                                        {(itemData as any).image ? (
                                          <img 
                                            src={(itemData as any).image} 
                                            alt=""
                                            className="w-full h-full object-cover rounded"
                                          />
                                        ) : (
                                          <PackageIcon className="w-5 h-5 text-gray-500" />
                                        )}
                                      </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white truncate">
                                        {getItemName(item.id, item.type, products, tags)}
                                      </p>
                                      {item.type === 'product' && itemData && (itemData as any).price && (
                                        <p className="text-xs text-green-400">
                                          R$ {(itemData as any).price}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <Button 
                                      type="button" 
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleItemRemove(item.id, item.type)} 
                                      className="text-red-400 hover:text-red-300 hover:bg-red-400/20 flex-shrink-0"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-6">
                  <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#343A40]">
                    <h4 className="text-sm font-medium text-orange-300 mb-3 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Link "Ver Todos" (Opcional)
                    </h4>
                    <Input 
                      value={formData.view_all_link || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, view_all_link: e.target.value }))} 
                      className="bg-[#2C2C44] border-[#343A40] text-white placeholder:text-gray-500" 
                      placeholder="Ex: /categoria/promocoes ou /secao/jogos-populares"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      URL para onde o botão "Ver Todos" irá direcionar. Deixe vazio se não quiser o botão.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t border-[#343A40]">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={handleFormSubmit}
              disabled={isLoading || selectedItems.length === 0} 
              className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : (currentSection ? 'Salvar Alterações' : 'Criar Seção')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductSectionManagerUltraSimple;

