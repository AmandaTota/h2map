import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ThermometerSun , BarChart3, LineChart, LogIn, LogOut, User, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { path: "/feasibility", label: "Análise de Viabilidade", icon: BarChart3 },
    { path: "/statistics", label: "Estatísticas", icon: LineChart },
    { path: "/dashboard", label: "Previsão", icon: ThermometerSun },
    { path: "/informacoes", label: "Informações", icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-br from-emerald-50/80 via-teal-50/80 to-cyan-50/80 backdrop-blur-md z-50 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-12 w-12 sm:h-14 sm:w-14">
              <img
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                src="/Logo.png"
                alt="Logo H2maps"
              />
            </div>
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
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm lg:px-4 lg:text-base",
                    isActive(item.path)
                      ? "bg-emerald-100 text-emerald-700 font-medium"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Auth Button */}{/*}
            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Entrar
                </Button>
              </Link>
            )} */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-emerald-100">
          <div className="px-2 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-base",
                    isActive(item.path)
                      ? "bg-emerald-100 text-emerald-700 font-medium"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Auth Button */}
            <div className="pt-2 border-t border-slate-200 mt-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 font-medium">
                      {user.email}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
