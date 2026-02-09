/**
 * Calculadora de emissões de CO₂ baseada em consumo energético
 * Fórmula oficial MCTI 2025
 */

/**
 * Fator oficial MCTI 2025
 * kg CO₂ por kWh consumido
 */
export const MCTI_2025_FACTOR = 0.0289;

/**
 * Calcula emissões de CO₂ com base no consumo em Watts.
 *
 * Fórmula:
 * kWh = (watts * horas) / 1000
 * CO₂(kg) = kWh * 0.0289   // fator oficial do MCTI 2025
 *
 * @param watts - Potência em Watts
 * @param horas - Horas de funcionamento
 * @returns Emissão estimada em kg de CO₂
 *
 * @example
 * const potencia = 200; // watts
 * const tempoUso = 5;   // horas por dia
 * const emissao = calcularEmissaoCO2(potencia, tempoUso);
 * console.log(`Emissão estimada: ${emissao.toFixed(4)} kg de CO₂`);
 */
export function calcularEmissaoCO2(watts: number, horas: number): number {
  const kWh = (watts * horas) / 1000;
  return kWh * MCTI_2025_FACTOR;
}

/**
 * Calcula emissões de CO₂ com base no consumo em kWh e fator customizado.
 *
 * @param kWh - Consumo em kilowatts-hora
 * @param fator - Fator de emissão (kg CO₂ / kWh), padrão: MCTI 2025
 * @returns Emissão em kg de CO₂
 *
 * @example
 * const emissao = calcularEmissaoPorKWh(200, 0.0289);
 * console.log(`${emissao.toFixed(2)} kg de CO₂`);
 */
export function calcularEmissaoPorKWh(
  kWh: number,
  fator: number = MCTI_2025_FACTOR
): number {
  return kWh * fator;
}

/**
 * Calcula o equivalente em número de árvores necessárias para absorver emissões
 * Considera 20 kg de CO₂ por árvore por ano como absorção média
 *
 * @param kgCO2Anual - Emissão anual em kg de CO₂
 * @returns Número de árvores arredondadas para cima
 */
export function calcularEquivalenteArvores(kgCO2Anual: number): number {
  const CO2_PER_TREE_ANNUAL = 20; // kg CO₂/árvore/ano
  return kgCO2Anual > 0 ? Math.ceil(kgCO2Anual / CO2_PER_TREE_ANNUAL) : 0;
}

/**
 * Calcula emissões mensais, anuais e equivalente em árvores
 * Função utilitária que retorna um objeto com todos os cálculos
 *
 * @param inputMode - "kwh" ou "watts"
 * @param inputValue1 - kWh (se inputMode==="kwh") ou Watts (se inputMode==="watts")
 * @param inputValue2 - horas (obrigatório se inputMode==="watts")
 * @param fator - Fator de emissão, padrão: MCTI 2025
 * @returns Objeto com cálculos mensais e anuais
 */
export interface CO2CalculationResult {
  mensalKg: number;
  anualKg: number;
  arvores: number;
  kWhMensal: number;
}

export function calcularEmissoesCodigo(
  inputMode: "kwh" | "watts",
  inputValue1: number,
  inputValue2: number = 0,
  fator: number = MCTI_2025_FACTOR
): CO2CalculationResult {
  let kWhMensal = 0;

  if (inputMode === "kwh") {
    kWhMensal = inputValue1;
  } else if (inputMode === "watts") {
    const kWh = (inputValue1 * inputValue2) / 1000;
    kWhMensal = kWh;
  }

  const mensalKg = calcularEmissaoPorKWh(kWhMensal, fator);
  const anualKg = mensalKg * 12;
  const arvores = calcularEquivalenteArvores(anualKg);

  return {
    mensalKg,
    anualKg,
    arvores,
    kWhMensal,
  };
}

/**
 * Classificação de nível de emissão baseado em km/dia
 * (compatível com original mas usando novo fator)
 */
export interface EmissionLevel {
  label: string;
  color: string;
  text: string;
}

/**
 * Retorna classificação de emissão para transportes
 */
export function classificarEmissaoTransporte(
  kmDia: number
): EmissionLevel {
  if (kmDia <= 0) {
    return {
      label: "Nenhuma",
      color: "bg-slate-200",
      text: "text-slate-700",
    };
  }
  if (kmDia < 10) {
    return {
      label: "Baixa",
      color: "bg-emerald-200",
      text: "text-emerald-700",
    };
  }
  if (kmDia < 30) {
    return {
      label: "Moderada",
      color: "bg-yellow-200",
      text: "text-yellow-700",
    };
  }
  if (kmDia < 50) {
    return {
      label: "Alta",
      color: "bg-orange-200",
      text: "text-orange-700",
    };
  }
  return {
    label: "Muito Alta",
    color: "bg-red-200",
    text: "text-red-700",
  };
}

// Fatores regionais brasileiros para referência
export const FATORES_REGIONAIS: Record<string, number> = {
  MCTI2025: 0.0289,
  AC: 0.084,
  AL: 0.091,
  AM: 0.091,
  AP: 0.086,
  BA: 0.087,
  CE: 0.077,
  DF: 0.079,
  ES: 0.07,
  GO: 0.076,
  MA: 0.076,
  MT: 0.09,
  MS: 0.093,
  MG: 0.077,
  PA: 0.1,
  PB: 0.063,
  PR: 0.065,
  PE: 0.079,
  PI: 0.088,
  RJ: 0.125,
  RN: 0.079,
  RO: 0.078,
  RR: 0.07,
  RS: 0.07,
  SC: 0.072,
  SP: 0.078,
  SE: 0.084,
  TO: 0.087,
};
