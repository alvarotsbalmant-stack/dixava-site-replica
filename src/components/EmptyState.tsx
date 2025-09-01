import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "Nenhum item encontrado",
  description = "Não há itens para exibir no momento.",
  className = ""
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto max-w-md">
        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
          <svg 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-full h-full"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;