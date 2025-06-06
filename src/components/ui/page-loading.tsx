import React from 'react';

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ message = "Carregando..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-white mx-auto mb-6"></div>
        <p className="text-xl font-semibold tracking-wide">{message}</p>
        <p className="text-sm opacity-80 mt-2">Por favor, aguarde um momento.</p>
      </div>
    </div>
  );
}; 