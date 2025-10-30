import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Map, BarChart3, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Mapa', icon: Map },
    { path: '/feasibility', label: 'Análise de Viabilidade', icon: BarChart3 },
    { path: '/statistics', label: 'Estatísticas', icon: LineChart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-h2-light-green shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <Link to="/" className="flex items-center space-x-2 group">
            <img className='h-[90px] w-[90px]' src="/Logo.svg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                    isActive(item.path)
                      ? 'bg-h2-light-green text-h2-dark-green font-medium'
                      : 'text-h2-dark hover:text-h2-primary hover:bg-h2-light-green/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-h2-light-green transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-h2-dark" />
            ) : (
              <Menu className="w-6 h-6 text-h2-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-h2-light-green">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                    isActive(item.path)
                      ? 'bg-h2-light-green text-h2-dark-green font-medium'
                      : 'text-h2-dark hover:text-h2-primary hover:bg-h2-light-green/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
