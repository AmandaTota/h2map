import { useMemo } from "react";
import { useWindyMapStore } from "@/store/windyMapStore";

type Location = {
  lat: number;
  lng: number;
  name: string;
};

interface MeteoblueMapProps {
  initialLocation?: Location;
  zoom?: number; // aproximação: 1-6 (site usa valores baixos)
}

// Mapeia camadas internas -> parâmetros de mapa do meteoblue
const METEOBLUE_MAP_PARAMS: Record<string, string> = {
  // Nuvens e precipitação (hourly, sfc)
  rain: "cloudsAndPrecipitation~hourly~auto~sfc~none",
  // Temperatura (hourly, 2m acima do solo)
  temp: "temperature~hourly~auto~2%20m%20above%20gnd~none",
  // Rajadas (hourly, superfície)
  wind: "gust~hourly~auto~sfc~none",
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function MeteoblueMap({ initialLocation, zoom = 3.52 }: MeteoblueMapProps) {
  const { currentLayer } = useWindyMapStore();

  const { lat, lng } = {
    lat: initialLocation?.lat ?? -14.235,
    lng: initialLocation?.lng ?? -51.9253,
  };

  const layerParam = METEOBLUE_MAP_PARAMS[currentLayer] ?? METEOBLUE_MAP_PARAMS["rain"];

  // O site usa coords = zoom/lat/lon com zoom baixo (~1.5 a 6)
  const coords = `${clamp(zoom, 1, 6).toFixed(2)}/${lat.toFixed(2)}/${lng.toFixed(2)}`;

  const src = useMemo(() => {
    // Página genérica de mapas com hash configurado
    return `https://www.meteoblue.com/pt/tempo/mapas#coords=${coords}&map=${layerParam}`;
  }, [coords, layerParam]);

  return (
    <div className="w-full h-full">
      <iframe
        src={src}
        title={`Meteoblue Map - ${initialLocation?.name || "Brasil"}`}
        className="w-full h-full block"
        style={{ border: "none", minHeight: "700px" }}
      />
    </div>
  );
}
