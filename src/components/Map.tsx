import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Location = {
  lat: number;
  lng: number;
  name: string;
};

interface MapProps {
  initialLocation?: Location;
  zoom?: number;
}

const Map = ({ initialLocation, zoom = 12 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Atualiza quando initialLocation ou zoom mudarem
  useEffect(() => {
    if (map.current) {
      if (initialLocation) {
        // Primeiro volta para o Brasil
        map.current.flyTo({
          center: [-51.9253, -14.235],
          zoom: 4,
          essential: true,
          duration: 1000,
        });

        // Depois anima para a nova localização
        setTimeout(() => {
          map.current?.flyTo({
            center: [initialLocation.lng, initialLocation.lat],
            zoom: zoom,
            essential: true,
            duration: 2000,
          });
        }, 1200);
      } else {
        // Se não houver location, volta para o Brasil
        map.current.flyTo({
          center: [-51.9253, -14.235],
          zoom: 4,
          essential: true,
          duration: 1500,
        });
      }
    }
  }, [initialLocation, zoom]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken =
      "pk.eyJ1IjoiYW1hbmRhdG90YSIsImEiOiJjbWgxdGdtYjUwNHdnMmpvYnZuNnNmN3pyIn0.giKYyvF_kOOqVtd_fx0RNA";

    // Coordenadas centrais do Brasil
    const brazilCenter: [number, number] = [-51.9253, -14.235];
    const brazilZoom = 4;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: brazilCenter,
      zoom: brazilZoom,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    // Espera o mapa carregar e então anima para a localização se fornecida
    map.current.on("load", () => {
      if (initialLocation) {
        // Pequeno delay para mostrar o Brasil antes de animar para a localização
        setTimeout(() => {
          map.current?.flyTo({
            center: [initialLocation.lng, initialLocation.lat],
            zoom: zoom,
            essential: true,
            duration: 2000, // Animação mais longa para mostrar transição
          });
        }, 500);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return <div ref={mapContainer} className="w-full h-[500px] rounded-lg" />;
};

export default Map;
