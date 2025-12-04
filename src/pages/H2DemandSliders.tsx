import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
const sectors = ["Refino", "Fertilizantes", "Siderurgia", "Mobilidade"];

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

const baseline2025 = {
  Refino: 480,
  Fertilizantes: 224,
  Siderurgia: 88,
  Mobilidade: 8,
};

const presets: any = {
  Base: {
    total2030: 1500,
    total2050: 8000,
    s2030: { Refino: 30, Fertilizantes: 40, Siderurgia: 25, Mobilidade: 5 },
    s2050: { Refino: 25, Fertilizantes: 35, Siderurgia: 30, Mobilidade: 10 },
  },
  Aceleracao: {
    total2030: 4000,
    total2050: 20000,
    s2030: { Refino: 28, Fertilizantes: 35, Siderurgia: 30, Mobilidade: 7 },
    s2050: { Refino: 20, Fertilizantes: 30, Siderurgia: 40, Mobilidade: 10 },
  },
};

function normShares(obj: Record<string, number>) {
  const sum = Object.values(obj).reduce((a, b) => a + b, 0) || 1;
  const out: Record<string, number> = {};
  sectors.forEach((s) => (out[s] = obj[s] / sum));
  return out;
}

function piecewiseSeries(v2025: number, v2030: number, v2050: number) {
  const years = Array.from({ length: 26 }, (_, i) => 2025 + i);
  const cagr1 = Math.pow(v2030 / Math.max(v2025, 1e-6), 1 / 5) - 1;
  const cagr2 = Math.pow(v2050 / Math.max(v2030, 1e-6), 1 / 20) - 1;
  const yval: Record<number, number> = {};
  years.forEach((y) => {
    if (y <= 2030) yval[y] = v2025 * Math.pow(1 + cagr1, y - 2025);
    else yval[y] = v2030 * Math.pow(1 + cagr2, y - 2030);
  });
  return yval;
}

export default function H2DemandSliders() {
  const [scenario, setScenario] = useState<string>("Base");
  const [total2030, setTotal2030] = useState<number>(1.5);
  const [total2050, setTotal2050] = useState<number>(8);
  const [s2030, setS2030] = useState<Record<string, number>>(
    presets.Base.s2030
  );
  const [s2050, setS2050] = useState<Record<string, number>>(
    presets.Base.s2050
  );
  const [bias, setBias] = useState<Record<string, number>>({
    N: 1,
    NE: 1,
    CO: 1,
    SE: 1,
    S: 1,
  });
  const [year, setYear] = useState<number>(2030);
  const [sector, setSector] = useState<string>(sectors[0]);
  const selectedShares = year <= 2030 ? s2030 : s2050;
  const chartWidth = 700;
  const labelWidth = 220;
  const rowHeight = 40;

  const [tableRows, setTableRows] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    totalNow: 0,
    kRef: 0,
    kFert: 0,
    kSid: 0,
    kMob: 0,
  });

  const svgHeight = Math.max(1, tableRows.length) * rowHeight + 20;
  const maxVal = Math.max(...tableRows.map((r) => r.val), 1);

  const ufFull: Record<string, string> = {
    SP: "São Paulo",
    RJ: "Rio de Janeiro",
    MG: "Minas Gerais",
    ES: "Espírito Santo",
    BA: "Bahia",
    SE: "Sergipe",
    PR: "Paraná",
    RS: "Rio Grande do Sul",
    PE: "Pernambuco",
    CE: "Ceará",
    AM: "Amazonas",
    MS: "Mato Grosso do Sul",
    DF: "Distrito Federal",
  };

  const regionFull: Record<string, string> = {
    SE: "Sudeste",
    NE: "Nordeste",
    S: "Sul",
    N: "Norte",
    CO: "Centro-Oeste",
  };

  const compute = useMemo(() => {
    const t2030 = total2030 * 1000;
    const t2050 = total2050 * 1000;
    const f2030 = normShares(s2030);
    const f2050 = normShares(s2050);

    const targ2030: Record<string, number> = {};
    const targ2050: Record<string, number> = {};
    sectors.forEach((s) => {
      targ2030[s] = t2030 * f2030[s];
      targ2050[s] = t2050 * f2050[s];
    });

    const series: Record<string, Record<number, number>> = {};
    sectors.forEach((s) => {
      series[s] = piecewiseSeries(
        (baseline2025 as any)[s],
        targ2030[s],
        targ2050[s]
      );
    });

    const alloc: Record<
      string,
      Record<number, Record<string, number>>
    > = {} as any;
    sectors.forEach((s) => {
      alloc[s] = {} as any;
      const sh: Record<string, number> = {};
      let sumW = 0;
      ufs.forEach((uf) => {
        const w = (weights as any)[s][uf] * (bias as any)[regions[uf]];
        sh[uf] = w;
        sumW += w;
      });
      ufs.forEach((uf) => (sh[uf] = sh[uf] / Math.max(1, sumW)));
      Object.keys(series[s]).forEach((y) => {
        alloc[s][Number(y)] = {} as any;
        ufs.forEach((uf) => {
          alloc[s][Number(y)][uf] = series[s][Number(y)] * sh[uf];
        });
      });
    });

    const kRef = ufs.reduce((a, uf) => a + alloc.Refino[year][uf], 0);
    const kFert = ufs.reduce((a, uf) => a + alloc.Fertilizantes[year][uf], 0);
    const kSid = ufs.reduce((a, uf) => a + alloc.Siderurgia[year][uf], 0);
    const kMob = ufs.reduce((a, uf) => a + alloc.Mobilidade[year][uf], 0);
    const totalNow = kRef + kFert + kSid + kMob;

    const arr = ufs.map((uf) => ({
      uf,
      reg: regions[uf],
      val: alloc[sector][year][uf],
    }));
    arr.sort((a, b) => b.val - a.val);

    return { alloc, series, arr, kpis: { totalNow, kRef, kFert, kSid, kMob } };
  }, [total2030, total2050, s2030, s2050, bias, year, sector]);

  useEffect(() => {
    setTableRows(
      compute.arr.slice(0, 10).map((r) => ({
        ...r,
        name: ufFull[r.uf],
        regionName: regionFull[r.reg],
      }))
    );
    setKpis(compute.kpis);
  }, [compute]);

  // Stepper control used to replace sliders for better UX
  const Stepper = ({
    value,
    onChange,
    min,
    max,
    step = 1,
  }: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="inline-flex items-center">
      <button
        type="button"
        className="inline-flex items-center justify-center px-2 py-1 border rounded-l bg-slate-50 hover:bg-slate-100"
        onClick={() =>
          onChange(
            Number(Math.max(min ?? -Infinity, +(value - step)).toFixed(2))
          )
        }
        aria-label="Diminuir"
      >
        <Minus size={14} />
      </button>
      <input
        className="w-20 text-right px-2 py-1 border-t border-b"
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button
        type="button"
        className="inline-flex items-center justify-center px-2 py-1 border rounded-r bg-slate-50 hover:bg-slate-100"
        onClick={() =>
          onChange(
            Number(Math.min(max ?? Infinity, +(value + step)).toFixed(2))
          )
        }
        aria-label="Aumentar"
      >
        <Plus size={14} />
      </button>
    </div>
  );

  const exportCsv = () => {
    const years = Array.from({ length: 26 }, (_, i) => 2025 + i);
    const rows = ["Ano,UF,Regiao,Setor,Demanda_kt"];
    years.forEach((y) => {
      ufs.forEach((uf) => {
        sectors.forEach((s) => {
          rows.push(
            [
              y,
              ufFull[uf],
              regionFull[regions[uf]],
              s,
              compute.alloc[s][y][uf].toFixed(3),
            ].join(",")
          );
        });
      });
    });
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "H2_demanda_UF_setor_" + Date.now() + ".csv";
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold">
          H2Maps • Demanda de H₂ por UF e Setor (2025–2050)
          <Badge className="ml-2">versão com sliders • offline</Badge>
        </h1>
        <p className="note mt-2">
          Ajuste metas nacionais, participação setorial e vieses regionais. A
          alocação por UF usa pesos setoriais calibrados por ativos.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <section className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-medium">1) Cenário & Totais Brasil</h2>

            <div className="mt-3">
              <label className="block text-sm">Escolha o cenário</label>
              <Select value={scenario} onValueChange={(v) => setScenario(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Base">
                    Base (take-off → consolidação)
                  </SelectItem>
                  <SelectItem value="Aceleracao">
                    Aceleração (compatível com Net-Zero)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm block">Total Brasil 2030 (Mt)</label>
                <div className="flex items-center gap-3">
                  <Stepper
                    value={total2030}
                    onChange={(v) => setTotal2030(v)}
                    min={0.5}
                    max={6}
                    step={0.1}
                  />
                  <Badge>→ {total2030.toFixed(1)} Mt</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm block">Total Brasil 2050 (Mt)</label>
                <div className="flex items-center gap-3">
                  <Stepper
                    value={total2050}
                    onChange={(v) => setTotal2050(v)}
                    min={2}
                    max={30}
                    step={0.5}
                  />
                  <Badge>→ {total2050.toFixed(1)} Mt</Badge>
                </div>
              </div>
            </div>

            <h3 className="mt-4 font-medium">2) Participação setorial (%)</h3>
            <p className="text-sm text-muted-foreground">
              Mostrando participação para {year}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(selectedShares).map(([k, v]) => (
                <div key={k}>
                  <label className="text-sm text-slate-600">
                    {year} {k}
                  </label>
                  <Stepper
                    value={v}
                    onChange={(val) => {
                      if (year <= 2030) setS2030((s) => ({ ...s, [k]: val }));
                      else setS2050((s) => ({ ...s, [k]: val }));
                    }}
                    min={0}
                    max={70}
                    step={1}
                  />
                  <div className="mt-1">
                    <Badge className="bg-emerald-50 text-emerald-700">
                      {v}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-4 font-medium">3) Vieses regionais</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(bias).map(([k, v]) => (
                <div key={k}>
                  <label className="text-sm text-slate-600">{k}</label>
                  <Stepper
                    value={v}
                    onChange={(val) => setBias((b) => ({ ...b, [k]: val }))}
                    min={0.5}
                    max={1.5}
                    step={0.05}
                  />
                  <div className="mt-1">
                    <Badge className="bg-emerald-50 text-emerald-700">
                      × {v.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-4 font-medium">4) Visualização</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-sm text-slate-600">Ano</label>
                <div className="flex items-center gap-2">
                  <Stepper
                    value={year}
                    onChange={(v) => setYear(v)}
                    min={2025}
                    max={2050}
                    step={1}
                  />
                  <Badge>{year}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm">Setor</label>
                <Select value={sector} onValueChange={(v) => setSector(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={exportCsv}>
                Exportar CSV (parâmetros atuais)
              </Button>
            </div>
          </Card>
        </section>

        <section className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium">
                  Demanda nacional (kt H₂/ano)
                </h2>
                <div className="inline mt-2">
                  <div>
                    Total{" "}
                    <strong>
                      {kpis.totalNow.toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  <div>
                    <Badge className="ml-2">por cenário & sliders</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div>
                  Refino:{" "}
                  <strong>
                    {kpis.kRef.toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
                <div>
                  Fertilizantes:{" "}
                  <strong>
                    {kpis.kFert.toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
                <div>
                  Siderurgia:{" "}
                  <strong>
                    {kpis.kSid.toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
                <div>
                  Mobilidade:{" "}
                  <strong>
                    {kpis.kMob.toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${svgHeight}`}
                  className="w-full"
                >
                  {tableRows.map((r, i) => {
                    const y = 10 + i * rowHeight;
                    const barMaxWidth = chartWidth - labelWidth - 40;
                    const barW = Math.max(2, (r.val / maxVal) * barMaxWidth);
                    return (
                      <g key={r.uf}>
                        <text x={10} y={y + 14} fontSize={12} fill="#0f172a">
                          {r.name}
                        </text>
                        <text
                          x={labelWidth - 10}
                          y={y + 14}
                          fontSize={12}
                          fill="#334155"
                          textAnchor="end"
                        >
                          {r.regionName}
                        </text>
                        <rect
                          x={labelWidth}
                          y={y}
                          width={barW}
                          height={18}
                          rx={4}
                          fill="#4ea1ff"
                        />
                        <text
                          x={labelWidth + barW + 8}
                          y={y + 14}
                          fontSize={12}
                          fill="#0b1220"
                        >
                          {r.val.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <h2 className="mt-4">
              Top 10 UFs – {sector} • {year}
            </h2>
            <div className="overflow-x-auto">
              <table id="tbl" className="w-full mt-2 table-fixed">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th className="w-56 text-left">Estado</th>
                    <th className="w-40 text-left">Região</th>
                    <th className="text-right">Demanda (kt)</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r, i) => (
                    <tr key={r.uf}>
                      <td className="text-sm">{i + 1}</td>
                      <td className="text-sm">{r.name}</td>
                      <td className="text-sm">{r.regionName}</td>
                      <td className="text-sm text-right">{r.val.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>

      <footer className="mt-6 text-sm">
        Fontes de calibração qualitativa: ANP (refino), EPE (Fact Sheet H₂),
        Instituto Aço Brasil/FIESP (siderurgia), MDIC/Petrobras/Unigel
        (fertilizantes), EMTU/USP e Neoenergia/Honda (mobilidade). Este
        simulador gera cenários para planejamento — não são medições oficiais.
      </footer>
    </div>
  );
}
