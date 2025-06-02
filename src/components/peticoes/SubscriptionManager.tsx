import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface SubscriptionManagerProps {
  onClose: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    // In a real implementation, this would invoke a Stripe checkout session
    // through a Supabase Edge Function
    setLoading(true);
    
    try {
      // Example of what the Supabase function call would look like:
      // const { data, error } = await supabase.functions.invoke('create-checkout', {});
      // if (error) throw error;
      // window.location.href = data.url;
      
      // For now, just show a demo toast
      setTimeout(() => {
        toast.info('Para implementar pagamentos com Stripe, é necessário conectar seu projeto ao Supabase.');
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      toast.error('Falha ao processar a assinatura.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <span className="bg-juriscalc-gold text-juriscalc-navy p-1 rounded mr-2">PRO</span> 
            Plano Premium
          </CardTitle>
          <CardDescription>
            Aproveite todos os recursos do IusCalc sem limitações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Plano Gratuito</h3>
                <ul className="text-sm space-y-1">
                  <li>• Limite de 6 petições</li>
                  <li>• Modelos básicos</li>
                  <li>• Calculadora com recursos limitados</li>
                </ul>
                <p className="mt-3 text-lg font-bold">R$ 0</p>
              </div>
              <div className="bg-juriscalc-navy text-white p-4 rounded-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-juriscalc-gold text-juriscalc-navy text-xs font-bold px-2 py-1">
                  RECOMENDADO
                </div>
                <h3 className="font-medium mb-2">Plano Premium</h3>
                <ul className="text-sm space-y-1">
                  <li>• Petições ilimitadas</li>
                  <li>• Todos os modelos disponíveis</li>
                  <li>• Calculadora completa</li>
                  <li>• Suporte prioritário</li>
                </ul>
                <p className="mt-3 text-lg font-bold">R$ 49,90<span className="text-sm font-normal">/mês</span></p>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-yellow-700 text-sm">
              <p>Economize tempo e aumente sua produtividade com nossas ferramentas exclusivas para profissionais.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            className="bg-juriscalc-gold text-juriscalc-navy hover:bg-opacity-90"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Processando..." : "Assinar agora"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
