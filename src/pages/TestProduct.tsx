import React from 'react';
import { useParams } from 'react-router-dom';

const TestProduct = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center">Página de Produto Premium Funcionando!</h1>
      <p className="text-xl text-center mt-4">ID do produto: {id}</p>
      <p className="text-center mt-2">Esta é a nova página de produto premium que criamos.</p>
    </div>
  );
};

export default TestProduct;