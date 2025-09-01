import { useState } from 'react';
import { toast } from 'sonner';
import { removeBackground, loadImage, loadImageFromUrl } from '@/utils/backgroundRemoval';
import { useImageUpload } from './useImageUpload';

export const useBackgroundRemoval = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { uploadImage } = useImageUpload();

  const processImageFromUrl = async (
    imageUrl: string, 
    options?: {
      model?: 'general' | 'portrait' | 'object' | 'product' | 'auto';
      quality?: 'fast' | 'balanced' | 'high';
      smoothEdges?: boolean;
      threshold?: number;
    }
  ): Promise<{ url: string; originalImage: HTMLImageElement; processedBlob: Blob } | null> => {
    setProcessing(true);
    setProgress(0);
    
    try {
      console.log('🎨 Iniciando processamento avançado da URL:', imageUrl);
      setProgress(10);
      
      // Carregar imagem da URL
      const imageElement = await loadImageFromUrl(imageUrl);
      setProgress(30);
      
      console.log('📷 Imagem carregada, iniciando remoção de fundo...');
      
      // Remover fundo com opções avançadas
      const processedBlob = await removeBackground(imageElement, options);
      setProgress(80);
      
      // Converter blob para arquivo
      const processedFile = new File([processedBlob], 'processed.png', { type: 'image/png' });
      
      // Fazer upload da imagem processada
      const uploadedUrl = await uploadImage(processedFile, 'products');
      setProgress(100);
      
      if (uploadedUrl) {
        toast.success('🎉 Fundo removido com sucesso!');
        return {
          url: uploadedUrl,
          originalImage: imageElement,
          processedBlob
        };
      } else {
        throw new Error('Falha no upload da imagem processada');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao remover fundo: ${errorMessage}`);
      return null;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const processImageFromFile = async (
    file: File,
    options?: {
      model?: 'general' | 'portrait' | 'object' | 'product' | 'auto';
      quality?: 'fast' | 'balanced' | 'high';
      smoothEdges?: boolean;
      threshold?: number;
    }
  ): Promise<{ url: string; originalImage: HTMLImageElement; processedBlob: Blob } | null> => {
    setProcessing(true);
    setProgress(0);
    
    try {
      console.log('🎨 Processando arquivo:', file.name);
      setProgress(10);
      
      // Carregar imagem do arquivo
      const imageElement = await loadImage(file);
      setProgress(30);
      
      console.log('📷 Arquivo carregado, iniciando remoção de fundo...');
      
      // Remover fundo com opções avançadas
      const processedBlob = await removeBackground(imageElement, options);
      setProgress(80);
      
      // Converter blob para arquivo
      const processedFile = new File([processedBlob], `${file.name.split('.')[0]}_no_bg.png`, { 
        type: 'image/png' 
      });
      
      // Fazer upload da imagem processada
      const uploadedUrl = await uploadImage(processedFile, 'products');
      setProgress(100);
      
      if (uploadedUrl) {
        toast.success('🎉 Fundo removido com sucesso!');
        return {
          url: uploadedUrl,
          originalImage: imageElement,
          processedBlob
        };
      } else {
        throw new Error('Falha no upload da imagem processada');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao remover fundo: ${errorMessage}`);
      return null;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const processMagicBrushEdit = async (editedBlob: Blob): Promise<string | null> => {
    setProcessing(true);
    setProgress(0);
    
    try {
      console.log('🪄 Salvando edição do pincel mágico...');
      setProgress(50);
      
      // Converter blob para arquivo
      const editedFile = new File([editedBlob], 'magic_brush_edit.png', { type: 'image/png' });
      
      // Fazer upload da imagem editada
      const uploadedUrl = await uploadImage(editedFile, 'products');
      setProgress(100);
      
      if (uploadedUrl) {
        toast.success('🪄 Pincel mágico aplicado com sucesso!');
        return uploadedUrl;
      } else {
        throw new Error('Falha no upload da imagem editada');
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar edição:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar edição: ${errorMessage}`);
      return null;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return {
    processImageFromUrl,
    processImageFromFile,
    processMagicBrushEdit,
    processing,
    progress
  };
};