import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Calculator, ChevronDown, BookOpenCheck } from "lucide-react";

type FormulaCard = {
  id: string;
  title: string;
  formula: string;
  implementation: string;
  notes?: string;
  references: string[];
};

const formulaCards: FormulaCard[] = [
  {
    id: "solar",
    title: "Energia Solar Diária",
    formula: "E_solar(dia) = irradiância × 24 × área_painel × eficiência_solar",
    implementation:
      "Usada em calculateEnergyProduction para estimar geração solar diária e anual.",
    notes:
      "Parâmetros no código: área_painel = 1000 × fator_escala (m²), eficiência = 0,20.",
    references: [
      "Duffie, J. A.; Beckman, W. A. Solar Engineering of Thermal Processes. 4th ed. Wiley, 2013.",
      "IEA PVPS. Trends in Photovoltaic Applications 2023.",
      "NREL. PVWatts Documentation and Best Practices.",
    ],
  },
  {
    id: "wind",
    title: "Potência Eólica de Pico e Média",
    formula:
      "P_eolica(pico) = (0,5 × ρ × A × v³ × eficiência)/1000; P_eolica(media) = P_eolica(pico) × fator_capacidade",
    implementation:
      "Aplicada no cálculo da geração eólica diária com fator de capacidade para intermitência.",
    notes:
      "Parâmetros no código: ρ = 1,225 kg/m³, A = 314 × fator_escala, eficiência = 0,40, fator_capacidade = 0,30.",
    references: [
      "Manwell, J. F.; McGowan, J. G.; Rogers, A. L. Wind Energy Explained. 2nd ed. Wiley, 2010.",
      "Burton, T. et al. Wind Energy Handbook. 2nd ed. Wiley, 2011.",
      "IEC 61400 (família de normas para turbinas eólicas).",
    ],
  },
  {
    id: "h2-production",
    title: "Produção de Hidrogênio",
    formula: "H2(kg) = energia_util / consumo_especifico_eletrolisador",
    implementation:
      "Na página de viabilidade: produção diária/anual usa energia útil e consumo de 65 kWh/kg.",
    notes:
      "Parâmetros no código: eficiência do sistema = 0,85; consumo específico = 65 kWh/kg H2.",
    references: [
      "IEA. Global Hydrogen Review 2023/2024.",
      "IRENA. Green Hydrogen Cost Reduction: Scaling up Electrolysers, 2020.",
      "DOE Hydrogen Program. H2A Production Model Documentation.",
    ],
  },
  {
    id: "capacity-factor",
    title: "Fator de Capacidade do Eletrolisador",
    formula:
      "fator_capacidade(%) = energia_consumida_total / (potencia_nominal × horas_totais) × 100",
    implementation:
      "Calculado ao final da simulação horária para avaliar aproveitamento da capacidade instalada.",
    references: [
      "IRENA. Renewable Power Generation Costs (edições recentes).",
      "EPE. Balanço Energético Nacional (BEN) - notas metodológicas.",
      "NREL. Glossary and performance metrics for renewable systems.",
    ],
  },
  {
    id: "capex",
    title: "CAPEX Total",
    formula:
      "CAPEX_total = CAPEX_solar + CAPEX_eolico + CAPEX_eletrolisador + infraestrutura",
    implementation:
      "A simulação soma CAPEX dos blocos e aplica multiplicador de infraestrutura.",
    notes:
      "No código, infraestrutura é aplicada sobre os componentes renováveis.",
    references: [
      "IEA. Global Hydrogen Review (componentes de custo).",
      "IRENA. Green Hydrogen Cost Reduction.",
      "Lazard. Levelized Cost of Hydrogen (edições recentes).",
    ],
  },
  {
    id: "crf",
    title: "CRF e CAPEX Anualizado",
    formula:
      "CRF = [i × (1+i)^n] / [(1+i)^n - 1]; CAPEX_anualizado = CAPEX_total × CRF",
    implementation:
      "Usado para transformar investimento inicial em custo anual equivalente.",
    references: [
      "Short, W.; Packey, D.; Holt, T. NREL Manual for Economic Evaluation, 1995.",
      "NREL. SAM Financial Models Documentation.",
      "Brealey, Myers, Allen. Principles of Corporate Finance.",
    ],
  },
  {
    id: "opex",
    title: "OPEX Anual",
    formula:
      "OPEX_anual = (CAPEX_total × percentual_opex) + (producao_H2_anual × custo_agua_por_kg)",
    implementation:
      "Combina componente fixo de operação/manutenção e componente variável associado à produção.",
    references: [
      "DOE Hydrogen Program. H2A Model assumptions.",
      "IEA. Global Hydrogen Review (estrutura de custos operacionais).",
      "IRENA. Green Hydrogen studies (fixed and variable O&M).",
    ],
  },
  {
    id: "lcoh",
    title: "LCOH (Custo Nivelado do Hidrogênio)",
    formula:
      "LCOH = [(CAPEX_anualizado + OPEX_anual) / producao_H2_anual] × bonus_escala",
    implementation:
      "Calculado por cenário (1, 3 e 5 anos) com bônus de escala definido no código.",
    references: [
      "IEA. Global Hydrogen Review.",
      "IRENA. Green Hydrogen Cost Reduction.",
      "Lazard. Levelized Cost of Hydrogen.",
    ],
  },
  {
    id: "roi-payback",
    title: "ROI e Payback Simples",
    formula:
      "receita_anual = producao_H2_anual × preco_H2; liquido_anual = receita_anual - OPEX; payback = CAPEX_total / liquido_anual; ROI(%) = (liquido_anual / CAPEX_total) × 100",
    implementation:
      "Métricas econômicas calculadas ao final de cada cenário para retorno e tempo de recuperação.",
    references: [
      "Brealey, Myers, Allen. Principles of Corporate Finance.",
      "Damodaran, A. Corporate Finance: Theory and Practice.",
      "PMI. Economic analysis metrics in project appraisal.",
    ],
  },
  {
    id: "nasa-power",
    title: "Base de Dados Climáticos",
    formula:
      "Entrada de dados: irradiância, vento e variáveis meteorológicas históricas para alimentar as fórmulas acima",
    implementation:
      "A aba de viabilidade consome dados NASA POWER via função fetch-nasa-power-data.",
    references: [
      "NASA POWER Project Documentation: https://power.larc.nasa.gov/docs/",
      "NASA POWER API methodology notes.",
    ],
  },
];

export default function FontesProjeto() {
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>(
    {},
  );

  const toggleCard = (cardId: string) => {
    setCollapsedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 to-cyan-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">
        <section className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-800">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Fontes do Projeto: Fórmulas e Referências
              </h1>
              <p className="text-slate-600 mt-2 max-w-3xl">
                Esta página foi estruturada para auditoria técnica: cada card
                apresenta a fórmula implementada na Análise de Viabilidade e a
                respectiva base bibliográfica.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Fórmula + Referência Bibliográfica
            </h2>
          </div>

          <div className="space-y-4">
            {formulaCards.map((card) => {
              const isCollapsed = collapsedCards[card.id] ?? true;

              return (
                <article
                  key={card.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/70"
                >
                  <button
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    aria-expanded={!isCollapsed}
                    className="w-full flex items-center justify-between gap-3 text-left"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {card.title}
                    </h3>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                    />
                  </button>

                  {!isCollapsed && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Fórmula
                        </p>
                        <p className="text-sm text-emerald-800 mt-1">
                          {card.formula}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Como é usada no projeto
                        </p>
                        <p className="text-sm text-slate-700 mt-1">
                          {card.implementation}
                        </p>
                        {card.notes && (
                          <p className="text-xs text-slate-500 mt-1">
                            {card.notes}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Referências bibliográficas
                        </p>
                        <ul className="mt-1 space-y-1">
                          {card.references.map((ref) => (
                            <li
                              key={ref}
                              className="text-sm text-slate-700 leading-relaxed"
                            >
                              {ref}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
