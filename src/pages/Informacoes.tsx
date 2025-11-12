import Navigation from '@/components/Navigation';

export default function Informacoes() {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Informações</h1>
            <p className="text-slate-700">Esta é a página de Informações. Coloque aqui detalhes, documentação ou quaisquer informações relevantes sobre o projeto, dados ou uso da aplicação.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Dados</h3>
                <p className="text-sm text-slate-600">Resumo sobre as fontes de dados, atualizações e escopo.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Como usar</h3>
                <p className="text-sm text-slate-600">Instruções rápidas sobre navegação e funcionalidades importantes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
