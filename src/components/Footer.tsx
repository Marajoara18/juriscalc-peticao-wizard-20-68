
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-juriscalc-navy text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-start md:items-start">
            <div className="bg-white p-1 rounded-lg mb-2">
              <img 
                src="/lovable-uploads/2dd8ec7a-6e0c-401d-9584-46801524c4cb.png"
                alt="Logo"
                className="h-20 w-auto"
                style={{ minWidth: 120 }}
              />
            </div>
            <p className="text-gray-300 mb-4">
              Ferramenta completa para advogados trabalhistas automatizarem petições iniciais e 
              calcularem verbas trabalhistas com precisão.
            </p>
          </div>
          
          <div>
            <h4 className="font-serif font-bold mb-4">Links Úteis</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-juriscalc-gold">Home</Link></li>
              <li><Link to="/calculadora" className="text-gray-300 hover:text-juriscalc-gold">Calculadora</Link></li>
              <li><Link to="/peticoes" className="text-gray-300 hover:text-juriscalc-gold">Petições</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-bold mb-4">Contato</h4>
            <p className="text-gray-300">mktadvisory7@gmail.com</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} IusCalc. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
