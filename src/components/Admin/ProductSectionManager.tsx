import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, ListFilter, Tag as TagIcon, Package as PackageIcon, Layers, Link as LinkIcon } from 'lucide-react';
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
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger, 
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/components/ui/use-toast';
import { useProductSections, ProductSection, ProductSectionInput, SectionItemType } from '@/hooks/useProductSections';
import { ProductSectionFormData } from '@/types/productSectionForm';
import { asExtendedProductSection } from '@/types/admin-temp-fixes';
import { useProducts, Product } from '@/hooks/useProducts'; // Assuming Product type is exported
import { useTags, Tag } from '@/hooks/useTags';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Helper to get item names for display
const getItemName = (itemId: string, type: SectionItemType, products: Product[], tags: Tag[]): string => {
  if (type === 'product') {
    const product = products.find(p => p.id === itemId);
    return product?.name || itemId; // Fallback to ID if not found
  } else {
    const tag = tags.find(t => t.id === itemId); // Assuming tag ID is used
    return tag?.name || itemId; // Fallback to ID/name
  }
};

const ProductSectionManager: React.FC = () => {
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
    title_color2: '#9ca3af',
    view_all_link: '' 
  });
  const [selectedItems, setSelectedItems] = useState<{ type: SectionItemType; id: string }[]>([]);
  const [itemTypeToAdd, setItemTypeToAdd] = useState<SectionItemType>('product'); // 'product' or 'tag'

  const isLoading = sectionsLoading || productsLoading || tagsLoading;

  const handleEditClick = (section: ProductSection) => {
    setCurrentSection(section);
    const extendedSection = asExtendedProductSection(section);
    setFormData({ 
      title: extendedSection.title, 
      title_part1: extendedSection.title_part1 || '',
      title_part2: extendedSection.title_part2 || '',
      title_color1: extendedSection.title_color1 || '#000000',
      title_color2: extendedSection.title_color2 || '#9ca3af',
      view_all_link: extendedSection.view_all_link || '' 
    });
    setSelectedItems(section.items?.map(item => ({ type: item.item_type, id: item.item_id })) || []);
    // Determine initial item type based on first item, if any
    setItemTypeToAdd(section.items?.[0]?.item_type || 'product'); 
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setCurrentSection(null);
    setFormData({ 
      title: '', 
      title_part1: '',
      title_part2: '',
      title_color1: '#000000',
      title_color2: '#9ca3af',
      view_all_link: '' 
    });
    setSelectedItems([]);
    setItemTypeToAdd('product');
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    // Add confirmation dialog here
    const confirmed = confirm('Tem certeza que deseja remover esta seção? Ela também será removida do layout da página inicial.');
    if (confirmed) {
      await deleteSection(id);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: deve ter título simples OU pelo menos uma parte do título bicolor
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
      title: formData.title || '', // Pode ser vazio se usar título bicolor
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
    // Clear selected items when changing type to avoid mixing
    setSelectedItems([]); 
    setItemTypeToAdd(value as SectionItemType);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => {
      // Prevent duplicates
      if (prev.some(item => item.id === itemId && item.type === itemTypeToAdd)) {
        return prev;
      }
      return [...prev, { type: itemTypeToAdd, id: itemId }];
    });
  };

  const handleItemRemove = (itemIdToRemove: string, typeToRemove: SectionItemType) => {
    setSelectedItems(prev => prev.filter(item => !(item.id === itemIdToRemove && item.type === typeToRemove)));
  };

  // Memoize options for selectors
  const productOptions = useMemo(() => products.map(p => ({ value: p.id, label: p.name })), [products]);
  const tagOptions = useMemo(() => tags.map(t => ({ value: t.id, label: t.name })), [tags]); // Assuming tags have unique IDs

  return (
    <Card className="bg-[#2C2C44] border-[#343A40]">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#343A40] pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <Layers className="w-6 h-6 text-[#007BFF]" />
            Gerenciar Seções de Produtos
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Crie e edite as seções que exibem produtos na página inicial.
          </p>
          <Alert className="mt-3 bg-[#1A1A2E] border-[#343A40] text-gray-300">
            <Layers className="h-4 w-4 text-[#007BFF]" />
            <AlertDescription>
              Configure seções de produtos por produtos específicos ou por tags. As seções aparecerão na página inicial conforme configurado no Layout Home.
            </AlertDescription>
          </Alert>
        </div>
        <Button size="sm" onClick={handleAddNewClick} disabled={isLoading} className="bg-[#007BFF] hover:bg-[#0056B3] text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Seção
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-[#343A40]" />
            <Skeleton className="h-10 w-full bg-[#343A40]" />
          </div>
        )}
        {sectionsError && <p className="text-red-500 p-4">Erro ao carregar seções: {sectionsError}</p>}
        {!isLoading && !sectionsError && (
          <div className="rounded-lg border border-[#343A40] overflow-hidden">
            <Table className="w-full text-white">
              <TableHeader className="bg-[#343A40]">
                <TableRow className="border-b border-[#495057]">
                  <TableHead className="text-gray-300">Título</TableHead>
                  <TableHead className="text-gray-300">Tipo</TableHead>
                  <TableHead className="text-gray-300">Itens</TableHead>
                  <TableHead className="text-gray-300">Link "Ver Todos"</TableHead>
                  <TableHead className="text-right text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#2C2C44]">
                {sections.length > 0 ? (
                  sections.map((section) => (
                    <TableRow key={section.id} className="border-b border-[#343A40] hover:bg-[#3A3A50]">
                      <TableCell className="font-medium text-white">{section.title}</TableCell>
                      <TableCell className="capitalize text-gray-300">
                        {section.items?.[0]?.item_type === 'product' ? 
                          <Badge className="bg-[#007BFF] text-white hover:bg-[#0056B3]">
                            <PackageIcon className="h-3 w-3 mr-1"/>
                            Produtos
                          </Badge> : 
                          <Badge className="bg-[#6F42C1] text-white hover:bg-[#5A2D91]">
                            <TagIcon className="h-3 w-3 mr-1"/>
                            Tags
                          </Badge>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {section.items?.slice(0, 3).map(item => (
                            <Badge key={item.id || item.item_id} className="bg-[#495057] text-white hover:bg-[#6C757D]">
                              {getItemName(item.item_id, item.item_type, products, tags)}
                            </Badge>
                          ))}
                          {section.items && section.items.length > 3 && (
                            <Badge className="bg-[#6C757D] text-white hover:bg-[#5A6268]">+{section.items.length - 3}...</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{section.view_all_link || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-2 text-[#FFC107] hover:bg-[#FFC107]/20 hover:text-[#FFC107]" onClick={() => handleEditClick(section)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#DC3545] hover:bg-[#DC3545]/20 hover:text-[#DC3545]" onClick={() => handleDeleteClick(section.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 h-24">
                      Nenhuma seção de produtos cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#2C2C44] border-[#343A40] text-white">
          <DialogHeader className="border-b border-[#343A40] pb-4 mb-4">
            <DialogTitle className="text-white">{currentSection ? 'Editar Seção' : 'Adicionar Nova Seção'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Defina o título, o link e selecione os produtos ou tags para esta seção.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-6 py-4">
              {/* Title Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Configurações de Título
                </h3>
                
                {/* Simple Title */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right text-gray-300">
                    Título Simples
                  </Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} 
                    className="col-span-3 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500" 
                    placeholder="Digite o título (ou deixe vazio para usar título bicolor)"
                  />
                </div>

                {/* Bicolor Title Part 1 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="titlePart1" className="text-right text-green-400">
                    Título Parte 1
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input 
                      id="titlePart1" 
                      name="titlePart1" 
                       value={formData.title_part1 || ''} 
                       onChange={(e) => setFormData(prev => ({ ...prev, title_part1: e.target.value }))}
                      className="flex-1 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500" 
                      placeholder="ex: Most Popular"
                    />
                    <input
                      type="color"
                      value={formData.title_color1 || '#000000'}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_color1: e.target.value }))}
                      className="w-12 h-10 rounded border border-[#343A40] bg-[#1A1A2E] cursor-pointer"
                      title="Cor da primeira parte"
                    />
                  </div>
                </div>

                {/* Bicolor Title Part 2 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="titlePart2" className="text-right text-purple-400">
                    Título Parte 2
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input 
                      id="titlePart2" 
                      name="titlePart2" 
                       value={formData.title_part2 || ''} 
                       onChange={(e) => setFormData(prev => ({ ...prev, title_part2: e.target.value }))}
                      className="flex-1 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500" 
                      placeholder="ex: Trading Cards"
                    />
                    <input
                      type="color"
                      value={formData.title_color2 || '#9ca3af'}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_color2: e.target.value }))}
                      className="w-12 h-10 rounded border border-[#343A40] bg-[#1A1A2E] cursor-pointer"
                      title="Cor da segunda parte"
                    />
                  </div>
                </div>
              </div>

              {/* View All Link */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="viewAllLink" className="text-right text-gray-300 flex items-center">
                  <LinkIcon className="mr-1 h-4 w-4" />
                  Link "Ver Todos"
                </Label>
                <Input 
                  id="viewAllLink" 
                  name="viewAllLink" 
                  value={formData.view_all_link || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, view_all_link: e.target.value }))} 
                  className="col-span-3 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500" 
                  placeholder="Opcional (ex: /categoria/promocoes)"
                />
              </div>
              {/* Item Type Selector */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemType" className="text-right text-gray-300">
                  Tipo de Item*
                </Label>
                <Select 
                  value={itemTypeToAdd}
                  onValueChange={handleItemTypeChange}
                  disabled={selectedItems.length > 0} // Disable changing type if items are already selected
                >
                  <SelectTrigger className="col-span-3 bg-[#1A1A2E] border-[#343A40] text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2C2C44] border-[#343A40] text-white">
                    <SelectItem value="product">Produtos Específicos</SelectItem>
                    <SelectItem value="tag">Produtos por Tag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Item Selector (Product or Tag) */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="itemSelector" className="text-right pt-2 text-gray-300">
                  {itemTypeToAdd === 'product' ? 'Produtos*' : 'Tags*'}
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-[#1A1A2E] border-[#343A40] text-white hover:bg-[#343A40]">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar {itemTypeToAdd === 'product' ? 'Produto' : 'Tag'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-[#2C2C44] border-[#343A40]" align="start">
                      <Command className="bg-[#2C2C44] text-white">
                        <CommandInput placeholder={`Buscar ${itemTypeToAdd === 'product' ? 'produto' : 'tag'}...`} className="text-white" />
                        <CommandList>
                          <CommandEmpty className="text-gray-400">Nenhum item encontrado.</CommandEmpty>
                          <CommandGroup>
                            {(itemTypeToAdd === 'product' ? productOptions : tagOptions).map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.value} // Use value for CommandItem value
                                onSelect={() => handleItemSelect(option.value)}
                                disabled={selectedItems.some(item => item.id === option.value && item.type === itemTypeToAdd)}
                                className="text-white hover:bg-[#343A40]"
                              >
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {/* Display Selected Items */}
                  <ScrollArea className="h-32 mt-2 border border-[#343A40] rounded-md p-2 bg-[#1A1A2E]">
                    <div className="flex flex-wrap gap-2">
                      {selectedItems.length === 0 && (
                        <p className="text-sm text-gray-400 p-2">Nenhum item selecionado.</p>
                      )}
                      {selectedItems.map((item) => (
                        <Badge key={`${item.type}-${item.id}`} className="bg-[#495057] text-white hover:bg-[#6C757D]">
                          {getItemName(item.id, item.type, products, tags)}
                          <button 
                            type="button" 
                            onClick={() => handleItemRemove(item.id, item.type)} 
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            aria-label={`Remover ${getItemName(item.id, item.type, products, tags)}`}
                          >
                            <span className="text-xs">×</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading || selectedItems.length === 0} className="bg-[#007BFF] hover:bg-[#0056B3] text-white">
                {isLoading ? 'Salvando...' : (currentSection ? 'Salvar Alterações' : 'Adicionar Seção')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductSectionManager;

