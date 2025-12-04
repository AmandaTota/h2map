import React, { useMemo, useState } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type SectorEntry = {
  level: "Alta" | "Média" | "Baixa" | string;
  notes?: string[];
};

const data: Record<
  string,
  {
    refino: SectorEntry;
    fertilizantes: SectorEntry;
    siderurgia: SectorEntry;
    mobilidade: SectorEntry;
  }
> = {
  SP: {
    refino: { level: "Alta", notes: ["REPLAN/REVAP/RECAP"] },
    fertilizantes: { level: "Média" },
    siderurgia: {
      level: "Alta",
      notes: ["Usiminas Cubatão (longos/especiais)"],
    },
    mobilidade: {
      level: "Alta",
      notes: ["pilotos EMTU/USP – célula a combustível, reformador de etanol"],
    },
  },
  RJ: {
    refino: { level: "Alta", notes: ["REDUC"] },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Alta", notes: ["CSN/ArcelorMittal/Sepetiba"] },
    mobilidade: { level: "Média", notes: ["Histórico de ônibus H₂"] },
  },
  MG: {
    refino: { level: "Média", notes: ["REGAP"] },
    fertilizantes: { level: "Média" },
    siderurgia: { level: "Alta", notes: ["Usiminas/Arcelor/Gerdau/Aperam"] },
    mobilidade: { level: "Baixa" },
  },
  ES: {
    refino: { level: "Baixa" },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Alta", notes: ["ArcelorMittal Tubarão"] },
    mobilidade: { level: "Baixa" },
  },
  BA: {
    refino: { level: "Alta", notes: ["Mataripe/Acelen"] },
    fertilizantes: { level: "Alta", notes: ["FAFEN‑BA/Unigel, amônia verde"] },
    siderurgia: { level: "Média" },
    mobilidade: { level: "Baixa" },
  },
  SE: {
    refino: { level: "Baixa" },
    fertilizantes: { level: "Alta", notes: ["FAFEN‑SE"] },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
  PR: {
    refino: { level: "Alta", notes: ["REPAR"] },
    fertilizantes: { level: "Alta", notes: ["ANSA (reativada)"] },
    siderurgia: { level: "Média" },
    mobilidade: { level: "Baixa" },
  },
  RS: {
    refino: { level: "Alta", notes: ["REFAP"] },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Média" },
    mobilidade: { level: "Baixa" },
  },
  PE: {
    refino: { level: "Alta", notes: ["RNEST/Abreu e Lima"] },
    fertilizantes: { level: "Média" },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
  CE: {
    refino: { level: "Média", notes: ["Lubnor (menor porte)"] },
    fertilizantes: { level: "Média" },
    siderurgia: { level: "Média", notes: ["CSP Pecém"] },
    mobilidade: { level: "Baixa" },
  },
  AM: {
    refino: { level: "Média", notes: ["REMAN"] },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
  MS: {
    refino: { level: "Baixa" },
    fertilizantes: { level: "Alta", notes: ["UFN‑III Três Lagoas"] },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
  DF: {
    refino: { level: "Baixa" },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
};

const getBadgeClass = (level: string) => {
  switch (level.toLowerCase()) {
    case "alta":
      return "bg-red-100 text-red-800 border-red-200";
    case "média":
    case "media":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "baixa":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

// ForecastCard: calcula previsão anual 2025-2030 para um UF ou Região
function ForecastCard({ estado }: { estado: string }) {
  const ufs = [
    "SP",
    "RJ",
    "MG",
    "ES",
    "BA",
    "SE",
    "PR",
    "RS",
    "PE",
    "CE",
    "AM",
    "MS",
    "DF",
  ];

  const regions: Record<string, string> = {
    SP: "SE",
    RJ: "SE",
    MG: "SE",
    ES: "SE",
    BA: "NE",
    SE: "NE",
    PE: "NE",
    CE: "NE",
    PR: "S",
    RS: "S",
    AM: "N",
    MS: "CO",
    DF: "CO",
  };

  const baseline2025: Record<string, number> = {
    Refino: 480,
    Fertilizantes: 224,
    Siderurgia: 88,
    Mobilidade: 8,
  };

  const weights: Record<string, Record<string, number>> = {
    Refino: {
      SP: 1.0,
      RJ: 1.0,
      MG: 0.6,
      ES: 0.2,
      BA: 1.0,
      SE: 0.2,
      PR: 1.0,
      RS: 1.0,
      PE: 1.0,
      CE: 0.6,
      AM: 0.6,
      MS: 0.2,
      DF: 0.2,
    },
    Fertilizantes: {
      SP: 0.6,
      RJ: 0.2,
      MG: 0.6,
      ES: 0.2,
      BA: 1.0,
      SE: 1.0,
      PR: 1.0,
      RS: 0.2,
      PE: 0.6,
      CE: 0.6,
      AM: 0.2,
      MS: 1.0,
      DF: 0.2,
    },
    Siderurgia: {
      SP: 1.0,
      RJ: 1.0,
      MG: 1.0,
      ES: 1.0,
      BA: 0.6,
      SE: 0.2,
      PR: 0.6,
      RS: 0.6,
      PE: 0.2,
      CE: 0.6,
      AM: 0.2,
      MS: 0.2,
      DF: 0.2,
    },
    Mobilidade: {
      SP: 1.2,
      RJ: 0.8,
      MG: 0.2,
      ES: 0.2,
      BA: 0.2,
      SE: 0.2,
      PR: 0.2,
      RS: 0.2,
      PE: 0.2,
      CE: 0.2,
      AM: 0.2,
      MS: 0.2,
      DF: 1.2,
    },
  };

  const [scope, setScope] = useState<"estado" | "regiao">("estado");
  const [year, setYear] = useState<number>(2030);
  const [scenario, setScenario] = useState<string>("ipea_low");
  const [customKt, setCustomKt] = useState<number | "">("");
  const [isOpen, setIsOpen] = useState(true);

  const series = useMemo(() => {
    // helper: compute state's series 2025..2030
    const sectors = Object.keys(baseline2025);
    const sumWeights: Record<string, number> = {} as any;
    sectors.forEach((s) => {
      sumWeights[s] = ufs.reduce((a, uf) => a + (weights as any)[s][uf], 0);
    });

    function stateSeries(uf: string) {
      const perYear: Record<number, number> = {} as any;
      const sectorVals: Record<string, Record<number, number>> = {} as any;
      sectors.forEach((s) => {
        const v2025 =
          (baseline2025 as any)[s] *
          ((weights as any)[s][uf] / Math.max(1, sumWeights[s]));
        // qualitative level from `data` if available
        const lvlRaw = (
          (data as any)[uf]?.[s.toLowerCase()]?.level || "Baixa"
        ).toLowerCase();
        let targetMultiplier = 1.5; // default
        if (lvlRaw === "alta") targetMultiplier = 3;
        else if (lvlRaw === "média" || lvlRaw === "media") targetMultiplier = 2;
        else targetMultiplier = 1.2;
        const v2030 = v2025 * targetMultiplier;
        const cagr = Math.pow(v2030 / Math.max(v2025, 1e-6), 1 / 5) - 1;
        for (let y = 2025; y <= 2030; y++) {
          const val = v2025 * Math.pow(1 + cagr, y - 2025);
          sectorVals[s] = sectorVals[s] || ({} as any);
          sectorVals[s][y] = val;
        }
      });

      for (let y = 2025; y <= 2030; y++) {
        perYear[y] = sectors.reduce((a, s) => a + (sectorVals[s][y] || 0), 0);
      }
      return perYear;
    }

    // compute according to scope
    if (scope === "estado") {
      return stateSeries(estado);
    }

    // region: sum all UFs from same region
    const region = regions[estado] || "";
    const regionUfs = ufs.filter((u) => regions[u] === region);
    const perYear: Record<number, number> = {} as any;
    for (let y = 2025; y <= 2030; y++) perYear[y] = 0;
    regionUfs.forEach((uf) => {
      const s = stateSeries(uf);
      for (let y = 2025; y <= 2030; y++) perYear[y] += s[y];
    });
    return perYear;
  }, [estado, scope]);

  const years = Array.from({ length: 6 }, (_, i) => 2025 + i);
  const cumulativeToYear = (y: number) =>
    years.filter((yr) => yr <= y).reduce((a, yr) => a + (series[yr] || 0), 0);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-sm text-slate-600 mb-2">Escopo</p>
          <Select value={scope} onValueChange={(v) => setScope(v as any)}>
            <SelectTrigger className="h-10 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="estado">Estado</SelectItem>
              <SelectItem value="regiao">Região</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-sm text-slate-600 mb-2">Ano</p>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="h-10 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="text-right w-full pb-2">
            <p className="text-sm text-slate-600 mb-1">
              Total {scope === "estado" ? "ano" : "região"}
            </p>
            <p className="text-lg font-bold text-slate-900">
              {(series[year] || 0).toFixed(1)} kt
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr>
              <th className="w-32 text-center">Ano</th>
              <th className="text-center">Demanda (kt)</th>
              <th className="w-48 text-center">Cumulativo até o ano (kt)</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {years.map((y) => (
              <tr key={y} className={y === year ? "bg-slate-50" : ""}>
                <td className="py-1">{y}</td>
                <td className="py-1 text-center">
                  {(series[y] || 0).toFixed(1)}
                </td>
                <td className="py-1 text-center">
                  {cumulativeToYear(y).toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default function SectorDemandByStateCard({
  estado,
  estadoNome,
}: {
  estado?: string | null;
  estadoNome?: string | null;
}) {
  if (!estado) return null;
  const estadoNorm = estado.toLowerCase();

  // Quando for 'all' agregamos os dados qualitativos
  if (estadoNorm === "all") {
    const sectors = ["refino", "fertilizantes", "siderurgia", "mobilidade"];

    const counts: Record<string, Record<string, number>> = {};
    const topStates: Record<string, string[]> = {};
    sectors.forEach((sec) => {
      counts[sec] = { Alta: 0, Média: 0, Baixa: 0 } as Record<string, number>;
      topStates[sec] = [];
    });

    Object.entries(data).forEach(([uf, values]) => {
      sectors.forEach((sec) => {
        // @ts-ignore
        const levelRaw = values[sec]?.level || "Baixa";
        const level =
          levelRaw.toLowerCase() === "alta"
            ? "Alta"
            : levelRaw.toLowerCase() === "média" ||
              levelRaw.toLowerCase() === "media"
            ? "Média"
            : "Baixa";
        counts[sec][level] = (counts[sec][level] || 0) + 1;
        if (level === "Alta") topStates[sec].push(uf);
      });
    });

    const weights: Record<string, number> = { Alta: 3, Média: 2, Baixa: 1 };

    const aggregated: Record<
      string,
      { level: string; distribution: string; notes?: string[] }
    > = {};

    sectors.forEach((sec) => {
      const total = counts[sec].Alta + counts[sec].Média + counts[sec].Baixa;
      const score =
        (counts[sec].Alta * weights.Alta +
          counts[sec].Média * weights.Média +
          counts[sec].Baixa * weights.Baixa) /
        Math.max(1, total);

      let level = "Baixa";
      if (score >= 2.5) level = "Alta";
      else if (score >= 1.5) level = "Média";

      aggregated[sec] = {
        level,
        distribution: `Alta: ${counts[sec].Alta}, Média: ${counts[sec].Média}, Baixa: ${counts[sec].Baixa}`,
        notes: topStates[sec].slice(0, 5),
      };
    });

    return (
      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mb-4">
        <div className="px-6 py-4 flex items-center">
          <FileText className="w-6 h-6 text-emerald-600 mr-3" />
          <h2 className="text-2xl font-bold text-slate-900">
            Demanda de H2 Setorial por Estado (Qualitativa)
          </h2>
          <Badge className="ml-auto bg-emerald-100 text-emerald-800 border-emerald-200">
            Todos
          </Badge>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(aggregated).map(([sec, v]) => (
              <div key={sec} className="p-3 rounded border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">
                    {sec.charAt(0).toUpperCase() + sec.slice(1)}
                  </div>
                  <Badge className={getBadgeClass(v.level)}>{v.level}</Badge>
                </div>
                {v.notes && v.notes.length > 0 && (
                  <div className="text-xs text-slate-400">
                    Principais UFs (Alta): {v.notes.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const s = data[estado.toUpperCase()];
  if (!s) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mb-4">
        <div className="px-6 py-4 flex items-center">
          <FileText className="w-6 h-6 text-emerald-600 mr-3" />
          <h2 className="text-2xl font-bold text-slate-900">
            Demanda setorial por estado (qualitativa)
          </h2>
          <Badge className="ml-auto bg-slate-100 text-slate-800 border-slate-200">
            {estado.toUpperCase()}
          </Badge>
        </div>
        <div className="px-6 pb-6 text-sm text-slate-600">
          Dados qualitativos não disponíveis para o estado selecionado.
        </div>
      </Card>
    );
  }

  const [isForecastOpen, setIsForecastOpen] = useState(true);
  const [isQualitativeOpen, setIsQualitativeOpen] = useState(true);

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mb-4">
        <Collapsible open={isForecastOpen} onOpenChange={setIsForecastOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="px-6 py-4 flex items-center hover:bg-slate-50 transition-colors">
              <FileText className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">
                Previsão da Demanda de H2 de 2025 até 2030
              </h2>
              <Badge className="ml-auto mr-3 bg-emerald-100 text-emerald-800 border-emerald-200">
                {estado.toUpperCase()}
              </Badge>
              <ChevronDown
                className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${
                  isForecastOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6">
              <ForecastCard estado={estado.toUpperCase()} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mb-4">
        <Collapsible open={isQualitativeOpen} onOpenChange={setIsQualitativeOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="px-6 py-4 flex items-center hover:bg-slate-50 transition-colors">
              <FileText className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">
                Demanda Setorial por Estado (Qualitativa)
              </h2>
              <Badge className="ml-auto mr-3 bg-emerald-100 text-emerald-800 border-emerald-200">
                {estado.toUpperCase()}
                {estadoNome ? ` — ${estadoNome}` : ""}
              </Badge>
              <ChevronDown
                className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${
                  isQualitativeOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>

            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Refino</div>
                    <Badge className={getBadgeClass(s.refino.level)}>
                      {s.refino.level}
                    </Badge>
                  </div>
                  {s.refino.notes && (
                    <div className="text-xs text-slate-500">
                      {s.refino.notes.map((n, i) => (
                        <div key={i}>{n}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Fertilizantes</div>
                    <Badge className={getBadgeClass(s.fertilizantes.level)}>
                      {s.fertilizantes.level}
                    </Badge>
                  </div>
                  {s.fertilizantes.notes && (
                    <div className="text-xs text-slate-500">
                      {s.fertilizantes.notes.map((n, i) => (
                        <div key={i}>{n}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Siderurgia</div>
                    <Badge className={getBadgeClass(s.siderurgia.level)}>
                      {s.siderurgia.level}
                    </Badge>
                  </div>
                  {s.siderurgia.notes && (
                    <div className="text-xs text-slate-500">
                      {s.siderurgia.notes.map((n, i) => (
                        <div key={i}>{n}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Mobilidade</div>
                    <Badge className={getBadgeClass(s.mobilidade.level)}>
                      {s.mobilidade.level}
                    </Badge>
                  </div>
                  {s.mobilidade.notes && (
                    <div className="text-xs text-slate-500">
                      {s.mobilidade.notes.map((n, i) => (
                        <div key={i}>{n}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </>
  );
}
