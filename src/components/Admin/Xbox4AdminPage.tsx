import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePages, PageLayoutItem } from '@/hooks/usePages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Xbox4FeaturedProductsManager from '@/components/Admin/Xbox4Admin/Xbox4FeaturedProductsManager';
import { PageLayoutItemConfig } from '@/types/xbox4Admin';
import { Gamepad2, Package, Headphones, Percent, Newspaper, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Xbox4AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('consoles');
  const { getPageBySlug, fetchPageLayout, updatePageLayout, addPageSection, loading, error } = usePages();
  const [xbox4PageId, setXbox4PageId] = useState<string | null>(null);
  const [pageLayoutItems, setPageLayoutItems] = useState<PageLayoutItem[]>([]);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  
  // Configurações para cada seção
  const [consolesConfig, setConsolesConfig] = useState<PageLayoutItemConfig | null>(null);
  const [gamesConfig, setGamesConfig] = useState<PageLayoutItemConfig | null>(null);
  const [accessoriesConfig, setAccessoriesConfig] = useState<PageLayoutItemConfig | null>(null);
  const [offersConfig, setOffersConfig] = useState<PageLayoutItemConfig | null>(null);
  const [newsConfig, setNewsConfig] = useState<PageLayoutItemConfig | null>(null);

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoadingPageData(true);
      const page = getPageBySlug('xbox4');
      if (page) {
        setXbox4PageId(page.id);
        const layout = await fetchPageLayout(page.id);
        setPageLayoutItems(layout);
        
        // Ensure the offers section exists
        const offersSection = layout.find(item => 
          item.section_key === 'xbox4_offers' || 
          item.section_key === 'xbox4_deals' || 
          item.title === 'OFERTAS IMPERDÍVEIS'
        );
        
        if (!offersSection) {
          console.log('[Xbox4AdminPage] Creating missing OFERTAS IMPERDÍVEIS section');
          try {
            const newOffersSection: Omit<PageLayoutItem, 'id'> = {
              page_id: page.id,
              section_key: 'xbox4_deals',
              title: 'OFERTAS IMPERDÍVEIS',
              display_order: 4,
              is_visible: true,
              section_type: 'products',
              sectionConfig: {
                filter: { tagIds: ['xbox', 'offer'], limit: 4 },
                products: []
              } as any,
            };

            const createdSection = await addPageSection(page.id, newOffersSection);
            if (createdSection) {
              setPageLayoutItems(prev => [...prev, createdSection]);
            }
          } catch (error) {
            console.error('[Xbox4AdminPage] Error creating offers section:', error);
          }
        }
        
        // Carregar configurações existentes para cada seção
        const consolesSection = layout.find(item => item.section_key === 'xbox4_consoles');
        if (consolesSection && consolesSection.sectionConfig) {
          setConsolesConfig(consolesSection.sectionConfig);
        }
        
        const gamesSection = layout.find(item => item.section_key === 'xbox4_games');
        if (gamesSection && gamesSection.sectionConfig) {
          setGamesConfig(gamesSection.sectionConfig);
        }
        
        const accessoriesSection = layout.find(item => item.section_key === 'xbox4_accessories');
        if (accessoriesSection && accessoriesSection.sectionConfig) {
          setAccessoriesConfig(accessoriesSection.sectionConfig);
        }
        
        const finalOffersSection = layout.find(item => 
          item.section_key === 'xbox4_offers' || 
          item.section_key === 'xbox4_deals' || 
          item.title === 'OFERTAS IMPERDÍVEIS'
        ) || offersSection;
        
        if (finalOffersSection && finalOffersSection.sectionConfig) {
          setOffersConfig(finalOffersSection.sectionConfig);
        }
        
        const newsSection = layout.find(item => item.section_key === 'xbox4_news');
        if (newsSection && newsSection.sectionConfig) {
          setNewsConfig(newsSection.sectionConfig);
        }
      } else {
        console.error('Página /xbox4 não encontrada no Supabase.');
      }
      setIsLoadingPageData(false);
    };
    loadPageData();
  }, [getPageBySlug, fetchPageLayout, addPageSection]);

  // CORREÇÃO CRÍTICA no salvamento de configurações
  const handleSaveSection = useCallback(async (sectionKey: string, config: PageLayoutItemConfig) => {
    if (!xbox4PageId) {
      console.error('xbox4PageId não disponível para salvar a configuração.');
      return;
    }

    try {
      const existingItem = pageLayoutItems.find(item => item.section_key === sectionKey);

      if (existingItem) {
        // IMPORTANTE: Preservar a estrutura existente do section_config
        const updatedConfig = {
          ...existingItem.sectionConfig,
          ...config // Mesclar nova configuração com a existente
        };
        
        console.log(`Salvando configuração para ${sectionKey}:`, updatedConfig);
        
        // Update existing section
        const updatedLayoutItems = pageLayoutItems.map(item =>
          item.section_key === sectionKey
            ? { ...item, sectionConfig: updatedConfig as any }
            : item
        );

        await updatePageLayout(xbox4PageId, updatedLayoutItems);
        setPageLayoutItems(updatedLayoutItems);
        
        console.log(`Configuração salva com sucesso para ${sectionKey}:`, updatedConfig);
      } else {
        // Create new section
        console.log('Creating new section:', sectionKey);
        const sectionTitles: Record<string, string> = {
          'xbox4_consoles': 'CONSOLES XBOX',
          'xbox4_games': 'JOGOS EM ALTA',
          'xbox4_accessories': 'ACESSÓRIOS XBOX',
          'xbox4_offers': 'OFERTAS IMPERDÍVEIS',
          'xbox4_deals': 'OFERTAS IMPERDÍVEIS',
          'xbox4_news': 'NOTÍCIAS & TRAILERS'
        };
        
        const newSectionData: Omit<PageLayoutItem, 'id'> = {
          page_id: xbox4PageId,
          section_key: sectionKey,
          title: sectionTitles[sectionKey] || 'Nova Seção',
          display_order: pageLayoutItems.length + 1,
          is_visible: true,
          section_type: sectionKey === 'xbox4_news' ? 'news' : 'products',
          sectionConfig: config as any,
        };

        const newSection = await addPageSection(xbox4PageId, newSectionData);
        if (newSection) {
          setPageLayoutItems(prev => [...prev, newSection]);
        }
      }
      
      // Update local state for the specific section
      switch (sectionKey) {
        case 'xbox4_consoles':
          setConsolesConfig(config);
          break;
        case 'xbox4_games':
          setGamesConfig(config);
          break;
        case 'xbox4_accessories':
          setAccessoriesConfig(config);
          break;
        case 'xbox4_offers':
        case 'xbox4_deals':
          setOffersConfig(config);
          break;
        case 'xbox4_news':
          setNewsConfig(config);
          break;
      }
      
    } catch (err) {
      console.error('Erro ao salvar configuração:', err);
    }
  }, [xbox4PageId, pageLayoutItems, updatePageLayout, addPageSection]);

  if (isLoadingPageData) {
    return (
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#007BFF] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando configurações da página Xbox 4...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardContent className="p-6 text-center">
          <p className="text-[#DC3545]">Erro ao carregar configurações: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#2C2C44] border-[#343A40]">
      <CardHeader className="border-b border-[#343A40] pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Gamepad2 className="w-6 h-6 text-[#107C10]" />
          Xbox 4 - Personalização
        </CardTitle>
        
        <Alert className="mt-3 bg-[#1A1A2E] border-[#343A40] text-gray-300">
          <AlertCircle className="h-4 w-4 text-[#107C10]" />
          <AlertDescription>
            <strong>Página Xbox Personalizada:</strong> Configure seções específicas da página /xbox4 com produtos, ofertas e notícias temáticas do Xbox.
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-[#343A40] border-[#495057]">
            <TabsTrigger 
              value="consoles" 
              className="data-[state=active]:bg-[#107C10] data-[state=active]:text-white text-gray-300"
            >
              <Package className="w-4 h-4 mr-2" />
              CONSOLES
            </TabsTrigger>
            <TabsTrigger 
              value="games"
              className="data-[state=active]:bg-[#107C10] data-[state=active]:text-white text-gray-300"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              JOGOS
            </TabsTrigger>
            <TabsTrigger 
              value="accessories"
              className="data-[state=active]:bg-[#107C10] data-[state=active]:text-white text-gray-300"
            >
              <Headphones className="w-4 h-4 mr-2" />
              ACESSÓRIOS
            </TabsTrigger>
            <TabsTrigger 
              value="offers"
              className="data-[state=active]:bg-[#107C10] data-[state=active]:text-white text-gray-300"
            >
              <Percent className="w-4 h-4 mr-2" />
              OFERTAS
            </TabsTrigger>
            <TabsTrigger 
              value="news"
              className="data-[state=active]:bg-[#107C10] data-[state=active]:text-white text-gray-300"
            >
              <Newspaper className="w-4 h-4 mr-2" />
              NOTÍCIAS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consoles">
            <Xbox4FeaturedProductsManager
              initialConfig={consolesConfig}
              onSave={(config) => handleSaveSection('xbox4_consoles', config)}
              sectionTitle="CONSOLES XBOX"
              defaultTags={['xbox', 'console']}
            />
          </TabsContent>

          <TabsContent value="games">
            <Xbox4FeaturedProductsManager
              initialConfig={gamesConfig}
              onSave={(config) => handleSaveSection('xbox4_games', config)}
              sectionTitle="JOGOS EM ALTA"
              defaultTags={['xbox', 'game']}
            />
          </TabsContent>

          <TabsContent value="accessories">
            <Xbox4FeaturedProductsManager
              initialConfig={accessoriesConfig}
              onSave={(config) => handleSaveSection('xbox4_accessories', config)}
              sectionTitle="ACESSÓRIOS XBOX"
              defaultTags={['xbox', 'accessory']}
            />
          </TabsContent>

          <TabsContent value="offers">
            <Xbox4FeaturedProductsManager
              initialConfig={offersConfig}
              onSave={(config) => handleSaveSection('xbox4_deals', config)}
              sectionTitle="OFERTAS IMPERDÍVEIS"
              defaultTags={['xbox', 'offer']}
            />
          </TabsContent>

          <TabsContent value="news">
            <Card className="bg-[#343A40] border-[#495057]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Newspaper className="w-5 h-5 text-[#107C10]" />
                  Gerenciar Notícias e Trailers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Aqui você poderá escolher ou cadastrar as notícias e trailers que aparecem na seção de notícias da página /xbox4.
                </p>
                <Alert className="bg-[#1A1A2E] border-[#343A40] text-gray-300">
                  <Settings className="h-4 w-4 text-[#FFC107]" />
                  <AlertDescription>
                    Esta funcionalidade será implementada em breve.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Xbox4AdminPage;
