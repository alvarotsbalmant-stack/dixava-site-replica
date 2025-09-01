import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayoutItemConfig, Xbox4OffersConfig } from '@/types/xbox4Admin';

interface Xbox4OffersManagerProps {
  initialConfig: PageLayoutItemConfig | null;
  onSave: (config: PageLayoutItemConfig) => void;
}

const Xbox4OffersManager: React.FC<Xbox4OffersManagerProps> = ({ initialConfig, onSave }) => {
  const [offers, setOffers] = useState<Array<{ 
    id: string; 
    title: string; 
    description: string; 
    imageUrl?: string; 
    link: string; 
    discount?: string 
  }>>([]);
  
  const [layout, setLayout] = useState<string>('grid');
  
  // New offer state
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferDescription, setNewOfferDescription] = useState('');
  const [newOfferImage, setNewOfferImage] = useState('');
  const [newOfferLink, setNewOfferLink] = useState('');
  const [newOfferDiscount, setNewOfferDiscount] = useState('');

  // Load initial config if available
  useEffect(() => {
    if (initialConfig && initialConfig.offers) {
      const { offers: offersConfig } = initialConfig;
      
      if (offersConfig.offers && Array.isArray(offersConfig.offers)) {
        setOffers(offersConfig.offers);
      }
      
      if (offersConfig.layout) {
        setLayout(offersConfig.layout);
      }
    }
  }, [initialConfig]);

  const addOffer = () => {
    if (newOfferTitle && newOfferDescription && newOfferLink) {
      setOffers([...offers, {
        id: `offer-${Date.now()}`,
        title: newOfferTitle,
        description: newOfferDescription,
        imageUrl: newOfferImage || undefined,
        link: newOfferLink,
        discount: newOfferDiscount || undefined
      }]);
      setNewOfferTitle('');
      setNewOfferDescription('');
      setNewOfferImage('');
      setNewOfferLink('');
      setNewOfferDiscount('');
    }
  };

  const removeOffer = (index: number) => {
    setOffers(offers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Prepare the configuration object according to the expected structure
    const offersConfig: Xbox4OffersConfig = {
      offers,
      layout
    };

    // Create the full config object to be saved
    const config: PageLayoutItemConfig = {
      offers: offersConfig
    };

    // Call the parent's onSave function
    onSave(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Ofertas Especiais</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Configure as ofertas especiais que aparecem na página /xbox4.</p>

        <h3 className="text-xl font-semibold mb-4">Configurações de Layout</h3>
        <div className="grid grid-cols-4 items-center gap-4 mb-6">
          <Label htmlFor="layout" className="text-right">Layout</Label>
          <Select value={layout} onValueChange={(value) => setLayout(value)}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="carousel">Carrossel</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="featured">Destaque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <h3 className="text-xl font-semibold mb-4">Ofertas</h3>
        <div className="space-y-4 mb-6">
          {offers.map((offer, index) => (
            <div key={index} className="border p-4 rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => removeOffer(index)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
              <div className="grid gap-2">
                <p><strong>Título:</strong> {offer.title}</p>
                <p><strong>Descrição:</strong> {offer.description}</p>
                <p><strong>Link:</strong> {offer.link}</p>
                {offer.imageUrl && <p><strong>Imagem:</strong> {offer.imageUrl}</p>}
                {offer.discount && <p><strong>Desconto:</strong> {offer.discount}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 py-4 mb-6 border-t pt-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offer-title" className="text-right">Título da Oferta</Label>
            <Input 
              id="offer-title" 
              className="col-span-3" 
              value={newOfferTitle}
              onChange={(e) => setNewOfferTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offer-description" className="text-right">Descrição</Label>
            <Input 
              id="offer-description" 
              className="col-span-3" 
              value={newOfferDescription}
              onChange={(e) => setNewOfferDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offer-image" className="text-right">URL da Imagem</Label>
            <Input 
              id="offer-image" 
              className="col-span-3" 
              value={newOfferImage}
              onChange={(e) => setNewOfferImage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offer-link" className="text-right">Link</Label>
            <Input 
              id="offer-link" 
              className="col-span-3" 
              value={newOfferLink}
              onChange={(e) => setNewOfferLink(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offer-discount" className="text-right">Desconto</Label>
            <Input 
              id="offer-discount" 
              className="col-span-3" 
              value={newOfferDiscount}
              onChange={(e) => setNewOfferDiscount(e.target.value)}
              placeholder="Ex: 20% OFF"
            />
          </div>
          <Button onClick={addOffer} className="ml-auto">
            <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Oferta
          </Button>
        </div>

        <Button onClick={handleSave} className="w-full">Salvar Todas as Configurações</Button>
      </CardContent>
    </Card>
  );
};

export default Xbox4OffersManager;
