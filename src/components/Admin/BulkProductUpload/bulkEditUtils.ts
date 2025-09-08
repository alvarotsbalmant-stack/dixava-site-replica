import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/hooks/useProducts/types';
import type { ImportedProduct, ValidationError } from './types';

// Interface para log de produtos ignorados
export interface SkippedProductLog {
  sku_code: string;
  reason: string;
  details?: string;
  row?: number;
}

// Interface para resultado da edição em massa
export interface BulkEditResult {
  success: boolean;
  updated: number;
  skipped: number;
  errors: string[];
  details: {
    updated_products: string[];
    skipped_skus: string[];
  };
  skipped_logs: SkippedProductLog[];
}

// Função para validar dados de edição em massa
export const validateBulkEditData = (products: ImportedProduct[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  products.forEach((product, index) => {
    const row = index + 2; // +2 porque começa na linha 2 do Excel (linha 1 é header)
    
    // SKU ou nome é obrigatório para identificar o produto
    if (!product.sku_code?.trim() && !product.name?.trim()) {
      errors.push({
        row,
        field: 'sku_code',
        message: 'Código SKU ou nome do produto é obrigatório para identificar o produto',
        severity: 'error'
      });
    }
    
    // Validar preços se fornecidos
    if (product.price !== undefined && (isNaN(Number(product.price)) || Number(product.price) < 0)) {
      errors.push({
        row,
        field: 'price',
        message: 'Preço deve ser um número maior ou igual a zero',
        severity: 'error'
      });
    }
    
    if (product.stock !== undefined && (isNaN(Number(product.stock)) || Number(product.stock) < 0)) {
      errors.push({
        row,
        field: 'stock',
        message: 'Estoque deve ser um número maior ou igual a zero',
        severity: 'error'
      });
    }
    
    // Validar valores booleanos
    const booleanFields = ['is_active', 'is_featured', 'badge_visible', 'free_shipping', 'uti_pro_enabled', 'is_master_product'];
    booleanFields.forEach(field => {
      const value = (product as any)[field];
      if (value !== undefined && value !== null && value !== '') {
        const stringValue = String(value).toLowerCase();
        if (!['true', 'false', '1', '0', 'sim', 'não', 'yes', 'no'].includes(stringValue)) {
          errors.push({
            row,
            field,
            message: `${field} deve ser TRUE/FALSE, 1/0, SIM/NÃO ou YES/NO`,
            severity: 'warning'
          });
        }
      }
    });
    
    // Validar formato de email se houver
    if (product.meta_description && product.meta_description.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(product.meta_description)) {
        errors.push({
          row,
          field: 'meta_description',
          message: 'Formato de email inválido em meta_description',
          severity: 'warning'
        });
      }
    }
    
    // Validar formato de tags se fornecidas
    if (product.tags?.trim()) {
      const tagNames = product.tags.split(';').map(name => name.trim()).filter(name => name.length > 0);
      
      if (tagNames.length === 0) {
        errors.push({
          row,
          field: 'tags',
          message: 'Tags fornecidas mas formato inválido (use ponto e vírgula para separar)',
          severity: 'warning'
        });
      } else {
        // Verificar se alguma tag está muito longa ou tem caracteres inválidos
        tagNames.forEach(tagName => {
          if (tagName.length > 50) {
            errors.push({
              row,
              field: 'tags',
              message: `Tag muito longa: "${tagName}" (máximo 50 caracteres)`,
              severity: 'warning'
            });
          }
          
          // Verificar caracteres especiais problemáticos
          if (/[<>{}[\]\\\/]/.test(tagName)) {
            errors.push({
              row,
              field: 'tags',
              message: `Tag com caracteres inválidos: "${tagName}"`,
              severity: 'warning'
            });
          }
        });
      }
    }
  });
  
  return errors;
};

// Função para converter valores booleanos de string
const convertBooleanValue = (value: any): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  
  const stringValue = String(value).toLowerCase().trim();
  if (['true', '1', 'sim', 'yes'].includes(stringValue)) return true;
  if (['false', '0', 'não', 'no'].includes(stringValue)) return false;
  
  return undefined;
};

// Função para processar arrays de strings
const processArrayField = (value: any): string[] | undefined => {
  if (!value || value === '') return undefined;
  if (typeof value === 'string') {
    return value.split(';').map(item => item.trim()).filter(item => item.length > 0);
  }
  return undefined;
};

// Função para processar JSON fields
const processJsonField = (value: any): any => {
  if (!value || value === '') return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value; // Retorna como string se não for JSON válido
    }
  }
  return value;
};

// Função para buscar produto por SKU ou nome
const findProductBySkuOrName = async (sku?: string, name?: string): Promise<Product | null> => {
  // Primeiro tenta buscar por SKU se fornecido
  if (sku?.trim()) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku_code', sku)
      .single();
      
    if (!error && data) return data as Product;
  }
  
  // Se não encontrou por SKU ou SKU não fornecido, busca por nome
  if (name?.trim()) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('name', name)
      .single();
      
    if (!error && data) return data as Product;
  }
  
  return null;
};

// Função principal para processar edição em massa
export const processBulkEdit = async (
  products: ImportedProduct[],
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<BulkEditResult> => {
  const result: BulkEditResult = {
    success: true,
    updated: 0,
    skipped: 0,
    errors: [],
    details: {
      updated_products: [],
      skipped_skus: []
    },
    skipped_logs: []
  };
  
  // Filtrar produtos que tenham SKU ou nome válido
  const validProducts = products.filter(p => p.sku_code?.trim() || p.name?.trim());
  
  for (let i = 0; i < validProducts.length; i++) {
    const product = validProducts[i];
    const progress = ((i + 1) / validProducts.length) * 100;
    const identifier = product.sku_code || product.name || 'produto';
    const rowNumber = products.findIndex(p => 
      (p.sku_code && p.sku_code === product.sku_code) || 
      (p.name && p.name === product.name)
    ) + 2; // +2 para linha do Excel
    
    if (onProgress) {
      onProgress(progress, i + 1, validProducts.length);
    }
    
    try {
      // Buscar produto existente pelo SKU ou nome
      const existingProduct = await findProductBySkuOrName(product.sku_code, product.name);
      
      if (!existingProduct) {
        result.skipped++;
        result.details.skipped_skus.push(identifier);
        result.skipped_logs.push({
          sku_code: identifier,
          reason: 'Produto não encontrado',
          details: `O produto "${identifier}" não foi encontrado no banco de dados`,
          row: rowNumber
        });
        continue;
      }
      
      // Preparar dados para atualização (apenas campos não vazios)
      const updateData: Partial<Product> = {};
      
      // Campos de texto simples
      if (product.name?.trim()) updateData.name = product.name.trim();
      if (product.description?.trim()) updateData.description = product.description.trim();
      if (product.brand?.trim()) updateData.brand = product.brand.trim();
      if (product.category?.trim()) updateData.category = product.category.trim();
      if (product.platform?.trim()) updateData.platform = product.platform.trim();
      if (product.condition?.trim()) updateData.condition = product.condition.trim();
      if (product.badge_text?.trim()) updateData.badge_text = product.badge_text.trim();
      if (product.badge_color?.trim()) updateData.badge_color = product.badge_color.trim();
      if (product.meta_title?.trim()) updateData.meta_title = product.meta_title.trim();
      if (product.meta_description?.trim()) updateData.meta_description = product.meta_description.trim();
      if (product.slug?.trim()) updateData.slug = product.slug.trim();
      
      // Campos numéricos
      if (product.price !== undefined && product.price !== null && String(product.price) !== '') {
        updateData.price = Number(product.price);
      }
      if (product.stock !== undefined && product.stock !== null && String(product.stock) !== '') {
        updateData.stock = Number(product.stock);
      }
      if (product.list_price !== undefined && product.list_price !== null && String(product.list_price) !== '') {
        updateData.list_price = Number(product.list_price);
      }
      if (product.pro_price !== undefined && product.pro_price !== null && String(product.pro_price) !== '') {
        updateData.pro_price = Number(product.pro_price);
      }
      
      // Campo UTI Coins Cashback
      if (product.uti_coins_cashback_percentage !== undefined && product.uti_coins_cashback_percentage !== null && String(product.uti_coins_cashback_percentage) !== '') {
        updateData.uti_coins_cashback_percentage = Number(product.uti_coins_cashback_percentage);
      }
      
      // Campos booleanos
      const isActive = convertBooleanValue(product.is_active);
      if (isActive !== undefined) updateData.is_active = isActive;
      
      const isFeatured = convertBooleanValue(product.is_featured);
      if (isFeatured !== undefined) updateData.is_featured = isFeatured;
      
      const badgeVisible = convertBooleanValue(product.badge_visible);
      if (badgeVisible !== undefined) updateData.badge_visible = badgeVisible;
      
      const freeShipping = convertBooleanValue(product.free_shipping);
      if (freeShipping !== undefined) updateData.free_shipping = freeShipping;
      
      const utiProEnabled = convertBooleanValue(product.uti_pro_enabled);
      if (utiProEnabled !== undefined) updateData.uti_pro_enabled = utiProEnabled;
      
      // Campos de imagem
      if (product.image?.trim()) updateData.image = product.image.trim();
      
      // Arrays
      const additionalImages = processArrayField(product.additional_images);
      if (additionalImages) updateData.additional_images = additionalImages;
      
      const colors = processArrayField(product.colors);
      if (colors) updateData.colors = colors;
      
      const sizes = processArrayField(product.sizes);
      if (sizes) updateData.sizes = sizes;
      
      // Campos JSON
      const specifications = processJsonField(product.specifications);
      if (specifications) updateData.specifications = specifications;
      
      const technicalSpecs = processJsonField(product.technical_specs);
      if (technicalSpecs) updateData.technical_specs = technicalSpecs;
      
      const productFeatures = processJsonField(product.product_features);
      if (productFeatures) updateData.product_features = productFeatures;
      
      // Apenas atualizar se há campos para atualizar
      if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', existingProduct.id);
          
        if (error) {
          result.errors.push(`Erro ao atualizar produto ${product.sku_code}: ${error.message}`);
          continue;
        }
        
        result.updated++;
        result.details.updated_products.push(product.sku_code!);
        
        // Processar tags se fornecidas
        if (product.tags?.trim()) {
          await updateProductTags(existingProduct.id, product.tags);
        }
      } else {
        result.skipped++;
        result.details.skipped_skus.push(product.sku_code!);
        result.skipped_logs.push({
          sku_code: product.sku_code!,
          reason: 'Nenhum campo para atualizar',
          details: 'Todos os campos estavam vazios ou com valores inválidos',
          row: rowNumber
        });
      }
      
    } catch (error) {
      console.error(`Erro ao processar produto ${product.sku_code}:`, error);
      result.errors.push(`Erro ao processar produto ${product.sku_code}: ${error}`);
    }
  }
  
  if (result.errors.length > 0) {
    result.success = false;
  }
  
  return result;
};

// Função auxiliar para atualizar tags do produto
const updateProductTags = async (productId: string, tagsString: string) => {
  const tagNames = tagsString.split(';').map(name => name.trim()).filter(name => name.length > 0);
  
  if (tagNames.length === 0) return;
  
  try {
    console.log(`[updateProductTags] Atualizando tags para produto ${productId}: ${tagNames.join(', ')}`);
    
    // Remover tags existentes do produto
    const { error: deleteError } = await supabase
      .from('product_tags')
      .delete()
      .eq('product_id', productId);
    
    if (deleteError) {
      console.error('[updateProductTags] Erro ao remover tags existentes:', deleteError);
    }
    
    // Processar cada tag
    for (const tagName of tagNames) {
      try {
        // Buscar tag existente (case insensitive)
        let { data: existingTag, error: findError } = await supabase
          .from('tags')
          .select('id, name')
          .ilike('name', tagName)
          .single();
        
        let tagId = existingTag?.id;
        
        // Criar tag se não existir
        if (!existingTag) {
          console.log(`[updateProductTags] Criando nova tag: ${tagName}`);
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({ 
              name: tagName.trim(),
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();
          
          if (createError) {
            console.error(`[updateProductTags] Erro ao criar tag ${tagName}:`, createError);
            continue;
          }
          
          tagId = newTag?.id;
        }
        
        // Associar tag ao produto se conseguiu obter o ID
        if (tagId) {
          const { error: linkError } = await supabase
            .from('product_tags')
            .insert({
              product_id: productId,
              tag_id: tagId
            });
          
          if (linkError) {
            console.error(`[updateProductTags] Erro ao associar tag ${tagName} ao produto:`, linkError);
          } else {
            console.log(`[updateProductTags] ✅ Tag ${tagName} associada com sucesso`);
          }
        }
      } catch (tagError) {
        console.error(`[updateProductTags] Erro ao processar tag ${tagName}:`, tagError);
      }
    }
    
    console.log(`[updateProductTags] ✅ Processamento de tags concluído para produto ${productId}`);
    
  } catch (error) {
    console.error('[updateProductTags] Erro geral ao atualizar tags:', error);
  }
};

// Função para gerar tutorial de edição em massa
export const generateBulkEditTutorial = (): string => {
  return `TUTORIAL - EDIÇÃO EM MASSA DE PRODUTOS

==================================================
IMPORTANTE: LEIA TODAS AS INSTRUÇÕES ANTES DE USAR
==================================================

1. PREPARAÇÃO DA PLANILHA
-------------------------
• Use o botão "Baixar Modelo" para obter uma planilha formatada
• O arquivo Excel conterá todas as colunas necessárias
• Preencha apenas as colunas que deseja ALTERAR
• Deixe em branco as colunas que NÃO devem ser modificadas

2. IDENTIFICAÇÃO DOS PRODUTOS
----------------------------
• O campo "Código SKU" é OBRIGATÓRIO e identifica cada produto
• NUNCA altere o código SKU - ele serve apenas para localizar o produto
• Produtos com SKU inexistente serão ignorados
• O sistema mostrará quais SKUs foram ignorados

3. CAMPOS EDITÁVEIS
------------------
• Nome do produto
• Descrição
• Marca, categoria, plataforma
• Preços (todos os tipos)
• Estoque
• Imagens (principal e adicionais)
• Status (ativo/inativo, destaque)
• Badge (texto e cor)
• SEO (meta title, meta description)
• Tags
• Especificações

4. FORMATO DOS DADOS
-------------------
• Booleanos: TRUE/FALSE, 1/0, SIM/NÃO, YES/NO
• Arrays: separe itens com ponto e vírgula (;)
  Exemplo: "tag1;tag2;tag3" ou "url1.jpg;url2.jpg"
• JSON: use formato JSON válido para campos complexos
• Números: use ponto (.) como separador decimal

5. PROCESSO DE EDIÇÃO
--------------------
• Faça upload da planilha preenchida
• O sistema validará os dados automaticamente
• Revise os avisos e erros antes de confirmar
• Confirme para aplicar as alterações
• Acompanhe o progresso da atualização

6. DICAS IMPORTANTES
-------------------
• Faça backup antes de edições grandes
• Teste com poucos produtos primeiro
• Campos vazios NÃO apagam dados existentes
• Use o preview para verificar antes de aplicar
• Mantenha sempre uma cópia da planilha original

7. EXEMPLOS DE USO
-----------------
• Atualizar preços de uma categoria específica
• Ativar/desativar produtos em massa
• Adicionar tags a vários produtos
• Corrigir informações de estoque
• Atualizar descriptions/SEO em lote

8. SOLUÇÃO DE PROBLEMAS
----------------------
• SKU não encontrado: verifique se o código está correto
• Erro de formato: verifique tipos de dados (números, booleanos)
• Falha na atualização: verifique permissões e conexão
• Dados não alterados: verifique se os campos não estão vazios

LEMBRE-SE: Esta ferramenta é poderosa - use com cuidado!
Para dúvidas, consulte a documentação ou suporte técnico.

Data: ${new Date().toLocaleDateString('pt-BR')}
`;
};