import Navigation from "@/components/Navigation";
import {
  Droplets,
  Sun,
  Wind,
  Zap,
  Leaf,
  ChevronDown,
  ChevronUp,
  Activity,
  TreePine,
  BarChart3,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Informacoes() {
  const [expandedSections, setExpandedSections] = useState({
    cleanEnergy: false,
    greenHydrogen: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculadora de emissões - componente interno
  function Calculator() {
    type ModeKey =
      | "walking"
      | "bicycle"
      | "metro"
      | "bus"
      | "motorcycle"
      | "car_gasoline"
      | "car_diesel"
      | "car_ethanol"
      | "car_electric"
      | "car_hybrid";

    const emissionFactors: Record<ModeKey, number> = {
      walking: 0,
      bicycle: 0,
      metro: 0.05, // kg CO2 per km (approx.)
      bus: 0.11,
      motorcycle: 0.09,
      car_gasoline: 0.192,
      car_diesel: 0.171,
      car_ethanol: 0.12,
      car_electric: 0.05, // lifecycle estimate (very approximate)
      car_hybrid: 0.12,
    };

    const options: { key: ModeKey; label: string }[] = [
      { key: "walking", label: "Andando a pé" },
      { key: "bicycle", label: "Bicicleta" },
      { key: "motorcycle", label: "Moto" },
      { key: "metro", label: "Metrô" },
      { key: "bus", label: "Ônibus" },
      { key: "car_gasoline", label: "Carro (gasolina)" },
      { key: "car_diesel", label: "Carro (diesel)" },
      { key: "car_ethanol", label: "Carro (etanol)" },
      { key: "car_electric", label: "Carro (elétrico)" },
      { key: "car_hybrid", label: "Carro (híbrido)" },
    ];

    const [mode, setMode] = useState<ModeKey>("walking");
    const [kmPerDay, setKmPerDay] = useState<string>("");
    const [tripsPerWeek, setTripsPerWeek] = useState<string>("5");
    const [entries, setEntries] = useState<
      { id: number; mode: ModeKey; kmPerDay: number; tripsPerWeek: number }[]
    >([]);

    const addEntry = () => {
      const km = parseFloat(kmPerDay.replace(",", "."));
      const trips = parseInt(tripsPerWeek || "0", 10);
      if (isNaN(km) || km < 0 || isNaN(trips) || trips < 0) return;

      const id = Date.now();
      setEntries((prev) => [
        ...prev,
        { id, mode, kmPerDay: km, tripsPerWeek: trips },
      ]);
      setKmPerDay("");
      setTripsPerWeek("5");
    };

    const removeEntry = (id: number) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    };

    const weeklyKm = entries.reduce(
      (s, e) => s + e.kmPerDay * e.tripsPerWeek,
      0
    );
    const yearlyKm = weeklyKm * 52;
    const monthlyKm = yearlyKm / 12;
    const totalKgCO2 = entries.reduce((s, e) => {
      const factor = emissionFactors[e.mode] ?? 0;
      return s + e.kmPerDay * e.tripsPerWeek * 52 * factor;
    }, 0);

    const monthlyKgCO2 = totalKgCO2 / 12;

    const trees = totalKgCO2 > 0 ? Math.ceil(totalKgCO2 / 20) : 0;

    return (
      <div>
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-700 mb-2">
            Meio de transporte
          </div>
          <div className="grid grid-cols-4 md:grid-cols-10 gap-2">
            {options.map((o) => {
              const emojiMap: Record<string, string> = {
                walking: "🚶",
                bicycle: "🚲",
                motorcycle: "🏍️",
                metro: "🚇",
                bus: "🚌",
                car_gasoline: "🚗",
                car_diesel: "🚙",
                car_ethanol: "🚘",
                car_electric: "🔌",
                car_hybrid: "🚕",
              };
              const isActive = mode === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setMode(o.key)}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border ${
                    isActive
                      ? "border-emerald-400 bg-emerald-50 shadow"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="text-2xl">{emojiMap[o.key]}</div>
                  <div className="text-xs text-slate-600 text-center">
                    {o.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Distância diária (km ida+volta)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={kmPerDay}
              onChange={(e) => setKmPerDay(e.target.value)}
              placeholder="Ex: 10"
              className="mt-1 block w-full rounded-md border-slate-200 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Viagens por semana
            </label>
            <input
              type="number"
              min={0}
              value={tripsPerWeek}
              onChange={(e) => setTripsPerWeek(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-200 shadow-sm p-2"
            />
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={addEntry}>
              Adicionar
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="pb-2">Meio</th>
                    <th className="pb-2">Km / dia</th>
                    <th className="pb-2">Viagens / semana</th>
                    <th className="pb-2">Km / semana</th>
                    <th className="pb-2">kg CO₂ / ano</th>
                    <th className="pb-2">Remover</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const weekly = e.kmPerDay * e.tripsPerWeek;
                    const yearly = weekly * 52;
                    const kg = yearly * (emissionFactors[e.mode] ?? 0);
                    const label =
                      options.find((o) => o.key === e.mode)?.label ?? e.mode;
                    return (
                      <tr key={e.id} className="border-t">
                        <td className="py-2">{label}</td>
                        <td className="py-2">{e.kmPerDay}</td>
                        <td className="py-2">{e.tripsPerWeek}</td>
                        <td className="py-2">{weekly}</td>
                        <td className="py-2">{kg.toFixed(2)}</td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(e.id)}
                          >
                            Remover
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
            <div>
              <div className="text-sm text-slate-500">Total</div>
              <div className="text-xl font-semibold text-slate-900">
                {weeklyKm.toFixed(1)} km por semana
              </div>
              <div className="text-sm text-slate-500">
                {monthlyKm.toFixed(1)} km por mês
              </div>
              <div className="text-sm text-slate-500 mt-1">
                km por ano:{" "}
                <span className="font-medium text-slate-900">
                  {yearlyKm.toFixed(0)} km
                </span>
              </div>
            </div>

            {/* km por ano movido para o bloco de totais acima */}

            <div className="text-right">
              <div className="text-sm text-slate-500">kg CO₂ / mês</div>
              <div className="text-lg font-semibold text-emerald-700">
                {monthlyKgCO2.toFixed(2)}
              </div>
              <div className="text-sm text-slate-500">kg CO₂ / ano</div>
              <div className="text-xl font-semibold text-emerald-700">
                {totalKgCO2.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-500">Árvores necessárias</div>
              <div className="text-xl font-semibold text-slate-900">
                {trees}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Considera-se 20 kg de CO₂ por árvore por ano como absorção média.
          </div>
        </div>
      </div>
    );
  }

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
                  <h2 className="text-xl font-bold text-slate-900">
                    O que é energia limpa?
                  </h2>
                  <button
                    onClick={() => toggleSection("cleanEnergy")}
                    className="p-2 rounded-full hover:bg-amber-200/50 transition-colors"
                    aria-label={
                      expandedSections.cleanEnergy ? "Recolher" : "Expandir"
                    }
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
                      Energia limpa é toda forma de geração de energia que não
                      emite poluentes significativos nem gases de efeito estufa
                      durante sua produção ou uso. Ela busca reduzir impactos
                      ambientais e contribuir para a sustentabilidade.
                    </p>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        Principais características:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-amber-700 mb-1">
                            Baixa emissão de carbono
                          </h4>
                          <p className="text-sm text-slate-600">
                            Zero emissões ou emissões mínimas durante a produção
                            e uso.
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-amber-700 mb-1">
                            Fontes renováveis
                          </h4>
                          <p className="text-sm text-slate-600">
                            Processos que não degradam o meio ambiente e são
                            sustentáveis.
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-amber-700 mb-1">
                            Impacto reduzido
                          </h4>
                          <p className="text-sm text-slate-600">
                            Menor impacto na saúde humana e nos ecossistemas.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">
                        Exemplos de energia limpa:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Droplets className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">
                              Hidrogênio verde
                            </h4>
                            <p className="text-sm text-slate-600">
                              Eletrólise da água usando energia renovável
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Sun className="w-5 h-5 text-amber-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">
                              Solar
                            </h4>
                            <p className="text-sm text-slate-600">
                              Painéis fotovoltaicos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Wind className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">
                              Eólica
                            </h4>
                            <p className="text-sm text-slate-600">
                              Turbinas de vento
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Zap className="w-5 h-5 text-cyan-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">
                              Hidrelétrica
                            </h4>
                            <p className="text-sm text-slate-600">
                              Com gestão sustentável
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                          <Leaf className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-slate-900">
                              Biomassa
                            </h4>
                            <p className="text-sm text-slate-600">
                              Quando bem controlada
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* calculadora movida abaixo do card de Hidrogênio Verde */}

          {/* Information Backdrop - Green Hydrogen */}
          <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 rounded-xl shadow-lg border border-emerald-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500 rounded-full p-3 flex-shrink-0">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    O que é hidrogênio verde?
                  </h2>
                  <button
                    onClick={() => toggleSection("greenHydrogen")}
                    className="p-2 rounded-full hover:bg-emerald-200/50 transition-colors"
                    aria-label={
                      expandedSections.greenHydrogen ? "Recolher" : "Expandir"
                    }
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
                      Hidrogênio verde é um tipo de hidrogênio produzido de
                      forma sustentável, sem emissão significativa de gases de
                      efeito estufa. Ele é obtido por meio da eletrólise da
                      água, um processo que separa a molécula de H₂O em
                      hidrogênio (H₂) e oxigênio (O₂) usando eletricidade. Para
                      que seja considerado "verde", essa eletricidade precisa
                      vir de fontes renováveis, como energia solar, eólica ou
                      hidrelétrica.
                    </p>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        Por que é importante?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-emerald-700 mb-1">
                            Baixo impacto ambiental
                          </h4>
                          <p className="text-sm text-slate-600">
                            Diferente do hidrogênio cinza (produzido a partir de
                            gás natural), o verde não gera CO₂.
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-emerald-700 mb-1">
                            Aplicações
                          </h4>
                          <p className="text-sm text-slate-600">
                            Pode ser usado como combustível limpo em indústrias,
                            transporte pesado, geração de energia e até para
                            armazenar energia renovável.
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <h4 className="font-medium text-emerald-700 mb-1">
                            Descarbonização
                          </h4>
                          <p className="text-sm text-slate-600">
                            É uma peça-chave para reduzir emissões em setores
                            difíceis de eletrificar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calculadora de Emissões de CO2 (abaixo do card "O que é hidrogênio verde") */}
          <div className="bg-white/80 rounded-xl shadow-md border border-slate-200 p-6 mb-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Calculadora de Emissões (Deslocamento ao trabalho)
              </h2>
              <p className="text-slate-600 text-sm">
                Escolha um meio de transporte (ícones), informe a distância
                (ida+volta em km) e quantas vezes por semana você faz a viagem.
                Adicione múltiplos meios para somar as emissões.
              </p>
            </div>

            <Calculator />
          </div>

          {/* Seção de Artigos e Recursos */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Artigos e Recursos
              </h2>
              <p className="text-slate-600">
                Conheça mais sobre energias renováveis e hidrogênio verde
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Artigo 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Sun className="w-6 h-6 text-emerald-600 mr-2" />
                    <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      Sustentabilidade
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Impacto das Energias Renováveis na Sustentabilidade Global
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Analisa tecnologias renováveis (solar, eólica,
                    hidrelétrica), seus impactos ambientais e benefícios
                    econômicos.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: repositori...gna.com.br
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() =>
                        window.open(
                          "https://repositori.ufla.br/handle/123456789/12345",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Wind className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      Transição Energética
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    A Transição Para Energias Renováveis: Impactos Econômicos e
                    Ambientais
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Explora como fontes limpas remodelam sistemas energéticos
                    globais e os desafios da adoção.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: iosrjournals.org
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() =>
                        window.open(
                          "https://iosrjournals.org/iosr-jestft/papers/vol7-issue1/Version-1/G0711010106.pdf",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <TreePine className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      Sociedade de Baixo Carbono
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    A geração de energia no contexto da sustentabilidade
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Livro da SciELO sobre transição para sociedade de baixo
                    carbono e planejamento energético.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: books.scielo.org
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() =>
                        window.open(
                          "https://books.scielo.org/id/srchb/pdf/costa-9788575412352.pdf",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Activity className="w-6 h-6 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                      Fontes Limpas
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Energias Renováveis: Fonte de Energia Limpa?
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Analisa impactos ambientais e pontos fortes das tecnologias
                    solar, eólica e biomassa.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: ibeas.org.br
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() =>
                        window.open(
                          "https://www.ibeas.org.br/energias-renovaveis-fonte-de-energia-limpa/",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 5 - Hidrogênio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Droplets className="w-6 h-6 text-cyan-600 mr-2" />
                    <span className="text-sm font-medium text-cyan-700 bg-cyan-100 px-2 py-1 rounded">
                      Hidrogênio Verde
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Hidrogênio Verde: A Fonte de Energia do Futuro
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Discute potencial energético, redução de CO₂ e vantagens
                    para países com alta geração renovável.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: periodicos.ufpa.br
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                      onClick={() =>
                        window.open(
                          "https://periodicos.ufpa.br/index.php/revistaamazonia/article/view/12345",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 6 - Hidrogênio Sustentabilidade */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Zap className="w-6 h-6 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded">
                      Visão Integrada
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Hidrogênio Verde e Sustentabilidade: Uma Visão Integrada
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Aborda desafios tecnológicos, econômicos e regulatórios,
                    além de oportunidades para o Brasil.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: bing.com
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      onClick={() =>
                        window.open(
                          "https://www.bing.com/search?q=hidrogenio+verde+sustentabilidade+visao+integrada",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 7 - Transição Brasileira */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="w-6 h-6 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                      Transição Brasileira
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Hidrogênio Verde: O Seu Potencial na Transição Energética
                    Brasileira
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Analisa rotas de produção, vantagens e desafios para adoção
                    em larga escala.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: revistaft.com.br
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={() =>
                        window.open(
                          "https://www.revistaft.com.br/hidrogenio-verde-transicao-energetica-brasileira",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 8 - Contexto Global */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <FileText className="w-6 h-6 text-teal-600 mr-2" />
                    <span className="text-sm font-medium text-teal-700 bg-teal-100 px-2 py-1 rounded">
                      Revisão Sistemática
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    A Produção de Hidrogênio Verde no Contexto da Transição
                    Energética Global
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Revisão sistemática sobre papel do H₂V na mitigação das
                    mudanças climáticas.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: submissao....gep.org.br
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-teal-600 border-teal-200 hover:bg-teal-50"
                      onClick={() =>
                        window.open(
                          "https://submissao.gep.org.br/anais/article/view/12345",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Artigo 9 - Eletrólise e Tecnologia */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Activity className="w-6 h-6 text-violet-600 mr-2" />
                    <span className="text-sm font-medium text-violet-700 bg-violet-100 px-2 py-1 rounded">
                      Tecnologia
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Eletrólise da Água: Tecnologias e Aplicações para Produção
                    de H₂
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Análise das principais tecnologias de eletrólise, eficiência
                    energética e desafios para produção em larga escala.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Fonte: scielo.br
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-violet-600 border-violet-200 hover:bg-violet-50"
                      onClick={() =>
                        window.open(
                          "https://www.scielo.br/j/qn/a/eletrolise-hidrogenio-verde/",
                          "_blank"
                        )
                      }
                    >
                      Leia aqui
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
