
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { RegisterFormData } from '@/types/auth';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  disabled?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, disabled = false }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nome, email, telefone, senha, confirmSenha }); 
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Crie sua conta</CardTitle>
        <CardDescription className="text-center">
          Preencha os dados abaixo para se cadastrar
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium">
              Nome Completo
            </label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email-cadastro" className="block text-sm font-medium">
              E-mail
            </label>
            <Input
              id="email-cadastro"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="telefone-cadastro" className="block text-sm font-medium">
              Telefone (WhatsApp)
            </label>
            <Input
              id="telefone-cadastro"
              type="tel"
              placeholder="(XX) XXXXX-XXXX"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)} 
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="senha-cadastro" className="block text-sm font-medium">
              Senha
            </label>
            <Input
              id="senha-cadastro"
              type="password"
              placeholder="Crie uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-senha" className="block text-sm font-medium">
              Confirmar Senha
            </label>
            <Input
              id="confirm-senha"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-juriscalc-gold text-juriscalc-navy hover:bg-opacity-90"
            disabled={disabled}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
