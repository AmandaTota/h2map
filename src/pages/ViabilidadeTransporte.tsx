import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";

const fmt = (v: number, d = 2) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

// Modelos simples traduzidos do script Python
type Veiculo = {
  consumo_km_por_l: number;
  preco_combustivel: number;
  emissao_kgco2_por_l?: number;
};

type Rota = {
  distancia_ida_km: number;
  distancia_volta_km: number;
  pedagios_ida: number[];
  pedagios_volta: number[];
  tempo_ida_h: number;
  tempo_volta_h: number;
  tempo_carreg_desc_h: number;
};

type CargaH2 = {
  carga_util_kg: number;
  perda_percentual: number;
};

type CustosFixos = {
  custo_motorista_por_h: number;
  seguro_por_viagem: number;
  outros_fixos_por_viagem: number;
  amortizacao_por_km: number;
};

type PoliticaPreco = {
  preco_venda_h2_por_kg?: number | null;
  margem_alvo_percent?: number | null;
  custo_carbono_por_tCO2?: number;
};

const parsePedagios = (text: string) => {
  if (!text) return [] as number[];
  return text.replace(/;/g, ",").split(",").map(s => parseFloat(s.trim())).filter(n => !Number.isNaN(n));
};

const calcular_custo_combustivel = (veic: Veiculo, rota_km: number) => {
  if (veic.consumo_km_por_l <= 0) throw new Error("Consumo deve ser > 0");
  const litros = rota_km / veic.consumo_km_por_l;
  return litros * veic.preco_combustivel;
};

const calcular_custo_carbono = (veic: Veiculo, rota_km: number, custo_carbono_por_tCO2 = 0) => {
  if (!custo_carbono_por_tCO2 || custo_carbono_por_tCO2 <= 0) return 0;
  const litros = rota_km / veic.consumo_km_por_l;
  const kg_co2 = litros * (veic.emissao_kgco2_por_l ?? 2.68);
  return (kg_co2 / 1000) * custo_carbono_por_tCO2;
};

export default function ViabilidadeTransporte() {
  // Inputs
  const [consumo, setConsumo] = useState<string>("");
  const [precoComb, setPrecoComb] = useState<string>("");
  const [distIda, setDistIda] = useState<string>("");
  const [distVolta, setDistVolta] = useState<string>("");
  const [pedIda, setPedIda] = useState<string>("");
  const [pedVolta, setPedVolta] = useState<string>("");
  const [tIda, setTIda] = useState<string>("");
  const [tVolta, setTVolta] = useState<string>("");
  const [tCarga, setTCarga] = useState<string>("");
  const [kgCarga, setKgCarga] = useState<string>("");
  const [perdaPct, setPerdaPct] = useState<string>("");
  const [custoMotH, setCustoMotH] = useState<string>("");
  const [seguro, setSeguro] = useState<string>("");
  const [outrosFixos, setOutrosFixos] = useState<string>("");
  const [amortKm, setAmortKm] = useState<string>("");
  const [precoKg, setPrecoKg] = useState<string>("");
  const [margem, setMargem] = useState<string>("");
  const [custoCarbono, setCustoCarbono] = useState<string>("");
  const [tipoTransporte, setTipoTransporte] = useState<string>("gasoso");
  const [capacidadeVeiculo, setCapacidadeVeiculo] = useState<string>("350");
  const [eficiencia, setEficiencia] = useState<string>("1");

  const [resultado, setResultado] = useState<any>(null);

  const calcular = () => {
    const veic: Veiculo = {
      consumo_km_por_l: parseFloat(consumo || "0"),
      preco_combustivel: parseFloat(precoComb || "0"),
      emissao_kgco2_por_l: 2.68,
    };

    const rota: Rota = {
      distancia_ida_km: parseFloat(distIda || "0"),
      distancia_volta_km: parseFloat(distVolta || "0"),
      pedagios_ida: parsePedagios(pedIda),
      pedagios_volta: parsePedagios(pedVolta),
      tempo_ida_h: parseFloat(tIda || "0"),
      tempo_volta_h: parseFloat(tVolta || "0"),
      tempo_carreg_desc_h: parseFloat(tCarga || "0"),
    };

    const carga: CargaH2 = {
      carga_util_kg: parseFloat(kgCarga || "0"),
      perda_percentual: parseFloat(perdaPct || "0"),
    };

    const fixos: CustosFixos = {
      custo_motorista_por_h: parseFloat(custoMotH || "0"),
      seguro_por_viagem: parseFloat(seguro || "0"),
      outros_fixos_por_viagem: parseFloat(outrosFixos || "0"),
      amortizacao_por_km: parseFloat(amortKm || "0"),
    };

    const pol: PoliticaPreco = {
      preco_venda_h2_por_kg: precoKg ? parseFloat(precoKg) : null,
      margem_alvo_percent: margem ? parseFloat(margem) : null,
      custo_carbono_por_tCO2: custoCarbono ? parseFloat(custoCarbono) : 0,
    };

    const km_total = rota.distancia_ida_km + rota.distancia_volta_km;
    const custo_comb = calcular_custo_combustivel(veic, km_total);
    const custo_carbono = calcular_custo_carbono(veic, km_total, pol.custo_carbono_por_tCO2 || 0);
    const custo_amort = fixos.amortizacao_por_km * km_total;
    const custo_pedagios = (rota.pedagios_ida || []).reduce((a,b)=>a+b,0) + (rota.pedagios_volta || []).reduce((a,b)=>a+b,0);
    const custo_motorista = fixos.custo_motorista_por_h * (rota.tempo_ida_h + rota.tempo_volta_h + rota.tempo_carreg_desc_h);
    const total_fixos = fixos.seguro_por_viagem + fixos.outros_fixos_por_viagem + custo_pedagios + custo_motorista;

    // Capacidade do veículo de acordo com o tipo
    const capacidadeDefault = (() => {
      if (tipoTransporte === "gasoso") return 350; // kg (200-500)
      if (tipoTransporte === "liquido") return 3500; // kg (3k-4k)
      return 1000; // LOHC/Outros: tratar como H2 equivalente
    })();
    const capacidade = parseFloat(capacidadeVeiculo || String(capacidadeDefault)) || capacidadeDefault;

    const custo_total_por_viagem = custo_comb + custo_carbono + custo_amort + total_fixos;
    const numero_viagens = Math.max(1, Math.ceil(carga.carga_util_kg / capacidade));
    const custo_total_geral = custo_total_por_viagem * numero_viagens;
    const custo_por_km = km_total > 0 ? custo_total_por_viagem / km_total : Infinity;

    const kg_entregue = Math.max(carga.carga_util_kg * (1 - carga.perda_percentual/100.0), 0);
    const preco_break_even_por_kg = kg_entregue > 0 ? custo_total_geral / kg_entregue : null;
    let receita = null;
    let lucro = null;
    let preco_sugerido_por_kg = null;
    if (kg_entregue > 0 && pol.preco_venda_h2_por_kg) {
      receita = pol.preco_venda_h2_por_kg * kg_entregue;
      lucro = receita - custo_total_geral;
    }
    if (kg_entregue > 0 && pol.margem_alvo_percent) {
      const margemNum = (pol.margem_alvo_percent || 0) / 100.0;
      if (margemNum >= 1.0) {
        preco_sugerido_por_kg = null;
      } else {
        preco_sugerido_por_kg = (preco_break_even_por_kg || 0) / (1.0 - margemNum);
      }
    }

    // Recomendações entre modos (simulação rápida usando custos por viagem calculados acima)
    const modeSpecs: Record<string, { label: string; cap: number; energyPenalty: number; boilOff: number; notes?: string }> = {
      gasoso: { label: 'Gasoso (cilindros/tubulares)', cap: 350, energyPenalty: 1.0, boilOff: 0, notes: 'Curta distância / pequenas quantidades' },
      liquido: { label: 'Líquido (tanque criogênico)', cap: 3500, energyPenalty: 1.2, boilOff: 0.01, notes: 'Longas distâncias / grandes quantidades. Possui boil-off e custo de liquefação.' },
      lohc: { label: 'LOHC / portadores', cap: 4000, energyPenalty: 1.25, boilOff: 0, notes: 'Integração com infraestrutura de líquidos; liberação demanda energia.' },
      ammonia: { label: 'Amônia (NH3)', cap: 3500, energyPenalty: 1.2, boilOff: 0, notes: 'Alta capacidade; atenção à toxicidade e manuseio.' },
    };

    const eficienciaNum = Math.max(0.0001, parseFloat(eficiencia || '1'));

    const modeResults: Array<any> = [];
    Object.keys(modeSpecs).forEach((m) => {
      const spec = modeSpecs[m];
      const cap = spec.cap;
      const nTrips = Math.max(1, Math.ceil(carga.carga_util_kg / cap));
      const totalCost = custo_total_por_viagem * nTrips; // custo_total_por_viagem já calcula combustível+fixos por viagem
      const kgDelivered = Math.max(0.0001, carga.carga_util_kg * (1 - carga.perda_percentual/100.0) * (1 - spec.boilOff));
      const costPerKg = totalCost / kgDelivered;
      const adjusted = costPerKg * spec.energyPenalty / eficienciaNum;
      modeResults.push({ key: m, label: spec.label, cap, nTrips, totalCost, kgDelivered, costPerKg, adjusted, notes: spec.notes });
    });

    // escolher o modo com menor custo ajustado
    modeResults.sort((a,b) => a.adjusted - b.adjusted);
    const best = modeResults[0];

    setResultado({
      km_total,
      custo_combustivel: custo_comb,
      custo_carbono,
      custo_amortizacao: custo_amort,
      custo_pedagios,
      custo_motorista,
      custo_fixos_total: total_fixos,
      custo_total_por_viagem,
      numero_viagens,
      custo_total_geral,
      custo_por_km,
      kg_carregado: carga.carga_util_kg,
      perda_percentual: carga.perda_percentual,
      kg_entregue,
      preco_break_even_por_kg,
      receita,
      lucro,
      preco_sugerido_por_kg,
      modeResults,
      recommendedMode: best,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-12">
      <Navigation />
      <div className="pt-28 max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Viabilidade de transporte</h1>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de transporte</Label>
              <div className="flex items-center gap-2">
                <Select value={tipoTransporte} onValueChange={(v) => {
                  setTipoTransporte(v);
                  // ajustar capacidade automaticamente ao mudar o tipo
                  if (v === 'gasoso') setCapacidadeVeiculo('350');
                  else if (v === 'liquido') setCapacidadeVeiculo('3500');
                  else setCapacidadeVeiculo('1000');
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoso">Gasoso (cilindros/tubulares)</SelectItem>
                    <SelectItem value="liquido">Líquido (tanque criogênico)</SelectItem>
                    <SelectItem value="lohc">LOHC / portadores químicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Capacidade por veículo (kg H₂)</Label>
              <Input className="placeholder:text-slate-400/60" value={capacidadeVeiculo} onChange={e=>setCapacidadeVeiculo(e.target.value)} placeholder="ex: 350" />
            </div>

            <div>
              <Label>Consumo do caminhão (km/L)</Label>
              <Input className="placeholder:text-slate-400/60" value={consumo} onChange={e=>setConsumo(e.target.value)} placeholder="ex: 3" />
            </div>
            <div>
              <Label>Preço do combustível (R$/L)</Label>
              <Input className="placeholder:text-slate-400/60" value={precoComb} onChange={e=>setPrecoComb(e.target.value)} placeholder="ex: 6.50" />
            </div>
            <div>
              <Label>Distância de ida (km)</Label>
              <Input className="placeholder:text-slate-400/60" value={distIda} onChange={e=>setDistIda(e.target.value)} placeholder="ex: 500" />
            </div>
            <div>
              <Label>Distância de volta (km)</Label>
              <Input className="placeholder:text-slate-400/60" value={distVolta} onChange={e=>setDistVolta(e.target.value)} placeholder="ex: 500 (0 se não houver)" />
            </div>
            <div>
              <Label>Pedágios ida (R$) separados por vírgula</Label>
              <Input className="placeholder:text-slate-400/60" value={pedIda} onChange={e=>setPedIda(e.target.value)} placeholder="ex: 12, 18.5, 22" />
            </div>
            <div>
              <Label>Pedágios volta (R$) separados por vírgula</Label>
              <Input className="placeholder:text-slate-400/60" value={pedVolta} onChange={e=>setPedVolta(e.target.value)} placeholder="vazio se não houver" />
            </div>
            <div>
              <Label>Tempo ida (h)</Label>
              <Input className="placeholder:text-slate-400/60" value={tIda} onChange={e=>setTIda(e.target.value)} placeholder="ex: 7.5" />
            </div>
            <div>
              <Label>Tempo volta (h)</Label>
              <Input className="placeholder:text-slate-400/60" value={tVolta} onChange={e=>setTVolta(e.target.value)} placeholder="ex: 7.5 (0 se não houver)" />
            </div>
            <div>
              <Label>Tempo carga+descarga (h)</Label>
              <Input className="placeholder:text-slate-400/60" value={tCarga} onChange={e=>setTCarga(e.target.value)} placeholder="ex: 2" />
            </div>
            <div>
              <Label>Kg carregados</Label>
              <Input className="placeholder:text-slate-400/60" value={kgCarga} onChange={e=>setKgCarga(e.target.value)} placeholder="ex: 1000" />
            </div>
            <div>
              <Label>Perda percentual (%)</Label>
              <Input className="placeholder:text-slate-400/60" value={perdaPct} onChange={e=>setPerdaPct(e.target.value)} placeholder="ex: 0.5" />
            </div>
            <div>
              <Label>Custo motorista (R$/h)</Label>
              <Input className="placeholder:text-slate-400/60" value={custoMotH} onChange={e=>setCustoMotH(e.target.value)} placeholder="ex: 35" />
            </div>
            <div>
              <Label>Seguro por viagem (R$)</Label>
              <Input className="placeholder:text-slate-400/60" value={seguro} onChange={e=>setSeguro(e.target.value)} placeholder="ex: 200" />
            </div>
            <div>
              <Label>Outros fixos por viagem (R$)</Label>
              <Input className="placeholder:text-slate-400/60" value={outrosFixos} onChange={e=>setOutrosFixos(e.target.value)} placeholder="ex: 300" />
            </div>
            <div>
              <Label>Amortização (R$/km)</Label>
              <Input className="placeholder:text-slate-400/60" value={amortKm} onChange={e=>setAmortKm(e.target.value)} placeholder="ex: 0.8" />
            </div>
            <div>
              <Label>Preço de venda (R$/kg) — opcional</Label>
              <Input className="placeholder:text-slate-400/60" value={precoKg} onChange={e=>setPrecoKg(e.target.value)} placeholder="deixe vazio se não souber" />
            </div>
            <div>
              <Label>Margem alvo (%) — opcional</Label>
              <Input className="placeholder:text-slate-400/60" value={margem} onChange={e=>setMargem(e.target.value)} placeholder="ex: 25" />
            </div>
            <div>
              <Label>Custo de carbono (R$/tCO2)</Label>
              <Input className="placeholder:text-slate-400/60" value={custoCarbono} onChange={e=>setCustoCarbono(e.target.value)} placeholder="ex: 0" />
            </div>
            <div>
              <Label>Eficiência</Label>
              <Input className="placeholder:text-slate-400/60" value={eficiencia} onChange={e=>setEficiencia(e.target.value)} placeholder="ex: 1 (padrão)" />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={calcular}>Calcular</Button>
            <Button variant="outline" onClick={()=>{
              setResultado(null);
              setConsumo(""); setPrecoComb(""); setDistIda(""); setDistVolta("");
              setPedIda(""); setPedVolta(""); setTIda(""); setTVolta(""); setTCarga("");
              setKgCarga(""); setPerdaPct(""); setCustoMotH(""); setSeguro(""); setOutrosFixos(""); setAmortKm("");
              setPrecoKg(""); setMargem(""); setCustoCarbono("");
              setTipoTransporte('gasoso'); setCapacidadeVeiculo('350');
            }}>Limpar</Button>
          </div>
        </Card>

        {resultado && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-lg">Resultados</h2>
                <p className="text-sm text-slate-500">Resumo por viagem</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Quilometragem</div>
                <div className="text-xl font-bold text-emerald-700">{fmt(resultado.km_total,2)} km</div>
                <div className="text-xs text-slate-500">Veículo / capacidade</div>
                <div className="text-sm font-medium">{resultado.numero_viagens} viagem(ns) • {resultado.kg_carregado ? `${fmt(resultado.kg_carregado,0)} kg` : ''} • capacidade por veículo: {resultado.numero_viagens ? `${fmt(parseFloat(capacidadeVeiculo||'0'),0)} kg` : ''}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white/90 rounded-lg border shadow-sm">
                <div className="text-sm text-slate-500">Custo total (todas as viagens)</div>
                <div className="text-lg font-semibold text-rose-600">R$ {fmt(resultado.custo_total_geral,2)}</div>
                <div className="text-xs text-slate-400 mt-1">Por viagem: R$ {fmt(resultado.custo_total_por_viagem,2)} • Inclui combustível, amortização e fixos</div>
              </div>

              <div className="p-4 bg-white/90 rounded-lg border shadow-sm">
                <div className="text-sm text-slate-500">Custo por km</div>
                <div className="text-lg font-semibold text-slate-800">R$ {fmt(resultado.custo_por_km,4)}/km</div>
              </div>

              <div className="p-4 bg-white/90 rounded-lg border shadow-sm">
                <div className="text-sm text-slate-500">Custo combustível</div>
                <div className="text-lg font-semibold text-amber-600">R$ {fmt(resultado.custo_combustivel,2)}</div>
              </div>

              <div className="p-4 bg-white/90 rounded-lg border shadow-sm">
                <div className="text-sm text-slate-500">Kg entregues</div>
                <div className="text-lg font-semibold text-slate-800">{fmt(resultado.kg_entregue,2)} kg</div>
              </div>

              <div className="p-4 bg-white/90 rounded-lg border shadow-sm">
                <div className="text-sm text-slate-500">Preço break-even</div>
                <div className="text-lg font-semibold text-emerald-700">{resultado.preco_break_even_por_kg ? `R$ ${fmt(resultado.preco_break_even_por_kg,4)}/kg` : '—'}</div>
              </div>

              <div className="p-4 bg-white/90 rounded-lg border shadow-sm">
                <div className="text-sm text-slate-500">Lucro (se informado)</div>
                <div className="text-lg font-semibold text-slate-800">{resultado.lucro !== null ? `R$ ${fmt(resultado.lucro,2)}` : '—'}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
              <div>Pedágios (total): <b>R$ {fmt(resultado.custo_pedagios,2)}</b></div>
              <div>Custo motorista: <b>R$ {fmt(resultado.custo_motorista,2)}</b></div>
              <div>Amortização: <b>R$ {fmt(resultado.custo_amortizacao,2)}</b></div>
              <div>Fixos totais: <b>R$ {fmt(resultado.custo_fixos_total,2)}</b></div>
              {resultado.receita !== null && <div>Receita: <b>R$ {fmt(resultado.receita,2)}</b></div>}
              {resultado.preco_sugerido_por_kg !== null && <div>Preço sugerido: <b>R$ {fmt(resultado.preco_sugerido_por_kg,4)}/kg</b></div>}
            </div>

            {/* Recomendação de modo de transporte */}
            {resultado.recommendedMode && (
              <div className="mt-6 p-4 bg-white/90 rounded-lg border">
                <h3 className="font-semibold">Recomendação de transporte</h3>
                <div className="mt-2 text-sm text-slate-700">
                  <div className="font-medium text-emerald-700">{resultado.recommendedMode.label}</div>
                  <div className="text-xs text-slate-500 mt-1">Justificativa: menor custo ajustado por eficiência e energia.</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>Capacidade usada: <b>{fmt(resultado.recommendedMode.cap,0)} kg</b></div>
                    <div>Viagens necessárias: <b>{resultado.recommendedMode.nTrips}</b></div>
                    <div>Custo por kg (ajustado): <b>R$ {fmt(resultado.recommendedMode.adjusted,4)}</b></div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600">Outras opções (rank):</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {resultado.modeResults.slice(0,4).map((m:any)=> (
                      <div key={m.key} className="p-2 bg-slate-50 rounded">
                        <div className="font-medium">{m.label}</div>
                        <div className="text-xs text-slate-500">Custo/kg: R$ {fmt(m.costPerKg,4)} • Ajustado: R$ {fmt(m.adjusted,4)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
