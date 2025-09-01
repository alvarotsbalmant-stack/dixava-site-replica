
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Settings, Box, LogOut, Package, Image, ImagePlus, Zap, Monitor, Wrench, HardDrive } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LogoImage } from '@/components/OptimizedImage/LogoImage';

const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();

  // Basic sidebar navigation items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'products', label: 'Produtos', icon: Package, path: '/admin/products' },
    { id: 'desktop-products', label: 'Produtos Desktop', icon: Monitor, path: '/admin/desktop-products' },
    { id: 'easy-manager', label: 'Gerenciamento Fácil', icon: Zap, path: '/admin/easy-manager' },
    { id: 'images', label: 'Upload Fácil', icon: ImagePlus, path: '/admin/images' },
    { id: 'storage', label: 'Storage Manager', icon: HardDrive, path: '/admin/storage' },
    { id: 'banners', label: 'Banners', icon: Image, path: '/admin/banners' },
    { id: 'spec-diagnostic', label: 'Diagnóstico Specs', icon: Wrench, path: '/admin/spec-diagnostic' },
    // Add more admin links here (e.g., Products, Orders, Settings)
    // { href: '/admin/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-background border-r border-border">
        <div className="flex items-center h-16 px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <LogoImage 
              src="/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png" 
              alt="UTI DOS GAMES Logo" 
              className="h-8 w-auto" 
              priority={true}
            />
            <span className="text-lg">Admin UTI</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                  // Add active state styling if needed using useLocation
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 border-t border-border">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Optional: Add a mobile header here if needed */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet /> {/* Renders the nested admin route component */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
