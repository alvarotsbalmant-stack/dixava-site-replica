import React from 'react';
import { Card } from '@/components/ui/card';
import type { SpecialSection } from '@/types/specialSections/core';

interface CategoryGridRendererProps {
  section: SpecialSection;
  className?: string;
}

export const CategoryGridRenderer: React.FC<CategoryGridRendererProps> = ({
  section,
  className = ''
}) => {
  const config = section.config as any;

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {section.title}
        </h2>
        {config.subtitle && (
          <p className="text-gray-600 text-lg">
            {config.subtitle}
          </p>
        )}
      </div>

      {/* Grid de categorias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {config.categories?.map((category: any, index: number) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              if (category.url) {
                window.location.href = category.url;
              }
            }}
          >
            <div className="aspect-square relative">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-2xl">{category.icon || '📱'}</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <h3 className="text-white font-bold text-center px-2">
                  {category.name}
                </h3>
              </div>
            </div>
          </Card>
        )) || (
          // Placeholder se não houver categorias configuradas
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Categoria {index + 1}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};

