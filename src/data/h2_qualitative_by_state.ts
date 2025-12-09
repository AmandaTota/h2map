export type SectorIntensity = {
    level: 'Baixa' | 'Média' | 'Alta';
    multiplier: number; // 0.8 | 1.0 | 1.2
    sources?: string[]; // ids referenciados em officialSources
};

export type StateQualitative = {
    state: string; // UF code
    lastUpdated: string;
    sectors: {
        refino: SectorIntensity;
        fertilizantes: SectorIntensity;
        siderurgia: SectorIntensity;
        mobilidade_powertox: SectorIntensity;
        pd_politica: SectorIntensity;
    };
};

export const h2QualitativeByState: Record<string, StateQualitative> = {
    AC: {
        state: 'AC',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Baixa', multiplier: 0.8 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 },
            pd_politica: { level: 'Média', multiplier: 1.0 },
        },
    },
    AP: {
        state: 'AP',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Média', multiplier: 1.0 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0 },
            pd_politica: { level: 'Média', multiplier: 1.0 },
        },
    },
    PA: {
        state: 'PA',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Baixa', multiplier: 0.8 },
            siderurgia: { level: 'Alta', multiplier: 1.2, sources: ['pa-hydro-2025','pa-sinobras-2023'] },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0 },
            pd_politica: { level: 'Média', multiplier: 1.0 },
        },
    },
    RO: {
        state: 'RO',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Média', multiplier: 1.0 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 },
            pd_politica: { level: 'Média', multiplier: 1.0, sources: ['ro-senai-2024'] },
        },
    },
    RR: {
        state: 'RR',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Baixa', multiplier: 0.8 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 },
            pd_politica: { level: 'Média', multiplier: 1.0, sources: ['rr-rbcip'] },
        },
    },
    TO: {
        state: 'TO',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Média', multiplier: 1.0 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 },
            pd_politica: { level: 'Média', multiplier: 1.0, sources: ['to-pnh2-2024'] },
        },
    },
    AL: {
        state: 'AL',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Baixa', multiplier: 0.8 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 },
            pd_politica: { level: 'Média', multiplier: 1.0, sources: ['al-braskem-2025'] },
        },
    },
    MA: {
        state: 'MA',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Baixa', multiplier: 0.8 },
            siderurgia: { level: 'Alta', multiplier: 1.2, sources: ['ma-avb-2025'] },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0, sources: ['ma-stegra-2025'] },
            pd_politica: { level: 'Média', multiplier: 1.0 },
        },
    },
    PB: {
        state: 'PB',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Média', multiplier: 1.0 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0, sources: ['pb-ufpb-2024'] },
            pd_politica: { level: 'Alta', multiplier: 1.2, sources: ['pb-lei-12345-2022'] },
        },
    },
    PI: {
        state: 'PI',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Alta', multiplier: 1.2, sources: ['pi-zpe-2023'] },
            siderurgia: { level: 'Média', multiplier: 1.0 },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0 },
            pd_politica: { level: 'Média', multiplier: 1.0 },
        },
    },
    RN: {
        state: 'RN',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Média', multiplier: 1.0 },
            fertilizantes: { level: 'Média', multiplier: 1.0 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0 },
            pd_politica: { level: 'Alta', multiplier: 1.2, sources: ['rn-lei-12336-2025','rn-petrobras-2024'] },
        },
    },
    GO: {
        state: 'GO',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Média', multiplier: 1.0 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0, sources: ['go-itumbiara-2024'] },
            pd_politica: { level: 'Alta', multiplier: 1.2 },
        },
    },
    MT: {
        state: 'MT',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Alta', multiplier: 1.2, sources: ['mt-atvos-2025'] },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0 },
            pd_politica: { level: 'Média', multiplier: 1.0 },
        },
    },
    SC: {
        state: 'SC',
        lastUpdated: '2025-12-09',
        sectors: {
            refino: { level: 'Baixa', multiplier: 0.8 },
            fertilizantes: { level: 'Média', multiplier: 1.0 },
            siderurgia: { level: 'Baixa', multiplier: 0.8 },
            mobilidade_powertox: { level: 'Média', multiplier: 1.0, sources: ['sc-weg-celesc-2025'] },
            pd_politica: { level: 'Alta', multiplier: 1.2, sources: ['sc-ufsc-2023'] },
        },
    },
};

export default h2QualitativeByState;
