import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { SpecialSection } from '@/types/specialSections/core';

interface NewsRendererProps {
  section: SpecialSection;
  className?: string;
}

export const NewsRenderer: React.FC<NewsRendererProps> = ({
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

      {/* Grid de notícias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.articles?.map((article: any, index: number) => (
          <Card 
            key={index} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              if (article.url) {
                window.open(article.url, '_blank');
              }
            }}
          >
            {article.imageUrl && (
              <div className="aspect-video">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 line-clamp-2">
                {article.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {article.excerpt}
              </p>
              <p className="text-xs text-gray-500">
                {article.publishedAt || 'Recente'}
              </p>
            </CardContent>
          </Card>
        )) || (
          // Placeholder se não houver artigos configurados
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video bg-gray-200"></div>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Notícia Exemplo {index + 1}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                </p>
                <p className="text-xs text-gray-500">Há 2 dias</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};

