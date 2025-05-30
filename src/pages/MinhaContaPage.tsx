
import React from 'react';
import { PeticoesProvider } from '@/contexts/PeticoesContext';
import { UserAccountView } from '@/components/peticoes/views/UserAccountView';

const MinhaContaPage = () => {
  return (
    <PeticoesProvider>
      <UserAccountView />
    </PeticoesProvider>
  );
};

export default MinhaContaPage;
