import React from 'react';
import { BarChart3, Eye, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PageStatsProps {
  page: any;
  sections: any[];
}

export const PageStats: React.FC<PageStatsProps> = ({ page, sections }) => {
  const visibleSections = sections.filter(s => s.is_visible).length;
  const hiddenSections = sections.filter(s => !s.is_visible).length;
  
  const sectionTypes = sections.reduce((acc, section) => {
    acc[section.section_type] = (acc[section.section_type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      product_section: 'Produtos',
      hero_banner: 'Banner Hero',
      promo_banner: 'Promo',
      custom_banner: 'Banner',
      special_section: 'Especial',
      spacer: 'Espaço'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>ESTATÍSTICAS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da página */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={page.is_active ? 'default' : 'secondary'}>
            {page.is_active ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>

        {/* Total de seções */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Seções</span>
          <span className="text-sm font-medium">{sections.length}</span>
        </div>

        {/* Seções visíveis */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Visíveis</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{visibleSections}</span>
            <Eye className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>

        {/* Seções ocultas */}
        {hiddenSections > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ocultas</span>
            <span className="text-sm font-medium text-muted-foreground">{hiddenSections}</span>
          </div>
        )}

        {/* Tipos de seção */}
        {Object.keys(sectionTypes).length > 0 && (
          <>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">TIPOS DE SEÇÃO</p>
              <div className="space-y-2">
                {Object.entries(sectionTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {getTypeLabel(type)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {count as number}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Data de criação */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Criada em</span>
                <span className="text-xs text-muted-foreground">
                  {page.created_at ? new Date(page.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>

        {/* Última atualização */}
        {page.updated_at && page.updated_at !== page.created_at && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Atualizada</span>
            <span className="text-xs text-muted-foreground">
              {new Date(page.updated_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageStats;