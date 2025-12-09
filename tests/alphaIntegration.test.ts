import { describe, it, expect } from 'vitest';
import h2QualitativeByState from '@/data/h2_qualitative_by_state';

// Recreate minimal inputs from H2DemandSliders to validate alpha effect
const ufs = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

const regions: Record<string,string> = {
  AC: 'N', AL: 'NE', AP: 'N', AM: 'N', BA: 'NE', CE: 'NE', DF: 'CO', ES: 'SE', GO: 'CO', MA: 'NE', MT: 'CO', MS: 'CO', MG: 'SE', PA: 'N', PB: 'NE', PR: 'S', PE: 'NE', PI: 'NE', RJ: 'SE', RN: 'NE', RS: 'S', RO: 'N', RR: 'N', SC: 'S', SP: 'SE', SE: 'NE', TO: 'N'
};

const weights: Record<string, Record<string, number>> = {
  Fertilizantes: {
    SP:0.6,RJ:0.2,MG:0.6,ES:0.2,BA:1.0,SE:1.0,PR:1.0,RS:0.2,PE:0.6,CE:0.6,AM:0.2,MS:1.0,DF:0.2,
    AC:0.2,AL:0.2,AP:0.2,GO:1.0,MA:0.2,MT:1.0,PA:0.2,PB:0.6,PI:1.0,RN:1.0,RO:0.2,RR:0.2,SC:1.0,TO:1.0
  }
};

const baseline2025: Record<string, number> = { Refino:480, Fertilizantes:224, Siderurgia:88, Mobilidade:8 };

function piecewiseSeries(v2025:number, v2030:number, v2050:number) {
  const years = Array.from({length:26}, (_,i)=>2025+i);
  const cagr1 = Math.pow(v2030/Math.max(v2025,1e-6), 1/5) - 1;
  const cagr2 = Math.pow(v2050/Math.max(v2030,1e-6), 1/20) - 1;
  const out: Record<number,number> = {};
  years.forEach(y=> {
    if (y<=2030) out[y] = v2025 * Math.pow(1+cagr1, y-2025);
    else out[y] = v2030 * Math.pow(1+cagr2, y-2030);
  });
  return out;
}

function computeAllocForSectorYear(sector:string, year:number, alpha:number) {
  // use simple preset: targ2030 from H2DemandSliders presets.Base.s2030 percentages
  const presets2030: Record<string, number> = { Refino:30, Fertilizantes:40, Siderurgia:25, Mobilidade:5 };
  const t2030 = 1500 * 1000; // as in component (total2030 * 1000)
  const f2030 = { Refino:0.3, Fertilizantes:0.4, Siderurgia:0.25, Mobilidade:0.05 };
  const targ2030 = t2030 * f2030[sector as keyof typeof f2030];
  const series = piecewiseSeries((baseline2025 as any)[sector], targ2030, 8000*1000);

  const sh: Record<string, number> = {};
  let sumW = 0;
  ufs.forEach(uf => {
    const baseW = (weights as any)[sector][uf] ?? 0.2;
    // map sector to qualitative key
    const sectorKey = sector === 'Refino' ? 'refino' : sector === 'Fertilizantes' ? 'fertilizantes' : sector === 'Siderurgia' ? 'siderurgia' : 'mobilidade_powertox';
    const intensity = (h2QualitativeByState as any)[uf]?.sectors?.[sectorKey]?.multiplier ?? 1.0;
    const intensityEff = 1 + alpha * (intensity - 1);
    const w = baseW * intensityEff * ( (regions[uf] ? 1 : 1) );
    sh[uf] = w; sumW += w;
  });
  // normalize
  Object.keys(sh).forEach(uf => sh[uf] = sh[uf] / Math.max(1, sumW));

  const alloc: Record<string, number> = {};
  Object.keys(series).forEach(y => {
    if (Number(y) === year) {
      ufs.forEach(uf => {
        alloc[uf] = series[Number(y)] * sh[uf];
      });
    }
  });
  return alloc;
}

describe('alpha influence integration', () => {
  it('target UFs exist in dataset', () => {
    const target = ['AC','AP','PA','RO','RR','TO','AL','MA','PB','PI','RN','GO','MT','SC'];
    target.forEach(t => expect(ufs.includes(t)).toBeTruthy());
  });

  it('alpha changes allocations for at least one target UF', () => {
    const year = 2030;
    const sector = 'Fertilizantes';
    const alloc0 = computeAllocForSectorYear(sector, year, 0);
    const alloc1 = computeAllocForSectorYear(sector, year, 1);
    const target = ['AC','AP','PA','RO','RR','TO','AL','MA','PB','PI','RN','GO','MT','SC'];
    const diffs = target.map(t => Math.abs((alloc1[t]||0) - (alloc0[t]||0)));
    const anyDiff = diffs.some(d => d > 1e-6);
    expect(anyDiff).toBeTruthy();
  });

  it('allocations sum approximately to sector total for chosen year', () => {
    const year = 2030;
    const sector = 'Fertilizantes';
    const alloc = computeAllocForSectorYear(sector, year, 1);
    const sum = Object.values(alloc).reduce((a,b)=>a+b,0);
    const expected = 1500*1000 * 0.4; // targ2030
    // allow 0.1% tolerance
    expect(Math.abs(sum - expected) / expected).toBeLessThan(0.001);
  });
});
