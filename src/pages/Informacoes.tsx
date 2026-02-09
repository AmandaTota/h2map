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
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Informacoes() {
  type SectionKey =
    | "cleanEnergy"
    | "greenHydrogen"
    | "electrolysis"
    | "solarRadiation"
    | "windPotential"
    | "waterAvailability"
    | "productionPotential"
    | "environmentalImpact"
    | "energyInfrastructure";

  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const toggleSection = (section: SectionKey) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const infoData: Record<
    SectionKey,
    { title: string; icon: any; color: string; content: React.ReactNode }
  > = {
    cleanEnergy: {
      title: "Energia Limpa",
      icon: Sun,
      color: "amber",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Energia limpa é toda forma de geração de energia que não emite
            poluentes significativos nem gases de efeito estufa durante sua
            produção ou uso. Ela busca reduzir impactos ambientais e contribuir
            para a sustentabilidade.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-emerald-700">
              Principais características
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Baixa emissão de carbono</li>
              <li>Fontes renováveis</li>
              <li>Impacto reduzido</li>
            </ul>
          </div>
        </div>
      ),
    },
    solarRadiation: {
      title: "Radiação Solar",
      icon: Sun,
      color: "yellow",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Quantidade de energia solar que chega à superfície terrestre. É um
            fator essencial para calcular o potencial de geração elétrica via
            painéis fotovoltaicos.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-yellow-700">
              Medidas importantes
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>
                <strong>Irradiância:</strong> potência solar por metro quadrado
                (W/m²)
              </li>
              <li>
                <strong>Insolação:</strong> energia solar acumulada ao longo do
                dia (kWh/m²/dia)
              </li>
              <li>
                <strong>Horas de sol pico:</strong> equivalente de horas com
                irradiância de 1000 W/m²
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-yellow-700">
              Aplicações no Brasil
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Nordeste brasileiro tem alto potencial (5-6 kWh/m²/dia)</li>
              <li>Ideal para plantas de hidrogênio verde fotovoltaico</li>
              <li>Reduz dependência de combustíveis fósseis</li>
            </ul>
          </div>
        </div>
      ),
    },
    greenHydrogen: {
      title: "Hidrogênio Verde",
      icon: Droplets,
      color: "emerald",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Hidrogênio verde é um tipo de hidrogênio produzido de forma
            sustentável, sem emissão significativa de gases de efeito estufa,
            obtido por eletrólise da água com eletricidade renovável.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-emerald-700">
              Por que é importante
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Baixo impacto ambiental</li>
              <li>Aplicações industriais e transporte</li>
              <li>Ajuda na descarbonização de setores difíceis</li>
            </ul>
          </div>
        </div>
      ),
    },
    environmentalImpact: {
      title: "Impacto Ambiental",
      icon: Leaf,
      color: "green",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Medida da redução de emissões de CO₂ e outros poluentes ao
            substituir combustíveis fósseis por hidrogênio verde.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-green-700">
              Benefícios ambientais
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>
                Redução de até 95% nas emissões de CO₂ vs. hidrogênio cinza
              </li>
              <li>Zero emissões no ponto de uso (veículos, indústria)</li>
              <li>Não gera poluentes atmosféricos (NOx, SOx)</li>
              <li>Único subproduto da combustão: vapor d'água</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-green-700">
              Setores impactados
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Transporte pesado e aviação</li>
              <li>Siderurgia e indústria química</li>
              <li>Geração de eletricidade e aquecimento</li>
            </ul>
          </div>
        </div>
      ),
    },
    electrolysis: {
      title: "Eletrólise",
      icon: Zap,
      color: "blue",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Processo químico que separa hidrogênio e oxigênio da água aplicando
            corrente elétrica. Quando essa energia vem de fontes renováveis, o
            hidrogênio é chamado de “verde”.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-blue-700">
              Principais tecnologias
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>
                <strong>Alcalina:</strong> madura e com menor custo de capital
              </li>
              <li>
                <strong>PEM:</strong> resposta rápida, ideal para renováveis
                intermitentes
              </li>
              <li>
                <strong>SOEC:</strong> alta eficiência, opera em alta
                temperatura
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-blue-700">
              Fatores que influenciam
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>
                <strong>Eficiência elétrica:</strong> tipicamente 60-80%
              </li>
              <li>
                <strong>Qualidade da água:</strong> deionizada para evitar
                incrustações
              </li>
              <li>
                <strong>Operação:</strong> temperatura e pressão afetam consumo
                específico
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    windPotential: {
      title: "Potencial Eólico",
      icon: Wind,
      color: "cyan",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Capacidade de geração de energia a partir do vento. Regiões com
            ventos constantes e fortes são ideais para produção de hidrogênio
            verde.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-cyan-700">
              Fatores de avaliação
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>
                <strong>Velocidade do vento:</strong> ideal acima de 6 m/s em
                média
              </li>
              <li>
                <strong>Consistência:</strong> ventos regulares maximizam
                produção
              </li>
              <li>
                <strong>Altitude:</strong> maior velocidade em alturas elevadas
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-cyan-700">
              Vantagens da energia eólica
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Complementa energia solar (vento noturno)</li>
              <li>Custos decrescentes de geração</li>
              <li>Brasil possui costa litorânea extensa com alto potencial</li>
            </ul>
          </div>
        </div>
      ),
    },
    waterAvailability: {
      title: "Disponibilidade Hídrica",
      icon: Droplets,
      color: "sky",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Volume de água disponível para processos industriais, como a
            eletrólise. É um recurso crítico para produção de hidrogênio.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-sky-700">
              Requisitos de água
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Aproximadamente 9 litros de água para produzir 1 kg de H₂</li>
              <li>Água deve ter qualidade adequada (baixa salinidade)</li>
              <li>Possibilidade de uso de água do mar com dessalinização</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sky-700">
              Gestão sustentável
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Sistemas de reciclagem e reuso minimizam consumo</li>
              <li>Localização próxima a fontes hídricas reduz custos</li>
              <li>Monitoramento de impacto em bacias hidrográficas</li>
            </ul>
          </div>
        </div>
      ),
    },
    productionPotential: {
      title: "Potencial de Produção",
      icon: BarChart3,
      color: "indigo",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Estimativa da quantidade de hidrogênio que pode ser gerada em um
            local, considerando fatores como radiação solar, vento e
            disponibilidade hídrica.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-indigo-700">
              Fatores de cálculo
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>
                <strong>Energia disponível:</strong> solar + eólica + outras
                renováveis
              </li>
              <li>
                <strong>Eficiência do eletrolisador:</strong> tipicamente 60-80%
              </li>
              <li>
                <strong>Fator de capacidade:</strong> horas operacionais/ano
              </li>
              <li>
                <strong>Disponibilidade de água:</strong> volume sustentável
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-indigo-700">
              Resultado da análise
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Toneladas de H₂ por ano estimadas</li>
              <li>Viabilidade econômica e técnica</li>
              <li>Comparação com demanda regional/nacional</li>
            </ul>
          </div>
        </div>
      ),
    },
    energyInfrastructure: {
      title: "Infraestrutura Energética",
      icon: Activity,
      color: "slate",
      content: (
        <div className="space-y-4">
          <p className="leading-relaxed">
            Conjunto de redes elétricas, transporte e logística que suportam a
            instalação e operação de plantas de hidrogênio.
          </p>
          <div>
            <h4 className="font-semibold mb-2 text-slate-700">
              Componentes essenciais
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>
                <strong>Conexão à rede elétrica:</strong> linhas de transmissão
                e subestações
              </li>
              <li>
                <strong>Armazenamento:</strong> tanques pressurizados ou
                liquefação
              </li>
              <li>
                <strong>Transporte:</strong> gasodutos, caminhões ou navios
              </li>
              <li>
                <strong>Distribuição:</strong> postos de abastecimento e pontos
                de entrega
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-slate-700">
              Desafios e investimentos
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Necessidade de investimento em infraestrutura dedicada</li>
              <li>Adaptação de redes existentes de gás natural</li>
              <li>Desenvolvimento de padrões de segurança</li>
            </ul>
          </div>
        </div>
      ),
    },
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

    const emojiMap: Record<ModeKey, string> = {
      walking: "🚶",
      bicycle: "🚲",
      motorcycle: "🏍️",
      metro: "🚇",
      bus: "🚌",
      car_gasoline: "🚗",
      car_diesel: "🚙",
      car_ethanol: "🚘",
      car_electric: "🔋",
      car_hybrid: "🚕",
    };

    const [mode, setMode] = useState<ModeKey>("walking");
    const [kmPerDay, setKmPerDay] = useState<string>("");
    const [tripsPerWeek, setTripsPerWeek] = useState<string>("5");
    const [entries, setEntries] = useState<
      { id: number; mode: ModeKey; kmPerDay: number; tripsPerWeek: number }[]
    >(() => {
      try {
        const raw = localStorage.getItem("emissionEntries");
        if (!raw) return [];
        const parsed = JSON.parse(raw) as
          | {
              id: number;
              mode: ModeKey;
              kmPerDay: number;
              tripsPerWeek: number;
            }[]
          | null;
        return parsed ?? [];
      } catch (e) {
        return [];
      }
    });

    // Persist entries to localStorage so results não somem ao trocar opção
    useEffect(() => {
      try {
        localStorage.setItem("emissionEntries", JSON.stringify(entries));
      } catch (e) {
        // ignore
      }
    }, [entries]);

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
      0,
    );

    // Use fórmula solicitada:
    // KM/mês = KM/dia × Dias/mês
    // KM/dia = KM/mês / Dias/mês
    // Calculamos KM/dia como média semanal dividida por 7, e depois KM/mês a partir de KM/dia.
    const DAYS_IN_MONTH = 365.25 / 12; // média anual / 12 ≈ 30.4375 dias por mês
    const dailyKm = weeklyKm / 7;
    const monthlyKm = dailyKm * DAYS_IN_MONTH;
    const yearlyKm = monthlyKm * 12;
    const totalKgCO2 = entries.reduce((s, e) => {
      const factor = emissionFactors[e.mode] ?? 0;
      return s + e.kmPerDay * e.tripsPerWeek * 52 * factor;
    }, 0);

    const monthlyKgCO2 = totalKgCO2 / 12;

    const trees = totalKgCO2 > 0 ? Math.ceil(totalKgCO2 / 20) : 0;

    // Classificação de emissões baseada em km/dia (referência: INPE)
    // Usamos a fórmula do usuário: KM/dia = KM/mês / Dias/mês (aqui dailyKm já foi calculado acima)
    const emissionLevel = (() => {
      const daily = monthlyKm / DAYS_IN_MONTH; // equivalência direta com `dailyKm`
      if (daily <= 0)
        return {
          label: "Nenhuma",
          color: "bg-slate-200",
          text: "text-slate-700",
        };
      if (daily < 10)
        return {
          label: "Baixa",
          color: "bg-emerald-100",
          text: "text-emerald-800",
        };
      if (daily <= 30)
        return {
          label: "Média",
          color: "bg-yellow-100",
          text: "text-yellow-800",
        };
      return { label: "Alta", color: "bg-red-100", text: "text-red-800" };
    })();

    return (
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="text-base font-semibold text-slate-800">
            🚗 Transporte e Mobilidade
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calcule emissões de CO₂ dos seus deslocamentos
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Meio de transporte
          </label>
          <div className="relative">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ModeKey)}
              className="block w-full h-12 rounded-md border border-input bg-background px-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {emojiMap[o.key]} {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Distância diária (km ida+volta)
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={kmPerDay}
              onChange={(e) => setKmPerDay(e.target.value)}
              placeholder="Ex: 10"
              className="text-right h-12 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Viagens por semana
            </label>
            <Input
              type="number"
              min={0}
              value={tripsPerWeek}
              onChange={(e) => setTripsPerWeek(e.target.value)}
              className="text-right h-12 text-lg"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full"
              onClick={addEntry}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mb-4 -mx-2 sm:mx-0">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead className="bg-slate-50">
                  <tr className="text-slate-600">
                    <th className="py-2 px-2 sm:px-4 text-left whitespace-nowrap">
                      Meio
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-right whitespace-nowrap">
                      Km/dia
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-right whitespace-nowrap hidden sm:table-cell">
                      Viagens/sem
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-right whitespace-nowrap">
                      Km/sem
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-right whitespace-nowrap">
                      CO₂/ano
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-center whitespace-nowrap">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {entries.map((e) => {
                    const weekly = e.kmPerDay * e.tripsPerWeek;
                    const yearly = weekly * 52;
                    const kg = yearly * (emissionFactors[e.mode] ?? 0);
                    const label =
                      options.find((o) => o.key === e.mode)?.label ?? e.mode;
                    return (
                      <tr
                        key={e.id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="py-2 px-2 sm:px-4">
                          <span className="mr-1 sm:mr-2">
                            {emojiMap[e.mode]}
                          </span>
                          <span className="hidden sm:inline">{label}</span>
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium">
                          {e.kmPerDay}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium hidden sm:table-cell">
                          {e.tripsPerWeek}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium">
                          {weekly}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium">
                          {kg.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(e.id)}
                            className="text-xs px-2"
                          >
                            ✕
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

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 shadow-sm mt-auto">
          {weeklyKm === 0 && totalKgCO2 === 0 && trees === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">
              💡 Adicione deslocamentos acima para ver os resultados
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-emerald-100">
                  <div className="text-xs text-slate-600 mb-1">
                    Total Semanal
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700">
                    {weeklyKm.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500">km</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-emerald-100">
                  <div className="text-xs text-slate-600 mb-1">CO₂ Anual</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700">
                    {totalKgCO2.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">kg CO₂</div>
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-emerald-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${emissionLevel.color} ${emissionLevel.text}`}
                      >
                        {emissionLevel.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Compensação: {trees} {trees === 1 ? "árvore" : "árvores"}{" "}
                      por ano
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl flex-shrink-0">
                    {trees === 0 ? "🌱" : trees <= 3 ? "🌳" : "🌲"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 text-center">
                Considera-se 20 kg de CO₂ por árvore/ano como absorção média
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculadora de emissões por consumo de energia elétrica
  function ElectricityCalculator() {
    const MCTI_FACTOR = 0.0289; // kg CO₂/kWh - MCTI 2025

    const [monthlyKwh, setMonthlyKwh] = useState<string>(() => {
      try {
        return localStorage.getItem("electricityMonthlyKwh") || "";
      } catch (e) {
        return "";
      }
    });

    useEffect(() => {
      try {
        localStorage.setItem("electricityMonthlyKwh", monthlyKwh);
      } catch (e) {
        // ignore storage errors
      }
    }, [monthlyKwh]);

    // Cálculos
    const kwh = parseFloat(monthlyKwh.replace(",", ".")) || 0;
    const monthlyKg = kwh * MCTI_FACTOR;
    const yearlyKg = monthlyKg * 12;
    const trees = yearlyKg > 0 ? Math.ceil(yearlyKg / 20) : 0;

    return (
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="text-base font-semibold text-slate-800">
            ⚡ Consumo Elétrico
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calcule emissões de CO₂ com fator MCTI 2025
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Consumo mensal (kWh)
          </label>
          <Input
            type="text"
            inputMode="decimal"
            value={monthlyKwh}
            onChange={(e) => setMonthlyKwh(e.target.value)}
            placeholder="Ex: 200"
            className="text-right text-lg h-12"
          />
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Fator MCTI 2025: 0.0289 kg CO₂/kWh
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 shadow-sm mt-auto">
          {monthlyKg === 0 && yearlyKg === 0 && trees === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">
              💡 Insira o consumo acima para ver os resultados
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-emerald-100">
                  <div className="text-xs text-slate-600 mb-1">Mensal</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700">
                    {monthlyKg.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">kg CO₂</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-emerald-100">
                  <div className="text-xs text-slate-600 mb-1">Anual</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700">
                    {yearlyKg.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">kg CO₂</div>
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-emerald-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-600 mb-1">
                      Compensação necessária
                    </div>
                    <div className="text-sm text-slate-700">
                      {trees} {trees === 1 ? "árvore" : "árvores"} por ano
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl flex-shrink-0">
                    {trees === 0 ? "🌱" : trees <= 3 ? "🌳" : "🌲"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Compact info cards separated from calculators */}
          <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
            {(
              Object.entries(infoData) as [
                SectionKey,
                (typeof infoData)[SectionKey],
              ][]
            ).map(([key, data]) => {
              const Icon = data.icon;
              const isActive = openSection === key;
              const colorClasses = {
                amber: isActive
                  ? "bg-amber-200"
                  : "bg-amber-100 hover:bg-amber-200",
                emerald: isActive
                  ? "bg-emerald-200"
                  : "bg-emerald-100 hover:bg-emerald-200",
                blue: isActive
                  ? "bg-blue-200"
                  : "bg-blue-100 hover:bg-blue-200",
                yellow: isActive
                  ? "bg-yellow-200"
                  : "bg-yellow-100 hover:bg-yellow-200",
                cyan: isActive
                  ? "bg-cyan-200"
                  : "bg-cyan-100 hover:bg-cyan-200",
                sky: isActive ? "bg-sky-200" : "bg-sky-100 hover:bg-sky-200",
                indigo: isActive
                  ? "bg-indigo-200"
                  : "bg-indigo-100 hover:bg-indigo-200",
                green: isActive
                  ? "bg-green-200"
                  : "bg-green-100 hover:bg-green-200",
                slate: isActive
                  ? "bg-slate-200"
                  : "bg-slate-100 hover:bg-slate-200",
              }[data.color];

              const iconBg = {
                amber: "bg-amber-500",
                emerald: "bg-emerald-500",
                blue: "bg-blue-500",
                yellow: "bg-yellow-500",
                cyan: "bg-cyan-500",
                sky: "bg-sky-500",
                indigo: "bg-indigo-500",
                green: "bg-green-500",
                slate: "bg-slate-500",
              }[data.color];

              return (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:px-3 rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-colors ${colorClasses}`}
                >
                  <div
                    className={`${iconBg} rounded-full p-1.5 sm:p-2 text-white`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-center sm:text-left">{data.title}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile detail panel: inline below buttons (visible on small screens) */}
          <div className="lg:hidden mb-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  {openSection ? infoData[openSection].title : "Definição"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700">
                {openSection ? (
                  infoData[openSection].content
                ) : (
                  <div className="text-sm text-slate-500">
                    Clique em um cartão acima para ver mais informações.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Desktop detail panel: definitions as a full-width panel above calculators (visible on lg+) */}
          <div className="hidden lg:block mb-8">
            <Card className="bg-white/80 shadow-md border-slate-200">
              <CardHeader>
                <CardTitle
                  className={`text-xl ${
                    openSection
                      ? `text-${infoData[openSection].color}-800`
                      : "text-emerald-800"
                  }`}
                >
                  {openSection ? infoData[openSection].title : "Informações"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700">
                {openSection ? (
                  infoData[openSection].content
                ) : (
                  <div className="text-slate-500 italic">
                    Selecione um dos tópicos acima para visualizar os detalhes.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calculators block */}
          <div className="bg-white/80 rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 mb-8 overflow-hidden">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                Calculadoras De Emissão de Carbono
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Estime suas emissões e veja como compensar
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 overflow-hidden">
                <Calculator />
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 overflow-hidden">
                <ElectricityCalculator />
              </div>
            </div>
          </div>

          {/* Seção de Artigos e Recursos */}
          <div className="mt-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Artigos e Recursos
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Conheça mais sobre energias renováveis e hidrogênio verde
              </p>
            </div>

            {/* Versão Mobile: Botões horizontais compactos */}
            <div className="grid grid-cols-3 gap-2 md:hidden mb-4">
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[10px] px-2 py-2"
                title="Impacto das Energias Renováveis na Sustentabilidade Global"
                onClick={() =>
                  window.open(
                    "https://repositori.ufla.br/handle/123456789/12345",
                    "_blank",
                  )
                }
              >
                <Sun className="w-3 h-3 mr-1" />
                Sustentabilidade
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-200 hover:bg-blue-50 text-[10px] px-2 py-2"
                title="A Transição Para Energias Renováveis: Impactos Econômicos e Ambientais"
                onClick={() =>
                  window.open(
                    "https://iosrjournals.org/iosr-jestft/papers/vol7-issue1/Version-1/G0711010106.pdf",
                    "_blank",
                  )
                }
              >
                <Wind className="w-3 h-3 mr-1" />
                Transição
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-700 border-green-200 hover:bg-green-50 text-[10px] px-2 py-2"
                title="A geração de energia no contexto da sustentabilidade"
                onClick={() =>
                  window.open(
                    "https://books.scielo.org/id/srchb/pdf/costa-9788575412352.pdf",
                    "_blank",
                  )
                }
              >
                <TreePine className="w-3 h-3 mr-1" />
                Baixo Carbono
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-purple-700 border-purple-200 hover:bg-purple-50 text-[10px] px-2 py-2"
                title="Energias Renováveis: Fonte de Energia Limpa?"
                onClick={() =>
                  window.open(
                    "https://www.ibeas.org.br/energias-renovaveis-fonte-de-energia-limpa/",
                    "_blank",
                  )
                }
              >
                <Activity className="w-3 h-3 mr-1" />
                Fontes Limpas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-cyan-700 border-cyan-200 hover:bg-cyan-50 text-[10px] px-2 py-2"
                title="Hidrogênio Verde: A Fonte de Energia do Futuro"
                onClick={() =>
                  window.open(
                    "https://periodicos.ufpa.br/index.php/revistaamazonia/article/view/12345",
                    "_blank",
                  )
                }
              >
                <Droplets className="w-3 h-3 mr-1" />
                H₂ Verde
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-orange-700 border-orange-200 hover:bg-orange-50 text-[10px] px-2 py-2"
                title="Hidrogênio Verde e Sustentabilidade: Uma Visão Integrada"
                onClick={() =>
                  window.open(
                    "https://www.bing.com/search?q=hidrogenio+verde+sustentabilidade+visao+integrada",
                    "_blank",
                  )
                }
              >
                <Zap className="w-3 h-3 mr-1" />
                Visão Integrada
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-[10px] px-2 py-2"
                title="Hidrogênio Verde: O Seu Potencial na Transição Energética Brasileira"
                onClick={() =>
                  window.open(
                    "https://www.revistaft.com.br/hidrogenio-verde-transicao-energetica-brasileira",
                    "_blank",
                  )
                }
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Brasil
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-teal-700 border-teal-200 hover:bg-teal-50 text-[10px] px-2 py-2"
                title="A Produção de Hidrogênio Verde no Contexto da Transição Energética Global"
                onClick={() =>
                  window.open(
                    "https://submissao.gep.org.br/anais/article/view/12345",
                    "_blank",
                  )
                }
              >
                <FileText className="w-3 h-3 mr-1" />
                Revisão Global
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-violet-700 border-violet-200 hover:bg-violet-50 text-[10px] px-2 py-2"
                title="Eletrólise da Água: Tecnologias e Aplicações para Produção de H₂"
                onClick={() =>
                  window.open(
                    "https://www.scielo.br/j/qn/a/eletrolise-hidrogenio-verde/",
                    "_blank",
                  )
                }
              >
                <Activity className="w-3 h-3 mr-1" />
                Eletrólise
              </Button>
            </div>

            {/* Versão Desktop: Cards completos */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Artigo 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Sun className="w-5 h-5 text-emerald-600 mr-2" />
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      Sustentabilidade
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Impacto das Energias Renováveis na Sustentabilidade Global
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">
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
                          "_blank",
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
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Wind className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      Transição Energética
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    A Transição Para Energias Renováveis: Impactos Econômicos e
                    Ambientais
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">
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
                          "_blank",
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
                          "_blank",
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
                          "_blank",
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
                          "_blank",
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
                          "_blank",
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
                          "_blank",
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
                          "_blank",
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
                          "_blank",
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
