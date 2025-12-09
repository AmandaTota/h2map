// Utilitários para cálculos de transporte e manipulação de dados

import type { Coordinates, TollData, RouteResult, GeocodingResult } from "@/types/transport";

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * @param coord1 Primeira coordenada
 * @param coord2 Segunda coordenada
 * @returns Distância em quilômetros
 */
export function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lon - coord1.lon);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Calcula o bearing (direção) entre dois pontos
 * @param coord1 Primeira coordenada
 * @param coord2 Segunda coordenada
 * @returns Bearing em graus (0-360)
 */
export function calculateBearing(coord1: Coordinates, coord2: Coordinates): number {
    const dLon = toRad(coord2.lon - coord1.lon);
    const lat1 = toRad(coord1.lat);
    const lat2 = toRad(coord2.lat);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    return ((bearing * 180) / Math.PI + 360) % 360;
}

/**
 * Verifica se um ponto está próximo a uma linha (buffer)
 * @param point Ponto a verificar
 * @param linePoints Pontos da linha
 * @param bufferKm Distância do buffer em km
 * @returns true se o ponto está dentro do buffer
 */
export function isPointNearLine(
    point: Coordinates,
    linePoints: Array<[number, number]>,
    bufferKm: number = 0.5
): boolean {
    for (let i = 0; i < linePoints.length - 1; i++) {
        const segmentStart = { lat: linePoints[i][0], lon: linePoints[i][1] };
        const segmentEnd = { lat: linePoints[i + 1][0], lon: linePoints[i + 1][1] };

        const distToSegment = distanceToSegment(point, segmentStart, segmentEnd);
        if (distToSegment <= bufferKm) {
            return true;
        }
    }
    return false;
}

/**
 * Calcula a distância perpendicular de um ponto a um segmento de linha
 */
function distanceToSegment(
    point: Coordinates,
    segmentStart: Coordinates,
    segmentEnd: Coordinates
): number {
    const A = point.lat - segmentStart.lat;
    const B = point.lon - segmentStart.lon;
    const C = segmentEnd.lat - segmentStart.lat;
    const D = segmentEnd.lon - segmentStart.lon;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = segmentStart.lat;
        yy = segmentStart.lon;
    } else if (param > 1) {
        xx = segmentEnd.lat;
        yy = segmentEnd.lon;
    } else {
        xx = segmentStart.lat + param * C;
        yy = segmentStart.lon + param * D;
    }

    return haversineDistance(point, { lat: xx, lon: yy });
}

/**
 * Calcula os pedágios que estão na rota
 * @param polyline Polyline da rota
 * @param tollDatabase Base de dados de pedágios
 * @param profile Perfil do veículo
 * @param bufferKm Buffer de proximidade em km
 * @returns Array de pedágios na rota e custo total
 */
export function calculateTollsOnRoute(
    polyline: Array<[number, number]>,
    tollDatabase: TollData[],
    profile: "car" | "truck" | "motorcycle",
    bufferKm: number = 1
): { tolls: TollData[]; totalCost: number } {
    const tollsOnRoute: TollData[] = [];
    let totalCost = 0;

    tollDatabase.forEach((toll) => {
        const tollPoint = { lat: toll.lat, lon: toll.lon };

        if (isPointNearLine(tollPoint, polyline, bufferKm)) {
            tollsOnRoute.push(toll);
            const price = toll.vehicleClass[profile] || 0;
            totalCost += price;
        }
    });

    return { tolls: tollsOnRoute, totalCost };
}

/**
 * Calcula o consumo de combustível
 * @param distanceKm Distância em km
 * @param avgKmPerLiter Consumo médio em km/L
 * @returns Consumo em litros
 */
export function calculateFuelConsumption(
    distanceKm: number,
    avgKmPerLiter: number
): number {
    if (avgKmPerLiter <= 0) return 0;
    return distanceKm / avgKmPerLiter;
}

/**
 * Calcula o custo de combustível
 * @param consumptionLiters Consumo em litros
 * @param pricePerLiter Preço por litro
 * @returns Custo em reais
 */
export function calculateFuelCost(
    consumptionLiters: number,
    pricePerLiter: number
): number {
    return consumptionLiters * pricePerLiter;
}

/**
 * Formata duração em horas para string legível
 * @param hours Duração em horas
 * @returns String formatada (ex: "2h 30min")
 */
export function formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

/**
 * Formata distância para string legível
 * @param km Distância em km
 * @returns String formatada
 */
export function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
}

/**
 * Formata valor monetário em reais
 * @param value Valor em reais
 * @returns String formatada (ex: "R$ 123,45")
 */
export function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

/**
 * Simplifica polyline usando algoritmo Ramer-Douglas-Peucker
 * @param points Pontos da polyline
 * @param epsilon Tolerância (quanto maior, mais simplificação)
 * @returns Polyline simplificada
 */
export function simplifyPolyline(
    points: Array<[number, number]>,
    epsilon: number = 0.001
): Array<[number, number]> {
    if (points.length <= 2) return points;

    // Encontrar o ponto mais distante da linha
    let maxDistance = 0;
    let maxIndex = 0;
    const start = { lat: points[0][0], lon: points[0][1] };
    const end = { lat: points[points.length - 1][0], lon: points[points.length - 1][1] };

    for (let i = 1; i < points.length - 1; i++) {
        const point = { lat: points[i][0], lon: points[i][1] };
        const distance = distanceToSegment(point, start, end);

        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }

    // Se a distância máxima é maior que epsilon, recursivamente simplificar
    if (maxDistance > epsilon) {
        const left = simplifyPolyline(points.slice(0, maxIndex + 1), epsilon);
        const right = simplifyPolyline(points.slice(maxIndex), epsilon);

        return [...left.slice(0, -1), ...right];
    } else {
        return [points[0], points[points.length - 1]];
    }
}

/**
 * Converte polyline para formato GPX
 * @param polyline Polyline da rota
 * @param routeName Nome da rota
 * @returns String GPX
 */
export function convertToGPX(
    polyline: Array<[number, number]>,
    routeName: string = "Rota"
): string {
    const trackpoints = polyline
        .map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`)
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="H2Map Transport System" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${routeName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${routeName}</name>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Converte polyline para formato GeoJSON
 * @param polyline Polyline da rota
 * @param properties Propriedades adicionais
 * @returns Objeto GeoJSON
 */
export function convertToGeoJSON(
    polyline: Array<[number, number]>,
    properties: Record<string, any> = {}
): object {
    return {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: polyline.map(([lat, lon]) => [lon, lat]), // GeoJSON usa [lon, lat]
        },
        properties: {
            timestamp: new Date().toISOString(),
            ...properties,
        },
    };
}

/**
 * Valida coordenadas
 * @param lat Latitude
 * @param lon Longitude
 * @returns true se válido
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Parseia string de coordenadas "lat,lon"
 * @param coordString String com coordenadas
 * @returns Objeto com lat e lon ou null se inválido
 */
export function parseCoordinates(coordString: string): Coordinates | null {
    const parts = coordString.split(",").map((s) => parseFloat(s.trim()));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const [lat, lon] = parts;
        if (isValidCoordinates(lat, lon)) {
            return { lat, lon };
        }
    }

    return null;
}

/**
 * Calcula o centro geográfico de um conjunto de pontos
 * @param points Array de coordenadas
 * @returns Centro geográfico
 */
export function calculateCenter(points: Coordinates[]): Coordinates {
    if (points.length === 0) return { lat: 0, lon: 0 };

    const sum = points.reduce(
        (acc, point) => ({
            lat: acc.lat + point.lat,
            lon: acc.lon + point.lon,
        }),
        { lat: 0, lon: 0 }
    );

    return {
        lat: sum.lat / points.length,
        lon: sum.lon / points.length,
    };
}

/**
 * Calcula bounds (limites) de um conjunto de pontos
 * @param points Array de coordenadas
 * @returns Bounds [[south, west], [north, east]]
 */
export function calculateBounds(
    points: Coordinates[]
): [[number, number], [number, number]] | null {
    if (points.length === 0) return null;

    let minLat = points[0].lat;
    let maxLat = points[0].lat;
    let minLon = points[0].lon;
    let maxLon = points[0].lon;

    points.forEach((point) => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLon = Math.min(minLon, point.lon);
        maxLon = Math.max(maxLon, point.lon);
    });

    return [
        [minLat, minLon],
        [maxLat, maxLon],
    ];
}

/**
 * Debounce function para otimizar chamadas
 * @param func Função a ser executada
 * @param wait Tempo de espera em ms
 * @returns Função debounced
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
