import React, { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type SectorKey = "refino" | "fertilizantes" | "siderurgia" | "mobilidade";

// Dados qualitativos por UF (mesma base usada no card setorial)
const ufQualitative: Record<
  string,
  Record<SectorKey, { level: string; notes?: string[] }>
> = {
  SP: {
    refino: { level: "Alta", notes: ["REPLAN/REVAP/RECAP"] },
    fertilizantes: { level: "Média" },
    siderurgia: { level: "Alta", notes: ["Usiminas Cubatão"] },
    mobilidade: {
      level: "Alta",
      notes: ["pilotos EMTU/USP – célula a combustível"],
    },
  },
  RJ: {
    refino: { level: "Alta", notes: ["REDUC"] },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Alta" },
    mobilidade: { level: "Média" },
  },
  MG: {
    refino: { level: "Média" },
    fertilizantes: { level: "Média" },
    siderurgia: { level: "Alta" },
    mobilidade: { level: "Baixa" },
  },
  ES: {
    refino: { level: "Baixa" },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Alta" },
    mobilidade: { level: "Baixa" },
  },
  BA: {
    refino: { level: "Alta" },
    fertilizantes: { level: "Alta" },
    siderurgia: { level: "Média" },
    mobilidade: { level: "Baixa" },
  },
  SE: {
    refino: { level: "Baixa" },
    fertilizantes: { level: "Alta" },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
  PR: {
    refino: { level: "Alta" },
    fertilizantes: { level: "Alta" },
    siderurgia: { level: "Média" },
    mobilidade: { level: "Baixa" },
  },
  RS: {
    refino: { level: "Alta" },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Média" },
    mobilidade: { level: "Baixa" },
  },
  PE: {
    refino: { level: "Alta" },
    fertilizantes: { level: "Média" },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
  CE: {
    refino: { level: "Média" },
    fertilizantes: { level: "Média" },
    siderurgia: { level: "Média" },
    mobilidade: { level: "Baixa" },
  },
  AM: {
    refino: { level: "Média" },
    fertilizantes: { level: "Baixa" },
    siderurgia: { level: "Baixa" },
    mobilidade: { level: "Baixa" },
  },
  MS: {
    refino: { level: "Baixa" },
    fertilizantes: { level: "Alta" },
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

const sectorKeys: Record<string, SectorKey> = {
  Refino: "refino",
  Fertilizantes: "fertilizantes",
  Siderurgia: "siderurgia",
  Mobilidade: "mobilidade",
};

// Metodologia / trajetórias nacionais (kt)
const base2025 = {
  refino: 480,
  fertilizantes: 224,
  siderurgia: 88,
  mobilidade: 8,
};

const scenarios = {
  base: {
    "2030": {
      refino: 450,
      fertilizantes: 600,
      siderurgia: 375,
      mobilidade: 75,
    },
    "2050": {
      refino: 2000,
      fertilizantes: 2800,
      siderurgia: 2400,
      mobilidade: 800,
    },
    note: "Cenário Base: 2030 = 1,5 Mt; 2050 = 8 Mt",
  },
  aceleracao: {
    "2030": {
      refino: 1120,
      fertilizantes: 1400,
      siderurgia: 1200,
      mobilidade: 280,
    },
    "2050": {
      refino: 4000,
      fertilizantes: 6000,
      siderurgia: 8000,
      mobilidade: 2000,
    },
    note: "Cenário Aceleração: 2030 = 4 Mt; 2050 = 20 Mt",
  },
} as const;

const qualitativeWeight = (level: string) => {
  switch (level.toLowerCase()) {
    case "alta":
      return 1.0;
    case "média":
    case "media":
      return 0.6;
    case "baixa":
      return 0.2;
    default:
      return 0.2;
  }
};

const getBadgeClass = (value: number, max: number) => {
  const ratio = max > 0 ? value / max : 0;
  if (ratio > 0.66) return "bg-red-100 text-red-800 border-red-200";
  if (ratio > 0.33) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
};

function interpolateSectorValue(
  year: number,
  sector: SectorKey,
  scenarioKey: keyof typeof scenarios
) {
  // 2025 base
  const v2025 = (base2025 as any)[sector] as number;
  const v2030 = (scenarios as any)[scenarioKey]["2030"][sector] as number;
  const v2050 = (scenarios as any)[scenarioKey]["2050"][sector] as number;

  if (year <= 2025) return v2025;
  if (year <= 2030) {
    const years = year - 2025;
    const rate = Math.pow(v2030 / Math.max(1, v2025), 1 / 5) - 1;
    return v2025 * Math.pow(1 + rate, years);
  }
  // year between 2030 and 2050
  const years2 = year - 2030;
  const rate2 = Math.pow(v2050 / Math.max(1, v2030), 1 / 20) - 1;
  return v2030 * Math.pow(1 + rate2, years2);
}

export default function H2DemandByStateSectorCard({
  estado,
}: {
  estado?: string | null;
}) {
  const [year, setYear] = useState<string>("2025");
  const [sector, setSector] = useState<string>("All");
  const [ufFilter, setUfFilter] = useState<string>(estado || "all");
  const [scenario, setScenario] = useState<string>("base");

  // list of UFs from qualitative map
  const ufs = useMemo(() => Object.keys(ufQualitative), []);

  const yearNum = Number(year);

  // compute national sector values for selected year
  const nationalBySector = useMemo(() => {
    const result: Record<SectorKey, number> = {
      refino: 0,
      fertilizantes: 0,
      siderurgia: 0,
      mobilidade: 0,
    };
    (Object.keys(sectorKeys) as Array<keyof typeof sectorKeys>).forEach((k) => {
      const sec = sectorKeys[k as any];
      // @ts-ignore
      result[sec] = interpolateSectorValue(yearNum, sec, scenario as any);
    });
    return result;
  }, [yearNum, scenario]);

  // compute weights and distribute to UFs
  const perUf = useMemo(() => {
    // compute weights per sector
    const weightsPerSector: Record<SectorKey, Record<string, number>> = {
      refino: {},
      fertilizantes: {},
      siderurgia: {},
      mobilidade: {},
    };

    Object.entries(ufQualitative).forEach(([uf, sectors]) => {
      (Object.keys(sectors) as SectorKey[]).forEach((sec) => {
        let w = qualitativeWeight(sectors[sec].level);
        // bonus mobilidade for SP and DF
        if (sec === "mobilidade" && (uf === "SP" || uf === "DF")) w *= 1.2;
        weightsPerSector[sec][uf] = w;
      });
    });

    // normalize and multiply by national
    const result: Record<string, Record<string, number>> = {};
    ufs.forEach((uf) => (result[uf] = {}));

    (Object.keys(weightsPerSector) as SectorKey[]).forEach((sec) => {
      const map = weightsPerSector[sec];
      const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
      ufs.forEach((uf) => {
        const w = map[uf] || 0;
        const value = nationalBySector[sec] * (w / total);
        result[uf][sec] = value;
      });
    });

    return result;
  }, [nationalBySector, ufs]);

  // compute aggregated per UF (sum of sectors or single sector)
  const perUfValue = useMemo(() => {
    const vals: Record<string, number> = {};
    ufs.forEach((uf) => {
      if (sector === "All") {
        vals[uf] = Object.values(perUf[uf]).reduce((a, b) => a + b, 0);
      } else {
        const key = sectorKeys[sector] as SectorKey | undefined;
        if (key) vals[uf] = perUf[uf][key] || 0;
        else vals[uf] = 0;
      }
    });
    return vals;
  }, [perUf, sector, ufs]);

  const maxVal = useMemo(
    () => Math.max(...Object.values(perUfValue)),
    [perUfValue]
  );

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mb-4">
      <div className="px-6 py-4 flex items-center">
        <FileText className="w-6 h-6 text-emerald-600 mr-3" />
        <h2 className="text-2xl font-bold text-slate-900">
          Demanda de H₂ por estado e setor
        </h2>
        <Badge className="ml-auto bg-slate-100 text-slate-800 border-slate-200">
          Metodologia
        </Badge>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">Ano</p>
            <Select value={year} onValueChange={(v) => setYear(v)}>
              <SelectTrigger className="h-10 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: 2050 - 2025 + 1 },
                  (_, i) => 2025 + i
                ).map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">Estado</p>
            <Select
              value={ufFilter}
              onValueChange={(v) => setUfFilter(v)}
              disabled={Boolean(estado) && estado.toLowerCase() !== "all"}
            >
              <SelectTrigger className="h-10 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estado ? (
                  <>
                    {estado.toLowerCase() === "all" ? (
                      <SelectItem value="all">Todos os estados</SelectItem>
                    ) : (
                      <SelectItem value={estado}>{estado}</SelectItem>
                    )}
                  </>
                ) : (
                  <>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    {ufs.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">Setor</p>
            <Select value={sector} onValueChange={(v) => setSector(v)}>
              <SelectTrigger className="h-10 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todos os setores</SelectItem>
                {Object.keys(sectorKeys).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {ufs
            .filter((u) => (ufFilter === "all" ? true : u === ufFilter))
            .map((uf) => (
              <div key={uf} className="p-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{uf}</div>
                  <Badge className={getBadgeClass(perUfValue[uf] || 0, maxVal)}>
                    {Math.round((perUfValue[uf] || 0) * 10) / 10} kt
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {sector === "All" ? (
                    <>
                      {Object.entries(perUf[uf]).map(([sec, val]) => (
                        <div key={sec} className="flex justify-between">
                          <span>{sec}</span>
                          <span>{Math.round(val * 10) / 10} kt</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    (() => {
                      const sk = sectorKeys[sector] as SectorKey | undefined;
                      if (!sk) return null;
                      const qual = ufQualitative[uf][sk];
                      return (
                        <div>
                          <div className="text-xs">Nível: {qual.level}</div>
                          {qual.notes && (
                            <div className="text-xs">
                              Premissa: {qual.notes.join(", ")}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}
        </div>

        <div className="mt-3 text-xs text-slate-500">
          <div className="font-semibold">Como construí os números (resumo)</div>
          <ul className="list-disc pl-5">
            <li>
              Base 2025 (kt/ano) por setor: Refino 480 | Fertilizantes 224 |
              Siderurgia 88 | Mobilidade 8
            </li>
            <li>
              Trajetórias por cenário: interpolação por CAGR 2025→2030 e
              2030→2050
            </li>
            <li>
              Distribuição por UF: pesos qualitativos (Alta=1.0, Média=0.6,
              Baixa=0.2) com bônus mobilidade SP/DF
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
