import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/hooks/useProducts/types';
import type { TemplateColumn } from './types';
import { fetchAllProductsForBackupFixed } from '@/hooks/useProducts/productApiFixed';

// FUNÇÃO CORRIGIDA: Busca todos os produtos para backup usando a estratégia corrigida
export const fetchAllProductsForBackup = async (): Promise<Product[]> => {
  console.log('[fetchAllProductsForBackup] 🔧 USANDO VERSÃO CORRIGIDA');
  
  try {
    // Usar a função corrigida que implementa múltiplas estratégias
    const products = await fetchAllProductsForBackupFixed();
    
    console.log(`[fetchAllProductsForBackup] ✅ Backup bem-sucedido: ${products.length} produtos`);
    
    // Log detalhado para debug
    const productTypes = products.reduce((acc, p) => {
      const type = p.product_type || 'simple';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('[fetchAllProductsForBackup] Distribuição por tipo:', productTypes);
    
    const activeCount = products.filter(p => p.is_active !== false).length;
    const inactiveCount = products.length - activeCount;
    
    console.log(`[fetchAllProductsForBackup] Produtos ativos: ${activeCount}, inativos: ${inactiveCount}`);
    
    return products;
    
  } catch (error) {
    console.error('[fetchAllProductsForBackup] ❌ Erro no backup:', error);
    throw new Error(`Erro ao buscar produtos para backup: ${error.message}`);
  }
};

// FUNÇÃO CORRIGIDA: Diagnóstico completo do sistema
export const diagnoseProductSystem = async () => {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO SISTEMA DE PRODUTOS');
  
  try {
    // 1. Contar produtos diretamente na tabela
    console.log('\n1️⃣ CONTAGEM DIRETA NA TABELA PRODUCTS:');
    
    const { count: totalCount, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('❌ Erro ao contar total:', totalError);
    } else {
      console.log(`   Total de produtos: ${totalCount}`);
    }
    
    // 2. Contar por status
    const { count: activeCount, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (activeError) {
      console.error('❌ Erro ao contar ativos:', activeError);
    } else {
      console.log(`   Produtos ativos: ${activeCount}`);
    }
    
    // 3. Contar por tipo
    const { data: typeData, error: typeError } = await supabase
      .from('products')
      .select('product_type')
      .not('product_type', 'is', null);
    
    if (typeError) {
      console.error('❌ Erro ao contar por tipo:', typeError);
    } else {
      const typeCounts = typeData.reduce((acc, item) => {
        const type = item.product_type || 'simple';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('   Distribuição por tipo:', typeCounts);
    }
    
    // 4. Verificar view problemática
    console.log('\n2️⃣ TESTE DA VIEW PROBLEMÁTICA:');
    
    try {
      const { count: viewCount, error: viewError } = await supabase
        .from('view_product_with_tags')
        .select('*', { count: 'exact', head: true });
      
      if (viewError) {
        console.error('❌ Erro na view (esperado):', viewError.message);
      } else {
        console.log(`   Registros na view: ${viewCount}`);
      }
    } catch (viewError) {
      console.error('❌ View completamente inacessível:', viewError.message);
    }
    
    // 5. Testar função corrigida
    console.log('\n3️⃣ TESTE DA FUNÇÃO CORRIGIDA:');
    
    const fixedProducts = await fetchAllProductsForBackup();
    console.log(`   Produtos retornados pela função corrigida: ${fixedProducts.length}`);
    
    // 6. Análise detalhada dos produtos retornados
    console.log('\n4️⃣ ANÁLISE DETALHADA:');
    
    const analysis = {
      total: fixedProducts.length,
      active: fixedProducts.filter(p => p.is_active !== false).length,
      inactive: fixedProducts.filter(p => p.is_active === false).length,
      withTags: fixedProducts.filter(p => p.tags && p.tags.length > 0).length,
      withoutTags: fixedProducts.filter(p => !p.tags || p.tags.length === 0).length,
      types: fixedProducts.reduce((acc, p) => {
        const type = p.product_type || 'simple';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    console.log('   Análise dos produtos retornados:');
    console.log(`     - Total: ${analysis.total}`);
    console.log(`     - Ativos: ${analysis.active}`);
    console.log(`     - Inativos: ${analysis.inactive}`);
    console.log(`     - Com tags: ${analysis.withTags}`);
    console.log(`     - Sem tags: ${analysis.withoutTags}`);
    console.log(`     - Por tipo:`, analysis.types);
    
    // 7. Comparação com dados esperados
    console.log('\n5️⃣ COMPARAÇÃO COM DADOS ESPERADOS:');
    console.log(`   Esperado (tabela products): ${totalCount || 'N/A'}`);
    console.log(`   Obtido (função corrigida): ${analysis.total}`);
    console.log(`   Diferença: ${totalCount ? totalCount - analysis.total : 'N/A'}`);
    
    if (totalCount && analysis.total >= totalCount * 0.95) {
      console.log('   ✅ SUCESSO: Recuperamos 95%+ dos produtos!');
    } else if (totalCount && analysis.total >= totalCount * 0.8) {
      console.log('   ⚠️  PARCIAL: Recuperamos 80%+ dos produtos');
    } else {
      console.log('   ❌ PROBLEMA: Ainda há discrepância significativa');
    }
    
    return {
      database: {
        total: totalCount,
        active: activeCount,
        types: typeData ? typeData.reduce((acc, item) => {
          const type = item.product_type || 'simple';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) : {}
      },
      corrected: analysis
    };
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    throw error;
  }
};

// Função para converter produtos em dados para planilha (mantém compatibilidade)
export const convertProductsToExcelData = (products: Product[]) => {
  console.log(`[convertProductsToExcelData] Convertendo ${products.length} produtos para Excel`);
  
  return products.map(product => ({
    // Identificação (obrigatório)
    sku_code: product.sku_code || '',
    
    // Campos básicos
    name: product.name || '',
    description: product.description || '',
    brand: product.brand || '',
    category: product.category || '',
    platform: product.platform || '',
    condition: product.condition || '',
    
    // Preços
    price: product.price || 0,
    list_price: product.list_price || '',
    pro_price: product.pro_price || '',
    pro_discount_percent: product.pro_discount_percent || '',
    new_price: product.new_price || '',
    digital_price: product.digital_price || '',
    discount_price: product.discount_price || '',
    promotional_price: product.promotional_price || '',
    discount_percentage: product.discount_percentage || '',
    pix_discount_percentage: product.pix_discount_percentage || '',
    
    // UTI Pro
    uti_pro_enabled: product.uti_pro_enabled ? 'TRUE' : 'FALSE',
    uti_pro_type: product.uti_pro_type || '',
    uti_pro_value: product.uti_pro_value || '',
    uti_pro_price: product.uti_pro_price || '',
    uti_pro_custom_price: product.uti_pro_custom_price || '',
    
    // Estoque e opções
    stock: product.stock || 0,
    installment_options: product.installment_options || '',
    
    // Imagens
    image: product.image || '',
    additional_images: Array.isArray(product.additional_images) 
      ? product.additional_images.join(';') 
      : product.additional_images || '',
    
    // Variações
    colors: Array.isArray(product.colors) 
      ? product.colors.join(';') 
      : product.colors || '',
    sizes: Array.isArray(product.sizes) 
      ? product.sizes.join(';') 
      : product.sizes || '',
    
    // Badge
    badge_text: product.badge_text || '',
    badge_color: product.badge_color || '',
    badge_visible: product.badge_visible ? 'TRUE' : 'FALSE',
    
    // Status
    is_active: product.is_active ? 'TRUE' : 'FALSE',
    is_featured: product.is_featured ? 'TRUE' : 'FALSE',
    
    // Sistema SKU
    is_master_product: product.is_master_product ? 'TRUE' : 'FALSE',
    parent_product_id: product.parent_product_id || '',
    product_type: product.product_type || 'simple',
    variant_attributes: typeof product.variant_attributes === 'object' 
      ? JSON.stringify(product.variant_attributes) 
      : product.variant_attributes || '',
    sort_order: product.sort_order || 0,
    available_variants: typeof product.available_variants === 'object' 
      ? JSON.stringify(product.available_variants) 
      : product.available_variants || '',
    master_slug: product.master_slug || '',
    inherit_from_master: typeof product.inherit_from_master === 'object' 
      ? JSON.stringify(product.inherit_from_master) 
      : product.inherit_from_master || '',
    
    // Especificações
    specifications: typeof product.specifications === 'object' 
      ? JSON.stringify(product.specifications) 
      : product.specifications || '',
    technical_specs: typeof product.technical_specs === 'object' 
      ? JSON.stringify(product.technical_specs) 
      : product.technical_specs || '',
    product_features: typeof product.product_features === 'object' 
      ? JSON.stringify(product.product_features) 
      : product.product_features || '',
    
    // Entrega
    shipping_weight: product.shipping_weight || '',
    free_shipping: product.free_shipping ? 'TRUE' : 'FALSE',
    delivery_config: typeof product.delivery_config === 'object' 
      ? JSON.stringify(product.delivery_config) 
      : product.delivery_config || '',
    
    // Conteúdo expandido
    product_videos: typeof product.product_videos === 'object' 
      ? JSON.stringify(product.product_videos) 
      : product.product_videos || '',
    product_descriptions: typeof product.product_descriptions === 'object' 
      ? JSON.stringify(product.product_descriptions) 
      : product.product_descriptions || '',
    product_highlights: typeof product.product_highlights === 'object' 
      ? JSON.stringify(product.product_highlights) 
      : product.product_highlights || '',
    reviews_config: typeof product.reviews_config === 'object' 
      ? JSON.stringify(product.reviews_config) 
      : product.reviews_config || '',
    trust_indicators: typeof product.trust_indicators === 'object' 
      ? JSON.stringify(product.trust_indicators) 
      : product.trust_indicators || '',
    manual_related_products: typeof product.manual_related_products === 'object' 
      ? JSON.stringify(product.manual_related_products) 
      : product.manual_related_products || '',
    breadcrumb_config: typeof product.breadcrumb_config === 'object' 
      ? JSON.stringify(product.breadcrumb_config) 
      : product.breadcrumb_config || '',
    display_config: typeof product.display_config === 'object' 
      ? JSON.stringify(product.display_config) 
      : product.display_config || '',
    
    // SEO
    slug: product.slug || '',
    meta_title: product.meta_title || '',
    meta_description: product.meta_description || '',
    
    // Tags
    tags: product.tags && product.tags.length > 0 
      ? product.tags.map(tag => tag.name).join(';') 
      : '',
    
    // Ratings
    rating_average: product.rating_average || '',
    rating_count: product.rating_count || '',
    
    // Metadados
    created_at: product.created_at || '',
    updated_at: product.updated_at || ''
  }));
};

// FUNÇÃO CORRIGIDA: Gerar planilha de backup
export const generateBackupExcel = async (): Promise<void> => {
  console.log('[generateBackupExcel] 🔧 GERANDO BACKUP COM VERSÃO CORRIGIDA');
  
  try {
    const products = await fetchAllProductsForBackup();
    
    if (products.length === 0) {
      throw new Error('Nenhum produto encontrado para backup');
    }
    
    const excelData = convertProductsToExcelData(products);
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Configurar larguras das colunas
    const headers = Object.keys(excelData[0] || {});
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    
    XLSX.utils.book_append_sheet(wb, ws, 'Backup Produtos');
    
    // Gerar arquivo com timestamp e informações de debug
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `backup-produtos-CORRIGIDO-${products.length}items-${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    
    console.log(`[generateBackupExcel] ✅ Backup gerado: ${filename}`);
    console.log(`[generateBackupExcel] Total de produtos: ${products.length}`);
    
  } catch (error) {
    console.error('[generateBackupExcel] ❌ Erro ao gerar backup:', error);
    throw error;
  }
};

// Obter template de colunas para backup/edição (mantém compatibilidade)
export const getBackupColumns = (): TemplateColumn[] => {
  return [
    { key: 'sku_code', label: 'Código SKU*', required: true, type: 'text', width: 15,
      instructions: 'Código único do produto. OBRIGATÓRIO e não deve ser alterado na edição.' },
    { key: 'name', label: 'Nome', type: 'text', width: 30 },
    { key: 'description', label: 'Descrição', type: 'text', width: 40 },
    { key: 'brand', label: 'Marca', type: 'text', width: 15 },
    { key: 'category', label: 'Categoria', type: 'text', width: 15 },
    { key: 'platform', label: 'Plataforma', type: 'text', width: 15 },
    { key: 'condition', label: 'Condição', type: 'text', width: 15 },
    { key: 'price', label: 'Preço', type: 'number', width: 12 },
    { key: 'list_price', label: 'Preço de Lista', type: 'number', width: 15 },
    { key: 'pro_price', label: 'Preço PRO', type: 'number', width: 12 },
    { key: 'stock', label: 'Estoque', type: 'number', width: 10 },
    { key: 'image', label: 'Imagem Principal', type: 'text', width: 50 },
    { key: 'additional_images', label: 'Imagens Adicionais', type: 'text', width: 50,
      instructions: 'URLs separadas por ponto e vírgula (;)' },
    { key: 'is_active', label: 'Ativo', type: 'boolean', width: 10,
      instructions: 'TRUE ou FALSE' },
    { key: 'is_featured', label: 'Destaque', type: 'boolean', width: 10,
      instructions: 'TRUE ou FALSE' },
    { key: 'badge_text', label: 'Texto Badge', type: 'text', width: 15 },
    { key: 'badge_color', label: 'Cor Badge', type: 'text', width: 12 },
    { key: 'meta_title', label: 'Meta Title', type: 'text', width: 30 },
    { key: 'meta_description', label: 'Meta Description', type: 'text', width: 40 },
    { key: 'tags', label: 'Tags', type: 'text', width: 30,
      instructions: 'Nomes das tags separados por ponto e vírgula (;)' }
  ];
};

