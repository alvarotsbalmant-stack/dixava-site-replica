
import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';

interface ProductConfigurationFormProps {
  product: Product;
  onSave: (productId: string, configurations: any) => void;
  onCancel: () => void;
}

const ProductConfigurationForm: React.FC<ProductConfigurationFormProps> = ({
  product,
  onSave,
  onCancel
}) => {
  // Estados para cada configuração
  const [productDescriptions, setProductDescriptions] = useState(
    product.product_descriptions || {
      short: '',
      detailed: '',
      technical: '',
      marketing: ''
    }
  );

  const [displayConfig, setDisplayConfig] = useState(
    product.display_config || {
      show_stock_counter: true,
      show_view_counter: true,
      custom_view_count: 0,
      show_urgency_banner: false,
      urgency_text: '',
      show_social_proof: false,
      social_proof_text: ''
    }
  );

  const [reviewsConfig, setReviewsConfig] = useState(
    product.reviews_config || {
      enabled: true,
      show_rating: true,
      show_count: true,
      allow_reviews: true,
      custom_rating: {
        value: 4.8,
        count: 127,
        use_custom: false
      }
    }
  );

  const [productVideos, setProductVideos] = useState(
    product.product_videos || []
  );

  const [productFaqs, setProductFaqs] = useState(
    product.product_faqs || []
  );

  const [productHighlights, setProductHighlights] = useState(
    product.product_highlights || []
  );

  const [trustIndicators, setTrustIndicators] = useState(
    product.trust_indicators || []
  );

  const [deliveryConfig, setDeliveryConfig] = useState(
    product.delivery_config || {
      custom_shipping_time: '',
      shipping_regions: [],
      express_available: false,
      pickup_locations: []
    }
  );

  const [breadcrumbConfig, setBreadcrumbConfig] = useState(
    product.breadcrumb_config || {
      custom_path: [],
      use_custom: false,
      show_breadcrumb: true
    }
  );

  // Funções para adicionar/remover itens
  const addVideo = () => {
    const newVideo = {
      id: `video-${Date.now()}`,
      title: '',
      url: '',
      thumbnail: '',
      duration: '',
      type: 'youtube' as const,
      order: productVideos.length + 1,
      is_featured: false
    };
    setProductVideos([...productVideos, newVideo]);
  };

  const removeVideo = (id: string) => {
    setProductVideos(productVideos.filter(video => video.id !== id));
  };

  const addFaq = () => {
    const newFaq = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      order: productFaqs.length + 1,
      is_visible: true,
      category: ''
    };
    setProductFaqs([...productFaqs, newFaq]);
  };

  const removeFaq = (id: string) => {
    setProductFaqs(productFaqs.filter(faq => faq.id !== id));
  };

  const addHighlight = () => {
    const newHighlight = {
      id: `highlight-${Date.now()}`,
      text: '',
      icon: 'star',
      order: productHighlights.length + 1,
      is_featured: true
    };
    setProductHighlights([...productHighlights, newHighlight]);
  };

  const removeHighlight = (id: string) => {
    setProductHighlights(productHighlights.filter(highlight => highlight.id !== id));
  };

  const addTrustIndicator = () => {
    const newIndicator = {
      id: `trust-${Date.now()}`,
      title: '',
      description: '',
      icon: 'shield',
      color: '#10B981',
      order: trustIndicators.length + 1,
      is_visible: true
    };
    setTrustIndicators([...trustIndicators, newIndicator]);
  };

  const removeTrustIndicator = (id: string) => {
    setTrustIndicators(trustIndicators.filter(indicator => indicator.id !== id));
  };

  const handleSave = () => {
    const configurations = {
      product_descriptions: productDescriptions,
      display_config: displayConfig,
      reviews_config: reviewsConfig,
      product_videos: productVideos,
      product_faqs: productFaqs,
      product_highlights: productHighlights,
      trust_indicators: trustIndicators,
      delivery_config: deliveryConfig,
      breadcrumb_config: breadcrumbConfig
    };
    
    onSave(product.id, configurations);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardHeader className="border-b border-[#343A40]">
          <CardTitle className="text-white">
            Configurações do Produto: {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="descriptions" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="descriptions">Descrições</TabsTrigger>
              <TabsTrigger value="display">Exibição</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="trust">Confiança</TabsTrigger>
            </TabsList>

            <TabsContent value="descriptions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Descrição Curta</Label>
                  <Textarea
                    value={productDescriptions.short}
                    onChange={(e) => setProductDescriptions({
                      ...productDescriptions,
                      short: e.target.value
                    })}
                    className="bg-[#343A40] border-[#6C757D] text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white">Descrição Detalhada</Label>
                  <Textarea
                    value={productDescriptions.detailed}
                    onChange={(e) => setProductDescriptions({
                      ...productDescriptions,
                      detailed: e.target.value
                    })}
                    className="bg-[#343A40] border-[#6C757D] text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white">Descrição Técnica</Label>
                  <Textarea
                    value={productDescriptions.technical}
                    onChange={(e) => setProductDescriptions({
                      ...productDescriptions,
                      technical: e.target.value
                    })}
                    className="bg-[#343A40] border-[#6C757D] text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white">Descrição Marketing</Label>
                  <Textarea
                    value={productDescriptions.marketing}
                    onChange={(e) => setProductDescriptions({
                      ...productDescriptions,
                      marketing: e.target.value
                    })}
                    className="bg-[#343A40] border-[#6C757D] text-white"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Mostrar Contador de Estoque</Label>
                    <Switch
                      checked={displayConfig.show_stock_counter}
                      onCheckedChange={(checked) => setDisplayConfig({
                        ...displayConfig,
                        show_stock_counter: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Mostrar Contador de Visualizações</Label>
                    <Switch
                      checked={displayConfig.show_view_counter}
                      onCheckedChange={(checked) => setDisplayConfig({
                        ...displayConfig,
                        show_view_counter: checked
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Visualizações Customizadas</Label>
                    <Input
                      type="number"
                      value={displayConfig.custom_view_count}
                      onChange={(e) => setDisplayConfig({
                        ...displayConfig,
                        custom_view_count: parseInt(e.target.value) || 0
                      })}
                      className="bg-[#343A40] border-[#6C757D] text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Banner de Urgência</Label>
                    <Switch
                      checked={displayConfig.show_urgency_banner}
                      onCheckedChange={(checked) => setDisplayConfig({
                        ...displayConfig,
                        show_urgency_banner: checked
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Texto de Urgência</Label>
                    <Input
                      value={displayConfig.urgency_text}
                      onChange={(e) => setDisplayConfig({
                        ...displayConfig,
                        urgency_text: e.target.value
                      })}
                      className="bg-[#343A40] border-[#6C757D] text-white"
                      placeholder="Ex: Últimas unidades!"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Prova Social</Label>
                    <Switch
                      checked={displayConfig.show_social_proof}
                      onCheckedChange={(checked) => setDisplayConfig({
                        ...displayConfig,
                        show_social_proof: checked
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Texto Prova Social</Label>
                    <Input
                      value={displayConfig.social_proof_text}
                      onChange={(e) => setDisplayConfig({
                        ...displayConfig,
                        social_proof_text: e.target.value
                      })}
                      className="bg-[#343A40] border-[#6C757D] text-white"
                      placeholder="Ex: Mais de 1000 clientes satisfeitos"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* Vídeos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Vídeos do Produto</h3>
                  <Button onClick={addVideo} size="sm" className="bg-[#007BFF] hover:bg-[#0056B3]">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vídeo
                  </Button>
                </div>
                <div className="space-y-4">
                  {productVideos.map((video, index) => (
                    <Card key={video.id} className="bg-[#343A40] border-[#6C757D]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary">Vídeo {index + 1}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVideo(video.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Título</Label>
                            <Input
                              value={video.title}
                              onChange={(e) => {
                                const updated = productVideos.map(v =>
                                  v.id === video.id ? { ...v, title: e.target.value } : v
                                );
                                setProductVideos(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">URL do Vídeo</Label>
                            <Input
                              value={video.url}
                              onChange={(e) => {
                                const updated = productVideos.map(v =>
                                  v.id === video.id ? { ...v, url: e.target.value } : v
                                );
                                setProductVideos(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Thumbnail</Label>
                            <Input
                              value={video.thumbnail}
                              onChange={(e) => {
                                const updated = productVideos.map(v =>
                                  v.id === video.id ? { ...v, thumbnail: e.target.value } : v
                                );
                                setProductVideos(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Duração</Label>
                            <Input
                              value={video.duration}
                              onChange={(e) => {
                                const updated = productVideos.map(v =>
                                  v.id === video.id ? { ...v, duration: e.target.value } : v
                                );
                                setProductVideos(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                              placeholder="Ex: 2:30"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">FAQ Personalizado</h3>
                  <Button onClick={addFaq} size="sm" className="bg-[#007BFF] hover:bg-[#0056B3]">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar FAQ
                  </Button>
                </div>
                <div className="space-y-4">
                  {productFaqs.map((faq, index) => (
                    <Card key={faq.id} className="bg-[#343A40] border-[#6C757D]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary">FAQ {index + 1}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFaq(faq.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Pergunta</Label>
                            <Input
                              value={faq.question}
                              onChange={(e) => {
                                const updated = productFaqs.map(f =>
                                  f.id === faq.id ? { ...f, question: e.target.value } : f
                                );
                                setProductFaqs(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Resposta</Label>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => {
                                const updated = productFaqs.map(f =>
                                  f.id === faq.id ? { ...f, answer: e.target.value } : f
                                );
                                setProductFaqs(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trust" className="space-y-6">
              {/* Configurações de Reviews */}
              <Card className="bg-[#343A40] border-[#6C757D]">
                <CardHeader>
                  <CardTitle className="text-white">Configurações de Avaliações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Avaliações Habilitadas</Label>
                      <Switch
                        checked={reviewsConfig.enabled}
                        onCheckedChange={(checked) => setReviewsConfig({
                          ...reviewsConfig,
                          enabled: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Mostrar Rating</Label>
                      <Switch
                        checked={reviewsConfig.show_rating}
                        onCheckedChange={(checked) => setReviewsConfig({
                          ...reviewsConfig,
                          show_rating: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Mostrar Contagem</Label>
                      <Switch
                        checked={reviewsConfig.show_count}
                        onCheckedChange={(checked) => setReviewsConfig({
                          ...reviewsConfig,
                          show_count: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Permitir Reviews</Label>
                      <Switch
                        checked={reviewsConfig.allow_reviews}
                        onCheckedChange={(checked) => setReviewsConfig({
                          ...reviewsConfig,
                          allow_reviews: checked
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Usar Rating Customizado</Label>
                    <Switch
                      checked={reviewsConfig.custom_rating?.use_custom || false}
                      onCheckedChange={(checked) => setReviewsConfig({
                        ...reviewsConfig,
                        custom_rating: {
                          ...reviewsConfig.custom_rating,
                          use_custom: checked
                        }
                      })}
                    />
                  </div>
                  
                  {reviewsConfig.custom_rating?.use_custom && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Rating Customizado</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={reviewsConfig.custom_rating?.value || 4.8}
                          onChange={(e) => setReviewsConfig({
                            ...reviewsConfig,
                            custom_rating: {
                              ...reviewsConfig.custom_rating,
                              value: parseFloat(e.target.value) || 4.8
                            }
                          })}
                          className="bg-[#2C2C44] border-[#6C757D] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Contagem Customizada</Label>
                        <Input
                          type="number"
                          value={reviewsConfig.custom_rating?.count || 127}
                          onChange={(e) => setReviewsConfig({
                            ...reviewsConfig,
                            custom_rating: {
                              ...reviewsConfig.custom_rating,
                              count: parseInt(e.target.value) || 127
                            }
                          })}
                          className="bg-[#2C2C44] border-[#6C757D] text-white"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Indicadores de Confiança</h3>
                  <Button onClick={addTrustIndicator} size="sm" className="bg-[#007BFF] hover:bg-[#0056B3]">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Indicador
                  </Button>
                </div>
                <div className="space-y-4">
                  {trustIndicators.map((indicator, index) => (
                    <Card key={indicator.id} className="bg-[#343A40] border-[#6C757D]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary">Indicador {index + 1}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTrustIndicator(indicator.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Título</Label>
                            <Input
                              value={indicator.title}
                              onChange={(e) => {
                                const updated = trustIndicators.map(t =>
                                  t.id === indicator.id ? { ...t, title: e.target.value } : t
                                );
                                setTrustIndicators(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Descrição</Label>
                            <Input
                              value={indicator.description}
                              onChange={(e) => {
                                const updated = trustIndicators.map(t =>
                                  t.id === indicator.id ? { ...t, description: e.target.value } : t
                                );
                                setTrustIndicators(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Ícone</Label>
                            <Input
                              value={indicator.icon}
                              onChange={(e) => {
                                const updated = trustIndicators.map(t =>
                                  t.id === indicator.id ? { ...t, icon: e.target.value } : t
                                );
                                setTrustIndicators(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white"
                              placeholder="Ex: shield, truck, clock"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Cor</Label>
                            <Input
                              type="color"
                              value={indicator.color}
                              onChange={(e) => {
                                const updated = trustIndicators.map(t =>
                                  t.id === indicator.id ? { ...t, color: e.target.value } : t
                                );
                                setTrustIndicators(updated);
                              }}
                              className="bg-[#2C2C44] border-[#6C757D] text-white h-10"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-[#343A40]">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#28A745] hover:bg-[#1E7E34]">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductConfigurationForm;
