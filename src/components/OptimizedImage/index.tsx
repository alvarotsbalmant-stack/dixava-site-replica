// Barrel export for OptimizedImage components
export { LazyImage } from './LazyImage';
export { ProductImage } from './ProductImage';
export { LogoImage } from './LogoImage';

// Re-export legacy OptimizedImage for backward compatibility
export { OptimizedImage, ProductImage as LegacyProductImage, useImagePreload } from '../OptimizedImage';