import {
  calcularEmissaoCO2,
  calcularEmissaoPorKWh,
  calcularEquivalenteArvores,
  calcularEmissoesCodigo,
  MCTI_2025_FACTOR,
} from "@/lib/co2Calculator";

describe("CO₂ Calculator - MCTI 2025", () => {
  describe("calcularEmissaoCO2", () => {
    it("deve calcular corretamente emissões de CO₂ a partir de watts", () => {
      // Exemplo do usuário: 200W × 5 horas
      const resultado = calcularEmissaoCO2(200, 5);
      // kWh = (200 × 5) / 1000 = 1
      // CO₂ = 1 × 0.0289 = 0.0289 kg
      expect(resultado).toBeCloseTo(0.0289, 4);
    });

    it("deve retornar 0 para watts 0", () => {
      expect(calcularEmissaoCO2(0, 5)).toBe(0);
    });

    it("deve retornar 0 para horas 0", () => {
      expect(calcularEmissaoCO2(200, 0)).toBe(0);
    });

    it("cálculo de 4 horas por dia × 30 dias = 120 horas", () => {
      const resultado = calcularEmissaoCO2(200, 120);
      // kWh = (200 × 120) / 1000 = 24
      // CO₂ = 24 × 0.0289 = 0.6936 kg/mês
      expect(resultado).toBeCloseTo(0.6936, 4);
    });
  });

  describe("calcularEmissaoPorKWh", () => {
    it("deve calcular corretamente com fator padrão", () => {
      const resultado = calcularEmissaoPorKWh(100);
      // 100 × 0.0289 = 2.89 kg
      expect(resultado).toBeCloseTo(2.89, 4);
    });

    it("deve usar fator customizado", () => {
      const resultado = calcularEmissaoPorKWh(100, 0.125); // Rio de Janeiro
      // 100 × 0.125 = 12.5 kg
      expect(resultado).toBe(12.5);
    });

    it("consumo de 200 kWh com MCTI 2025", () => {
      const resultado = calcularEmissaoPorKWh(200, MCTI_2025_FACTOR);
      // 200 × 0.0289 = 5.78 kg
      expect(resultado).toBeCloseTo(5.78, 2);
    });
  });

  describe("calcularEquivalenteArvores", () => {
    it("deve calcular corretamente número de árvores", () => {
      // 20 kg CO₂ = 1 árvore
      const resultado = calcularEquivalenteArvores(20);
      expect(resultado).toBe(1);
    });

    it("deve arredondar para cima", () => {
      // 50 kg CO₂ = 2.5 árvores → 3 árvores (arredondado)
      const resultado = calcularEquivalenteArvores(50);
      expect(resultado).toBe(3);
    });

    it("deve retornar 0 para valores nulos", () => {
      expect(calcularEquivalenteArvores(0)).toBe(0);
      expect(calcularEquivalenteArvores(-10)).toBe(0);
    });

    it("emissão anual de 8.32 kg = 1 árvore", () => {
      const resultado = calcularEquivalenteArvores(8.32);
      expect(resultado).toBe(1); // 8.32 / 20 ≈ 0.416 → 1 árvore
    });
  });

  describe("calcularEmissoesCodigo", () => {
    it("modo kWh: 200 kWh/mês", () => {
      const resultado = calcularEmissoesCodigo("kwh", 200);
      expect(resultado.kWhMensal).toBe(200);
      expect(resultado.mensalKg).toBeCloseTo(5.78, 2);
      expect(resultado.anualKg).toBeCloseTo(69.36, 2);
      expect(resultado.arvores).toBe(4);
    });

    it("modo watts: 200W × 120 horas/mês", () => {
      const resultado = calcularEmissoesCodigo("watts", 200, 120);
      expect(resultado.kWhMensal).toBe(24); // (200 × 120) / 1000
      expect(resultado.mensalKg).toBeCloseTo(0.6936, 4);
      expect(resultado.anualKg).toBeCloseTo(8.32, 2);
      expect(resultado.arvores).toBe(1);
    });

    it("com fator customizado (Rio de Janeiro)", () => {
      const resultado = calcularEmissoesCodigo("kwh", 200, 0, 0.125);
      expect(resultado.mensalKg).toBe(25);
      expect(resultado.anualKg).toBe(300);
      expect(resultado.arvores).toBe(15);
    });
  });

  describe("MCTI_2025_FACTOR", () => {
    it("deve ter valor correto", () => {
      expect(MCTI_2025_FACTOR).toBe(0.0289);
    });
  });

  describe("Casos práticos reais", () => {
    it("geladeira 500W × 12 horas/dia", () => {
      const horasAno = 12 * 30; // 360 horas/mês
      const resultado = calcularEmissoesCodigo("watts", 500, horasAno);
      // kWh = (500 × 360) / 1000 = 180
      // CO₂ = 180 × 0.0289 = 5.202 kg/mês
      // Anual = 5.202 × 12 = 62.424 kg
      expect(resultado.kWhMensal).toBeCloseTo(180, 1);
      expect(resultado.mensalKg).toBeCloseTo(5.202, 2);
      expect(resultado.anualKg).toBeCloseTo(62.42, 1);
      expect(resultado.arvores).toBe(4); // 62.42 / 20 ≈ 3.1 → 4
    });

    it("ar condicionado 3500W × 6 horas/dia", () => {
      const horasAno = 6 * 30; // 180 horas/mês
      const resultado = calcularEmissoesCodigo("watts", 3500, horasAno);
      // kWh = (3500 × 180) / 1000 = 630
      // CO₂ = 630 × 0.0289 = 18.207 kg/mês
      expect(resultado.kWhMensal).toBeCloseTo(630, 1);
      expect(resultado.mensalKg).toBeCloseTo(18.207, 2);
      expect(resultado.anualKg).toBeCloseTo(218.48, 1);
      expect(resultado.arvores).toBe(11); // 218.48 / 20 ≈ 10.9 → 11
    });

    it("lâmpada LED 15W × 8 horas/dia", () => {
      const horasAno = 8 * 30; // 240 horas/mês
      const resultado = calcularEmissoesCodigo("watts", 15, horasAno);
      // kWh = (15 × 240) / 1000 = 3.6
      // CO₂ = 3.6 × 0.0289 = 0.10404 kg/mês
      expect(resultado.kWhMensal).toBe(3.6);
      expect(resultado.mensalKg).toBeCloseTo(0.10404, 4);
      expect(resultado.anualKg).toBeCloseTo(1.249, 2);
      expect(resultado.arvores).toBe(1); // 1.249 / 20 ≈ 0.06 → 1
    });
  });
});
