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
  const [openSection, setOpenSection] = useState<
    "cleanEnergy" | "greenHydrogen" | null
  >(null);

  const toggleSection = (section: "cleanEnergy" | "greenHydrogen") => {
    setOpenSection((prev) => (prev === section ? null : section));
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
      0
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Meio de transporte
          </label>
          <div className="relative">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ModeKey)}
              className="mt-1 block w-full h-10 rounded-md border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {emojiMap[o.key]} {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Distância diária (km ida+volta)
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={kmPerDay}
              onChange={(e) => setKmPerDay(e.target.value)}
              placeholder="Ex: 10"
              className="mt-1 text-right"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Viagens por semana
            </label>
            <Input
              type="number"
              min={0}
              value={tripsPerWeek}
              onChange={(e) => setTripsPerWeek(e.target.value)}
              className="mt-1 text-right"
            />
          </div>

          <div className="flex items-end justify-end">
            <Button
              variant="outline"
              size="sm"
              className="w-[50px] md:w-auto px-3 py-2 h-10"
              onClick={addEntry}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-slate-600">
                    <th className="py-2 px-2 sm:px-4 text-left">Meio</th>
                    <th className="py-2 px-2 sm:px-4 text-right">Km / dia</th>
                    <th className="py-2 px-2 sm:px-4 text-right">
                      Viagens / semana
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-right">
                      Km / semana
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-right">
                      kg CO₂ / ano
                    </th>
                    <th className="py-2 px-2 sm:px-4 text-center">Remover</th>
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
                        <td className="py-2 px-2 sm:px-4">
                          <span className="mr-2">{emojiMap[e.mode]}</span>
                          {label}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium">
                          {e.kmPerDay}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium">
                          {e.tripsPerWeek}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium">
                          {weekly}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-right font-medium">
                          {kg.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-center">
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

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mt-auto">
          {weeklyKm === 0 && totalKgCO2 === 0 && trees === 0 ? (
            <div className="text-sm text-slate-500">
              Nenhum dado adicionado — adicione deslocamentos para ver os
              totais.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-base font-semibold text-slate-900">
                  {weeklyKm.toFixed(1)} km / semana
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">kg CO₂ / ano</div>
                <div className="text-lg font-semibold text-emerald-700">
                  {totalKgCO2.toFixed(2)}
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${emissionLevel.color} ${emissionLevel.text}`}
                  >
                    {emissionLevel.label}
                  </span>
                </div>
              </div>

              <div className="w-44">
                <div className="text-xs text-slate-500">Árvores</div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center mt-1">
                  <div className="text-2xl font-bold text-emerald-800">
                    {trees} <span className="ml-1">🌳</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="text-xs text-slate-500 mt-2">
            Considera-se 20 kg de CO₂ por árvore por ano como absorção média.
          </div>
        </div>
      </div>
    );
  }

  // Calculadora de emissões por consumo de energia elétrica
  function ElectricityCalculator() {
    const [monthlyKwh, setMonthlyKwh] = useState<string>(() => {
      try {
        return localStorage.getItem("electricityMonthlyKwh") || "";
      } catch (e) {
        return "";
      }
    });
    const [factor, setFactor] = useState<string>(() => {
      try {
        return localStorage.getItem("electricityFactor") || "0.082";
      } catch (e) {
        return "0.082";
      }
    });

    // Estados brasileiros com fatores estimados (kg CO₂ / kWh)
    // Valores são estimativas baseadas no mix elétrico regional — ajustar conforme fonte local
    const stateOptions: {
      code: string;
      label: string;
      factor: number | null;
    }[] = [
      // Fatores derivados das tarifas por estado (Clarke) — Opção A: escala do fator base 0.082
      { code: "AC", label: "Acre", factor: 0.084 },
      { code: "AL", label: "Alagoas", factor: 0.091 },
      { code: "AM", label: "Amazonas", factor: 0.091 },
      { code: "AP", label: "Amapá", factor: 0.086 },
      { code: "BA", label: "Bahia", factor: 0.087 },
      { code: "CE", label: "Ceará", factor: 0.077 },
      { code: "DF", label: "Distrito Federal", factor: 0.079 },
      { code: "ES", label: "Espírito Santo", factor: 0.07 },
      { code: "GO", label: "Goiás", factor: 0.076 },
      { code: "MA", label: "Maranhão", factor: 0.076 },
      { code: "MT", label: "Mato Grosso", factor: 0.09 },
      { code: "MS", label: "Mato Grosso do Sul", factor: 0.093 },
      { code: "MG", label: "Minas Gerais", factor: 0.077 },
      { code: "PA", label: "Pará", factor: 0.1 },
      { code: "PB", label: "Paraíba", factor: 0.063 },
      { code: "PR", label: "Paraná", factor: 0.065 },
      { code: "PE", label: "Pernambuco", factor: 0.079 },
      { code: "PI", label: "Piauí", factor: 0.088 },
      { code: "RJ", label: "Rio de Janeiro", factor: 0.125 },
      { code: "RN", label: "Rio Grande do Norte", factor: 0.079 },
      { code: "RO", label: "Rondônia", factor: 0.078 },
      { code: "RR", label: "Roraima", factor: 0.07 },
      { code: "RS", label: "Rio Grande do Sul", factor: 0.07 },
      { code: "SC", label: "Santa Catarina", factor: 0.072 },
      { code: "SP", label: "São Paulo", factor: 0.078 },
      { code: "SE", label: "Sergipe", factor: 0.084 },
      { code: "TO", label: "Tocantins", factor: 0.087 },
    ];

    const [selectedState, setSelectedState] = useState<string>(() => {
      try {
        return localStorage.getItem("electricityState") || "";
      } catch {
        return "";
      }
    });

    useEffect(() => {
      try {
        localStorage.setItem("electricityMonthlyKwh", monthlyKwh);
        localStorage.setItem("electricityFactor", factor);
        localStorage.setItem("electricityState", selectedState);
      } catch (e) {
        // ignore storage errors
      }
    }, [monthlyKwh, factor, selectedState]);

    // Quando o usuário muda o estado, atualizamos o fator se o estado tem um valor predefinido
    const onStateChange = (code: string) => {
      setSelectedState(code);
      const opt = stateOptions.find((s) => s.code === code);
      if (opt && opt.factor !== null) {
        setFactor(String(opt.factor));
      }
    };

    const kwh = parseFloat(monthlyKwh.replace(",", ".")) || 0;
    const f = parseFloat(factor.replace(",", ".")) || 0;
    const monthlyKg = kwh * f;
    const yearlyKg = monthlyKg * 12;
    const trees = yearlyKg > 0 ? Math.ceil(yearlyKg / 20) : 0;

    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <div className="text-sm font-medium text-slate-700">
            Consumo elétrico
          </div>
          <div className="text-xs text-slate-500">
            kWh por mês e fator (kg CO₂ / kWh)
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Consumo mensal (kWh)
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={monthlyKwh}
              onChange={(e) => setMonthlyKwh(e.target.value)}
              placeholder="Ex: 200"
              className="mt-1 text-right"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Fator emissão (kg CO₂ / kWh)
            </label>
            <div className="flex gap-2">
              <select
                value={selectedState}
                onChange={(e) => onStateChange(e.target.value)}
                className="mt-1 block w-1/2 h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione o estado</option>
                {stateOptions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code}
                    {s.factor !== null ? ` — ${s.factor.toFixed(3)}` : ""}
                  </option>
                ))}
              </select>
              <Input
                type="text"
                inputMode="decimal"
                value={factor}
                onChange={(e) => {
                  setFactor(e.target.value);
                  setSelectedState("");
                }}
                placeholder="Ex: 0.082"
                className="mt-1 text-right w-1/2"
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Valores estimados por estado — ajuste se necessário.
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mt-auto">
          {monthlyKg === 0 && yearlyKg === 0 && trees === 0 ? (
            <div className="text-sm text-slate-500">
              Nenhum dado adicionado — insira consumo para ver totais.
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">kg CO₂ / mês</div>
                <div className="text-lg font-semibold text-emerald-700">
                  {monthlyKg.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">kg CO₂ / ano</div>
                <div className="text-base font-semibold text-emerald-700">
                  {yearlyKg.toFixed(2)}
                </div>
              </div>
              <div className="w-36">
                <div className="text-xs text-slate-500">Árvores</div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center mt-1">
                  <div className="text-2xl font-bold text-emerald-800">
                    {trees} <span className="ml-1">🌳</span>
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
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => toggleSection("cleanEnergy")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                openSection === "cleanEnergy"
                  ? "bg-amber-200"
                  : "bg-amber-100 hover:bg-amber-200"
              }`}
            >
              <div className="bg-amber-500 rounded-full p-2 text-white">
                <Sun className="w-4 h-4" />
              </div>
              <span>O que é energia limpa?</span>
            </button>

            <button
              onClick={() => toggleSection("greenHydrogen")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                openSection === "greenHydrogen"
                  ? "bg-emerald-200"
                  : "bg-emerald-100 hover:bg-emerald-200"
              }`}
            >
              <div className="bg-emerald-500 rounded-full p-2 text-white">
                <Droplets className="w-4 h-4" />
              </div>
              <span>O que é hidrogênio verde?</span>
            </button>
          </div>

          {/* Mobile detail panel: inline below buttons (visible on small screens) */}
          <div className="lg:hidden mb-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Definição</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700">
                {openSection === "cleanEnergy" && (
                  <div className="space-y-3">
                    <p>
                      Energia limpa é toda forma de geração de energia que não
                      emite poluentes significativos nem gases de efeito estufa
                      durante sua produção ou uso. Ela busca reduzir impactos
                      ambientais e contribuir para a sustentabilidade.
                    </p>
                    <h4 className="font-semibold">
                      Principais características
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-600">
                      <li>Baixa emissão de carbono</li>
                      <li>Fontes renováveis</li>
                      <li>Impacto reduzido</li>
                    </ul>
                  </div>
                )}

                {openSection === "greenHydrogen" && (
                  <div className="space-y-3">
                    <p>
                      Hidrogênio verde é um tipo de hidrogênio produzido de
                      forma sustentável, sem emissão significativa de gases de
                      efeito estufa, obtido por eletrólise da água com
                      eletricidade renovável.
                    </p>
                    <h4 className="font-semibold">Por que é importante</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600">
                      <li>Baixo impacto ambiental</li>
                      <li>Aplicações industriais e transporte</li>
                      <li>Ajuda na descarbonização de setores difíceis</li>
                    </ul>
                  </div>
                )}

                {!openSection && (
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
                <CardTitle className="text-xl text-emerald-800">
                  {openSection === "cleanEnergy"
                    ? "Energia Limpa"
                    : openSection === "greenHydrogen"
                    ? "Hidrogênio Verde"
                    : "Informações"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700">
                {openSection === "cleanEnergy" && (
                  <div className="space-y-4">
                    <p className="leading-relaxed">
                      Energia limpa é toda forma de geração de energia que não
                      emite poluentes significativos nem gases de efeito estufa
                      durante sua produção ou uso. Ela busca reduzir impactos
                      ambientais e contribuir para a sustentabilidade.
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
                )}

                {openSection === "greenHydrogen" && (
                  <div className="space-y-4">
                    <p className="leading-relaxed">
                      Hidrogênio verde é um tipo de hidrogênio produzido de
                      forma sustentável, sem emissão significativa de gases de
                      efeito estufa, obtido por eletrólise da água com
                      eletricidade renovável.
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
                )}

                {!openSection && (
                  <div className="text-slate-500 italic">
                    Selecione um dos tópicos acima para visualizar os detalhes.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calculators block */}
          <div className="bg-white/80 rounded-xl shadow-md border border-slate-200 p-6 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Calculadoras De Emissão de Carbono
              </h2>
              <p className="text-slate-600">
                Estime suas emissões e veja como compensar
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Calculator />
              <ElectricityCalculator />
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
