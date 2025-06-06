import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

const SupabaseLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      // O toast de erro já é tratado no hook/página superior
      return;
    }
    
    await signIn(email, password);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Acesse sua conta</CardTitle>
        <CardDescription className="text-center">
          Entre com seus dados para acessar o sistema
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/80"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/80"
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-juriscalc-navy hover:bg-opacity-90"
            disabled={loading || !email || !password}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SupabaseLoginForm;
