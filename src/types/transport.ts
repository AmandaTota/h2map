// Tipos para o sistema de viabilidade de transporte offline

export interface Waypoint {
    id: string;
    address: string;
    lat?: number;
    lon?: number;
}

export interface Coordinates {
    lat: number;
    lon: number;
}

export interface RoutePreferences {
    avoidTolls: boolean;
    avoidUnpaved: boolean;
    avoidFerries: boolean;
    profile: "car" | "truck" | "motorcycle";
}

export interface VehicleParams {
    avgKmPerLiter: number;
    fuelType: "gasolina" | "etanol" | "diesel" | "gnv";
    pricePerLiter: number;
}

export interface TollData {
    id: string;
    name: string;
    lat: number;
    lon: number;
    direction: "north" | "south" | "east" | "west" | "both";
    highway?: string;
    vehicleClass: {
        car?: number;
        truck?: number;
        motorcycle?: number;
        [key: string]: number | undefined;
    };
    operatingHours?: string;
    paymentMethods?: string[];
}

export interface RouteStep {
    instruction: string;
    distance: number; // km
    duration: number; // horas
    maneuver?: {
        type: string;
        modifier?: string;
        bearing_before?: number;
        bearing_after?: number;
        location: [number, number];
    };
}

export interface RouteResult {
    distance: number; // km
    duration: number; // horas
    steps: RouteStep[];
    polyline: Array<[number, number]>; // [lat, lon]
    consumption: number; // litros
    fuelCost: number; // R$
    tollCost: number; // R$
    totalCost: number; // R$
    tollsOnRoute?: TollData[];
}

export interface GeocodingResult {
    id?: string;
    name: string;
    state?: string;
    fullName?: string;
    lat: number;
    lon: number;
    population?: number;
    aliases?: string[];
}

export interface OSRMRoute {
    code: string;
    routes: Array<{
        distance: number; // metros
        duration: number; // segundos
        geometry: {
            coordinates: Array<[number, number]>; // [lon, lat]
            type: "LineString";
        };
        legs: Array<{
            distance: number;
            duration: number;
            steps: Array<{
                distance: number;
                duration: number;
                geometry: any;
                name: string;
                mode: string;
                maneuver: {
                    type: string;
                    modifier?: string;
                    bearing_before?: number;
                    bearing_after?: number;
                    location: [number, number];
                    instruction?: string;
                };
            }>;
        }>;
    }>;
    waypoints: Array<{
        hint: string;
        distance: number;
        name: string;
        location: [number, number];
    }>;
}

export interface ExportOptions {
    format: "gpx" | "geojson" | "pdf";
    includeMetrics?: boolean;
    includeMap?: boolean;
    includeSteps?: boolean;
}

export interface MapConfig {
    center: [number, number];
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
    bounds?: [[number, number], [number, number]];
}

export interface CacheConfig {
    cacheName: string;
    version: string;
    urlsToCache: string[];
    maxAge?: number; // milissegundos
}
