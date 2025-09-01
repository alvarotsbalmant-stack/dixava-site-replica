import React, { Suspense, lazy } from 'react';
import { useAdminImport } from '@/hooks/useConditionalImport';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { AdminFeatureLoader } from './LazyAdminFeatures';

// Lazy load all admin tab components
const LazyProductManager = lazy(() => import('./ProductManagerNew'));
const LazyBannerManager = lazy(() => import('./BannerManagerNew').then(m => ({ default: m.BannerManagerNew })));
const LazyUserManager = lazy(() => import('./SimpleUserManager').then(m => ({ default: m.SimpleUserManager })));
const LazyStorageManager = lazy(() => import('./StorageManager'));
const LazyPageManager = lazy(() => import('./PageManager'));
const LazyMasterProductManager = lazy(() => import('./MasterProductManager'));
const LazyPlatformManager = lazy(() => import('./PlatformManager'));
const LazyBulkProductUpload = lazy(() => import('./BulkProductUploadLazy'));
const LazyProductImageManager = lazy(() => import('@/pages/Admin/ProductImageManager'));
const LazySpecialSectionManager = lazy(() => import('./SpecialSectionManager'));
const LazyDesktopProductManager = lazy(() => import('@/pages/Admin/ProductDesktopManager'));

interface LazyTabProps {
  children: React.ReactNode;
  tabName: string;
}

const LazyTabWrapper: React.FC<LazyTabProps> = ({ children, tabName }) => (
  <AdminErrorBoundary fallback={() => <div>Erro ao carregar {tabName}</div>}>
    <Suspense fallback={<AdminFeatureLoader feature={tabName} />}>
      {children}
    </Suspense>
  </AdminErrorBoundary>
);

// Individual lazy tab components
export const LazyProductManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Gerenciador de Produtos">
    <LazyProductManager />
  </LazyTabWrapper>
);

export const LazyBannerManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Gerenciador de Banners">
    <LazyBannerManager />
  </LazyTabWrapper>
);

export const LazyUserManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Gerenciador de Usuários">
    <LazyUserManager />
  </LazyTabWrapper>
);

export const LazyStorageManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Gerenciador de Armazenamento">
    <LazyStorageManager />
  </LazyTabWrapper>
);

export const LazyAnalyticsManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Analytics">
    <div>Analytics Manager não encontrado</div>
  </LazyTabWrapper>
);

export const LazyPageManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Gerenciador de Páginas">
    <LazyPageManager />
  </LazyTabWrapper>
);

export const LazyMasterProductManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Produtos Mestres">
    <LazyMasterProductManager />
  </LazyTabWrapper>
);

export const LazyPlatformManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Gerenciador de Plataformas">
    <LazyPlatformManager />
  </LazyTabWrapper>
);

export const LazyBulkProductUploadTab: React.FC = () => (
  <LazyTabWrapper tabName="Upload em Massa">
    <LazyBulkProductUpload />
  </LazyTabWrapper>
);

export const LazyProductImageManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Gerenciador de Imagens">
    <LazyProductImageManager />
  </LazyTabWrapper>
);

export const LazySpecialSectionManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Seções Especiais">
    <LazySpecialSectionManager />
  </LazyTabWrapper>
);

export const LazyDesktopProductManagerTab: React.FC = () => (
  <LazyTabWrapper tabName="Produtos Desktop">
    <LazyDesktopProductManager />
  </LazyTabWrapper>
);