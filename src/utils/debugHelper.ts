// Debug utility para diagnosticar problemas de loading e render

export const debugPageRender = () => {
  console.log('[DEBUG] Page Render Status:');
  console.log('- Document ready state:', document.readyState);
  console.log('- Root element:', document.getElementById('root'));
  console.log('- Body classes:', document.body.className);
  console.log('- Head style count:', document.querySelectorAll('style').length);
  console.log('- Script count:', document.querySelectorAll('script').length);
  
  // Verificar se há elementos React renderizados
  const reactRoot = document.querySelector('[data-reactroot]') || document.getElementById('root');
  if (reactRoot) {
    console.log('- React root found with children:', reactRoot.children.length);
  } else {
    console.log('- React root NOT found');
  }
  
  // Verificar erros de CSS
  const stylesheets = Array.from(document.styleSheets);
  stylesheets.forEach((sheet, index) => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      console.log(`- Stylesheet ${index}: ${rules?.length || 0} rules`);
    } catch (e) {
      console.log(`- Stylesheet ${index}: Error accessing rules`, e);
    }
  });
  
  // Verificar recursos carregados
  console.log('- Images loaded:', document.querySelectorAll('img[src]').length);
  console.log('- CSS files:', document.querySelectorAll('link[rel="stylesheet"]').length);
  
  // Performance check
  if (performance.timing) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`- Page load time: ${loadTime}ms`);
  }
};

export const checkForWhiteScreen = () => {
  const body = document.body;
  const root = document.getElementById('root');
  
  if (!root) {
    console.error('[WHITE SCREEN] Root element not found!');
    return { hasIssue: true, reason: 'No root element' };
  }
  
  if (!root.children.length) {
    console.error('[WHITE SCREEN] Root element has no children!');
    return { hasIssue: true, reason: 'Empty root element' };
  }
  
  // Verificar se o body tem conteúdo visível
  const bodyStyle = window.getComputedStyle(body);
  if (bodyStyle.display === 'none' || bodyStyle.visibility === 'hidden') {
    console.error('[WHITE SCREEN] Body is hidden!');
    return { hasIssue: true, reason: 'Body hidden' };
  }
  
  // Verificar se há CSS básico carregado
  const hasBasicCSS = bodyStyle.fontFamily !== 'Times'; // Times é default do navegador
  if (!hasBasicCSS) {
    console.warn('[WHITE SCREEN] CSS may not be loaded properly');
    return { hasIssue: true, reason: 'CSS not loaded' };
  }
  
  console.log('[WHITE SCREEN] No issues detected');
  return { hasIssue: false, reason: null };
};

export const monitorRenderTime = () => {
  const startTime = performance.now();
  
  const observer = new MutationObserver((mutations) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 100) {
      console.warn(`[PERFORMANCE] Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
    
    // Parar de observar após 5 segundos
    if (renderTime > 5000) {
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Cleanup automático
  setTimeout(() => observer.disconnect(), 5000);
};

// Auto-run em desenvolvimento
if (import.meta.env.DEV) {
  setTimeout(() => {
    debugPageRender();
    checkForWhiteScreen();
    monitorRenderTime();
  }, 1000);
}