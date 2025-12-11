// Tipos globais para a API do Windy
declare global {
    interface Window {
        windyInit?: (options: WindyOptions, callback: (api: WindyAPI) => void) => void;
        L?: any; // Leaflet usado pelo Windy
    }
}

interface WindyOptions {
    key: string;
    lat: number;
    lon: number;
    zoom: number;
}

interface WindyAPI {
    map: any; // Leaflet Map
    store: any;
    picker: any;
    utils: any;
    broadcast: any;
}

export { };
