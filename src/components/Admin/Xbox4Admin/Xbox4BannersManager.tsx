import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayoutItemConfig, Xbox4BannersConfig } from '@/types/xbox4Admin';

interface Xbox4BannersManagerProps {
  initialConfig: PageLayoutItemConfig | null;
  onSave: (config: PageLayoutItemConfig) => void;
}

const Xbox4BannersManager: React.FC<Xbox4BannersManagerProps> = ({ initialConfig, onSave }) => {
  const [banners, setBanners] = useState<Array<{ 
    id: string; 
    imageUrl: string; 
    link: string; 
    altText?: string 
  }>>([]);
  
  const [layout, setLayout] = useState<string>('carousel');
  
  // New banner state
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('');
  const [newBannerAlt, setNewBannerAlt] = useState('');

  // Load initial config if available
  useEffect(() => {
    if (initialConfig && initialConfig.banners) {
      const { banners: bannersConfig } = initialConfig;
      
      if (bannersConfig.banners && Array.isArray(bannersConfig.banners)) {
        setBanners(bannersConfig.banners);
      }
      
      if (bannersConfig.layout) {
        setLayout(bannersConfig.layout);
      }
    }
  }, [initialConfig]);

  const addBanner = () => {
    if (newBannerImage && newBannerLink) {
      setBanners([...banners, {
        id: `banner-${Date.now()}`,
        imageUrl: newBannerImage,
        link: newBannerLink,
        altText: newBannerAlt || undefined
      }]);
      setNewBannerImage('');
      setNewBannerLink('');
      setNewBannerAlt('');
    }
  };

  const removeBanner = (index: number) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Prepare the configuration object according to the expected structure
    const bannersConfig: Xbox4BannersConfig = {
      banners,
      layout
    };

    // Create the full config object to be saved
    const config: PageLayoutItemConfig = {
      banners: bannersConfig
    };

    // Call the parent's onSave function
    onSave(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Banners Secundários</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Configure os banners secundários que aparecem na página /xbox4.</p>

        <h3 className="text-xl font-semibold mb-4">Configurações de Layout</h3>
        <div className="grid grid-cols-4 items-center gap-4 mb-6">
          <Label htmlFor="layout" className="text-right">Layout</Label>
          <Select value={layout} onValueChange={(value) => setLayout(value)}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="carousel">Carrossel</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="stacked">Empilhado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <h3 className="text-xl font-semibold mb-4">Banners</h3>
        <div className="space-y-4 mb-6">
          {banners.map((banner, index) => (
            <div key={index} className="border p-4 rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => removeBanner(index)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
              <div className="grid gap-2">
                <p><strong>Imagem:</strong> {banner.imageUrl}</p>
                <p><strong>Link:</strong> {banner.link}</p>
                {banner.altText && <p><strong>Texto Alternativo:</strong> {banner.altText}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 py-4 mb-6 border-t pt-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="banner-image" className="text-right">URL da Imagem</Label>
            <Input 
              id="banner-image" 
              className="col-span-3" 
              value={newBannerImage}
              onChange={(e) => setNewBannerImage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="banner-link" className="text-right">Link</Label>
            <Input 
              id="banner-link" 
              className="col-span-3" 
              value={newBannerLink}
              onChange={(e) => setNewBannerLink(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="banner-alt" className="text-right">Texto Alternativo</Label>
            <Input 
              id="banner-alt" 
              className="col-span-3" 
              value={newBannerAlt}
              onChange={(e) => setNewBannerAlt(e.target.value)}
            />
          </div>
          <Button onClick={addBanner} className="ml-auto">
            <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Banner
          </Button>
        </div>

        <Button onClick={handleSave} className="w-full">Salvar Todas as Configurações</Button>
      </CardContent>
    </Card>
  );
};

export default Xbox4BannersManager;
