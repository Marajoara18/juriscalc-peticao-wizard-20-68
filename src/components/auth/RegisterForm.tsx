
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { RegisterFormData } from '@/types/auth';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState(''); // Adicionado estado para telefone
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Incluir telefone no objeto de dados submetido
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
              required
            />
          </div>
          {/* Campo de Telefone Adicionado */}
          <div className="space-y-2">
            <label htmlFor="telefone-cadastro" className="block text-sm font-medium">
              Telefone (WhatsApp)
            </label>
            <Input
              id="telefone-cadastro"
              type="tel" // Usar type="tel" para semântica e potencial formatação móvel
              placeholder="(XX) XXXXX-XXXX"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)} 
              // Opcional: Adicionar validação de formato ou máscara aqui ou no onChange
              required // Definir como obrigatório se necessário
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
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-juriscalc-gold text-juriscalc-navy hover:bg-opacity-90">
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;

