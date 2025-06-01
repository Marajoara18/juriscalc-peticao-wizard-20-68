
import React from 'react';

const AuthLogo: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center">
      <img 
        src="/lovable-uploads/2dd8ec7a-6e0c-401d-9584-46801524c4cb.png"
        alt="Logo"
        className="h-28 w-auto mb-3"
        style={{ minWidth: 160 }}
      />
      <p className="mt-1 text-gray-600">Sua plataforma de cálculos trabalhistas</p>
    </div>
  );
};

export default AuthLogo;
