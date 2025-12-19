import { useMemo } from "react";
import { useWindyMapStore } from "@/store/windyMapStore";

type Location = {
  lat: number;
  lng: number;
  name: string;
};

interface WindyMapProps {
  initialLocation?: Location;
  zoom?: number;
  mapId?: string;
  enableSync?: boolean;
  initialLayer?: string;
}

const WindyMap = ({ 
  initialLocation, 
  zoom = 10,
}: WindyMapProps) => {
  const { currentLayer } = useWindyMapStore();
  
  // Mapa de camadas para os overlays do Windy - otimizado para meteoblue
  const layerMap: Record<string, string> = {
    wind: "wind",
    temp: "temp", // Temperatura a 2m
    rain: "rainAccu", // Acumulado de precipitação (melhor visualização)
  };

  const windyLayer = layerMap[currentLayer] || "rainAccu";
  
  // Gerar URL do Windy embed
  const windyUrl = useMemo(() => {
    const lat = initialLocation?.lat || -14.235;
    const lng = initialLocation?.lng || -51.9253;
    
    return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lng}&detailLat=${lat}&detailLon=${lng}&zoom=${zoom}&level=surface&overlay=${windyLayer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=true&metricWind=km/h&metricTemp=%C2%B0C&radarRange=-1`;
  }, [initialLocation, zoom, windyLayer]);

  return (
    <div className="w-full h-full">
      <iframe
        src={windyUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        title={`Mapa Windy - ${initialLocation?.name || 'Brasil'}`}
        className="w-full h-full block"
        style={{ border: "none", display: "block", minHeight: "700px" }}
        allowFullScreen
      />
    </div>
  );
};

export default WindyMap;
