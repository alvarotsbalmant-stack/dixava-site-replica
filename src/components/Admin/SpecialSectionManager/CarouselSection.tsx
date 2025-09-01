import React, { useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Package, Settings, Search, Tag, ShoppingCart, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Tag {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price?: number;
  image_url?: string;
}

interface CarouselConfig {
  title: string;
  selection_mode: 'tags' | 'products' | 'combined';
  tag_ids: string[];
  product_ids: string[];
}

interface CarouselSectionProps {
  control: Control<any>;
  carouselKey: 'carrossel_1' | 'carrossel_2';
  carouselValue: CarouselConfig;
  tags: Tag[];
  products: Product[];
  tagsLoading: boolean;
  productsLoading: boolean;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  control,
  carouselKey,
  carouselValue,
  tags,
  products,
  tagsLoading,
  productsLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const carouselNumber = carouselKey === 'carrossel_1' ? '1' : '2';

  // Filtrar produtos para busca
  const filteredProducts = products.filter(product => {
    const nameMatch = product.name && typeof product.name === 'string' 
                      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) 
                      : false;
    const idMatch = product.id && typeof product.id === 'string' 
                     ? product.id.toLowerCase().includes(searchTerm.toLowerCase()) 
                     : false;
    return nameMatch || idMatch;
  });

  // Obter produtos selecionados para preview
  const selectedProducts = products.filter(product => 
    carouselValue?.product_ids?.includes(product.id)
  );

  // Obter tags selecionadas para preview
  const selectedTags = tags.filter(tag => 
    carouselValue?.tag_ids?.includes(tag.id)
  );

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Carrossel de Produtos {carouselNumber}
          </h2>
          <p className="text-gray-400 mt-1">
            Configure o {carouselNumber === '1' ? 'primeiro' : 'segundo'} carrossel de produtos da seção especial
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Ocultar Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Preview
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Título do Carrossel */}
          <Card className="bg-[#2C2C44] border-[#343A40]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Configurações de Título
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título Simples */}
              <div className="space-y-2">
                <Label className="text-yellow-400 flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4" />
                  Título Simples (ou deixe vazio para usar título bicolor)
                </Label>
                <Controller
                  name={`${carouselKey}.title`}
                  control={control}
                  render={({ field }) => (
                    <Input 
                      {...field}
                      className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500" 
                      placeholder="Digite o título simples (opcional)"
                    />
                  )}
                />
              </div>

              {/* Título Bicolor - Parte 1 */}
              <div className="space-y-2">
                <Label className="text-green-400 flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4" />
                  Título Parte 1 (ex: "Most Popular")
                </Label>
                <div className="flex gap-2">
                  <Controller
                    name={`${carouselKey}.titlePart1`}
                    control={control}
                    render={({ field }) => (
                      <Input 
                        {...field}
                        className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 flex-1" 
                        placeholder="Primeira parte do título"
                      />
                    )}
                  />
                  <Controller
                    name={`${carouselKey}.titleColor1`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="color"
                        {...field}
                        className="w-12 h-10 rounded border border-[#343A40] bg-[#1A1A2E] cursor-pointer"
                        title="Cor da primeira parte"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Título Bicolor - Parte 2 */}
              <div className="space-y-2">
                <Label className="text-purple-400 flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4" />
                  Título Parte 2 (ex: "Trading Cards")
                </Label>
                <div className="flex gap-2">
                  <Controller
                    name={`${carouselKey}.titlePart2`}
                    control={control}
                    render={({ field }) => (
                      <Input 
                        {...field}
                        className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 flex-1" 
                        placeholder="Segunda parte do título"
                      />
                    )}
                  />
                  <Controller
                    name={`${carouselKey}.titleColor2`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="color"
                        {...field}
                        className="w-12 h-10 rounded border border-[#343A40] bg-[#1A1A2E] cursor-pointer"
                        title="Cor da segunda parte"
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Modo de Seleção */}
              <div className="space-y-2">
                <Label className="text-orange-400 flex items-center gap-2 font-medium">
                  <Settings className="w-4 h-4" />
                  Modo de Seleção de Produtos
                </Label>
                <Controller
                  name={`${carouselKey}.selection_mode`}
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={(value: 'tags' | 'products' | 'combined') => field.onChange(value)}
                    >
                      <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Selecione o modo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                        <SelectItem value="tags" className="text-white hover:bg-[#343A40]">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Por Tags
                          </div>
                        </SelectItem>
                        <SelectItem value="products" className="text-white hover:bg-[#343A40]">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Produtos Específicos
                          </div>
                        </SelectItem>
                        <SelectItem value="combined" className="text-white hover:bg-[#343A40]">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Combinado (Tags + Produtos)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seleção por Tags */}
          {(carouselValue?.selection_mode === 'tags' || carouselValue?.selection_mode === 'combined') && (
            <Card className="bg-[#2C2C44] border-[#343A40]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Badge className="bg-[#9370DB] text-white">
                    <Tag className="h-3 w-3 mr-1" />
                    Tags
                  </Badge>
                  Selecione as Tags
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Produtos serão selecionados automaticamente com base nas tags escolhidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#9370DB]" />
                    <span className="ml-2 text-gray-400">Carregando tags...</span>
                  </div>
                ) : tags.length === 0 ? (
                  <Alert className="border-yellow-500 bg-yellow-500/10">
                    <AlertDescription className="text-yellow-400">
                      Nenhuma tag encontrada. Verifique se existem tags cadastradas no sistema.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-48 border rounded-md p-3 bg-[#1A1A2E] border-[#343A40]">
                    <div className="space-y-3">
                      {tags.map(tag => (
                        <div key={tag.id} className="flex items-center space-x-3">
                          <Controller
                            name={`${carouselKey}.tag_ids`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`tag-${tag.id}-${carouselKey}`}
                                checked={field.value?.includes(tag.id)}
                                onCheckedChange={(checked) => {
                                  const currentTags = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentTags, tag.id]);
                                  } else {
                                    field.onChange(currentTags.filter((id: string) => id !== tag.id));
                                  }
                                }}
                              />
                            )}
                          />
                          <Label 
                            htmlFor={`tag-${tag.id}-${carouselKey}`} 
                            className="text-sm text-gray-300 cursor-pointer flex-1"
                          >
                            {tag.name}
                          </Label>
                          <Badge variant="outline" className="text-xs border-[#9370DB] text-[#9370DB]">
                            Tag
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}

          {/* Seleção por Produtos */}
          {(carouselValue?.selection_mode === 'products' || carouselValue?.selection_mode === 'combined') && (
            <Card className="bg-[#2C2C44] border-[#343A40]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Badge className="bg-[#28A745] text-white">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Produtos
                  </Badge>
                  Selecione os Produtos
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Escolha produtos específicos para exibir no carrossel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca de produtos */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos por nome ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 pl-10"
                  />
                </div>

                {productsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#28A745]" />
                    <span className="ml-2 text-gray-400">Carregando produtos...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <Alert className="border-yellow-500 bg-yellow-500/10">
                    <AlertDescription className="text-yellow-400">
                      {searchTerm ? 'Nenhum produto encontrado com esse termo de busca.' : 'Nenhum produto encontrado no sistema.'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-64 border rounded-md p-3 bg-[#1A1A2E] border-[#343A40]">
                    <div className="space-y-3">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="flex items-center space-x-3 p-2 rounded hover:bg-[#2C2C44] transition-colors">
                          <Controller
                            name={`${carouselKey}.product_ids`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`product-${product.id}-${carouselKey}`}
                                checked={field.value?.includes(product.id)}
                                onCheckedChange={(checked) => {
                                  const currentProducts = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentProducts, product.id]);
                                  } else {
                                    field.onChange(currentProducts.filter((id: string) => id !== product.id));
                                  }
                                }}
                              />
                            )}
                          />
                          
                          {/* Imagem do produto */}
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded border border-[#495057]"
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={`product-${product.id}-${carouselKey}`} 
                              className="text-sm text-gray-300 cursor-pointer block truncate"
                            >
                              {product.name || 'Produto sem nome'}
                            </Label>
                            <p className="text-xs text-gray-500 truncate">
                              ID: {product.id?.slice(0, 8)}...
                            </p>
                            {product.price && (
                              <p className="text-xs text-green-400">
                                R$ {product.price.toFixed(2)}
                              </p>
                            )}
                          </div>
                          
                          <Badge variant="outline" className="text-xs border-[#28A745] text-[#28A745]">
                            Produto
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-6">
            <Card className="bg-[#2C2C44] border-[#343A40]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-green-300 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview do Carrossel
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Visualização dos itens selecionados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Título do carrossel */}
                {carouselValue?.title && (
                  <div className="p-3 bg-[#1A1A2E] rounded border border-[#343A40]">
                    <h3 className="text-lg font-semibold text-white">{carouselValue.title}</h3>
                  </div>
                )}

                {/* Tags selecionadas */}
                {selectedTags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Tags Selecionadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <Badge key={tag.id} className="bg-[#9370DB] text-white">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produtos selecionados */}
                {selectedProducts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Produtos Selecionados ({selectedProducts.length}):
                    </h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {selectedProducts.map(product => (
                          <div key={product.id} className="flex items-center gap-3 p-2 bg-[#1A1A2E] rounded border border-[#343A40]">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">ID: {product.id?.slice(0, 8)}...</p>
                              {product.price && (
                                <p className="text-xs text-green-400">R$ {product.price.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Estado vazio */}
                {selectedTags.length === 0 && selectedProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum item selecionado</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Selecione tags ou produtos para ver o preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarouselSection;

