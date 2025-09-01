import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { SKUNavigation, Platform } from '@/hooks/useProducts/types';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';
import { cn } from '@/lib/utils';

interface SKUBreadcrumbProps {
  skuNavigation: SKUNavigation;
  className?: string;
}

const SKUBreadcrumb: React.FC<SKUBreadcrumbProps> = ({
  skuNavigation,
  className
}) => {
  const { masterProduct, currentSKU } = skuNavigation;
  const { platformConfig } = useDynamicPlatforms();
  
  const getCurrentPlatformInfo = () => {
    if (currentSKU?.variant_attributes?.platform) {
      return platformConfig[currentSKU.variant_attributes.platform];
    }
    return null;
  };

  const platformInfo = getCurrentPlatformInfo();

  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-gray-600", className)}>
      {/* Home */}
      <Link 
        to="/" 
        className="flex items-center hover:text-red-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* SKU Atual (se for um SKU específico) */}
      {currentSKU && platformInfo && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium flex items-center gap-2">
            {platformInfo.icon.startsWith('http') ? (
              <img 
                src={platformInfo.icon} 
                alt={platformInfo.name}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <span className="text-lg">{platformInfo.icon}</span>
            )}
            {platformInfo.name}
          </span>
        </>
      )}
    </nav>
  );
};

export default SKUBreadcrumb;

