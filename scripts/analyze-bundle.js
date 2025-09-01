#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  log('🔍 Analisando bundle...', 'cyan');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    log('❌ Pasta dist não encontrada. Execute npm run build primeiro.', 'red');
    process.exit(1);
  }
  
  // Analisar arquivos JavaScript
  const jsFiles = [];
  const cssFiles = [];
  const assetFiles = [];
  
  function scanDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const relativeFilePath = path.join(relativePath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectory(filePath, relativeFilePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        const size = stats.size;
        
        const fileInfo = {
          name: file,
          path: relativeFilePath,
          size,
          sizeFormatted: formatBytes(size),
        };
        
        if (ext === '.js') {
          jsFiles.push(fileInfo);
        } else if (ext === '.css') {
          cssFiles.push(fileInfo);
        } else {
          assetFiles.push(fileInfo);
        }
      }
    });
  }
  
  scanDirectory(distPath);
  
  // Ordenar por tamanho
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);
  assetFiles.sort((a, b) => b.size - a.size);
  
  // Calcular totais
  const totalJS = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCSS = cssFiles.reduce((sum, file) => sum + file.size, 0);
  const totalAssets = assetFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSize = totalJS + totalCSS + totalAssets;
  
  // Exibir resultados
  log('\n📊 ANÁLISE DO BUNDLE', 'bright');
  log('='.repeat(50), 'blue');
  
  log(`\n📦 RESUMO GERAL`, 'yellow');
  log(`Total: ${formatBytes(totalSize)}`, 'bright');
  log(`JavaScript: ${formatBytes(totalJS)} (${((totalJS / totalSize) * 100).toFixed(1)}%)`, 'green');
  log(`CSS: ${formatBytes(totalCSS)} (${((totalCSS / totalSize) * 100).toFixed(1)}%)`, 'blue');
  log(`Assets: ${formatBytes(totalAssets)} (${((totalAssets / totalSize) * 100).toFixed(1)}%)`, 'magenta');
  
  // Arquivos JavaScript
  if (jsFiles.length > 0) {
    log(`\n🟨 ARQUIVOS JAVASCRIPT (${jsFiles.length})`, 'yellow');
    log('-'.repeat(50), 'yellow');
    
    jsFiles.forEach((file, index) => {
      const percentage = ((file.size / totalJS) * 100).toFixed(1);
      const color = file.size > 100 * 1024 ? 'red' : file.size > 50 * 1024 ? 'yellow' : 'green';
      log(`${index + 1}. ${file.name} - ${file.sizeFormatted} (${percentage}%)`, color);
    });
  }
  
  // Arquivos CSS
  if (cssFiles.length > 0) {
    log(`\n🟦 ARQUIVOS CSS (${cssFiles.length})`, 'blue');
    log('-'.repeat(50), 'blue');
    
    cssFiles.forEach((file, index) => {
      const percentage = ((file.size / totalCSS) * 100).toFixed(1);
      log(`${index + 1}. ${file.name} - ${file.sizeFormatted} (${percentage}%)`);
    });
  }
  
  // Assets maiores
  const largeAssets = assetFiles.filter(file => file.size > 50 * 1024);
  if (largeAssets.length > 0) {
    log(`\n🟪 ASSETS GRANDES (>50KB)`, 'magenta');
    log('-'.repeat(50), 'magenta');
    
    largeAssets.forEach((file, index) => {
      log(`${index + 1}. ${file.name} - ${file.sizeFormatted}`);
    });
  }
  
  // Recomendações
  log(`\n💡 RECOMENDAÇÕES`, 'cyan');
  log('-'.repeat(50), 'cyan');
  
  const largeJSFiles = jsFiles.filter(file => file.size > 100 * 1024);
  if (largeJSFiles.length > 0) {
    log(`⚠️  ${largeJSFiles.length} arquivo(s) JS > 100KB encontrado(s)`, 'yellow');
    log(`   Considere code splitting adicional`, 'yellow');
  }
  
  if (totalJS > 500 * 1024) {
    log(`⚠️  Total de JS muito grande (${formatBytes(totalJS)})`, 'yellow');
    log(`   Meta: < 500KB`, 'yellow');
  }
  
  const duplicateChunks = findDuplicateChunks(jsFiles);
  if (duplicateChunks.length > 0) {
    log(`⚠️  Possíveis chunks duplicados encontrados`, 'yellow');
    duplicateChunks.forEach(chunk => {
      log(`   ${chunk}`, 'yellow');
    });
  }
  
  if (jsFiles.length > 20) {
    log(`⚠️  Muitos arquivos JS (${jsFiles.length})`, 'yellow');
    log(`   Considere consolidar chunks menores`, 'yellow');
  }
  
  // Métricas de performance
  log(`\n📈 MÉTRICAS DE PERFORMANCE`, 'green');
  log('-'.repeat(50), 'green');
  
  const mainJS = jsFiles.find(file => file.name.includes('index') || file.name.includes('main'));
  if (mainJS) {
    log(`Bundle principal: ${mainJS.sizeFormatted}`);
    if (mainJS.size < 100 * 1024) {
      log(`✅ Tamanho do bundle principal OK`, 'green');
    } else {
      log(`❌ Bundle principal muito grande`, 'red');
    }
  }
  
  const vendorFiles = jsFiles.filter(file => file.name.includes('vendor'));
  const vendorSize = vendorFiles.reduce((sum, file) => sum + file.size, 0);
  log(`Vendor chunks: ${formatBytes(vendorSize)}`);
  
  if (vendorSize < 300 * 1024) {
    log(`✅ Tamanho dos vendors OK`, 'green');
  } else {
    log(`❌ Vendors muito grandes`, 'red');
  }
  
  log(`\n🎯 SCORE GERAL`, 'bright');
  log('='.repeat(50), 'blue');
  
  let score = 100;
  
  if (totalJS > 500 * 1024) score -= 20;
  if (largeJSFiles.length > 0) score -= 10 * largeJSFiles.length;
  if (jsFiles.length > 20) score -= 10;
  if (vendorSize > 300 * 1024) score -= 15;
  
  const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  log(`Score: ${score}/100`, scoreColor);
  
  if (score >= 80) {
    log(`🎉 Excelente! Bundle bem otimizado.`, 'green');
  } else if (score >= 60) {
    log(`⚠️  Bom, mas há espaço para melhorias.`, 'yellow');
  } else {
    log(`❌ Bundle precisa de otimização urgente.`, 'red');
  }
}

function findDuplicateChunks(jsFiles) {
  const duplicates = [];
  const basenames = {};
  
  jsFiles.forEach(file => {
    const basename = file.name.replace(/-[a-f0-9]+\.js$/, '');
    if (basenames[basename]) {
      duplicates.push(basename);
    } else {
      basenames[basename] = true;
    }
  });
  
  return duplicates;
}

function generateReport() {
  log('\n📄 Gerando relatório detalhado...', 'cyan');
  
  try {
    // Gerar relatório com bundle analyzer
    execSync('npm run build -- --mode=analyze', { stdio: 'inherit' });
    log('✅ Relatório visual gerado em dist/stats.html', 'green');
  } catch (error) {
    log('❌ Erro ao gerar relatório visual', 'red');
  }
}

function optimizeSuggestions() {
  log('\n🔧 SUGESTÕES DE OTIMIZAÇÃO', 'cyan');
  log('='.repeat(50), 'cyan');
  
  log('1. Code Splitting:', 'bright');
  log('   - Lazy load páginas não críticas');
  log('   - Separar vendors por funcionalidade');
  log('   - Usar dynamic imports para features opcionais');
  
  log('\n2. Tree Shaking:', 'bright');
  log('   - Verificar imports não utilizados');
  log('   - Usar imports específicos (import { x } from "lib")');
  log('   - Configurar sideEffects no package.json');
  
  log('\n3. Compressão:', 'bright');
  log('   - Habilitar gzip/brotli no servidor');
  log('   - Otimizar imagens (WebP/AVIF)');
  log('   - Minificar CSS e JS');
  
  log('\n4. Cache:', 'bright');
  log('   - Implementar cache headers apropriados');
  log('   - Usar service worker para cache offline');
  log('   - Versionar assets com hash');
  
  log('\n5. Preload/Prefetch:', 'bright');
  log('   - Preload recursos críticos');
  log('   - Prefetch rotas prováveis');
  log('   - Lazy load imagens below-the-fold');
}

// Executar análise
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log('📊 Analisador de Bundle - UTI Gamer Shop', 'bright');
    log('\nUso: node scripts/analyze-bundle.js [opções]', 'cyan');
    log('\nOpções:');
    log('  --report, -r    Gerar relatório visual');
    log('  --suggestions   Mostrar sugestões de otimização');
    log('  --help, -h      Mostrar esta ajuda');
    process.exit(0);
  }
  
  analyzeBundle();
  
  if (args.includes('--report') || args.includes('-r')) {
    generateReport();
  }
  
  if (args.includes('--suggestions')) {
    optimizeSuggestions();
  }
}

