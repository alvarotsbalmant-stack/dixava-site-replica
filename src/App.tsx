import React, { Suspense, lazy } from "react";
import './utils/categoryTestSimple';
import './utils/n7ErrorSuppressor'; // ← NOVO: Supressor de erro n7.map
import './styles/n7ErrorSuppression.css'; // ← NOVO: CSS para suprimir erro n7.map
import './styles/mobile-improvements.css'; // ← NOVO: CSS para melhorias mobile
import './utils/debugHelper'; // ← Debug helper para diagnosticar problemas
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { ProductProviderOptimized } from '@/contexts/ProductContextOptimized';
import { ProductProvider } from '@/contexts/ProductContext';
import { UTICoinsProvider } from '@/contexts/UTICoinsContext';
import { UIStateProvider } from '@/contexts/UIStateContext';
import { LoadingProvider } from "@/contexts/LoadingContext";
import { GlobalNavigationProvider } from "@/contexts/GlobalNavigationContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { EnterpriseTrackingProvider } from "@/contexts/EnterpriseTrackingContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import { setupErrorInterception } from "@/utils/errorCorrection";
import GlobalNavigationOverlay from "@/components/GlobalNavigationOverlay";
import { usePageResourcePreload } from '@/hooks/useResourceHints';
import { usePageScrollRestoration } from '@/hooks/usePageScrollRestoration';
import AppContent from '@/components/AppContent';
import Index from "./pages/Index";
import AssistenciaTecnica from "./pages/AssistenciaTecnica";
// Security system removed - using simplified auth
import { useEffect } from "react";

// Componentes de preloading inteligente
import { AppWithPreloader } from "@/components/AppWithPreloader";
import ErrorBoundary from "@/components/ErrorBoundary";

// Hook minimalista para prevenir layout shift sem interferir no scroll
const usePreventLayoutShift = () => {
  useEffect(() => {
    // Apenas configuração básica, sem interferir no scroll restoration
    document.body.style.overflowX = 'hidden';
    
    // Observer mais específico com proteção contra erros
    let observer: MutationObserver | null = null;
    
    try {
      observer = new MutationObserver((mutations) => {
        try {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const target = mutation.target as HTMLElement;
              if (target === document.body) {
                // Apenas remove padding/margin que causam layout shift, SEM tocar no overflow-y
                if (target.style.paddingRight || target.style.marginRight) {
                  target.style.paddingRight = '';
                  target.style.marginRight = '';
                }
              }
            }
          });
        } catch (error) {
          console.warn('MutationObserver error:', error);
        }
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style']
      });
    } catch (error) {
      console.warn('Failed to setup MutationObserver:', error);
    }

    return () => {
      if (observer) {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('Failed to disconnect MutationObserver:', error);
        }
      }
    };
  }, []);
};

// Lazy loading para páginas menos críticas
const SearchResults = lazy(() => import("./pages/SearchResultsFinal"));
const SectionPage = lazy(() => import("./pages/SectionPage"));
const PrimePage = lazy(() => import("./pages/PrimePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UTIPro = lazy(() => import("./pages/UTIPro"));

// Lazy loading para páginas de plataforma
const PlayStationPageProfessionalV2 = lazy(() => import("./pages/platforms/PlayStationPageProfessionalV2"));
const PlayStationPageProfessionalV3 = lazy(() => import("./pages/platforms/PlayStationPageProfessionalV3"));
const PlayStationPageProfessionalV4 = lazy(() => import("./pages/platforms/PlayStationPageProfessionalV4"));
const PlayStationPageProfessionalV5 = lazy(() => import("./pages/platforms/PlayStationPageProfessionalV5"));
const NintendoPage = lazy(() => import("./pages/platforms/NintendoPage"));
const PCGamingPage = lazy(() => import("./pages/platforms/PCGamingPage"));
const RetroGamingPage = lazy(() => import("./pages/platforms/RetroGamingPage"));
const AreaGeekPage = lazy(() => import("./pages/platforms/AreaGeekPage"));

// Lazy loading para Xbox4 (única versão mantida)
const XboxPage4 = lazy(() => import("./pages/platforms/XboxPage4"));

// Conditional lazy loading para admin - apenas carrega se usuário for admin
const ConditionalAdminLoader = lazy(() => import("@/components/Admin/ConditionalAdminLoader").then(module => ({ default: module.ConditionalAdminLoader })));
const Xbox4AdminPage = lazy(() => import("./components/Admin/Xbox4AdminPage"));
const SpecialSectionCarouselPage = lazy(() => import("./pages/SpecialSectionCarouselPage"));
const PlatformPage = lazy(() => import("./components/PlatformPage"));

// Lazy loading para páginas de produto
const ProductPageSKU = lazy(() => import("./pages/ProductPageSKU"));
const TestProduct = lazy(() => import("./pages/TestProduct"));

// Lazy loading para páginas de cliente
const ClientArea = lazy(() => import("./pages/ClientArea"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const MeusCoins = lazy(() => import("./pages/MeusCoins"));
const Coins = lazy(() => import("./pages/Coins"));
// Import direto para páginas críticas de auth
import ConfirmarConta from "./pages/ConfirmarConta";
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AdminAutoLogin = lazy(() => import("./pages/AdminAutoLogin").then(module => ({ default: module.AdminAutoLogin })));
import { EmailVerificationGuard } from "@/components/Auth/EmailVerificationGuard";
const LoginPage = lazy(() => import("./components/Auth/LoginPage").then(module => ({ default: module.LoginPage })));

// Lazy loading para páginas de UTI Coins (legacy)
const CoinsShop = lazy(() => import("./pages/CoinsShop"));
const CoinsHistory = lazy(() => import("./pages/CoinsHistory"));

// Otimizar QueryClient com cache mais agressivo mas seguro
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos - cache moderado
      gcTime: 20 * 60 * 1000, // 20 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component otimizado
const PageLoader = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));
PageLoader.displayName = 'PageLoader';

// Protected Route Component otimizado
const ProtectedAdminRoute = React.memo(({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
});
ProtectedAdminRoute.displayName = 'ProtectedAdminRoute';

const App = () => {
  // Hook para prevenir layout shift globalmente
  usePreventLayoutShift();
  
  // Setup de interceptação de erros 404
  React.useEffect(() => {
    setupErrorInterception();
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* Security system removed */}
            <UTICoinsProvider>
              <UIStateProvider>
                <ProductProviderOptimized>
                  <LoadingProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <AnalyticsProvider>
                          <EnterpriseTrackingProvider>
                            <CartProvider>
                            <AppWithPreloader>
                              <GlobalNavigationProvider>
                                 <LoadingOverlay />
                                 <GlobalNavigationOverlay />
                                 <Suspense fallback={<PageLoader />}>
                                   <AppContent>
                                     <Routes>
                                       {/* Auth Routes - Outside EmailVerificationGuard */}
                                       <Route path="/auth" element={<LoginPage />} />
                                       <Route path="/cadastro" element={<RegisterPage />} />
                                     
                                     {/* Email Confirmation Route */}
                                     <Route path="/confirmar-conta/:codigo" element={<ConfirmarConta />} />

                                     {/* All other routes protected by EmailVerificationGuard */}
                                     <Route path="/*" element={
                                       <EmailVerificationGuard>
                                         <Routes>
                                           {/* Public Routes - Index sem lazy loading por ser crítica */}
                                           <Route path="/" element={<Index />} />
                                           
                                           {/* Product Page Routes - MUST come before dynamic routes */}
                                           <Route path="/produto/:id" element={<ProductPageSKU />} />
                                           <Route path="/teste-produto/:id" element={<TestProduct />} />

                                            {/* Client Area Routes */}
                                           <Route path="/area-cliente" element={<ClientArea />} />
                                           <Route path="/lista-desejos" element={<WishlistPage />} />
                                           
                                           {/* UTI Coins Routes - New Unified System */}
                                           <Route path="/coins" element={<Coins />} />
                                           
                                           {/* Legacy UTI Coins Routes - Redirect to unified page */}
                                           <Route path="/meus-coins" element={<Navigate to="/coins" replace />} />
                                           <Route path="/coins/loja" element={<Navigate to="/coins" replace />} />
                                           <Route path="/coins/historico" element={<Navigate to="/coins" replace />} />

                                           {/* Admin Auto Login Route - MUST come before admin routes */}
                                           <Route path="/admin-login/:token" element={<AdminAutoLogin />} />

                                           {/* Admin Routes - Protected & Conditionally Loaded */}
                                           <Route 
                                             path="/admin" 
                                             element={
                                               <ProtectedAdminRoute>
                                                 <ProductProvider>
                                                   <ConditionalAdminLoader />
                                                 </ProductProvider>
                                               </ProtectedAdminRoute>
                                             }
                                           />
                                           <Route 
                                             path="/admin/xbox4" 
                                             element={
                                               <ProtectedAdminRoute>
                                                 <Xbox4AdminPage /> 
                                               </ProtectedAdminRoute>
                                             }
                                           />

                                           {/* Special routes - MUST come before dynamic routes */}
                                           <Route path="/servicos/assistencia" element={<AssistenciaTecnica />} />
                                           <Route path="/busca" element={<SearchResults />} />
                                           <Route path="/secao/:sectionKey" element={<SectionPage />} />
                                           <Route path="/categoria/:category" element={<CategoryPage />} />
                                           
                                           {/* Dynamic Carousel Page Route */}
                                           <Route 
                                             path="/secao-especial/:sectionId/carrossel/:carouselIndex" 
                                             element={<SpecialSectionCarouselPage />} 
                                           />
                                           
                                           {/* Páginas de plataforma específicas - MUST come before dynamic routes */}
                                           <Route path="/xbox4" element={<XboxPage4 />} />
                                           <Route path="/playstation" element={<PlayStationPageProfessionalV5 />} />
                                           <Route path="/playstation-v2" element={<PlayStationPageProfessionalV2 />} />
                                           <Route path="/playstation-v3" element={<PlayStationPageProfessionalV3 />} />
                                           <Route path="/playstation-v4" element={<PlayStationPageProfessionalV4 />} />
                                           <Route path="/nintendo" element={<NintendoPage />} />
                                           <Route path="/pc-gaming" element={<PCGamingPage />} />
                                           <Route path="/retro-gaming" element={<RetroGamingPage />} />
                                           <Route path="/area-geek" element={<AreaGeekPage />} />

                                           {/* Prime Pages Route - MUST come before dynamic routes */}
                                           <Route path="/prime/:slug" element={<PrimePage />} />

                                           {/* Dynamic Page Route - MUST be last before catch-all */}
                                           <Route 
                                             path="/:slug" 
                                             element={<PlatformPage slug={window.location.pathname.substring(1)} />} 
                                           />

                                            {/* Catch-all Not Found Route - MUST be absolute last */}
                                            <Route path="*" element={<NotFound />} />
                                         </Routes>
                                       </EmailVerificationGuard>
                                     } />
                                   </Routes>
                                   </AppContent>
                                 </Suspense>
                            </GlobalNavigationProvider>
                          </AppWithPreloader>
                         </CartProvider>
                        </EnterpriseTrackingProvider>
                       </AnalyticsProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                 </LoadingProvider>
               </ProductProviderOptimized>
              </UIStateProvider>
             </UTICoinsProvider>
          {/* Security system removed */}
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
