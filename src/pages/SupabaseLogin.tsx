
import React from 'react';
// import SupabaseLoginContainer from '@/components/auth/SupabaseLoginContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const SupabaseLogin = () => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold flex items-center justify-center p-4"
      style={{ 
        backgroundImage: "url('/lovable-uploads/22902ab3-f207-4d33-9503-0fb6e29d3d05.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-xl">Autenticação Temporariamente Desabilitada</CardTitle>
            <CardDescription>
              O sistema de login está temporariamente desabilitado para testes. 
              Você pode acessar todas as funcionalidades diretamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/home')}
              className="w-full bg-juriscalc-navy hover:bg-juriscalc-blue"
            >
              Ir para a Página Principal
            </Button>
            <Button 
              onClick={() => navigate('/calculadora')}
              variant="outline"
              className="w-full border-juriscalc-navy text-juriscalc-navy"
            >
              Ir para Calculadora
            </Button>
            <Button 
              onClick={() => navigate('/peticoes')}
              variant="outline"
              className="w-full border-juriscalc-navy text-juriscalc-navy"
            >
              Ir para Petições
            </Button>
          </CardContent>
        </Card>
        
        {/* COMPONENTE ORIGINAL COMENTADO PARA REATIVAÇÃO FUTURA:
        <SupabaseLoginContainer />
        */}
      </div>
    </div>
  );
};

export default SupabaseLogin;
