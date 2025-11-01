import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Loader2 } from 'lucide-react';
import { z } from 'zod';
import type { User, Session } from '@supabase/supabase-js';

const emailSchema = z.string().email({ message: "Email inválido" });
const passwordSchema = z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" });

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users
        if (session?.user) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em uso. Tente fazer login.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao cadastrar",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Você será redirecionado em instantes.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao entrar",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Droplets className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-slate-900">H2maps</span>
          </div>
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Entrar na plataforma' : 'Criar sua conta'}
            </h1>
            <p className="text-slate-600">
              {isLogin 
                ? 'Acesse sua conta para continuar' 
                : 'Cadastre-se para começar a usar'}
            </p>
          </div>

          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
              disabled={loading}
            >
              {isLogin 
                ? 'Não tem conta? Cadastre-se' 
                : 'Já tem conta? Entre'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <Link 
              to="/" 
              className="text-sm text-slate-600 hover:text-emerald-600 flex items-center justify-center"
            >
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
