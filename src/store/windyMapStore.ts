import { create } from "zustand";

export type WeatherLayer =
    | "wind"
    | "temp"
    | "rain"
    | "clouds"
    | "pressure"
    | "humidity"
    | "waves"
    | "swell"
    | "gust";

export type WeatherPreset = {
    name: string;
    layer: WeatherLayer;
    description: string;
    icon: string;
};

export const WEATHER_PRESETS: WeatherPreset[] = [
    { name: "Vento", layer: "wind", description: "Velocidade e direção do vento", icon: "🌬️" },
    { name: "Temperatura", layer: "temp", description: "Temperatura do ar", icon: "🌡️" },
    { name: "Chuva", layer: "rain", description: "Precipitação e chuva", icon: "🌧️" },
    { name: "Nuvens", layer: "clouds", description: "Cobertura de nuvens", icon: "☁️" },
    { name: "Pressão", layer: "pressure", description: "Pressão atmosférica", icon: "📊" },
    { name: "Umidade", layer: "humidity", description: "Umidade relativa do ar", icon: "💧" },
    { name: "Ondas", layer: "waves", description: "Altura das ondas", icon: "🌊" },
    { name: "Rajadas", layer: "gust", description: "Rajadas de vento", icon: "💨" },
];

interface WindyMapState {
    // Sincronização
    syncEnabled: boolean;
    currentLayer: WeatherLayer;
    currentZoom: number;
    currentCenter: { lat: number; lng: number } | null;

    // Personalização visual
    showLabels: boolean;
    showParticles: boolean;
    showIsoliness: boolean;

    // Actions
    setSyncEnabled: (enabled: boolean) => void;
    setCurrentLayer: (layer: WeatherLayer) => void;
    setCurrentZoom: (zoom: number) => void;
    setCurrentCenter: (center: { lat: number; lng: number }) => void;
    setShowLabels: (show: boolean) => void;
    setShowParticles: (show: boolean) => void;
    setShowIsolines: (show: boolean) => void;

    // Map instances registry
    registerMap: (id: string, api: any) => void;
    unregisterMap: (id: string) => void;
    maps: Map<string, any>;
}

export const useWindyMapStore = create<WindyMapState>((set, get) => ({
    // Estado inicial
    syncEnabled: false,
    currentLayer: "wind",
    currentZoom: 10,
    currentCenter: null,
    showLabels: true,
    showParticles: true,
    showIsoliness: true,
    maps: new Map(),

    // Actions
    setSyncEnabled: (enabled) => set({ syncEnabled: enabled }),

    setCurrentLayer: (layer) => {
        set({ currentLayer: layer });
        const { syncEnabled, maps } = get();
        if (syncEnabled) {
            maps.forEach((api) => {
                if (api?.store?.set) {
                    api.store.set("overlay", layer);
                }
            });
        }
    },

    setCurrentZoom: (zoom) => {
        set({ currentZoom: zoom });
        const { syncEnabled, maps, currentCenter } = get();
        if (syncEnabled && currentCenter) {
            maps.forEach((api) => {
                if (api?.map) {
                    api.map.setView([currentCenter.lat, currentCenter.lng], zoom);
                }
            });
        }
    },

    setCurrentCenter: (center) => {
        set({ currentCenter: center });
        const { syncEnabled, maps, currentZoom } = get();
        if (syncEnabled) {
            maps.forEach((api) => {
                if (api?.map) {
                    api.map.setView([center.lat, center.lng], currentZoom);
                }
            });
        }
    },

    setShowLabels: (show) => {
        set({ showLabels: show });
        const { maps } = get();
        maps.forEach((api) => {
            if (api?.store?.set) {
                api.store.set("graticule", show);
            }
        });
    },

    setShowParticles: (show) => {
        set({ showParticles: show });
        const { maps } = get();
        maps.forEach((api) => {
            if (api?.store?.set) {
                api.store.set("particlesAnim", show);
            }
        });
    },

    setShowIsolines: (show) => {
        set({ showIsoliness: show });
        const { maps } = get();
        maps.forEach((api) => {
            if (api?.store?.set) {
                api.store.set("isolines", show ? "pressure" : "off");
            }
        });
    },

    registerMap: (id, api) => {
        const { maps } = get();
        maps.set(id, api);
        set({ maps: new Map(maps) });
    },

    unregisterMap: (id) => {
        const { maps } = get();
        maps.delete(id);
        set({ maps: new Map(maps) });
    },
}));
