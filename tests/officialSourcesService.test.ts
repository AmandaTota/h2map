// tests/officialSources.test.ts
import { officialData, getStateData, computeReadinessIndex } from '../src/services/officialSources';

test('carrega dados oficiais', () => {
    expect(officialData.version).toBeDefined();
    expect(Object.keys(officialData.states).length).toBeGreaterThan(10);
});

test('retorna dados do CE e índice alto', () => {
    const ce = getStateData('CE');
    expect(ce?.hub_status).toBe('prioritized_PNH2');
    expect(computeReadinessIndex('CE')).toBe('alto');
});

test('estado sem hub tem índice baixo ou médio', () => {
    const ac = getStateData('AC');
    expect(ac?.hub_status).toBe('no_specific_official_hub');
    expect(['baixo', 'medio']).toContain(computeReadinessIndex('AC'));
});
