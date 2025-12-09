import React, { useMemo, useState } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import h2QualitativeByState from "@/data/h2_qualitative_by_state";
import { officialSources } from "@/data/officialSources";
// Função utilitária para buscar títulos das fontes
function getSourceTitles(sourceIds?: string[]): string[] {
  if (!sourceIds) return [];
  return sourceIds
    .map(id => {
      const found = officialSources.find(s => s.id === id);
      return found ? found.title : id;
    })
    .filter(Boolean);
}
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
  // User-provided states (14) - follow same UI logic as SP
  AC: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Baixa' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Baixa', notes: ['Projetos locais listados nas fontes'] },
  },
  AP: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Média', notes: ['Negociações NextGen Hydrogen / governo estadual'] },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Média' },
  },
  PA: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Baixa' },
    siderurgia: { level: 'Alta', notes: ['Hydro, Sinobras, Vale / expansão siderúrgica'] },
    mobilidade: { level: 'Média' },
  },
  RO: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Média' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Baixa', notes: ['SENAI/SEDEC - roadmap H2V'] },
  },
  RR: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Baixa' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Baixa', notes: ['RBCIP - hubs e projetos H2V'] },
  },
  TO: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Média' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Baixa', notes: ['Projetos PNH2 / iniciativas locais'] },
  },
  AL: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Baixa' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Baixa', notes: ['Braskem (unidade hibernada)'] },
  },
  MA: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Baixa' },
    siderurgia: { level: 'Alta', notes: ['AVB / projetos de aço verde'] },
    mobilidade: { level: 'Média', notes: ['Stegra / negociações e investimentos'] },
  },
  PB: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Média' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Média', notes: ['UFPB, PetroSolGas, iniciativas locais'] },
  },
  PI: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Alta', notes: ['ZPE Parnaíba / Hub IND / Green Energy Park'] },
    siderurgia: { level: 'Média' },
    mobilidade: { level: 'Média' },
  },
  RN: {
    refino: { level: 'Média' },
    fertilizantes: { level: 'Média' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Média', notes: ['Marco legal estadual e projetos Petrobras'] },
  },
  GO: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Média' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Média', notes: ['Itumbiara (planta piloto) / ATVOS'] },
  },
  MT: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Alta', notes: ['ATVOS - fábrica de amônia verde'] },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Média' },
  },
  SC: {
    refino: { level: 'Baixa' },
    fertilizantes: { level: 'Média' },
    siderurgia: { level: 'Baixa' },
    mobilidade: { level: 'Média', notes: ['WEG / Celesc / UFSC - projetos-piloto'] },
  },
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

// Merge local `data` with external qualitative dataset to cover additional UFs
const combinedData: Record<string, any> = (() => {
  const out: Record<string, any> = { ...data };
  Object.entries(h2QualitativeByState).forEach(([uf, obj]) => {
    const sectors = obj.sectors || {};
    out[uf] = out[uf] || { refino: { level: 'Baixa' }, fertilizantes: { level: 'Baixa' }, siderurgia: { level: 'Baixa' }, mobilidade: { level: 'Baixa' } };
    // Map keys
    out[uf].refino = out[uf].refino || {};
    out[uf].fertilizantes = out[uf].fertilizantes || {};
    out[uf].siderurgia = out[uf].siderurgia || {};
    out[uf].mobilidade = out[uf].mobilidade || {};
    if (sectors.refino) {
      out[uf].refino.level = sectors.refino.level || out[uf].refino.level;
      if (sectors.refino.sources) out[uf].refino.sources = sectors.refino.sources;
    }
    if (sectors.fertilizantes) {
      out[uf].fertilizantes.level = sectors.fertilizantes.level || out[uf].fertilizantes.level;
      if (sectors.fertilizantes.sources) out[uf].fertilizantes.sources = sectors.fertilizantes.sources;
    }
    if (sectors.siderurgia) {
      out[uf].siderurgia.level = sectors.siderurgia.level || out[uf].siderurgia.level;
      if (sectors.siderurgia.sources) out[uf].siderurgia.sources = sectors.siderurgia.sources;
    }
    if (sectors.mobilidade_powertox) {
      out[uf].mobilidade.level = sectors.mobilidade_powertox.level || out[uf].mobilidade.level;
      if (sectors.mobilidade_powertox.sources) out[uf].mobilidade.sources = sectors.mobilidade_powertox.sources;
    }
  });
  return out;
})();

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
  // UFs ampliados para todos os 27 estados
  const ufs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const regions: Record<string, string> = {
    AC: "N", AL: "NE", AP: "N", AM: "N", BA: "NE", CE: "NE", DF: "CO", ES: "SE", GO: "CO", MA: "NE", MT: "CO", MS: "CO", MG: "SE", PA: "N", PB: "NE", PR: "S", PE: "NE", PI: "NE", RJ: "SE", RN: "NE", RS: "S", RO: "N", RR: "N", SC: "S", SP: "SE", SE: "NE", TO: "N"
  };

  const baseline2025: Record<string, number> = {
    Refino: 480,
    Fertilizantes: 224,
    Siderurgia: 88,
    Mobilidade: 8,
  };

  // Pesos ampliados para todos os UFs
  const weights: Record<string, Record<string, number>> = {
    Refino: {
      SP: 1.0, RJ: 1.0, MG: 0.6, ES: 0.2, BA: 1.0, SE: 0.2, PR: 1.0, RS: 1.0, PE: 1.0, CE: 0.6, AM: 0.6, MS: 0.2, DF: 0.2,
      AC: 0.2, AL: 0.2, AP: 0.2, GO: 0.2, MA: 0.2, MT: 0.2, PA: 0.2, PB: 0.2, PI: 0.2, RN: 1.0, RO: 0.2, RR: 0.2, SC: 0.2, TO: 0.2
    },
    Fertilizantes: {
      SP: 0.6, RJ: 0.2, MG: 0.6, ES: 0.2, BA: 1.0, SE: 1.0, PR: 1.0, RS: 0.2, PE: 0.6, CE: 0.6, AM: 0.2, MS: 1.0, DF: 0.2,
      AC: 0.2, AL: 0.2, AP: 0.2, GO: 1.0, MA: 0.2, MT: 1.0, PA: 0.2, PB: 0.6, PI: 1.0, RN: 1.0, RO: 0.2, RR: 0.2, SC: 1.0, TO: 1.0
    },
    Siderurgia: {
      SP: 1.0, RJ: 1.0, MG: 1.0, ES: 1.0, BA: 0.6, SE: 0.2, PR: 0.6, RS: 0.6, PE: 0.2, CE: 0.6, AM: 0.2, MS: 0.2, DF: 0.2,
      AC: 0.2, AL: 0.2, AP: 0.2, GO: 0.2, MA: 1.0, MT: 0.2, PA: 1.0, PB: 0.2, PI: 1.0, RN: 0.8, RO: 0.2, RR: 0.2, SC: 0.2, TO: 0.2
    },
    Mobilidade: {
      SP: 1.2, RJ: 0.8, MG: 0.2, ES: 0.2, BA: 0.2, SE: 0.2, PR: 0.2, RS: 0.2, PE: 0.2, CE: 0.2, AM: 0.2, MS: 0.2, DF: 1.2,
      AC: 0.2, AL: 0.2, AP: 0.2, GO: 1.0, MA: 1.0, MT: 1.0, PA: 1.0, PB: 1.0, PI: 1.0, RN: 1.0, RO: 0.2, RR: 0.2, SC: 1.0, TO: 0.2
    },
  };

  const [scope, setScope] = useState<"estado" | "regiao">("estado");
  const [year, setYear] = useState<number>(2025);
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
        // qualitative level from combinedData if available
        const lvlRaw = (
          (combinedData as any)[uf]?.[s.toLowerCase()]?.level || "Baixa"
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
              Total {scope === "estado" ? "estado/ano" : "região/ano"}
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
      
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600">
          <strong>Fonte dos dados:</strong> Projeções baseadas em dados setoriais oficiais (Refino, Fertilizantes, Siderurgia, Mobilidade) 
          combinados com baseline IPEA e tendências regionais. Os valores refletem estimativas qualitativas ajustadas por nível de demanda 
          (Alta/Média/Baixa) observado em cada estado.
        </p>
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

  // States for which we hide the "Fontes/Empresas" visual (user request)
  const hiddenSourceStates = new Set([
    'AC','AP','PA','RO','RR','TO','AL','MA','PB','PI','RN','GO','MT','SC'
  ]);
  const hideSourcesForThisState = hiddenSourceStates.has(estado.toUpperCase());

  // Quando for 'all' agregamos os dados qualitativos
  if (estadoNorm === "all") {
    const sectors = ["refino", "fertilizantes", "siderurgia", "mobilidade"];

    const counts: Record<string, Record<string, number>> = {};
    const topStates: Record<string, string[]> = {};
    sectors.forEach((sec) => {
      counts[sec] = { Alta: 0, Média: 0, Baixa: 0 } as Record<string, number>;
      topStates[sec] = [];
    });

    Object.entries(combinedData).forEach(([uf, values]) => {
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

  const s = combinedData[estado.toUpperCase()];
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
  const [isOxygenOpen, setIsOxygenOpen] = useState(true);

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
                  {/* Notas locais */}
                  {s.refino.notes && (
                    <div className="text-xs text-slate-500">
                      {s.refino.notes.map((n, i) => (
                        <div key={i}>{n}</div>
                      ))}
                    </div>
                  )}
                  {/* Fontes qualitativas */}
                  {s.refino.sources && !hideSourcesForThisState && (
                    <div className="text-xs text-emerald-700 mt-1">
                      <b>Fontes/Empresas:</b>
                      <ul>
                        {getSourceTitles(s.refino.sources).map((title, idx) => (
                          <li key={idx}>{title}</li>
                        ))}
                      </ul>
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
                  {s.fertilizantes.sources && !hideSourcesForThisState && (
                    <div className="text-xs text-emerald-700 mt-1">
                      <b>Fontes/Empresas:</b>
                      <ul>
                        {getSourceTitles(s.fertilizantes.sources).map((title, idx) => (
                          <li key={idx}>{title}</li>
                        ))}
                      </ul>
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
                  {s.siderurgia.sources && !hideSourcesForThisState && (
                    <div className="text-xs text-emerald-700 mt-1">
                      <b>Fontes/Empresas:</b>
                      <ul>
                        {getSourceTitles(s.siderurgia.sources).map((title, idx) => (
                          <li key={idx}>{title}</li>
                        ))}
                      </ul>
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
                  {s.mobilidade.sources && !hideSourcesForThisState && (
                    <div className="text-xs text-emerald-700 mt-1">
                      <b>Fontes/Empresas:</b>
                      <ul>
                        {getSourceTitles(s.mobilidade.sources).map((title, idx) => (
                          <li key={idx}>{title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mb-4">
        <Collapsible open={isOxygenOpen} onOpenChange={setIsOxygenOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="px-6 py-4 flex items-center hover:bg-slate-50 transition-colors">
              <FileText className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">
                Demanda do Oxigênio Gerado na Produção de Hidrogênio
              </h2>
              <Badge className="ml-auto mr-3 bg-emerald-100 text-emerald-800 border-emerald-200">
                {estado.toUpperCase()}
                {estadoNome ? ` — ${estadoNome}` : ""}
              </Badge>
              <ChevronDown
                className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${
                  isOxygenOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Aplicações Médicas</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>Oxigênio medicinal para hospitais e clínicas</p>
                  </div>
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Processamento Químico</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>Oxidação controlada em síntese química</p>
                  </div>
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Indústria Metalúrgica</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>Corte e soldagem, tratamento de minérios</p>
                  </div>
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Tratamento de Efluentes</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>Oxidação biológica e química de resíduos</p>
                  </div>
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Indústria de Alimentos</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>Esterilização, oxidação controlada em bebidas</p>
                  </div>
                </div>

                <div className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Combustão Aprimorada</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <p>Queimadores de alta eficiência</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </>
  );
}
