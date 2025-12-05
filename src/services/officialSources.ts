// src/services/officialSources.ts
export type OfficialLaw = { id: string; title: string; source: string };
export type OfficialProject = { name: string; source: string; investment_brl_billion?: number; investment_usd_billion?: number; op_start?: string; capacity_gw_phase1?: number; first_molecule_date?: string };
export type GridInfo = { par_pel_investment_brl_billion?: number; source?: string; '2024_deliveries'?: any; open_data?: string };
export type StateData = {
    hub_status: 'prioritized_PNH2' | 'no_specific_official_hub';
    projects?: OfficialProject[];
    grid?: GridInfo;
    multilateral_support?: { world_bank_press?: string; project_pid?: string };
    derivatives?: { name: string; source: string }[];
    grid_deliveries_2024?: string;
    international_corridor?: string;
    regulator?: string;
    sources?: { epe_painel?: string; ons_open_data?: string };
};

export type OfficialData = {
    version: string;
    legal_framework: {
        laws: OfficialLaw[];
        decree_status: { status: string; date: string; source: string };
        regulator: { agency: string; manual: string; cert_threshold_kgco2eq_per_kgH2: number; threshold_source: string };
    };
    international: { corridor_netherlands?: { report: string; states: string[]; '2030_supply_vs_demand_percent': number } };
    states: Record<string, StateData>;
    data_panels: { epe_painel_potencial: string; epe_fact_sheet: string };
};

import officialDataJson from '../../data/h2maps_official_state_data.json';

export const officialData: OfficialData = officialDataJson as OfficialData;

export function getStateData(uf: string): StateData | undefined {
    return officialData.states[uf];
}

export type Readiness = 'baixo' | 'medio' | 'alto';

export function computeReadinessIndex(uf: string): Readiness {
    const s = getStateData(uf);
    if (!s) return 'baixo';
    let score = 0;
    if (s.hub_status === 'prioritized_PNH2') score++;
    if (s.projects && s.projects.length > 0) score++;
    if (s.grid?.par_pel_investment_brl_billion || s.grid?.['2024_deliveries'] || s.grid_deliveries_2024) score++;
    if (score >= 3) return 'alto';
    if (score >= 2) return 'medio';
    return 'baixo';
}
