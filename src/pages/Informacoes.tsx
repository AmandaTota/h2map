import Navigation from '@/components/Navigation';
import { Droplets, Sun, Wind, Zap, Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function Informacoes() {
  const [expandedSections, setExpandedSections] = useState({
    cleanEnergy: true,
    greenHydrogen: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Information Backdrop - Clean Energy */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 rounded-xl shadow-lg border border-amber-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-500 rounded-full p-3 flex-shrink-0">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">O que é energia limpa?</h2>
                  <button
                    onClick={() => toggleSection('cleanEnergy')}
                    className="p-2 rounded-full hover:bg-amber-200/50 transition-colors"
                    aria-label={expandedSections.cleanEnergy ? "Recolher" : "Expandir"}
                  >
                    {expandedSections.cleanEnergy ? (
                      <ChevronUp className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-amber-600" />
                    )}
                  </button>
                </div>
                
                {expandedSections.cleanEnergy && (
                  <div className="text-slate-700 leading-relaxed space-y-4">
                    <p>
                      Energia limpa é toda forma de geração de energia que não emite poluentes significativos nem gases de efeito estufa durante sua produção ou uso. 
                      Ela busca reduzir impactos ambientais e contribuir para a sustentabilidade.
                    </p>
                    
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Principais características:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-amber-700 mb-1">Baixa emissão de carbono</h4>
                          <p className="text-sm text-slate-600">
                            Zero emissões ou emissões mínimas durante a produção e uso.
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-amber-700 mb-1">Fontes renováveis</h4>
                          <p className="text-sm text-slate-600">
                            Processos que não degradam o meio ambiente e são sustentáveis.
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-amber-700 mb-1">Impacto reduzido</h4>
                          <p className="text-sm text-slate-600">
                            Menor impacto na saúde humana e nos ecossistemas.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Exemplos de energia limpa:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Sun className="w-5 h-5 text-amber-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">Solar</h4>
                            <p className="text-sm text-slate-600">Painéis fotovoltaicos</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Wind className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">Eólica</h4>
                            <p className="text-sm text-slate-600">Turbinas de vento</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Zap className="w-5 h-5 text-cyan-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">Hidrelétrica</h4>
                            <p className="text-sm text-slate-600">Com gestão sustentável</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Leaf className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">Biomassa</h4>
                            <p className="text-sm text-slate-600">Quando bem controlada</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Droplets className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">Hidrogênio verde</h4>
                            <p className="text-sm text-slate-600">Como falamos antes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Backdrop - Green Hydrogen */}
          <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 rounded-xl shadow-lg border border-emerald-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500 rounded-full p-3 flex-shrink-0">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">O que é hidrogênio verde?</h2>
                  <button
                    onClick={() => toggleSection('greenHydrogen')}
                    className="p-2 rounded-full hover:bg-emerald-200/50 transition-colors"
                    aria-label={expandedSections.greenHydrogen ? "Recolher" : "Expandir"}
                  >
                    {expandedSections.greenHydrogen ? (
                      <ChevronUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-emerald-600" />
                    )}
                  </button>
                </div>
                
                {expandedSections.greenHydrogen && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

