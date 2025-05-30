
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Calculator, Crown, User, BookOpen, LogOut } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import SubscriptionManager from '@/components/peticoes/SubscriptionManager';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ManualRapido from '@/components/calculadora/ManualRapido';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isPremium, signOut } = useSupabaseAuth();
  const [showSubscription, setShowSubscription] = useState(false);
  
  const handleNewPeticao = () => {
    console.log('Navigating to petições');
    navigate('/peticoes');
  };
  
  const handleCalculadora = () => {
    console.log('Navigating to calculadora');
    navigate('/calculadora');
  };
  
  const handleUserClick = () => {
    console.log('Navigating to minha conta');
    navigate('/minha-conta');
  };

  const handleLogout = async () => {
    console.log('Attempting logout');
    await signOut();
  };
  
  return (
    <header className="bg-juriscalc-navy text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/home" className="flex items-center">
          <div className="bg-white p-1 rounded-lg">
            <img 
              src="/lovable-uploads/caf683c7-0cb3-4ef4-8e5f-5de22f996b8a.png"
              alt="Logo"
              className="h-20 w-auto"
              style={{ minWidth: 140 }}
            />
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/home" 
            className={`hover:text-juriscalc-gold transition-colors ${
              location.pathname === '/home' ? 'text-juriscalc-gold' : ''
            }`}
          >
            Home
          </Link>
          <Link 
            to="/calculadora" 
            className={`hover:text-juriscalc-gold transition-colors ${
              location.pathname === '/calculadora' ? 'text-juriscalc-gold' : ''
            }`}
          >
            Calculadora
          </Link>
          <Link 
            to="/peticoes" 
            className={`hover:text-juriscalc-gold transition-colors ${
              location.pathname === '/peticoes' ? 'text-juriscalc-gold' : ''
            }`}
          >
            Petições
          </Link>
          {user?.email && (user.email === 'admin@juriscalc.com' || user.email === 'johnnysantos_177@msn.com') && (
            <Link 
              to="/admin" 
              className={`hover:text-juriscalc-gold transition-colors ${
                location.pathname === '/admin' ? 'text-juriscalc-gold' : ''
              }`}
            >
              Admin
            </Link>
          )}
          {!isPremium && (
            <Button
              onClick={() => {
                console.log('Opening subscription modal');
                setShowSubscription(true);
              }}
              className="bg-juriscalc-gold text-juriscalc-navy hover:bg-opacity-90 flex items-center gap-1"
            >
              <Crown className="h-4 w-4" />
              Premium
            </Button>
          )}
        </nav>
        
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-white text-juriscalc-navy hover:bg-gray-100"
                onClick={() => console.log('Opening manual')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Manual Rápido IusCalc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <ManualRapido />
            </DialogContent>
          </Dialog>
          
          <Button 
            className="bg-white text-juriscalc-navy hover:bg-gray-100"
            onClick={handleCalculadora}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculadora
          </Button>
          <Button 
            className="bg-white text-juriscalc-navy hover:bg-gray-100"
            onClick={handleUserClick}
          >
            <User className="mr-2 h-4 w-4" />
            Minha Conta
          </Button>
          <Button 
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
      
      {showSubscription && (
        <SubscriptionManager onClose={() => setShowSubscription(false)} />
      )}
    </header>
  );
};

export default Header;
