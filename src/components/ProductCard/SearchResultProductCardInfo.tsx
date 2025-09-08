import React from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface SearchResultProductCardInfoProps {
  product: Product;
}

const SearchResultProductCardInfo: React.FC<SearchResultProductCardInfoProps> = ({ product }) => {
  // Função para extrair plataforma do nome do produto
  const extractPlatform = (name: string): string => {
    const platforms = [
      'PlayStation 5', 'PS5', 'PlayStation 4', 'PS4',
      'Xbox Series X', 'Xbox Series S', 'Xbox One',
      'Nintendo Switch', 'Switch', 'PC', 'Steam'
    ];
    
    for (const platform of platforms) {
      if (name.toLowerCase().includes(platform.toLowerCase())) {
        // Normalizar nomes
        if (platform.includes('PS5') || platform.includes('PlayStation 5')) return 'PlayStation 5';
        if (platform.includes('PS4') || platform.includes('PlayStation 4')) return 'PlayStation 4';
        if (platform.includes('Xbox Series X')) return 'Xbox Series X';
        if (platform.includes('Xbox Series S')) return 'Xbox Series S';
        if (platform.includes('Xbox One')) return 'Xbox One';
        if (platform.includes('Switch') || platform.includes('Nintendo Switch')) return 'Nintendo Switch';
        if (platform.includes('PC') || platform.includes('Steam')) return 'PC';
        return platform;
      }
    }
    return '';
  };

  // Função para extrair categoria do nome do produto
  const extractCategory = (name: string): string => {
    const categories = [
      'RPG', 'Ação', 'Aventura', 'Esporte', 'Corrida', 'Luta', 'Tiro', 'Estratégia',
      'Simulação', 'Puzzle', 'Plataforma', 'Horror', 'Survival', 'Battle Royale'
    ];
    
    // Mapeamento baseado em palavras-chave comuns
    const keywordMap: { [key: string]: string } = {
      'resident evil': 'Horror',
      'call of duty': 'Tiro',
      'assassin': 'Ação',
      'fifa': 'Esporte',
      'forza': 'Corrida',
      'halo': 'Tiro',
      'mario': 'Plataforma',
      'zelda': 'Aventura',
      'pokemon': 'RPG',
      'final fantasy': 'RPG',
      'dragon ball': 'Luta',
      'spider-man': 'Ação',
      'god of war': 'Ação',
      'horizon': 'Aventura',
      'the last of us': 'Aventura',
      'cyberpunk': 'RPG',
      'witcher': 'RPG',
      'battlefield': 'Tiro',
      'apex': 'Battle Royale',
      'fortnite': 'Battle Royale'
    };

    const lowerName = name.toLowerCase();
    
    // Verificar palavras-chave específicas
    for (const [keyword, category] of Object.entries(keywordMap)) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }

    // Verificar categorias diretas no nome
    for (const category of categories) {
      if (lowerName.includes(category.toLowerCase())) {
        return category;
      }
    }

    return 'Jogo';
  };

  // Função para determinar status do produto
  const getProductStatus = (product: Product): string => {
    // Lógica simples baseada no preço e disponibilidade
    if (product.price === 0) return 'Indisponível';
    if (product.name.toLowerCase().includes('pré-venda') || 
        product.name.toLowerCase().includes('pre-order')) return 'Pré-venda';
    
    // Simular alguns status baseado no ID do produto
    const statusOptions = ['Em estoque', 'Últimas unidades', 'Novo lançamento'];
    const statusIndex = parseInt(product.id) % statusOptions.length;
    return statusOptions[statusIndex];
  };

  const platform = extractPlatform(product.name);
  const category = extractCategory(product.name);
  const status = getProductStatus(product);

  // Cores para diferentes plataformas
  const getPlatformColor = (platform: string): string => {
    switch (platform) {
      case 'PlayStation 5':
      case 'PlayStation 4':
        return 'bg-blue-100 text-blue-800';
      case 'Xbox Series X':
      case 'Xbox Series S':
      case 'Xbox One':
        return 'bg-green-100 text-green-800';
      case 'Nintendo Switch':
        return 'bg-red-100 text-red-800';
      case 'PC':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  // Cores para diferentes status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Em estoque':
        return 'bg-green-100 text-green-800';
      case 'Últimas unidades':
        return 'bg-orange-100 text-orange-800';
      case 'Novo lançamento':
        return 'bg-blue-100 text-blue-800';
      case 'Pré-venda':
        return 'bg-purple-100 text-purple-800';
      case 'Indisponível':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-1 min-h-[4rem] flex flex-col">
      {/* Título do produto */}
      <h3
        className={cn(
          "font-sans text-xs sm:text-sm md:text-base font-medium leading-tight text-gray-900 text-left",
          "line-clamp-2",
          "flex-shrink-0 mb-1" // Removendo altura fixa e adicionando margem
        )}
        title={product.name}
      >
        {product.name}
      </h3>

      {/* Tags informativas - responsivas para todas as resoluções */}
      <div className="flex-1 flex items-start pt-1">
        <div className="flex flex-wrap gap-1 w-full">
          {platform && (
            <span className={cn(
              "inline-flex items-center px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0",
              getPlatformColor(platform)
            )}>
              {platform}
            </span>
          )}
          
          <span className="inline-flex items-center px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap flex-shrink-0">
            {category}
          </span>
          
          <span className={cn(
            "inline-flex items-center px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0",
            getStatusColor(status)
          )}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchResultProductCardInfo;

