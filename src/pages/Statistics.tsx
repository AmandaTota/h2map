import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function Statistics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white/95 backdrop-blur-md border-b border-emerald-100 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Estatísticas</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Análise de Dados
          </h2>
          <p className="text-slate-600">Estatísticas e gráficos serão implementados aqui</p>
        </div>
      </div>
    </div>
  );
}
