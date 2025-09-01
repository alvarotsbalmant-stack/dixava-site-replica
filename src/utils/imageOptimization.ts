// Utilitário para otimização de imagens e correção de URLs

// Cache de URLs válidas para evitar verificações repetidas
const validUrlCache = new Set<string>();
const invalidUrlCache = new Set<string>();

// Placeholder SVG otimizado
export const OPTIMIZED_PLACEHOLDER = `data:image/svg+xml;base64,${btoa(`
<svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="160" fill="#F8F9FA"/>
  <rect x="75" y="60" width="50" height="40" rx="4" fill="#E9ECEF"/>
  <circle cx="85" cy="70" r="3" fill="#DEE2E6"/>
  <path d="M75 85L85 75L95 85L105 75L125 95V100H75V85Z" fill="#DEE2E6"/>
</svg>
`)}`;

// Lista de URLs problemáticas conhecidas para correção
const PROBLEMATIC_URLS = [
  '/placeholder-image.webp',
  '/placeholder.jpg',
  '/placeholder.png',
  '/images/placeholder.webp',
  'placeholder-image.webp',
  'placeholder.jpg',
  'placeholder.png'
];

// Função para otimizar URL da imagem
export const optimizeImageUrl = (url: string, width: number = 200, height: number = 160): string => {
  if (!url || url.trim() === '') {
    return OPTIMIZED_PLACEHOLDER;
  }

  // Verificar se é uma URL problemática conhecida
  if (PROBLEMATIC_URLS.some(problematic => url.includes(problematic))) {
    return OPTIMIZED_PLACEHOLDER;
  }

  // Se for uma URL do Supabase Storage, adicionar parâmetros de redimensionamento
  if (url.includes('supabase') && url.includes('storage')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('width', width.toString());
      urlObj.searchParams.set('height', height.toString());
      urlObj.searchParams.set('resize', 'contain');
      urlObj.searchParams.set('format', 'webp');
      return urlObj.toString();
    } catch (error) {
      console.warn('[optimizeImageUrl] Invalid URL:', url);
      return OPTIMIZED_PLACEHOLDER;
    }
  }

  // Para outras URLs, retornar como está
  return url;
};

// Função para verificar se uma URL de imagem é válida
export const isValidImageUrl = async (url: string): Promise<boolean> => {
  if (!url || url.trim() === '') return false;
  
  // Verificar cache primeiro
  if (validUrlCache.has(url)) return true;
  if (invalidUrlCache.has(url)) return false;

  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Para evitar problemas de CORS
    });
    
    const isValid = response.ok || response.type === 'opaque';
    
    if (isValid) {
      validUrlCache.add(url);
    } else {
      invalidUrlCache.add(url);
    }
    
    return isValid;
  } catch (error) {
    invalidUrlCache.add(url);
    return false;
  }
};

// Função para pré-carregar imagens críticas
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Função para pré-carregar múltiplas imagens
export const preloadImages = async (urls: string[], maxConcurrent: number = 3): Promise<void> => {
  const validUrls = urls.filter(url => url && !PROBLEMATIC_URLS.some(p => url.includes(p)));
  
  // Dividir em lotes para não sobrecarregar
  for (let i = 0; i < validUrls.length; i += maxConcurrent) {
    const batch = validUrls.slice(i, i + maxConcurrent);
    const promises = batch.map(url => 
      preloadImage(url).catch(error => {
        console.warn('[preloadImages] Failed to preload:', url, error);
      })
    );
    
    await Promise.allSettled(promises);
  }
};

// Função para limpar cache de URLs
export const clearImageUrlCache = (): void => {
  validUrlCache.clear();
  invalidUrlCache.clear();
};

// Função para obter estatísticas do cache
export const getImageCacheStats = () => {
  return {
    validUrls: validUrlCache.size,
    invalidUrls: invalidUrlCache.size,
    totalCached: validUrlCache.size + invalidUrlCache.size
  };
};

// Função para detectar formato de imagem suportado pelo browser
export const getSupportedImageFormat = (): 'webp' | 'avif' | 'jpg' => {
  // Verificar suporte a AVIF
  const avifCanvas = document.createElement('canvas');
  const avifSupported = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  
  if (avifSupported) return 'avif';
  
  // Verificar suporte a WebP
  const webpCanvas = document.createElement('canvas');
  const webpSupported = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  if (webpSupported) return 'webp';
  
  // Fallback para JPG
  return 'jpg';
};

// Função para corrigir URLs de assets problemáticas
export const fixAssetUrl = (url: string): string => {
  if (!url) return '';
  
  // Corrigir URLs que começam com /lovable-uploads mas não têm domínio
  if (url.startsWith('/lovable-uploads/')) {
    // Assumir que é do Supabase storage
    return `https://your-supabase-project.supabase.co/storage/v1/object/public${url}`;
  }
  
  // Corrigir URLs relativas
  if (url.startsWith('./') || url.startsWith('../')) {
    return url.replace(/^\.\.?\//, '/');
  }
  
  return url;
};

// Função para gerar srcset para imagens responsivas
export const generateSrcSet = (baseUrl: string, sizes: number[] = [200, 400, 600, 800]): string => {
  if (!baseUrl || PROBLEMATIC_URLS.some(p => baseUrl.includes(p))) {
    return '';
  }
  
  return sizes
    .map(size => `${optimizeImageUrl(baseUrl, size, Math.round(size * 0.8))} ${size}w`)
    .join(', ');
};

// Função para calcular tamanho otimizado baseado no container
export const calculateOptimalSize = (containerWidth: number, containerHeight: number, devicePixelRatio: number = 1): { width: number, height: number } => {
  const width = Math.ceil(containerWidth * devicePixelRatio);
  const height = Math.ceil(containerHeight * devicePixelRatio);
  
  // Limitar tamanho máximo para evitar imagens muito grandes
  const maxWidth = 800;
  const maxHeight = 600;
  
  return {
    width: Math.min(width, maxWidth),
    height: Math.min(height, maxHeight)
  };
};

