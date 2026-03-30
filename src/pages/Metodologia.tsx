import { type ReactNode, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calculator,
  Car,
  ChevronDown,
  CloudRain,
  Database,
  ExternalLink,
  Factory,
  FlaskConical,
  Leaf,
  Link2,
} from "lucide-react";
import { MCTI_2025_FACTOR } from "@/lib/co2Calculator";
import { officialSources } from "@/data/officialSources";
import { auxiliaryServices } from "@/data/auxiliaryServices";
import { describeSources } from "@/data/linkManifest";

const categoryLabel: Record<string, string> = {
  law: "Lei",
  regulation: "Regulação",
  guidance: "Guia",
  dashboard: "Painel",
  planning: "Planejamento",
  international: "Internacional",
  news: "Notícia",
  institutional: "Institucional",
};

const auxiliaryLabel: Record<string, string> = {
  dataset: "Dataset",
  guidance: "Guia",
  financing: "Financiamento",
  "international-corridor": "Corredor internacional",
};

type MinimizableCardProps = {
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  contentClassName?: string;
};

function MinimizableCard({
  title,
  icon,
  badge,
  children,
  defaultOpen = false,
  contentClassName = "space-y-3 text-slate-700",
}: MinimizableCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleCard = () => setIsOpen((prev) => !prev);

  const shouldIgnoreToggle = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        "a,button,input,select,textarea,label,[data-no-card-toggle='true']",
      ),
    );
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      className="cursor-pointer"
      onClick={(event) => {
        if (shouldIgnoreToggle(event.target)) return;
        toggleCard();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (shouldIgnoreToggle(event.target)) return;
        event.preventDefault();
        toggleCard();
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
            {badge}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-no-card-toggle="true"
            onClick={(event) => {
              event.stopPropagation();
              toggleCard();
            }}
            aria-label={isOpen ? "Minimizar card" : "Expandir card"}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}
    </Card>
  );
}

export default function Metodologia() {
  const sourcesSummary = describeSources();

  const groupedOfficialSources = useMemo(() => {
    return officialSources.reduce<Record<string, typeof officialSources>>(
      (acc, source) => {
        if (source.category === "news") {
          return acc;
        }

        const key = source.category;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(source);
        return acc;
      },
      {},
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Calculator className="w-5 h-5" />
            <span className="font-medium">Transparência metodológica</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Cálculos e Fontes do Projeto
          </h1>
          <p className="mt-3 text-slate-600 max-w-4xl">
            Esta aba reúne as fórmulas, parâmetros e bases de dados usadas no
            H2Map para estimativas de emissões, potencial energético, produção
            de hidrogênio e referências oficiais.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">
                Fontes oficiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {sourcesSummary.officialCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">
                Serviços auxiliares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {sourcesSummary.auxiliaryCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">
                Links catalogados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {sourcesSummary.linksCount}
              </p>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="calculos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculos">Cálculos</TabsTrigger>
            <TabsTrigger value="fontes">Fontes Oficiais</TabsTrigger>
            <TabsTrigger value="servicos">Serviços Auxiliares</TabsTrigger>
          </TabsList>

          <TabsContent value="calculos" className="mt-6 space-y-8">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  Ambiental
                </Badge>
                <p className="text-xs text-slate-500">
                  Emissões, conversões de CO2 e equivalência de compensação.
                </p>
              </div>

              <MinimizableCard
                title="Emissões de CO2 (MCTI 2025)"
                icon={<Leaf className="w-5 h-5 text-emerald-600" />}
              >
                <p>
                  Fator oficial adotado no projeto:{" "}
                  <strong>{MCTI_2025_FACTOR} kg CO2/kWh</strong>.
                </p>
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`kWh = (watts x horas) / 1000
CO2 (kg) = kWh x 0.0289
CO2 anual = CO2 mensal x 12
arvores equivalentes = ceil(CO2 anual / 20)`}
                </pre>
              </MinimizableCard>

              <MinimizableCard
                title="Mobilidade Urbana e Emissões de Transporte"
                icon={<Car className="w-5 h-5 text-sky-700" />}
              >
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`km_semana = sum(km_dia x viagens_semana)
km_dia_medio = km_semana / 7
km_mes = km_dia_medio x (365.25 / 12)
km_ano = km_mes x 12

CO2_ano (kg) = sum(km_dia x viagens_semana x 52 x fator_modal)
CO2_mes (kg) = CO2_ano / 12
arvores = ceil(CO2_ano / 20)`}
                </pre>
                <p className="text-sm text-slate-600">
                  Fatores por modal (kg CO2/km) no projeto: metro 0.05, onibus
                  0.11, moto 0.09, carro gasolina 0.192, diesel 0.171, etanol
                  0.12, eletrico 0.05, hibrido 0.12.
                </p>
              </MinimizableCard>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                  Energia
                </Badge>
                <p className="text-xs text-slate-500">
                  Produção de energia/H2 e desempenho técnico do sistema.
                </p>
              </div>

              <MinimizableCard
                title="Viabilidade Energética e Produção de H2"
                icon={<FlaskConical className="w-5 h-5 text-cyan-700" />}
              >
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`Energia solar diaria (kWh) = irradiancia x 24 x area_paineis x eficiencia_solar
Potencia eolica pico (kW) = (0.5 x rho x area_turbina x v^3 x eficiencia_eolica) / 1000
Energia util = energia_total x eficiencia_sistema
H2 diario (kg) = energia_util / 65

LCOH = ((CAPEX anualizado + OPEX anual) / H2 anual) x bonus_escala`}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">eficiencia solar: 20%</Badge>
                  <Badge variant="secondary">eficiencia eolica: 40%</Badge>
                  <Badge variant="secondary">
                    densidade do ar: 1.225 kg/m3
                  </Badge>
                  <Badge variant="secondary">
                    consumo eletrolisador: 65 kWh/kg
                  </Badge>
                  <Badge variant="secondary">eficiencia do sistema: 85%</Badge>
                </div>
              </MinimizableCard>

              <MinimizableCard
                title="Estatísticas Climáticas e Potencial Solar"
                icon={<BarChart3 className="w-5 h-5 text-amber-700" />}
              >
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`media = sum(x) / n
desvio_padrao = sqrt(sum((x - media)^2) / n)

dias_chuvosos = contagem(rainfall > 1 mm)
dias_ensolarados = contagem(solarIrradiance > 300 W/m2)

potencial_solar_medio (kWh/m2/dia) =
  media((solarIrradiance x 12) / 1000)

geracao_1kWp_dia = potencial_solar_medio x 0.8
geracao_1kWp_mes = geracao_1kWp_dia x 30`}
                </pre>
              </MinimizableCard>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-100 text-violet-800 border-violet-200">
                  Econômico
                </Badge>
                <p className="text-xs text-slate-500">
                  Custos anualizados, retorno e competitividade do H2.
                </p>
              </div>

              <MinimizableCard
                title="Simulação Financeira de Viabilidade (ROI, Payback e LCOH)"
                icon={<Calculator className="w-5 h-5 text-violet-700" />}
              >
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`fator_capacidade (%) =
  (energia_consumida_total / (potencia_nominal x horas_periodo)) x 100

CRF = (i x (1 + i)^n) / ((1 + i)^n - 1)
CAPEX_anualizado = CAPEX_total x CRF
OPEX_anual = CAPEX_total x taxa_opex + (H2_anual x custo_agua_kg)

LCOH = ((CAPEX_anualizado + OPEX_anual) / H2_anual) x bonus_escala

receita_anual = H2_anual x preco_H2
resultado_liquido = receita_anual - OPEX_anual
payback = CAPEX_total / resultado_liquido
ROI (%) = (resultado_liquido / CAPEX_total) x 100`}
                </pre>
              </MinimizableCard>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-sky-100 text-sky-800 border-sky-200">
                  Clima
                </Badge>
                <p className="text-xs text-slate-500">
                  Regras de alerta e conversões meteorológicas operacionais.
                </p>
              </div>

              <MinimizableCard
                title="Alertas Meteorológicos e Conversões"
                icon={<CloudRain className="w-5 h-5 text-cyan-700" />}
              >
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`vento_km_h = vento_m_s x 3.6

regra_alerta_temperatura_alta: temp > limiar_alto
regra_alerta_temperatura_baixa: temp < limiar_baixo
regra_alerta_vento_forte: vento_m_s > limiar_vento
regra_alerta_chuva: weatherMain in ["Rain", "Drizzle"]
regra_alerta_radiacao: weatherMain == "Clear" e temp > 25`}
                </pre>
              </MinimizableCard>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  Demanda
                </Badge>
                <p className="text-xs text-slate-500">
                  Projeções setoriais e distribuição por UF com pesos
                  qualitativos.
                </p>
              </div>

              <MinimizableCard
                title="Projeção de Demanda de H2 por UF e Setor"
                icon={<Factory className="w-5 h-5 text-indigo-700" />}
              >
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`Serie 2025-2030-2050 com CAGR por etapa (piecewise)
CAGR(2025->2030) = (v2030 / v2025)^(1/5) - 1
CAGR(2030->2050) = (v2050 / v2030)^(1/20) - 1

Demanda_UF = Demanda_setorial_ano x peso_UF_setor x vies_regional x fator_qualitativo`}
                </pre>
              </MinimizableCard>

              <MinimizableCard
                title="Projeções Qualitativas por UF/Setor"
                icon={<Factory className="w-5 h-5 text-rose-700" />}
              >
                <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                  {`interpolacao_setorial (2025-2030):
taxa = (v2030 / v2025)^(1/5) - 1
valor_ano = v2025 x (1 + taxa)^(ano - 2025)

score_setorial_agregado =
  (Alta x 3 + Media x 2 + Baixa x 1) / total_estados

classificacao:
score >= 2.5 => Alta
1.5 <= score < 2.5 => Media
score < 1.5 => Baixa`}
                </pre>
              </MinimizableCard>
            </section>
          </TabsContent>

          <TabsContent value="fontes" className="mt-6 space-y-6">
            {Object.entries(groupedOfficialSources).map(
              ([category, sources]) => (
                <MinimizableCard
                  key={category}
                  title={categoryLabel[category] ?? category}
                  icon={<Database className="w-5 h-5 text-slate-700" />}
                  badge={<Badge variant="secondary">{sources.length}</Badge>}
                  contentClassName="space-y-4"
                >
                  {sources.map((source) => (
                    <div key={source.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {source.title}
                        </h3>
                        <Badge variant="outline">{source.owner}</Badge>
                        {source.geography && (
                          <Badge variant="secondary">{source.geography}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {source.summary}
                      </p>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 text-sm font-medium"
                      >
                        Abrir fonte
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </MinimizableCard>
              ),
            )}
          </TabsContent>

          <TabsContent value="servicos" className="mt-6">
            <MinimizableCard
              title="Serviços e Bases Complementares"
              icon={<Link2 className="w-5 h-5 text-slate-700" />}
              contentClassName="space-y-4"
            >
              {auxiliaryServices.map((service, index) => (
                <div key={service.id}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {service.name}
                    </h3>
                    <Badge variant="outline">{service.provider}</Badge>
                    <Badge variant="secondary">
                      {auxiliaryLabel[service.category] ?? service.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {service.datasetUrl && (
                      <a
                        href={service.datasetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800"
                      >
                        Dataset
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {service.docsUrl && (
                      <a
                        href={service.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800"
                      >
                        Documentação
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {index < auxiliaryServices.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </MinimizableCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
