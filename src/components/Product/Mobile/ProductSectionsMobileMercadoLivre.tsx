import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { SKUNavigation } from '@/hooks/useProducts/types';
import { ChevronDown, ChevronUp, Star, ThumbsUp, Flag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import RelatedProductsCarousel from '../MainContent/RelatedProductsCarousel';
import GoogleReviewsMobile from '../Sidebar/GoogleReviewsMobile';

interface ProductSectionsMobileMercadoLivreProps {
  product: Product;
  skuNavigation?: SKUNavigation;
}

const ProductSectionsMobileMercadoLivre: React.FC<ProductSectionsMobileMercadoLivreProps> = ({ 
  product, 
  skuNavigation 
}) => {
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Especificações principais (simuladas baseadas no produto)
  const mainSpecs = [
    { label: 'É carta cromada', value: 'Sim' },
    { label: 'Quantidade de cartões', value: '60' },
    { label: 'Quantidade de mazos', value: '1' },
    { label: 'Nome do carta colecionável', value: product.name },
    { label: 'Ano', value: '2024' },
    { label: 'Plataforma', value: product.platform || 'Múltiplas' },
    { label: 'Idioma', value: 'Português' },
    { label: 'É carta cromada', value: 'Sim' },
    { label: 'É holográfica', value: 'Sim' }
  ];

  const allSpecs = [
    ...mainSpecs,
    { label: 'Tipo de rareza', value: 'Rara' },
    { label: 'Tipo de jogo', value: 'TCG' },
    { label: 'Marca', value: 'Copag' },
    { label: 'Linha', value: product.category },
    { label: 'Condição', value: 'Novo' },
    { label: 'Origem', value: 'Nacional' }
  ];

  // Imagens adicionais
  const additionalImages = product.additional_images || [];

  // Avaliações simuladas
  const reviews = [
    {
      id: 1,
      rating: 4,
      date: '22 dez. 2024',
      comment: 'O jogo de cartas colecionáveis é recomendado por sua qualidade e diversão, sendo considerado um dos melhores para batalhas de liga. As cartas são elogiadas por serem bonitas e o deck é visto como ótimo para batalhas.',
      helpful: 1,
      photos: []
    },
    {
      id: 2,
      rating: 4,
      date: '07 jan. 2025',
      comment: 'A caixa veio um pouco amassado na ponta, mas sinceramente não me importo com ela. Agora falando das coisas que vem nesse box, pokémon company poderia muito bem aumentar o tamanho do deck box, até colocando o sleeve mais fino que tenho aqui já passa o tamanho da caixa inteira.',
      helpful: 11,
      photos: []
    },
    {
      id: 3,
      rating: 5,
      date: '28 jan. 2025',
      comment: 'Tirando a caixa que veio levemente amassada o produto segue perfeito.',
      helpful: 5,
      photos: []
    }
  ];

  return (
    <div className="bg-white">
      {/* Outras opções de compra */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Outras opções de compra</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-medium text-gray-900">R$ 165,12</div>
              <div className="text-sm text-gray-500">15% OFF</div>
              <div className="text-sm text-green-600">Parcelamento sem juros</div>
            </div>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Ver mais opções a partir de R$ 125,91
        </Button>
      </div>

      {/* Ver mais produtos do vendedor */}
      <div className="border-t border-gray-100 p-4">
        <Button variant="outline" className="w-full text-blue-600 border-blue-600">
          Ver mais produtos do vendedor
        </Button>
      </div>

      {/* Avaliações Google - substituindo seção de informações do produto */}
      <GoogleReviewsMobile />

      {/* Vendedor */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Vendido por UTI DOS GAMES</h3>
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">+100</div>
            <div className="text-sm text-gray-500">Vendas concluídas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">Oferece um bom atendimento</div>
            <div className="text-sm text-gray-500">Oferece um bom atendimento</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">Entrega os produtos dentro do prazo</div>
            <div className="text-sm text-gray-500">Entrega os produtos dentro do prazo</div>
          </div>
        </div>
        <Button variant="outline" className="w-full text-blue-600 border-blue-600">
          Ver mais produtos do vendedor
        </Button>
      </div>

      {/* Características do produto */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Características do produto</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Características principais</h4>
          <div className="space-y-3">
            {(showAllSpecs ? allSpecs : allSpecs.slice(0, 7)).map((spec, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-600">{spec.label}</span>
                <span className="font-medium text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAllSpecs(!showAllSpecs)}
          className="w-full text-blue-600 border-blue-600"
        >
          {showAllSpecs ? 'Ver menos características' : 'Conferir todas as características'}
          {showAllSpecs ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {/* Fotos do produto */}
      {additionalImages.length > 0 && (
        <div className="border-t border-gray-100 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Fotos do produto</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(showAllPhotos ? additionalImages : additionalImages.slice(0, 4)).map((image, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
          {additionalImages.length > 4 && (
            <Button
              variant="outline"
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="w-full text-blue-600 border-blue-600"
            >
              {showAllPhotos ? 'Ver menos fotos' : 'Ver mais fotos'}
            </Button>
          )}
        </div>
      )}

      {/* Descrição */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Descrição</h3>
        <div className="text-sm text-gray-700 leading-relaxed">
          <div className={showFullDescription ? '' : 'line-clamp-6'}>
            {product.description || 'Baralho Batalha de Liga Pokémon Gardevoir ex Mew ex Greninja Radiante Lumineon V Copag\n\nTenha o poder da mente em suas mãos!\n\nContendo 6 cartas ultra raras, dentre elas a de Mew ex, você será capaz de duelar com um baralho com cartas especialmente designadas para as mais épicas batalhas! Através da habilidade de Gardevoir ex, carregue seus Pokémons. Lumineon V, além de um poderoso ataque, será responsável por trazer um Apoiador à sua mão!\n\nEscolha um dos ataques do Pokémon do seu oponente como um próprio ataque com Mew ex e utilize com sabedoria a habilidade de Greninja Radiante, que proporciona a compra de mais duas cartas durante o seu turno. Com esse engenhoso deck você será capaz de combates e vitórias inesquecíveis!'}
          </div>
        </div>
        {/* 🔧 CORREÇÃO: Só mostrar botão se descrição for longa (mais de 200 caracteres) */}
        {(product.description || 'Baralho Batalha de Liga Pokémon Gardevoir ex Mew ex Greninja Radiante Lumineon V Copag\n\nTenha o poder da mente em suas mãos!\n\nContendo 6 cartas ultra raras, dentre elas a de Mew ex, você será capaz de duelar com um baralho com cartas especialmente designadas para as mais épicas batalhas! Através da habilidade de Gardevoir ex, carregue seus Pokémons. Lumineon V, além de um poderoso ataque, será responsável por trazer um Apoiador à sua mão!\n\nEscolha um dos ataques do Pokémon do seu oponente como um próprio ataque com Mew ex e utilize com sabedoria a habilidade de Greninja Radiante, que proporciona a compra de mais duas cartas durante o seu turno. Com esse engenhoso deck você será capaz de combates e vitórias inesquecíveis!').length > 200 && (
          <Button
            variant="ghost"
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-blue-600 p-0 h-auto mt-2"
          >
            {showFullDescription ? 'Ver menos' : 'Ver descrição completa'}
          </Button>
        )}
      </div>

      {/* Meios de pagamento */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Meios de pagamento</h3>
        <Button variant="outline" className="w-full text-blue-600 border-blue-600">
          Ver mais meios de pagamento
        </Button>
      </div>

      {/* Perguntas e respostas */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Perguntas e respostas</h3>
        
        <div className="relative mb-4">
          <Input
            placeholder="Digite uma pergunta ou palavra-chave..."
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Últimas perguntas feitas</h4>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                As cartas são todas em português?
              </div>
              <div className="text-sm text-gray-600 pl-4">
                Olá, sim, são em português.
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full text-blue-600 border-blue-600">
          Como pergunto ao vendedor?
        </Button>
      </div>

      {/* Opiniões do produto */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Opiniões do produto</h3>
        
        {/* Resumo das avaliações */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-light text-blue-600 mb-1">4.8</div>
            <div className="flex justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="text-sm text-gray-500">184 avaliações</div>
          </div>
          
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-600 w-2">{rating}</span>
                <Star className="w-3 h-3 text-gray-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full" 
                    style={{ width: rating === 5 ? '80%' : rating === 4 ? '15%' : '5%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custo-benefício */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-900 mb-2">Custo-benefício</div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-blue-500 text-blue-500" />
            ))}
          </div>
        </div>

        {/* Opiniões com fotos */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-900 mb-3">Opiniões com fotos</div>
          <div className="flex gap-2 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div key={index} className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex-shrink-0 w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
              +3
            </div>
          </div>
        </div>

        {/* Opiniões em destaque */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-900">Opiniões em destaque</div>
            <div className="text-sm text-gray-500">31 comentários</div>
            <Button variant="outline" size="sm" className="text-green-600 border-green-600">
              Filtrar
            </Button>
          </div>

          <div className="space-y-4">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {review.comment}
                </p>
                
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    É útil {review.helpful > 1 && review.helpful}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 p-0 h-auto">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="w-full text-blue-600 border-blue-600"
        >
          {showAllReviews ? 'Ver menos opiniões' : 'Mostrar todas as opiniões'}
        </Button>
      </div>

      {/* Produtos relacionados */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Quem viu este produto também comprou</h3>
        <RelatedProductsCarousel currentProduct={product} />
      </div>

      {/* Você também pode estar interessado */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Você também pode estar interessado:</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'carta pokemon ex',
            'deck box',
            'deck pokemon',
            'deck box pokemon',
            'box pokemon',
            'baralho pokemon',
            'pokemon tcg'
          ].map((term, index) => (
            <Button key={index} variant="outline" size="sm" className="text-blue-600 border-blue-600">
              {term}
            </Button>
          ))}
        </div>
      </div>

      {/* Espaçamento para botões fixos */}
      <div className="h-20"></div>
    </div>
  );
};

export default ProductSectionsMobileMercadoLivre;

