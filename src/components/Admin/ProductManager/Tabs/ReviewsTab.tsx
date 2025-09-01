import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Star } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';

interface ReviewsTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ formData, onChange }) => {
  const handleReviewConfigChange = (field: string, value: any) => {
    const currentConfig = formData.reviews_config || {};
    onChange('reviews_config', {
      ...currentConfig,
      [field]: value
    });
  };

  const handleCustomRatingChange = (field: string, value: any) => {
    const currentConfig = formData.reviews_config || {
      enabled: true,
      show_rating: true, 
      show_count: true,
      allow_reviews: true,
      custom_rating: { value: 0, count: 0, use_custom: false }
    };
    const currentCustomRating = currentConfig.custom_rating || { value: 0, count: 0, use_custom: false };
    onChange('reviews_config', {
      ...currentConfig,
      custom_rating: {
        ...currentCustomRating,
        [field]: value
      }
    });
  };

  const reviewsConfig = formData.reviews_config || {
    enabled: true,
    show_rating: true,
    show_count: true,
    allow_reviews: true,
    custom_rating: {
      value: 0,
      count: 0,
      use_custom: false
    }
  };
  const customRating = reviewsConfig.custom_rating || {
    value: 0,
    count: 0,
    use_custom: false
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Configurações de Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={reviewsConfig.enabled !== false}
              onCheckedChange={(checked) => handleReviewConfigChange('enabled', checked)}
            />
            <Label>Habilitar sistema de avaliações</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={reviewsConfig.show_rating !== false}
              onCheckedChange={(checked) => handleReviewConfigChange('show_rating', checked)}
            />
            <Label>Exibir rating (estrelas)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={reviewsConfig.show_count !== false}
              onCheckedChange={(checked) => handleReviewConfigChange('show_count', checked)}
            />
            <Label>Exibir quantidade de avaliações</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={reviewsConfig.allow_reviews !== false}
              onCheckedChange={(checked) => handleReviewConfigChange('allow_reviews', checked)}
            />
            <Label>Permitir novas avaliações</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Rating Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={customRating.use_custom || false}
              onCheckedChange={(checked) => handleCustomRatingChange('use_custom', checked)}
            />
            <Label>Usar rating personalizado (sobrescreve o automático)</Label>
          </div>

          {customRating.use_custom && (
            <>
              <div>
                <Label htmlFor="custom_rating_value">Nota (0-5)</Label>
                <Input
                  id="custom_rating_value"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={customRating.value || 0}
                  onChange={(e) => handleCustomRatingChange('value', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="custom_rating_count">Quantidade de Avaliações</Label>
                <Input
                  id="custom_rating_count"
                  type="number"
                  min="0"
                  value={customRating.count || 0}
                  onChange={(e) => handleCustomRatingChange('count', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {customRating.use_custom && customRating.value > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (customRating.value || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{customRating.value}</span>
                <span className="text-gray-500">({customRating.count} avaliações)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsTab;

