import { useEffect, useRef, useState } from "react";
import { useWindyMapStore, WeatherLayer } from "@/store/windyMapStore";

type Location = {
  lat: number;
  lng: number;
  name: string;
};

interface WindyMapProps {
  initialLocation?: Location;
  zoom?: number;
  mapId?: string; // ID único para sincronização
  enableSync?: boolean; // Se este mapa participa da sincronização
  initialLayer?: WeatherLayer; // Camada inicial
}

// Windy API keys
const WINDY_API_KEYS = [
  "tqexRyJzU1Tsu9pKo8TKfbFZutYe2KnE",
  "j1CAj41gDPTD4GaHGnSXs6xDyKfLh32a"
];

// Contador global para IDs únicos
let mapIdCounter = 0;

// Controle global de script
let windyScriptLoaded = false;
let windyScriptLoading = false;
const windyCallbacks: Array<() => void> = [];

const loadWindyScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (windyScriptLoaded) {
      resolve();
      return;
    }

    windyCallbacks.push(resolve);

    if (windyScriptLoading) {
      return;
    }

    windyScriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://api.windy.com/assets/map-forecast/libBoot.js`;
    script.async = true;
    
    script.onload = () => {
      windyScriptLoaded = true;
      windyScriptLoading = false;
      windyCallbacks.forEach(cb => cb());
      windyCallbacks.length = 0;
    };

    script.onerror = () => {
      windyScriptLoading = false;
      console.error("Erro ao carregar script do Windy");
    };

    document.body.appendChild(script);
  });
};

const WindyMap = ({ 
  initialLocation, 
  zoom = 10,
  mapId: providedMapId,
  enableSync = false,
  initialLayer = "wind"
}: WindyMapProps) => {
  const [internalMapId] = useState(() => providedMapId || `windy-map-${mapIdCounter++}`);
  const windyAPIRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Store para sincronização
  const { 
    syncEnabled, 
    currentLayer, 
    registerMap, 
    unregisterMap,
    setCurrentLayer,
    setCurrentZoom,
    setCurrentCenter
  } = useWindyMapStore();

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        await loadWindyScript();
        
        if (!mounted) return;

        // Seleciona uma key aleatória para distribuir carga
        const apiKey = WINDY_API_KEYS[Math.floor(Math.random() * WINDY_API_KEYS.length)];

        // @ts-ignore - Windy API global
        if (window.windyInit) {
          const options = {
            key: apiKey,
            lat: initialLocation?.lat || -14.235,
            lon: initialLocation?.lng || -51.9253,
            zoom: zoom,
          };

          // @ts-ignore - Windy API global
          window.windyInit(options, (windyAPI: any) => {
            if (!mounted) return;
            
            windyAPIRef.current = windyAPI;
            const { map, store } = windyAPI;
            
            // Configurar camada inicial
            if (store?.set) {
              store.set("overlay", enableSync ? currentLayer : initialLayer);
            }
            
            // Registrar mapa para sincronização se habilitado
            if (enableSync) {
              registerMap(internalMapId, windyAPI);
            }
            
            // Adicionar marcador se houver localização inicial
            if (initialLocation) {
              // @ts-ignore - Leaflet global (usado pelo Windy)
              if (window.L) {
                // @ts-ignore
                markerRef.current = window.L.marker([initialLocation.lat, initialLocation.lng])
                  .addTo(map)
                  .bindPopup(initialLocation.name);
              }
            }
            
            // Sincronizar movimentos do mapa se habilitado
            if (enableSync && syncEnabled) {
              map.on("moveend", () => {
                const center = map.getCenter();
                const zoom = map.getZoom();
                setCurrentCenter({ lat: center.lat, lng: center.lng });
                setCurrentZoom(zoom);
              });
            }
          });
        }
      } catch (error) {
        console.error("Erro ao inicializar mapa Windy:", error);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch (e) {
          // Ignora erro se o marcador já foi removido
        }
      }
      if (enableSync) {
        unregisterMap(internalMapId);
      }
      windyAPIRef.current = null;
    };
  }, []);
  
  // Sincronizar camada quando mudar no store
  useEffect(() => {
    if (windyAPIRef.current && enableSync && syncEnabled) {
      const { store } = windyAPIRef.current;
      if (store?.set) {
        store.set("overlay", currentLayer);
      }
    }
  }, [currentLayer, syncEnabled, enableSync]);

  // Atualizar mapa quando a localização mudar
  useEffect(() => {
    if (windyAPIRef.current && initialLocation) {
      const { map } = windyAPIRef.current;
      if (map) {
        map.setView([initialLocation.lat, initialLocation.lng], zoom);
        
        // Remover marcador antigo
        if (markerRef.current) {
          try {
            markerRef.current.remove();
          } catch (e) {
            // Ignora erro
          }
        }
        
        // Adicionar novo marcador
        // @ts-ignore - Leaflet global
        if (window.L) {
          // @ts-ignore
          markerRef.current = window.L.marker([initialLocation.lat, initialLocation.lng])
            .addTo(map)
            .bindPopup(initialLocation.name);
        }
      }
    }
  }, [initialLocation, zoom]);

  return (
    <div 
      id={internalMapId} 
      className="w-full h-[500px] rounded-lg bg-slate-100"
      style={{ width: "100%", height: "500px" }}
    />
  );
};

export default WindyMap;
