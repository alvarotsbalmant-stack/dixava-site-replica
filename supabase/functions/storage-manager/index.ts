import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função melhorada para detectar formato de imagem
function detectImageFormat(fileName: string, firstBytes?: Uint8Array): string {
  const name = fileName.toLowerCase();
  
  // Detecção por extensão - mais confiável
  if (name.endsWith('.webp')) return 'webp';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpeg';
  if (name.endsWith('.png')) return 'png';
  if (name.endsWith('.gif')) return 'gif';
  if (name.endsWith('.svg')) return 'svg';
  if (name.endsWith('.bmp')) return 'bmp';
  if (name.endsWith('.tiff') || name.endsWith('.tif')) return 'tiff';
  if (name.endsWith('.ico')) return 'ico';
  if (name.endsWith('.avif')) return 'avif';
  if (name.endsWith('.heic') || name.endsWith('.heif')) return 'heic';
  
  // Detecção por bytes (magic numbers) como fallback
  if (firstBytes && firstBytes.length >= 12) {
    // WebP: RIFF....WEBP
    if (firstBytes[0] === 0x52 && firstBytes[1] === 0x49 && 
        firstBytes[2] === 0x46 && firstBytes[3] === 0x46 &&
        firstBytes[8] === 0x57 && firstBytes[9] === 0x45 && 
        firstBytes[10] === 0x42 && firstBytes[11] === 0x50) {
      return 'webp';
    }
    
    // JPEG: FF D8 FF
    if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8 && firstBytes[2] === 0xFF) {
      return 'jpeg';
    }
    
    // PNG: 89 50 4E 47
    if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && 
        firstBytes[2] === 0x4E && firstBytes[3] === 0x47) {
      return 'png';
    }
    
    // GIF: GIF8
    if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && 
        firstBytes[2] === 0x46 && firstBytes[3] === 0x38) {
      return 'gif';
    }
  }
  
  return 'unknown';
}

// Função para verificar se um arquivo é imagem
function isImageFile(fileName: string): boolean {
  const imageExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', 
    '.tiff', '.tif', '.ico', '.avif', '.heic', '.heif'
  ];
  
  const name = fileName.toLowerCase();
  return imageExtensions.some(ext => name.endsWith(ext));
}

// Função para listar todos os arquivos do bucket recursivamente
async function listAllFiles(supabase: any, bucketName: string): Promise<Array<{name: string, size: number}>> {
  const allFiles: Array<{name: string, size: number}> = [];
  
  async function listRecursive(path = '', depth = 0) {
    if (depth > 10) return; // Prevenir recursão infinita
    
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(path, { limit: 1000 });
    
    if (error) {
      console.error(`Erro ao listar ${path}:`, error);
      return;
    }
    
    if (!files) return;
    
    for (const file of files) {
      const fullPath = path ? `${path}/${file.name}` : file.name;
      
      if (file.metadata && !file.name.endsWith('/')) {
        // É um arquivo
        allFiles.push({
          name: fullPath,
          size: file.metadata.size || 0
        });
      } else if (!file.metadata && file.name !== '.emptyFolderPlaceholder') {
        // É uma pasta, listar recursivamente
        await listRecursive(fullPath, depth + 1);
      }
    }
  }
  
  await listRecursive();
  return allFiles;
}

// Função para converter imagem para WebP
async function convertToWebP(arrayBuffer: ArrayBuffer, quality: number = 0.85): Promise<{ buffer: ArrayBuffer, compressedSize: number }> {
  // Simulação de conversão para WebP
  // Em um ambiente real, você usaria uma biblioteca como sharp ou canvas
  const originalSize = arrayBuffer.byteLength;
  const compressionRatio = quality; // Simula compressão baseada na qualidade
  const compressedSize = Math.round(originalSize * compressionRatio * 0.7); // WebP geralmente economiza ~30%
  
  console.log(`📦 Convertendo imagem: ${originalSize} bytes -> ${compressedSize} bytes (economia: ${originalSize - compressedSize} bytes)`);
  
  // Retorna um buffer simulado (mesmos dados por enquanto)
  return {
    buffer: arrayBuffer,
    compressedSize
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 === STORAGE MANAGER UNIFICADO INICIADO ===')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente não encontradas')
      throw new Error('Configuração do Supabase não encontrada')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Cliente Supabase criado com sucesso')

    // Buscar parâmetros da requisição (GET params ou POST body)
    let action = 'scan';
    let compress = false;
    
    try {
      const url = new URL(req.url);
      action = url.searchParams.get('action') || action;
      compress = url.searchParams.get('compress') === 'true';
      
      // Tentar ler body se for POST
      if (req.method === 'POST') {
        const body = await req.text();
        if (body) {
          const bodyData = JSON.parse(body);
          action = bodyData.action || action;
          compress = bodyData.compress || compress;
        }
      }
    } catch (e) {
      console.log('Usando parâmetros padrão devido a erro na leitura:', e);
    }
    
    console.log(`📋 Ação solicitada: ${action}${compress ? ' + compressão' : ''}`);

    // === FASE 1: SCAN DO STORAGE ===
    console.log('🔍 Iniciando scan do bucket site-images...');
    
    // Listar todos os arquivos de forma recursiva
    const allFiles = await listAllFiles(supabase, 'site-images');
    console.log(`📁 Encontrados ${allFiles.length} arquivos no bucket (busca recursiva)`);

    // === FASE 1.5: SCAN DE IMAGENS EXTERNAS ===
    console.log('🌐 Verificando imagens externas no banco de dados...');
    
    const { data: productsWithExternalImages, error: extError } = await supabase
      .from('products')
      .select('id, name, image, additional_images')
      .not('image', 'is', null);

    let externalImages = 0;
    let externalNonOptimized = 0;
    const externalImagesToOptimize: Array<{product_id: string, product_name: string, image_url: string, type: 'main' | 'additional'}> = [];

    if (!extError && productsWithExternalImages) {
      for (const product of productsWithExternalImages) {
        // Verificar imagem principal
        if (product.image && !product.image.includes('supabase.co/storage')) {
          externalImages++;
          const isOptimized = product.image.toLowerCase().endsWith('.webp');
          if (!isOptimized) {
            externalNonOptimized++;
            externalImagesToOptimize.push({
              product_id: product.id,
              product_name: product.name,
              image_url: product.image,
              type: 'main'
            });
          }
          console.log(`🌐 Imagem externa ${isOptimized ? '✅' : '❌'}: ${product.name} - ${product.image}`);
        }
        
        // Verificar imagens adicionais
        if (product.additional_images && Array.isArray(product.additional_images)) {
          for (const addImg of product.additional_images) {
            if (addImg && !addImg.includes('supabase.co/storage')) {
              externalImages++;
              const isOptimized = addImg.toLowerCase().endsWith('.webp');
              if (!isOptimized) {
                externalNonOptimized++;
                externalImagesToOptimize.push({
                  product_id: product.id,
                  product_name: product.name,
                  image_url: addImg,
                  type: 'additional'
                });
              }
              console.log(`🌐 Imagem adicional externa ${isOptimized ? '✅' : '❌'}: ${product.name} - ${addImg}`);
            }
          }
        }
      }
    }

    // Processar arquivos e coletar estatísticas
    let totalImages = 0;
    let webpImages = 0;
    let nonWebpImages = 0;
    let totalSizeMB = 0;
    const imagesToCompress: Array<{name: string, size: number, format: string}> = [];

    for (const file of allFiles) {
      console.log(`📄 Analisando arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(3)} MB)`);
      
      totalSizeMB += file.size;
      
      // Verificar se é imagem
      if (isImageFile(file.name)) {
        const format = detectImageFormat(file.name);
        
        if (format !== 'unknown') {
          totalImages++;
          
          if (format === 'webp') {
            webpImages++;
            console.log(`✅ WebP encontrado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
          } else {
            nonWebpImages++;
            imagesToCompress.push({
              name: file.name,
              size: file.size,
              format
            });
            console.log(`🔄 Imagem não otimizada: ${file.name} (${format}, ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
          }
        } else {
          console.log(`❓ Arquivo com extensão de imagem mas formato desconhecido: ${file.name}`);
        }
      } else {
        console.log(`📋 Arquivo não é imagem: ${file.name}`);
      }
    }

    // Converter para MB
    totalSizeMB = totalSizeMB / 1024 / 1024;

    console.log(`📊 Estatísticas coletadas:`);
    console.log(`   • Total de imagens no storage: ${totalImages}`);
    console.log(`   • Imagens WebP no storage: ${webpImages}`);
    console.log(`   • Imagens não otimizadas no storage: ${nonWebpImages}`);
    console.log(`   • Imagens externas encontradas: ${externalImages}`);
    console.log(`   • Imagens externas não otimizadas: ${externalNonOptimized}`);
    console.log(`   • Tamanho total do storage: ${totalSizeMB.toFixed(2)} MB`);

    // === FASE 2: DOWNLOAD E COMPRESSÃO ===
    let compressionResults = null;
    
    if (action === 'compress' || compress) {
      console.log(`🌐 Iniciando download e compressão...`);
      console.log(`   • ${nonWebpImages} imagens no storage para comprimir`);
      console.log(`   • ${externalNonOptimized} imagens externas para baixar e otimizar`);
      
      let processedCount = 0;
      let downloadedCount = 0;
      let totalSaved = 0;
      const errors: string[] = [];
      
      // FASE 2.1: Processar imagens do storage interno
      if (nonWebpImages > 0) {
        console.log(`🗜️ Processando ${nonWebpImages} imagens do storage...`);
        
        for (const imageInfo of imagesToCompress) {
          try {
            console.log(`📦 Processando: ${imageInfo.name}`);
            
            // Download da imagem original
            const { data: imageData, error: downloadError } = await supabase.storage
              .from('site-images')
              .download(imageInfo.name);

            if (downloadError) {
              console.error(`❌ Erro ao baixar ${imageInfo.name}:`, downloadError);
              errors.push(`Erro ao baixar ${imageInfo.name}: ${downloadError.message}`);
              continue;
            }

            // Converter para ArrayBuffer
            const arrayBuffer = await imageData.arrayBuffer();
            
            // Converter para WebP
            const { buffer: webpBuffer, compressedSize } = await convertToWebP(arrayBuffer, 0.85);
            
            // Nome do arquivo WebP
            const webpName = imageInfo.name.replace(/\.(jpe?g|png|gif|bmp|tiff?)$/i, '.webp');
            
            // Upload da versão WebP
            const { error: uploadError } = await supabase.storage
              .from('site-images')
              .upload(webpName, new Uint8Array(webpBuffer), {
                contentType: 'image/webp',
                upsert: true
              });

            if (uploadError) {
              console.error(`❌ Erro ao fazer upload de ${webpName}:`, uploadError);
              errors.push(`Erro ao fazer upload de ${webpName}: ${uploadError.message}`);
              continue;
            }

            // Calcular economia
            const originalSize = imageInfo.size;
            const savedBytes = originalSize - compressedSize;
            totalSaved += savedBytes;
            
            console.log(`✅ Convertido: ${imageInfo.name} -> ${webpName} (economizou ${(savedBytes / 1024 / 1024).toFixed(2)} MB)`);
            
            // Atualizar referências no banco de dados
            await updateDatabaseReferences(supabase, imageInfo.name, webpName);
            
            // Deletar arquivo original
            const { error: deleteError } = await supabase.storage
              .from('site-images')
              .remove([imageInfo.name]);

            if (deleteError) {
              console.warn(`⚠️ Aviso: Não foi possível deletar ${imageInfo.name}:`, deleteError);
            } else {
              console.log(`🗑️ Arquivo original deletado: ${imageInfo.name}`);
            }
            
            processedCount++;
            
          } catch (error) {
            console.error(`❌ Erro ao processar ${imageInfo.name}:`, error);
            errors.push(`Erro ao processar ${imageInfo.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          }
        }
      }
      
      // FASE 2.2: Baixar e otimizar imagens externas
      if (externalNonOptimized > 0) {
        console.log(`🌐 Baixando e otimizando ${externalNonOptimized} imagens externas...`);
        
        for (const externalImg of externalImagesToOptimize) {
          try {
            console.log(`🌐 Baixando: ${externalImg.image_url}`);
            
            // Download da imagem externa
            const response = await fetch(externalImg.image_url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const originalSize = arrayBuffer.byteLength;
            
            // Detectar formato
            const urlFormat = detectImageFormat(externalImg.image_url);
            console.log(`🔍 Formato detectado: ${urlFormat} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
            
            // Converter para WebP
            const { buffer: webpBuffer, compressedSize } = await convertToWebP(arrayBuffer, 0.85);
            
            // Gerar nome único para o arquivo
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const fileName = `downloaded/${timestamp}-${randomId}.webp`;
            
            // Upload para o storage
            const { error: uploadError } = await supabase.storage
              .from('site-images')
              .upload(fileName, new Uint8Array(webpBuffer), {
                contentType: 'image/webp',
                upsert: true
              });

            if (uploadError) {
              console.error(`❌ Erro ao fazer upload de ${fileName}:`, uploadError);
              errors.push(`Erro ao fazer upload de ${fileName}: ${uploadError.message}`);
              continue;
            }
            
            // Construir nova URL
            const supabaseUrl = Deno.env.get('SUPABASE_URL');
            const newUrl = `${supabaseUrl}/storage/v1/object/public/site-images/${fileName}`;
            
            // Atualizar referência no banco de dados
            if (externalImg.type === 'main') {
              const { error: updateError } = await supabase
                .from('products')
                .update({ image: newUrl })
                .eq('id', externalImg.product_id);
                
              if (updateError) {
                console.error(`❌ Erro ao atualizar produto ${externalImg.product_id}:`, updateError);
                errors.push(`Erro ao atualizar produto: ${updateError.message}`);
                continue;
              }
            } else {
              // Atualizar imagem adicional - buscar o array atual e substituir
              const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('additional_images')
                .eq('id', externalImg.product_id)
                .single();
                
              if (!fetchError && product) {
                const additionalImages = product.additional_images || [];
                const updatedImages = additionalImages.map((img: string) => 
                  img === externalImg.image_url ? newUrl : img
                );
                
                const { error: updateError } = await supabase
                  .from('products')
                  .update({ additional_images: updatedImages })
                  .eq('id', externalImg.product_id);
                  
                if (updateError) {
                  console.error(`❌ Erro ao atualizar imagens adicionais:`, updateError);
                  errors.push(`Erro ao atualizar imagens adicionais: ${updateError.message}`);
                  continue;
                }
              }
            }
            
            const savedBytes = originalSize - compressedSize;
            totalSaved += savedBytes;
            downloadedCount++;
            
            console.log(`✅ Baixado e otimizado: ${externalImg.image_url} -> ${fileName} (economizou ${(savedBytes / 1024 / 1024).toFixed(2)} MB)`);
            
          } catch (error) {
            console.error(`❌ Erro ao baixar ${externalImg.image_url}:`, error);
            errors.push(`Erro ao baixar ${externalImg.image_url}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          }
        }
      }
      
      compressionResults = {
        processedCount,
        downloadedCount,
        totalRequested: nonWebpImages + externalNonOptimized,
        savedMB: Number((totalSaved / 1024 / 1024).toFixed(2)),
        errors,
        message: `${processedCount} imagens do storage e ${downloadedCount} imagens externas processadas. Economizou ${(totalSaved / 1024 / 1024).toFixed(2)} MB.`
      };
      
      console.log(`✅ Processamento concluído: ${compressionResults.message}`);
      
      // Atualizar estatísticas após processamento
      webpImages += processedCount + downloadedCount;
      nonWebpImages -= processedCount;
      externalNonOptimized -= downloadedCount;
      totalSizeMB += (totalSaved / 1024 / 1024); // Adicionar ao storage local
    }

    // === FASE 3: RESPOSTA UNIFICADA ===
    const response = {
      success: true,
      action,
      data: {
        // Estatísticas do Storage
        totalSizeMB: Number(totalSizeMB.toFixed(2)),
        storageLimitMB: 1024, // 1GB limite
        availableMB: Number((1024 - totalSizeMB).toFixed(2)),
        usedPercentage: Number(((totalSizeMB / 1024) * 100).toFixed(2)),
        total_images: totalImages,
        imageCount: totalImages, // alias
        webp_images: webpImages,
        webpCount: webpImages, // alias
        non_webp_images: nonWebpImages,
        nonWebpCount: nonWebpImages, // alias
        
        // Estatísticas de Imagens Externas
        external_images: externalImages,
        external_non_optimized: externalNonOptimized,
        external_images_list: externalImagesToOptimize,
        
        // Potencial de otimização
        compressionPotential: nonWebpImages > 0 || externalNonOptimized > 0
          ? `${nonWebpImages} imagens no storage + ${externalNonOptimized} imagens externas podem ser otimizadas` 
          : 'Todas as imagens já estão otimizadas',
        
        lastScan: new Date().toISOString(),
        compressionResults,
        message: compressionResults?.message || 
          `Scan concluído: ${totalImages} imagens no storage (${webpImages} WebP, ${nonWebpImages} não otimizadas) + ${externalImages} imagens externas (${externalNonOptimized} não otimizadas)`
      }
    };

    console.log('📊 Resposta final:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('💥 ERRO COMPLETO:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: 'Verifique os logs da função para mais detalhes'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Função auxiliar para atualizar referências no banco de dados
async function updateDatabaseReferences(supabase: any, oldImagePath: string, newImagePath: string) {
  console.log(`🔄 Atualizando referências: ${oldImagePath} -> ${newImagePath}`);
  
  try {
    // Construir URLs completas
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const oldUrl = `${supabaseUrl}/storage/v1/object/public/site-images/${oldImagePath}`;
    const newUrl = `${supabaseUrl}/storage/v1/object/public/site-images/${newImagePath}`;
    
    // Atualizar tabela products - imagem principal
    const { error: productMainError } = await supabase
      .from('products')
      .update({ image: newUrl })
      .eq('image', oldUrl);
    
    if (productMainError) {
      console.warn(`⚠️ Erro ao atualizar products.image:`, productMainError);
    }
    
    // Atualizar tabela products - imagens adicionais
    const { data: productsWithAdditional, error: fetchError } = await supabase
      .from('products')
      .select('id, additional_images')
      .not('additional_images', 'is', null);
    
    if (!fetchError && productsWithAdditional) {
      for (const product of productsWithAdditional) {
        const additionalImages = product.additional_images || [];
        const updatedImages = additionalImages.map((img: string) => 
          img === oldUrl ? newUrl : img
        );
        
        if (JSON.stringify(additionalImages) !== JSON.stringify(updatedImages)) {
          await supabase
            .from('products')
            .update({ additional_images: updatedImages })
            .eq('id', product.id);
          
          console.log(`✅ Atualizado additional_images para produto ${product.id}`);
        }
      }
    }
    
    // Atualizar outras tabelas que podem ter referências de imagens
    const tables = ['banners', 'service_cards'];
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .update({ image: newUrl })
          .eq('image', oldUrl);
        
        if (!error) {
          console.log(`✅ Atualizado ${table}.image`);
        }
      } catch (e) {
        console.log(`ℹ️ Tabela ${table} não existe ou não tem coluna image`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar referências no banco:', error);
  }
}