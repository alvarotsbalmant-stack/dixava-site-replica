import React from 'react';
import { useParams } from 'react-router-dom';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import Footer from '@/components/Footer';

const SectionPageSimple: React.FC = () => {
  const { sectionKey } = useParams<{ sectionKey: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Seção: {sectionKey}
          </h1>
          <p className="text-gray-600 mt-2">
            Página de teste para verificar se o roteamento está funcionando
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Informações de Debug</h2>
          <div className="space-y-2">
            <p><strong>Section Key:</strong> {sectionKey}</p>
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>Status:</strong> Página carregada com sucesso</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SectionPageSimple;

