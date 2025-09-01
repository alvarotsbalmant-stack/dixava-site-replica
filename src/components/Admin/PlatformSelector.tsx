import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';

interface PlatformSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione a plataforma",
  label = "Plataforma",
  disabled = false,
  required = false
}) => {
  const { platformConfig, loading } = useDynamicPlatforms();

  if (loading) {
    return (
      <div>
        {label && <Label>{label}</Label>}
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Carregando plataformas..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  const platforms = Object.values(platformConfig);

  return (
    <div>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform.id} value={platform.id}>
              <div className="flex items-center gap-2">
                {platform.icon.startsWith('http') ? (
                  <img 
                    src={platform.icon} 
                    alt={platform.name}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <span>{platform.icon}</span>
                )}
                <span>{platform.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PlatformSelector;