
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Page not found component for platform pages
const PlatformPageNotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-16">
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Página não encontrada</AlertTitle>
            <AlertDescription>
              A página que você está procurando não existe ou não está disponível.
            </AlertDescription>
          </Alert>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlatformPageNotFound;
