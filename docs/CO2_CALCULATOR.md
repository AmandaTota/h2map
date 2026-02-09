# Cálculo de Emissões de CO₂ - MCTI 2025

## Resumo

A partir de **fevereiro/2026**, o projeto h2map utiliza o **fator oficial MCTI 2025** para cálculo de emissões de CO₂: **0.0289 kg CO₂/kWh**.

## Fórmula Base

```
kWh = (watts × horas) / 1000
CO₂(kg) = kWh × 0.0289
```

## Localização da Implementação

### 1. **Calculadora Interativa**

Arquivo: `src/pages/Informacoes.tsx`

A calculadora foi atualizada com duas abas:

#### Aba "Por kWh"

- Entrada: Consumo mensal direto em kWh
- Fator: 0.0289 (MCTI 2025) ou customizável
- Saída: kg CO₂/mês, kg CO₂/ano, árvores equivalentes

#### Aba "Por Watts"

- Entrada: Potência (Watts) + Horas de uso/mês
- Cálculo automático de kWh
- Fator: 0.0289 ou customizável
- Saída: kg CO₂/mês, kg CO₂/ano, árvores equivalentes

**Exemplo de uso direto:**

- Potência: 200 watts
- Horas/mês: 120 horas (4 horas/dia × 30 dias)
- kWh mensal: (200 × 120) / 1000 = 24 kWh
- CO₂ mensal: 24 × 0.0289 = **0.6936 kg**
- CO₂ anual: 0.6936 × 12 = **8.32 kg**
- Árvores: 8.32 / 20 = **1 árvore**

### 2. **Biblioteca Reutilizável**

Arquivo: `src/lib/co2Calculator.ts`

Exporta funções para uso em outros componentes:

```typescript
import {
  calcularEmissaoCO2,
  calcularEmissaoPorKWh,
  calcularEquivalenteArvores,
  calcularEmissoesCodigo,
  MCTI_2025_FACTOR,
  FATORES_REGIONAIS,
} from "@/lib/co2Calculator";
```

## Exemplos de Uso

### Exemplo 1: Cálculo por Watts

```typescript
import { calcularEmissaoCO2 } from "@/lib/co2Calculator";

const potencia = 200; // watts
const tempoUso = 5; // horas por dia

const emissaoDiaria = calcularEmissaoCO2(potencia, tempoUso);
console.log(`Emissão estimada: ${emissaoDiaria.toFixed(4)} kg de CO₂`);
// Saída: "Emissão estimada: 0.0289 kg de CO₂"
```

### Exemplo 2: Cálculo por kWh

```typescript
import { calcularEmissaoPorKWh } from "@/lib/co2Calculator";

const consumoMensal = 200; // kWh
const emissao = calcularEmissaoPorKWh(consumoMensal);
console.log(`${emissao.toFixed(2)} kg de CO₂ por mês`);
// Saída: "5.78 kg de CO₂ por mês"
```

### Exemplo 3: Cálculo Completo

```typescript
import { calcularEmissoesCodigo } from "@/lib/co2Calculator";

// Modo 1: kWh direto
const resultado1 = calcularEmissoesCodigo("kwh", 200);
console.log(resultado1);
// {
//   mensalKg: 5.78,
//   anualKg: 69.36,
//   arvores: 4,
//   kWhMensal: 200
// }

// Modo 2: Watts e horas
const resultado2 = calcularEmissoesCodigo("watts", 200, 120); // 200W × 120 horas/mês
console.log(resultado2);
// {
//   mensalKg: 0.6936,
//   anualKg: 8.32,
//   arvores: 1,
//   kWhMensal: 24
// }
```

### Exemplo 4: Fatores Regionais

```typescript
import { calcularEmissaoPorKWh, FATORES_REGIONAIS } from "@/lib/co2Calculator";

const consumoKwh = 200;

// Usando fator do Rio de Janeiro
const rjFator = FATORES_REGIONAIS.RJ; // 0.125
const emissaoRJ = calcularEmissaoPorKWh(consumoKwh, rjFator);
console.log(`RJ: ${emissaoRJ.toFixed(2)} kg CO₂`); // "RJ: 25.00 kg CO₂"

// Usando fator de Santa Catarina
const scFator = FATORES_REGIONAIS.SC; // 0.072
const emissaoSC = calcularEmissaoPorKWh(consumoKwh, scFator);
console.log(`SC: ${emissaoSC.toFixed(2)} kg CO₂`); // "SC: 14.40 kg CO₂"
```

## Fator MCTI 2025

| Descrição                   | Valor                                        |
| --------------------------- | -------------------------------------------- |
| **Fator Oficial MCTI 2025** | **0.0289 kg CO₂/kWh**                        |
| Data de referência          | Abril/2025                                   |
| Fonte                       | Ministério da Ciência, Tecnologia e Inovação |
| Padrão na calculadora       | Sim (opção padrão)                           |

## Fatores Regionais (Referência)

Os fatores são baseados no mix elétrico regional brasileiro:

- **Menor emissão:** Paraíba (0.063) - maior uso de energias renováveis
- **Maior emissão:** Rio de Janeiro (0.125) - maior uso de combustíveis fósseis
- **Padrão MCTI:** 0.0289 - valor national representativo

## Equivalência em Árvores

Considera-se que **1 árvore absorve 20 kg de CO₂ por ano** em média.

```typescript
const arvores = calcularEquivalenteArvores(50); // 50 kg CO₂/ano
// Resultado: 3 árvores (arredondado para cima)
```

## Modificações Realizadas

### No arquivo `src/pages/Informacoes.tsx`:

✅ Adicionada função `calcularEmissaoCO2()` localmente  
✅ Implementadas duas abas de entrada: "Por kWh" e "Por Watts"  
✅ Fator padrão alterado de 0.082 para **0.0289 (MCTI 2025)**  
✅ Mantida compatibilidade com fatores regionais  
✅ Adicionado estado "MCTI2025" como opção padrão  
✅ Melhorado armazenamento em localStorage para novo modo de entrada

### Novo arquivo `src/lib/co2Calculator.ts`:

✅ Criada biblioteca reutilizável com múltiplas funções  
✅ Exportadas constantes de fatores  
✅ Documentação de tipos e interfaces TypeScript  
✅ Exemplos de uso comentados  
✅ Compatível com outras páginas (FeasibilityAnalysis, etc)

## Próximas Etapas (Opcionais)

1. **Integrar em FeasibilityAnalysis.tsx** - usar `calcularEmissaoCO2` para cálculos de hidrogênio verde
2. **Dashboard de Emissões** - painel consolidado de CO₂ por usuário
3. **Relatórios** - exportar cálculos em PDF com metodologia MCTI
4. **Alertas** - notificar quando emissões ultrapassam threshold

## Referência

- **MCTI (Ministério da Ciência, Tecnologia e Inovação)** - Fator oficial de emissão nacional
- **Fator de conversão:** 1 árvore = 20 kg CO₂/ano (estimativa de absorção média)
