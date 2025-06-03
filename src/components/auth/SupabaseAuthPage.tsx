import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
// Import the custom RegisterForm and its data type
import RegisterForm from '@/components/auth/RegisterForm';
import { RegisterFormData } from '@/types/auth'; // Make sure this type includes 'telefone'

const SupabaseAuthPage = () => {
  // Keep signIn, signUp, loading from the hook
  const { signIn, signUp, loading } = useSupabaseAuth();
  const [showPassword, setShowPassword] = useState(false);
  // Keep formData for Login, but registration fields (nome, confirmPassword) are now handled by RegisterForm
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: ''
  });

  // Keep handleInputChange for Login form
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Keep handleLogin as is, using loginFormData
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginFormData.email || !loginFormData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const { error } = await signIn(loginFormData.email, loginFormData.password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Por favor, confirme seu email antes de fazer login');
      } else {
        toast.error(`Erro no login: ${error.message}`);
      }
    } else {
      toast.success('Login realizado com sucesso!');
    }
  };

  // Modify handleRegister to accept RegisterFormData and pass telefone to signUp
  const handleRegister = async (data: RegisterFormData) => {
    // Validation can be simplified if RegisterForm handles it, but basic checks here are fine
    if (!data.nome || !data.email || !data.telefone || !data.senha || !data.confirmSenha) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (data.senha !== data.confirmSenha) {
      toast.error('As senhas não conferem');
      return;
    }

    if (data.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Call signUp with all data including telefone
    // NOTE: Assuming signUp in useSupabaseAuth accepts telefone based on previous refactoring.
    const { error } = await signUp(data.email, data.senha, data.nome, data.telefone);
    
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error(`Erro no cadastro: ${error.message}`);
      }
    } else {
      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
    }
  };

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
        <div className="text-center mb-6">
          <div className="bg-white p-2 rounded-lg inline-block mb-4">
            <img 
              src="/lovable-uploads/caf683c7-0cb3-4ef4-8e5f-5de22f996b8a.png"
              alt="IusCalc Logo"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">IusCalc</h1>
          <p className="text-white/80">Sistema Jurídico de Cálculos Trabalhistas</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-juriscalc-navy">Acesse sua conta</CardTitle>
            <CardDescription className="text-center">
              Faça login ou crie sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                {/* Login form using loginFormData and handleLoginInputChange */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email" // Ensure name matches state key
                      type="email"
                      placeholder="seu@email.com"
                      value={loginFormData.email}
                      onChange={handleLoginInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password" // Ensure name matches state key
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={loginFormData.password}
                        onChange={handleLoginInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-juriscalc-navy hover:bg-juriscalc-blue"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                {/* Use the custom RegisterForm component */}
                <RegisterForm onSubmit={handleRegister} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseAuthPage;

