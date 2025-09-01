import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Image, Video, Plus, X, Star, Upload, Link, Youtube, Play } from 'lucide-react';
import { ProductFormData, ProductVideo } from '@/types/product-extended';

interface MediaTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const MediaTab: React.FC<MediaTabProps> = ({ formData, onChange }) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideo, setNewVideo] = useState<Partial<ProductVideo>>({
    title: '',
    url: '',
    type: 'youtube',
    is_featured: false
  });

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      const currentImages = formData.additional_images || [];
      onChange('additional_images', [...currentImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = formData.additional_images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    onChange('additional_images', newImages);
  };

  const handleSetMainImage = (imageUrl: string) => {
    onChange('image', imageUrl);
  };

  const handleAddVideo = () => {
    if (newVideo.title && newVideo.url) {
      const currentVideos = formData.product_videos || [];
      const videoToAdd: ProductVideo = {
        id: `video-${Date.now()}`,
        title: newVideo.title,
        url: newVideo.url,
        thumbnail: extractThumbnail(newVideo.url, newVideo.type || 'youtube'),
        duration: '',
        type: newVideo.type || 'youtube',
        order: currentVideos.length + 1,
        is_featured: newVideo.is_featured || false
      };
      
      onChange('product_videos', [...currentVideos, videoToAdd]);
      setNewVideo({
        title: '',
        url: '',
        type: 'youtube',
        is_featured: false
      });
    }
  };

  const handleRemoveVideo = (videoId: string) => {
    const currentVideos = formData.product_videos || [];
    const newVideos = currentVideos.filter(v => v.id !== videoId);
    onChange('product_videos', newVideos);
  };

  const extractThumbnail = (url: string, type: string): string => {
    if (type === 'youtube') {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    }
    return '';
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const allImages = [
    ...(formData.image ? [formData.image] : []),
    ...(formData.additional_images || [])
  ];

  return (
    <div className="space-y-6">
      {/* Imagem Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Imagem Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="main_image">URL da Imagem Principal</Label>
            <Input
              id="main_image"
              value={formData.image}
              onChange={(e) => onChange('image', e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="mt-1"
            />
          </div>

          {formData.image && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
              <img
                src={formData.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Galeria de Imagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Galeria de Imagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="URL da imagem adicional"
              className="flex-1"
            />
            <Button onClick={handleAddImage} disabled={!newImageUrl.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {allImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                  
                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    {imageUrl !== formData.image && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetMainImage(imageUrl)}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index - 1)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Badge para imagem principal */}
                  {imageUrl === formData.image && (
                    <Badge className="absolute top-2 left-2 bg-blue-600">
                      Principal
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {allImages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma imagem adicionada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vídeos do Produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Vídeos do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Adicionar novo vídeo */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900">Adicionar Vídeo</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="video_title">Título do Vídeo</Label>
                <Input
                  id="video_title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Gameplay Trailer"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="video_type">Tipo</Label>
                <select
                  id="video_type"
                  value={newVideo.type}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="mp4">MP4 (Upload)</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={newVideo.url}
                onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="video_featured"
                checked={newVideo.is_featured}
                onCheckedChange={(checked) => setNewVideo(prev => ({ ...prev, is_featured: checked as boolean }))}
              />
              <Label htmlFor="video_featured">Vídeo em destaque</Label>
            </div>

            <Button 
              onClick={handleAddVideo} 
              disabled={!newVideo.title || !newVideo.url}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </div>

          {/* Lista de vídeos */}
          {formData.product_videos && formData.product_videos.length > 0 ? (
            <div className="space-y-3">
              {formData.product_videos.map((video) => (
                <div key={video.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-20 h-14 bg-gray-200 rounded flex items-center justify-center">
                        {video.type === 'youtube' && <Youtube className="w-6 h-6 text-red-600" />}
                        {video.type === 'vimeo' && <Play className="w-6 h-6 text-blue-600" />}
                        {video.type === 'mp4' && <Video className="w-6 h-6 text-gray-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{video.title}</h4>
                        <p className="text-sm text-gray-500 truncate">{video.url}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {video.type.toUpperCase()}
                          </Badge>
                          {video.is_featured && (
                            <Badge className="text-xs bg-blue-600">
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveVideo(video.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum vídeo adicionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaTab;

