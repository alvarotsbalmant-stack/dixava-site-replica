import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { ChevronDown, ChevronUp, Info, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProductSpecifications } from '@/hooks/useProductSpecifications';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { getSpecificationByCode, extractCodeFromCategory, SPECIFICATION_CODES } from '@/utils/specificationCodes';

interface ProductSpecificationsTableProps {
  product: Product;
  className?: string;
}

const getCategoryConfig = (category: string) => {
  // First try to extract code from category (e.g., "[CTRL] 🎮 Controles" or "CTRL")
  const { code, cleanCategory } = extractCodeFromCategory(category);
  
  if (code) {
    const spec = getSpecificationByCode(code);
    if (spec) {
      return { title: spec.categoryName, icon: spec.emoji };
    }
  }
  
  // Try to match by code directly
  const directSpec = getSpecificationByCode(category);
  if (directSpec) {
    return { title: directSpec.categoryName, icon: directSpec.emoji };
  }
  
  // Try to match by category name
  const specByName = Object.values(SPECIFICATION_CODES).find(spec => 
    spec.categoryName.toLowerCase() === cleanCategory.toLowerCase() ||
    spec.categoryName.toLowerCase() === category.toLowerCase()
  );
  
  if (specByName) {
    return { title: specByName.categoryName, icon: specByName.emoji };
  }
  
  // Fallback to legacy mapping for compatibility
  const legacyConfigs: Record<string, { title: string; icon: string }> = {
    general: { title: 'Informações Gerais', icon: '📋' },
    technical: { title: 'Especificações Técnicas', icon: '⚙️' },
    storage: { title: 'Armazenamento e Instalação', icon: '💾' },
    multiplayer: { title: 'Recursos Online', icon: '🌐' },
    physical: { title: 'Informações Físicas', icon: '📦' },
  };
  
  return legacyConfigs[category] || { title: cleanCategory || category.charAt(0).toUpperCase() + category.slice(1), icon: '📄' };
};

const ProductSpecificationsTable: React.FC<ProductSpecificationsTableProps> = ({
  product,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);
  const { categorizedSpecs, loading } = useProductSpecifications(product.id, 'desktop', product);
  const { storeSettings } = useStoreSettings();

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Se não há especificações no banco, mostrar dados básicos do produto
  const hasSpecifications = categorizedSpecs && categorizedSpecs.length > 0;
  
  const fallbackSpecs = [
    {
      category: 'general',
      items: [
        { id: '1', product_id: product.id, category: 'general', label: 'Nome do Produto', value: product.name, highlight: false, order_index: 1 },
        { id: '2', product_id: product.id, category: 'general', label: 'Categoria', value: product.category || 'Games', highlight: false, order_index: 2 },
        { id: '3', product_id: product.id, category: 'general', label: 'Código do Produto', value: product.id.slice(0, 8).toUpperCase(), highlight: false, order_index: 3 },
        { id: '4', product_id: product.id, category: 'general', label: 'Marca/Editora', value: product.brand || 'A definir', highlight: false, order_index: 4 }
      ]
    }
  ];

  const specificationsToShow = hasSpecifications ? categorizedSpecs : fallbackSpecs;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Título */}
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-gray-900">
          Especificações Técnicas
        </h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {hasSpecifications ? 'Informações Detalhadas' : 'Informações Básicas'}
        </Badge>
      </div>

      {/* Seções de Especificações */}
      <div className="space-y-4">
        {specificationsToShow.map((section) => {
          const isExpanded = expandedSections.includes(section.category);
          const config = getCategoryConfig(section.category);
          
          return (
            <div
              key={section.category}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header da Seção */}
              <button
                onClick={() => toggleSection(section.category)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <h4 className="font-semibold text-gray-900 text-left">
                    {config.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {section.items.length} itens
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Conteúdo da Seção */}
              {isExpanded && (
                <div className="bg-white">
                  <div className="divide-y divide-gray-100">
                    {section.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 text-sm">
                            {item.label}
                          </span>
                          {item.highlight && (
                            <Badge className="bg-green-100 text-green-800 text-xs font-bold">
                              DESTAQUE
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium text-sm">
                            {item.value}
                          </span>
                          {item.value === 'Sim' && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                          {item.value === 'Não' && (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setExpandedSections(specificationsToShow.map(s => s.category))}
          className="flex-1"
        >
          Expandir Todas
        </Button>
        <Button
          variant="outline"
          onClick={() => setExpandedSections([])}
          className="flex-1"
        >
          Recolher Todas
        </Button>
      </div>

      {/* Link para Mais Informações */}
      <div className="text-center">
        <Button variant="outline" className="border-gray-300 text-gray-600">
          📄 Baixar ficha técnica completa (PDF)
        </Button>
      </div>
    </div>
  );
};

export default ProductSpecificationsTable;

