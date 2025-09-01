import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayoutItemConfig, Xbox4NewsConfig } from '@/types/xbox4Admin';

interface Xbox4NewsManagerProps {
  initialConfig: PageLayoutItemConfig | null;
  onSave: (config: PageLayoutItemConfig) => void;
}

const Xbox4NewsManager: React.FC<Xbox4NewsManagerProps> = ({ initialConfig, onSave }) => {
  const [newsItems, setNewsItems] = useState<Array<{ id: string; title: string; imageUrl?: string; link: string }>>([]);
  const [trailerItems, setTrailerItems] = useState<Array<{ id: string; title: string; videoUrl: string; thumbnailUrl?: string }>>([]);
  const [layout, setLayout] = useState<string>('carousel');
  
  // New item states
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsImage, setNewNewsImage] = useState('');
  const [newNewsLink, setNewNewsLink] = useState('');
  
  const [newTrailerTitle, setNewTrailerTitle] = useState('');
  const [newTrailerVideo, setNewTrailerVideo] = useState('');
  const [newTrailerThumbnail, setNewTrailerThumbnail] = useState('');

  // Load initial config if available
  useEffect(() => {
    if (initialConfig && initialConfig.news) {
      const { news: newsConfig } = initialConfig;
      
      if (newsConfig.newsItems && Array.isArray(newsConfig.newsItems)) {
        setNewsItems(newsConfig.newsItems);
      }
      
      if (newsConfig.trailerItems && Array.isArray(newsConfig.trailerItems)) {
        setTrailerItems(newsConfig.trailerItems);
      }
      
      if (newsConfig.layout) {
        setLayout(newsConfig.layout);
      }
    }
  }, [initialConfig]);

  const addNewsItem = () => {
    if (newNewsTitle && newNewsLink) {
      setNewsItems([...newsItems, {
        id: `news-${Date.now()}`,
        title: newNewsTitle,
        imageUrl: newNewsImage || undefined,
        link: newNewsLink
      }]);
      setNewNewsTitle('');
      setNewNewsImage('');
      setNewNewsLink('');
    }
  };

  const removeNewsItem = (index: number) => {
    setNewsItems(newsItems.filter((_, i) => i !== index));
  };

  const addTrailerItem = () => {
    if (newTrailerTitle && newTrailerVideo) {
      setTrailerItems([...trailerItems, {
        id: `trailer-${Date.now()}`,
        title: newTrailerTitle,
        videoUrl: newTrailerVideo,
        thumbnailUrl: newTrailerThumbnail || undefined
      }]);
      setNewTrailerTitle('');
      setNewTrailerVideo('');
      setNewTrailerThumbnail('');
    }
  };

  const removeTrailerItem = (index: number) => {
    setTrailerItems(trailerItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Prepare the configuration object according to the expected structure
    const newsConfig: Xbox4NewsConfig = {
      newsItems,
      trailerItems,
      layout
    };

    // Create the full config object to be saved
    const config: PageLayoutItemConfig = {
      news: newsConfig
    };

    // Call the parent's onSave function
    onSave(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Notícias e Trailers</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Configure as notícias e trailers que aparecem na página /xbox4.</p>

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

        <h3 className="text-xl font-semibold mb-4">Notícias</h3>
        <div className="space-y-4 mb-6">
          {newsItems.map((item, index) => (
            <div key={index} className="border p-4 rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => removeNewsItem(index)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
              <div className="grid gap-2">
                <p><strong>Título:</strong> {item.title}</p>
                <p><strong>Link:</strong> {item.link}</p>
                {item.imageUrl && <p><strong>Imagem:</strong> {item.imageUrl}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 py-4 mb-6 border-t pt-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="news-title" className="text-right">Título da Notícia</Label>
            <Input 
              id="news-title" 
              className="col-span-3" 
              value={newNewsTitle}
              onChange={(e) => setNewNewsTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="news-image" className="text-right">URL da Imagem</Label>
            <Input 
              id="news-image" 
              className="col-span-3" 
              value={newNewsImage}
              onChange={(e) => setNewNewsImage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="news-link" className="text-right">Link</Label>
            <Input 
              id="news-link" 
              className="col-span-3" 
              value={newNewsLink}
              onChange={(e) => setNewNewsLink(e.target.value)}
            />
          </div>
          <Button onClick={addNewsItem} className="ml-auto">
            <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Notícia
          </Button>
        </div>

        <h3 className="text-xl font-semibold mb-4 border-t pt-6">Trailers</h3>
        <div className="space-y-4 mb-6">
          {trailerItems.map((item, index) => (
            <div key={index} className="border p-4 rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => removeTrailerItem(index)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
              <div className="grid gap-2">
                <p><strong>Título:</strong> {item.title}</p>
                <p><strong>URL do Vídeo:</strong> {item.videoUrl}</p>
                {item.thumbnailUrl && <p><strong>Thumbnail:</strong> {item.thumbnailUrl}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 py-4 mb-6 border-t pt-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trailer-title" className="text-right">Título do Trailer</Label>
            <Input 
              id="trailer-title" 
              className="col-span-3" 
              value={newTrailerTitle}
              onChange={(e) => setNewTrailerTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trailer-video" className="text-right">URL do Vídeo</Label>
            <Input 
              id="trailer-video" 
              className="col-span-3" 
              value={newTrailerVideo}
              onChange={(e) => setNewTrailerVideo(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trailer-thumbnail" className="text-right">URL da Thumbnail</Label>
            <Input 
              id="trailer-thumbnail" 
              className="col-span-3" 
              value={newTrailerThumbnail}
              onChange={(e) => setNewTrailerThumbnail(e.target.value)}
            />
          </div>
          <Button onClick={addTrailerItem} className="ml-auto">
            <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Trailer
          </Button>
        </div>

        <Button onClick={handleSave} className="w-full">Salvar Todas as Configurações</Button>
      </CardContent>
    </Card>
  );
};

export default Xbox4NewsManager;
