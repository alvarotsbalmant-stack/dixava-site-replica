import { Product } from '@/hooks/useProducts/types';
import { fetchSingleProductFromDatabase } from '@/hooks/useProducts/productApi';

/**
 * Hook para gerenciar herança de dados do produto mestre para SKUs
 */

// Campos que devem ser herdados do produto mestre se estiverem vazios no SKU
const INHERITABLE_FIELDS = [
  'product_faqs',
  'specifications', 
  'product_descriptions',
  'product_highlights',
  'technical_specs',
  'product_features',
  'product_videos',
  'trust_indicators',
  'delivery_config',
  'reviews_config',
  'breadcrumb_config'
];

/**
 * Herda dados do produto mestre para um SKU
 */
export async function inheritFromMaster(skuProduct: Product): Promise<Product> {
  // Se não é um SKU, retornar como está
  if (skuProduct.product_type !== 'sku' || !skuProduct.parent_product_id) {
    return skuProduct;
  }

  try {
    // Buscar produto mestre
    const masterProduct = await fetchSingleProductFromDatabase(skuProduct.parent_product_id);
    
    if (!masterProduct) {
      console.warn(`[inheritFromMaster] Produto mestre não encontrado: ${skuProduct.parent_product_id}`);
      return skuProduct;
    }

    // Criar uma cópia do SKU para modificar
    const enhancedSKU = { ...skuProduct };

    // Herdar campos vazios do produto mestre
    INHERITABLE_FIELDS.forEach(field => {
      const skuValue = (enhancedSKU as any)[field];
      const masterValue = (masterProduct as any)[field];

      // Verificar se o campo do SKU está vazio e o mestre tem dados
      if (isEmpty(skuValue) && !isEmpty(masterValue)) {
        console.log(`[inheritFromMaster] Herdando ${field} do produto mestre`);
        (enhancedSKU as any)[field] = masterValue;
      }
    });

    // Herdar descrições específicas se estiverem vazias
    if (enhancedSKU.product_descriptions) {
      const skuDesc = enhancedSKU.product_descriptions;
      const masterDesc = masterProduct.product_descriptions || {};

      if (!skuDesc.detailed && masterDesc.detailed) {
        skuDesc.detailed = masterDesc.detailed;
      }
      if (!skuDesc.technical && masterDesc.technical) {
        skuDesc.technical = masterDesc.technical;
      }
      if (!skuDesc.marketing && masterDesc.marketing) {
        skuDesc.marketing = masterDesc.marketing;
      }
    }

    return enhancedSKU;
  } catch (error) {
    console.error(`[inheritFromMaster] Erro ao herdar dados: ${error}`);
    return skuProduct;
  }
}

/**
 * Verifica se um campo está vazio
 */
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object') {
    // Para objetos, verificar se todas as propriedades estão vazias
    if (Object.keys(value).length === 0) return true;
    
    // Para objetos de descrição, verificar se todas as strings estão vazias
    if ('short' in value || 'detailed' in value) {
      return Object.values(value).every(v => 
        v === null || v === undefined || (typeof v === 'string' && v.trim() === '')
      );
    }
  }
  return false;
}

export default { inheritFromMaster };