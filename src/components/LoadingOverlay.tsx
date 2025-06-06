
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subtitle?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = "Carregando...", 
  subtitle 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-2xl">
        <div className="mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-juriscalc-navy mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-juriscalc-navy mb-2">
          {message}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
