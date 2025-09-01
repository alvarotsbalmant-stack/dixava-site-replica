// Utilitário para correção de erros 404 e assets problemáticos

// Lista de URLs problemáticas conhecidas e suas correções
const URL_CORRECTIONS: Record<string, string> = {
  // Placeholders problemáticos
  '/placeholder-image.webp': '',
  '/placeholder.jpg': '',
  '/placeholder.png': '',
  '/images/placeholder.webp': '',
  'placeholder-image.webp': '',
  'placeholder.jpg': '',
  'placeholder.png': '',
  
  // Assets comuns que podem estar quebrados
  '/favicon.ico': '/lovable-uploads/a514a032-d79a-4bc4-a10e-3c9f0f9cde73.png',
  '/logo.png': '/lovable-uploads/a514a032-d79a-4bc4-a10e-3c9f0f9cde73.png',
  '/logo.svg': '/lovable-uploads/a514a032-d79a-4bc4-a10e-3c9f0f9cde73.png',
};

// Lista de extensões de arquivo que devem ser verificadas
const ASSET_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.ico', '.css', '.js'];

// Cache de URLs verificadas
const verifiedUrls = new Set<string>();
const brokenUrls = new Set<string>();

// Função para verificar se uma URL é válida
export const isUrlValid = async (url: string): Promise<boolean> => {
  if (!url || url.trim() === '') return false;
  
  // Verificar cache primeiro
  if (verifiedUrls.has(url)) return true;
  if (brokenUrls.has(url)) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    const isValid = response.ok || response.type === 'opaque';
    
    if (isValid) {
      verifiedUrls.add(url);
    } else {
      brokenUrls.add(url);
    }
    
    return isValid;
  } catch (error) {
    brokenUrls.add(url);
    return false;
  }
};

// Função para corrigir URL problemática
export const correctUrl = (url: string): string => {
  if (!url) return '';
  
  // Verificar se há correção conhecida
  if (URL_CORRECTIONS[url]) {
    return URL_CORRECTIONS[url];
  }
  
  // Verificar se é uma URL relativa que precisa ser corrigida
  if (url.startsWith('./') || url.startsWith('../')) {
    return url.replace(/^\.\.?\//, '/');
  }
  
  // Verificar se é uma URL do Supabase mal formada
  if (url.includes('supabase') && !url.startsWith('http')) {
    return `https://${url}`;
  }
  
  return url;
};

// Função para interceptar e corrigir erros 404
export const setupErrorInterception = (): void => {
  // Interceptar erros de imagem
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const originalSrc = img.src;
      
      console.warn('[404 Error] Image failed to load:', originalSrc);
      
      // Tentar correção
      const correctedUrl = correctUrl(originalSrc);
      if (correctedUrl && correctedUrl !== originalSrc) {
        img.src = correctedUrl;
        console.log('[404 Fix] Corrected image URL:', correctedUrl);
      } else {
        // Usar placeholder se não houver correção
        img.src = `data:image/svg+xml;base64,${btoa(`
          <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="160" fill="#F3F4F6"/>
            <rect x="75" y="60" width="50" height="40" rx="4" fill="#E9ECEF"/>
            <circle cx="85" cy="70" r="3" fill="#DEE2E6"/>
            <path d="M75 85L85 75L95 85L105 75L125 95V100H75V85Z" fill="#DEE2E6"/>
          </svg>
        `)}`;
      }
      
      brokenUrls.add(originalSrc);
    }
  }, true);
  
  // Interceptar erros de CSS
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'LINK' && (target as HTMLLinkElement).rel === 'stylesheet') {
      const link = target as HTMLLinkElement;
      console.warn('[404 Error] CSS failed to load:', link.href);
      brokenUrls.add(link.href);
    }
  }, true);
  
  // Interceptar erros de script
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'SCRIPT') {
      const script = target as HTMLScriptElement;
      console.warn('[404 Error] Script failed to load:', script.src);
      brokenUrls.add(script.src);
    }
  }, true);
};

// Função para verificar e corrigir todos os assets da página
export const auditPageAssets = async (): Promise<{
  total: number;
  broken: number;
  corrected: number;
  brokenUrls: string[];
}> => {
  const allImages = Array.from(document.querySelectorAll('img'));
  const allLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  const allScripts = Array.from(document.querySelectorAll('script[src]'));
  
  const allAssets = [
    ...allImages.map(img => ({ type: 'image', element: img, url: img.src })),
    ...allLinks.map(link => ({ type: 'css', element: link, url: (link as HTMLLinkElement).href })),
    ...allScripts.map(script => ({ type: 'script', element: script, url: (script as HTMLScriptElement).src }))
  ];
  
  let corrected = 0;
  const brokenAssets: string[] = [];
  
  for (const asset of allAssets) {
    if (!asset.url || asset.url.startsWith('data:')) continue;
    
    const isValid = await isUrlValid(asset.url);
    
    if (!isValid) {
      brokenAssets.push(asset.url);
      
      // Tentar correção
      const correctedUrl = correctUrl(asset.url);
      if (correctedUrl && correctedUrl !== asset.url) {
        if (asset.type === 'image') {
          (asset.element as HTMLImageElement).src = correctedUrl;
          corrected++;
        }
      }
    }
  }
  
  return {
    total: allAssets.length,
    broken: brokenAssets.length,
    corrected,
    brokenUrls: brokenAssets
  };
};

// Função para obter estatísticas de URLs
export const getUrlStats = () => {
  return {
    verified: verifiedUrls.size,
    broken: brokenUrls.size,
    total: verifiedUrls.size + brokenUrls.size,
    brokenList: Array.from(brokenUrls)
  };
};

// Função para limpar cache de URLs
export const clearUrlCache = (): void => {
  verifiedUrls.clear();
  brokenUrls.clear();
};

// Função para adicionar correção personalizada
export const addUrlCorrection = (brokenUrl: string, correctedUrl: string): void => {
  URL_CORRECTIONS[brokenUrl] = correctedUrl;
};

// Função para remover assets problemáticos do DOM
export const removeProblematicAssets = (): number => {
  let removed = 0;
  
  // Remover imagens com URLs problemáticas
  const problematicImages = document.querySelectorAll('img');
  problematicImages.forEach(img => {
    if (brokenUrls.has(img.src) || Object.keys(URL_CORRECTIONS).includes(img.src)) {
      img.remove();
      removed++;
    }
  });
  
  return removed;
};

