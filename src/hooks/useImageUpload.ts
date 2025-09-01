
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Função para converter imagem para WebP com alta qualidade
  const convertToWebP = (file: File, quality: number = 0.95): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Para imagens de header/site, manter resolução alta
        const maxWidth = 2000;
        const maxHeight = 1000;
        
        let { width, height } = img;
        
        // Redimensionar apenas se for muito grande
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;

        // Configurar contexto para alta qualidade
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Converter para WebP com alta qualidade
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(webpFile);
            } else {
              reject(new Error('Falha na conversão para WebP'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file: File, folder: string = 'general', disableCompression: boolean = false): Promise<string | null> => {
    setUploading(true);
    
    try {
      let processedFile = file;

      // Converter para WebP apenas se a compressão não estiver desabilitada
      if (!disableCompression && file.type !== 'image/webp') {
        try {
          // Para imagens de site/header, usar qualidade máxima
          const quality = folder === 'site-images' ? 0.95 : 0.85;
          processedFile = await convertToWebP(file, quality);
          console.log(`Imagem convertida para WebP (qualidade ${quality}): ${file.size} bytes → ${processedFile.size} bytes`);
        } catch (conversionError) {
          console.warn('Falha na conversão para WebP, usando arquivo original:', conversionError);
          // Continua com o arquivo original se a conversão falhar
        }
      } else if (disableCompression) {
        console.log('Compressão desabilitada, mantendo arquivo original');
      }

      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('site-images')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      // Trigger scan automático para atualizar estatísticas
      try {
        await supabase.functions.invoke('storage-manager', {
          body: JSON.stringify({ action: 'scan' })
        });
        console.log('✅ Scan automático executado após upload');
      } catch (scanError) {
        console.warn('⚠️ Erro no scan automático:', scanError);
        // Não bloquear o upload por falha no scan
      }

      const compressionText = disableCompression ? ' (original)' : ' (otimizada)';
      toast({
        title: "Upload realizado com sucesso!",
        description: `Imagem${compressionText} carregada como ${processedFile.type}.`,
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Nova função para baixar imagem de URL via proxy
  const downloadAndUploadFromUrl = async (imageUrl: string, folder: string = 'products'): Promise<string | null> => {
    setUploading(true);
    
    try {
      console.log('Processando URL da imagem via proxy:', imageUrl);
      
      // Converter URLs do Imgur para formato direto da imagem
      let directImageUrl = imageUrl;
      if (imageUrl.includes('imgur.com/') && !imageUrl.includes('i.imgur.com')) {
        const imgurId = imageUrl.split('/').pop()?.split('.')[0];
        if (imgurId) {
          directImageUrl = `https://i.imgur.com/${imgurId}.jpg`;
          console.log('URL do Imgur convertida para:', directImageUrl);
        }
      }
      
      // Usar proxy via edge function para contornar CORS
      const proxyUrl = `https://pmxnfpnnvtuuiedoxuxc.supabase.co/functions/v1/image-proxy`;
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteG5mcG5udnR1dWllZG94dXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTY3MTYsImV4cCI6MjA2MzY3MjcxNn0.mc3shTLqOg_Iifd1TVXg49SdVITdmsTENw5e3_TJmi4`
        },
        body: JSON.stringify({ 
          imageUrl: directImageUrl,
          folder: folder
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro no proxy: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro desconhecido no proxy');
      }

      console.log('Imagem processada via proxy:', result);
      
      // Trigger scan automático para atualizar estatísticas
      try {
        await supabase.functions.invoke('storage-manager', {
          body: JSON.stringify({ action: 'scan' })
        });
        console.log('✅ Scan automático executado após download');
      } catch (scanError) {
        console.warn('⚠️ Erro no scan automático:', scanError);
        // Não bloquear o download por falha no scan
      }
      
      toast({
        title: "Imagem baixada e salva!",
        description: `Imagem convertida (${(result.size / 1024).toFixed(1)}KB) e salva com sucesso.`,
      });

      return result.url;
      
    } catch (error: any) {
      console.error('Erro ao processar URL via proxy:', error);
      
      toast({
        title: "Erro ao processar imagem",
        description: `Não foi possível processar a imagem: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Nova função para deletar imagem do storage
  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Verificar se é uma URL do nosso storage
      if (!imageUrl.includes('supabase') || !imageUrl.includes('site-images')) {
        console.log('URL não é do storage interno, não precisa deletar:', imageUrl);
        return true;
      }

      // Extrair o caminho do arquivo da URL
      const urlParts = imageUrl.split('/storage/v1/object/public/site-images/');
      if (urlParts.length !== 2) {
        console.warn('Não foi possível extrair caminho do arquivo da URL:', imageUrl);
        return false;
      }

      const filePath = urlParts[1];
      console.log('Deletando arquivo do storage:', filePath);

      const { error } = await supabase.storage
        .from('site-images')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar arquivo do storage:', error);
        return false;
      }

      // Trigger scan automático para atualizar estatísticas
      try {
        await supabase.functions.invoke('storage-manager', {
          body: JSON.stringify({ action: 'scan' })
        });
        console.log('✅ Scan automático executado após deletar');
      } catch (scanError) {
        console.warn('⚠️ Erro no scan automático:', scanError);
        // Não bloquear a deleção por falha no scan
      }

      console.log('Arquivo deletado com sucesso:', filePath);
      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  };

  return { uploadImage, downloadAndUploadFromUrl, deleteImage, uploading };
};
