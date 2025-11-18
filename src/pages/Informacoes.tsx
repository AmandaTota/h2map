import Navigation from '@/components/Navigation';
import { Droplets } from 'lucide-react';

export default function Informacoes() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Information Backdrop - Green Hydrogen */}
          <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 rounded-xl shadow-lg border border-emerald-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500 rounded-full p-3 flex-shrink-0">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-4">O que é hidrogênio verde?</h2>
                <div className="text-slate-700 leading-relaxed space-y-4">
                  <p>
                    Hidrogênio verde é um tipo de hidrogênio produzido de forma sustentável, sem emissão significativa de gases de efeito estufa. 
                    Ele é obtido por meio da eletrólise da água, um processo que separa a molécula de H₂O em hidrogênio (H₂) e oxigênio (O₂) usando eletricidade. 
                    Para que seja considerado "verde", essa eletricidade precisa vir de fontes renováveis, como energia solar, eólica ou hidrelétrica.
                  </p>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Por que é importante?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/60 rounded-lg p-3">
                        <h4 className="font-medium text-emerald-700 mb-1">Baixo impacto ambiental</h4>
                        <p className="text-sm text-slate-600">
                          Diferente do hidrogênio cinza (produzido a partir de gás natural), o verde não gera CO₂.
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <h4 className="font-medium text-emerald-700 mb-1">Aplicações</h4>
                        <p className="text-sm text-slate-600">
                          Pode ser usado como combustível limpo em indústrias, transporte pesado, geração de energia e até para armazenar energia renovável.
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <h4 className="font-medium text-emerald-700 mb-1">Descarbonização</h4>
                        <p className="text-sm text-slate-600">
                          É uma peça-chave para reduzir emissões em setores difíceis de eletrificar.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

