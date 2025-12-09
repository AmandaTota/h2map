export type SectorIntensity = {
  level: 'Baixa' | 'Média' | 'Alta';
  multiplier: number;
  sources?: string[];
};

export type StateQualitative = {
  state: string;
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
      pd_politica: { level: 'Média', multiplier: 1.0, sources: ['ac-eixos-2025', 'to-pnh2-2024'] },
    },
  },
  AP: {
    state: 'AP',
    lastUpdated: '2025-12-09',
    sectors: {
      refino: { level: 'Baixa', multiplier: 0.8 },
      fertilizantes: { level: 'Média', multiplier: 1.0, sources: ['ap-diario-2025', 'ap-amapa-gov-2025'] },
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
      siderurgia: { level: 'Alta', multiplier: 1.2, sources: ['pa-hydro-2025', 'pa-hydro-official-2025', 'pa-sinobras-2023', 'pa-vale-gep-2025'] },
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
      mobilidade_powertox: { level: 'Média', multiplier: 1.0, sources: ['pb-ufpb-2024', 'pb-petrosolgas-2025', 'pb-expresso-2025'] },
      pd_politica: { level: 'Alta', multiplier: 1.2, sources: ['pb-lei-12345-2022'] },
    },
  },
  PI: {
    state: 'PI',
    lastUpdated: '2025-12-09',
    sectors: {
      refino: { level: 'Baixa', multiplier: 0.8 },
      fertilizantes: { level: 'Alta', multiplier: 1.2, sources: ['pi-zpe-2023', 'pi-hubind-2025', 'pi-diario-2025'] },
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
      pd_politica: { level: 'Alta', multiplier: 1.2, sources: ['rn-lei-12336-2025', 'rn-petrobras-2024'] },
    },
  },
  GO: {
    state: 'GO',
    lastUpdated: '2025-12-09',
    sectors: {
      refino: { level: 'Baixa', multiplier: 0.8 },
      fertilizantes: { level: 'Média', multiplier: 1.0 },
      siderurgia: { level: 'Baixa', multiplier: 0.8 },
      mobilidade_powertox: { level: 'Média', multiplier: 1.0, sources: ['go-itumbiara-2024', 'go-atvos-2025'] },
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
      mobilidade_powertox: { level: 'Média', multiplier: 1.0, sources: ['sc-weg-celesc-2025', 'sc-weg-2025', 'sc-weg-ocp-2025'] },
      pd_politica: { level: 'Alta', multiplier: 1.2, sources: ['sc-ufsc-2023'] },
    },
  },
  // defaults for other states (kept conservative)
  SP: { state: 'SP', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Alta', multiplier: 1.2 }, fertilizantes: { level: 'Média', multiplier: 1.0 }, siderurgia: { level: 'Alta', multiplier: 1.2 }, mobilidade_powertox: { level: 'Alta', multiplier: 1.2 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  RJ: { state: 'RJ', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Alta', multiplier: 1.2 }, fertilizantes: { level: 'Baixa', multiplier: 0.8 }, siderurgia: { level: 'Alta', multiplier: 1.2 }, mobilidade_powertox: { level: 'Média', multiplier: 1.0 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  MG: { state: 'MG', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Média', multiplier: 1.0 }, fertilizantes: { level: 'Média', multiplier: 1.0 }, siderurgia: { level: 'Alta', multiplier: 1.2 }, mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  ES: { state: 'ES', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Baixa', multiplier: 0.8 }, fertilizantes: { level: 'Baixa', multiplier: 0.8 }, siderurgia: { level: 'Alta', multiplier: 1.2 }, mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  BA: { state: 'BA', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Baixa', multiplier: 0.8 }, fertilizantes: { level: 'Média', multiplier: 1.0 }, siderurgia: { level: 'Baixa', multiplier: 0.8 }, mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  CE: { state: 'CE', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Baixa', multiplier: 0.8 }, fertilizantes: { level: 'Baixa', multiplier: 0.8 }, siderurgia: { level: 'Baixa', multiplier: 0.8 }, mobilidade_powertox: { level: 'Média', multiplier: 1.0 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  PR: { state: 'PR', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Baixa', multiplier: 0.8 }, fertilizantes: { level: 'Baixa', multiplier: 0.8 }, siderurgia: { level: 'Média', multiplier: 1.0 }, mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  PE: { state: 'PE', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Baixa', multiplier: 0.8 }, fertilizantes: { level: 'Baixa', multiplier: 0.8 }, siderurgia: { level: 'Baixa', multiplier: 0.8 }, mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
  RS: { state: 'RS', lastUpdated: '2025-12-09', sectors: { refino: { level: 'Baixa', multiplier: 0.8 }, fertilizantes: { level: 'Baixa', multiplier: 0.8 }, siderurgia: { level: 'Média', multiplier: 1.0 }, mobilidade_powertox: { level: 'Baixa', multiplier: 0.8 }, pd_politica: { level: 'Média', multiplier: 1.0 } } },
};

export default h2QualitativeByState;
