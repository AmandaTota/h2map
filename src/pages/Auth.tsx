import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

export default function Auth() {

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
          <AuthForm />
          
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
