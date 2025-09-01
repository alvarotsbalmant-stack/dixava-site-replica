import React from 'react';
import { Product } from '@/hooks/useProducts';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductDescriptionExpandableProps {
  product: Product;
  className?: string;
}

const ProductDescriptionExpandable: React.FC<ProductDescriptionExpandableProps> = ({
  product,
  className
}) => {
  const previewText = product.description || 
    "Descubra uma experiência de jogo revolucionária com gráficos impressionantes, jogabilidade inovadora e uma narrativa envolvente que redefine os padrões da indústria. Com tecnologia de ponta e otimização para PlayStation 5, este título oferece horas de entretenimento de alta qualidade.";

  return (
    <div className={cn("space-y-6", className)}>
      {/* Título */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Sobre o Produto
        </h3>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Informações Completas
        </Badge>
      </div>

      {/* Descrição Simples */}
      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {previewText}
        </p>
      </div>

      {/* Suporte e Atendimento */}
<div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-sm p-4">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded-sm flex-shrink-0">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 mb-2">
              Precisa de ajuda com este produto?
            </h5>
            <p className="text-gray-700 mb-3 leading-relaxed text-sm">
              Nossa equipe especializada está pronta para esclarecer suas dúvidas e ajudar você a fazer a melhor escolha.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                onClick={() => window.open('https://wa.me/5527999999999?text=Olá! Tenho dúvidas sobre o produto: ' + encodeURIComponent(product.name), '_blank')}
              >
                <span className="text-sm">📱</span>
                WhatsApp
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                onClick={() => window.open('tel:+5527999999999', '_self')}
              >
                <span className="text-sm">📞</span>
                Ligar Agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescriptionExpandable;

