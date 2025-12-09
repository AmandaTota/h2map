import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  calculateBearing,
  calculateFuelConsumption,
  calculateFuelCost,
  formatDuration,
  formatDistance,
  formatCurrency,
  parseCoordinates,
  isValidCoordinates,
  calculateCenter,
  calculateBounds,
} from '../src/utils/transportUtils';

describe('TransportUtils', () => {
  describe('haversineDistance', () => {
    it('deve calcular distância entre São Paulo e Rio de Janeiro', () => {
      const sp = { lat: -23.5505, lon: -46.6333 };
      const rj = { lat: -22.9068, lon: -43.1729 };
      
      const distance = haversineDistance(sp, rj);
      
      // Distância real é aproximadamente 357 km
      expect(distance).toBeGreaterThan(350);
      expect(distance).toBeLessThan(365);
    });

    it('deve retornar 0 para o mesmo ponto', () => {
      const point = { lat: -23.5505, lon: -46.6333 };
      
      const distance = haversineDistance(point, point);
      
      expect(distance).toBe(0);
    });
  });

  describe('calculateBearing', () => {
    it('deve calcular bearing correto para norte', () => {
      const start = { lat: 0, lon: 0 };
      const end = { lat: 1, lon: 0 };
      
      const bearing = calculateBearing(start, end);
      
      expect(bearing).toBeCloseTo(0, 0);
    });

    it('deve calcular bearing correto para leste', () => {
      const start = { lat: 0, lon: 0 };
      const end = { lat: 0, lon: 1 };
      
      const bearing = calculateBearing(start, end);
      
      expect(bearing).toBeCloseTo(90, 0);
    });
  });

  describe('calculateFuelConsumption', () => {
    it('deve calcular consumo de combustível corretamente', () => {
      const distanceKm = 100;
      const avgKmPerLiter = 10;
      
      const consumption = calculateFuelConsumption(distanceKm, avgKmPerLiter);
      
      expect(consumption).toBe(10);
    });

    it('deve retornar 0 se consumo médio for 0', () => {
      const consumption = calculateFuelConsumption(100, 0);
      
      expect(consumption).toBe(0);
    });
  });

  describe('calculateFuelCost', () => {
    it('deve calcular custo de combustível corretamente', () => {
      const consumptionLiters = 10;
      const pricePerLiter = 5.89;
      
      const cost = calculateFuelCost(consumptionLiters, pricePerLiter);
      
      expect(cost).toBeCloseTo(58.9, 2);
    });
  });

  describe('formatDuration', () => {
    it('deve formatar duração em horas e minutos', () => {
      expect(formatDuration(2.5)).toBe('2h 30min');
      expect(formatDuration(1.0)).toBe('1h');
      expect(formatDuration(0.75)).toBe('45min');
      expect(formatDuration(0)).toBe('0min');
    });
  });

  describe('formatDistance', () => {
    it('deve formatar distância em km', () => {
      expect(formatDistance(100.5)).toBe('100.5km');
      expect(formatDistance(1.2)).toBe('1.2km');
    });

    it('deve formatar distância menor que 1km em metros', () => {
      expect(formatDistance(0.5)).toBe('500m');
      expect(formatDistance(0.123)).toBe('123m');
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar valor monetário em reais', () => {
      const formatted = formatCurrency(123.45);
      
      expect(formatted).toContain('123,45');
      expect(formatted).toContain('R$');
    });
  });

  describe('parseCoordinates', () => {
    it('deve parsear coordenadas válidas', () => {
      const coords = parseCoordinates('-23.5505, -46.6333');
      
      expect(coords).toEqual({ lat: -23.5505, lon: -46.6333 });
    });

    it('deve retornar null para coordenadas inválidas', () => {
      expect(parseCoordinates('abc, def')).toBeNull();
      expect(parseCoordinates('100, 200')).toBeNull(); // lat inválida
      expect(parseCoordinates('0')).toBeNull(); // formato errado
    });
  });

  describe('isValidCoordinates', () => {
    it('deve validar coordenadas corretamente', () => {
      expect(isValidCoordinates(-23.5505, -46.6333)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
    });

    it('deve rejeitar coordenadas inválidas', () => {
      expect(isValidCoordinates(91, 0)).toBe(false); // lat > 90
      expect(isValidCoordinates(-91, 0)).toBe(false); // lat < -90
      expect(isValidCoordinates(0, 181)).toBe(false); // lon > 180
      expect(isValidCoordinates(0, -181)).toBe(false); // lon < -180
    });
  });

  describe('calculateCenter', () => {
    it('deve calcular centro de múltiplos pontos', () => {
      const points = [
        { lat: 0, lon: 0 },
        { lat: 10, lon: 10 },
        { lat: 20, lon: 20 },
      ];
      
      const center = calculateCenter(points);
      
      expect(center).toEqual({ lat: 10, lon: 10 });
    });

    it('deve retornar 0,0 para array vazio', () => {
      const center = calculateCenter([]);
      
      expect(center).toEqual({ lat: 0, lon: 0 });
    });
  });

  describe('calculateBounds', () => {
    it('deve calcular bounds de múltiplos pontos', () => {
      const points = [
        { lat: -23.5505, lon: -46.6333 },
        { lat: -22.9068, lon: -43.1729 },
      ];
      
      const bounds = calculateBounds(points);
      
      expect(bounds).toBeTruthy();
      if (bounds) {
        const [[minLat, minLon], [maxLat, maxLon]] = bounds;
        
        expect(minLat).toBe(-23.5505);
        expect(maxLat).toBe(-22.9068);
        expect(minLon).toBe(-46.6333);
        expect(maxLon).toBe(-43.1729);
      }
    });

    it('deve retornar null para array vazio', () => {
      const bounds = calculateBounds([]);
      
      expect(bounds).toBeNull();
    });
  });
});
