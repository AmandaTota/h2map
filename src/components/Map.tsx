import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type Location = {
  lat: number;
  lng: number;
  name: string;
};

const Map = ({ initialLocation }: { initialLocation?: Location }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Atualiza quando initialLocation mudar
  useEffect(() => {
    if (initialLocation && map.current) {
      map.current.flyTo({
        center: [initialLocation.lng, initialLocation.lat],
        zoom: 12,
        essential: true,
      });
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hbmRhdG90YSIsImEiOiJjbWgxdGdtYjUwNHdnMmpvYnZuNnNmN3pyIn0.giKYyvF_kOOqVtd_fx0RNA';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation ? [initialLocation.lng, initialLocation.lat] : [-43.2096, -22.9068],
      zoom: initialLocation ? 12 : 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    // Espera o mapa carregar antes de aplicar flyTo
    map.current.on('load', () => {
      if (initialLocation) {
        map.current?.flyTo({
          center: [initialLocation.lng, initialLocation.lat],
          zoom: 12,
          essential: true,
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div ref={mapContainer} className="w-full h-[500px] rounded-lg" />
  );
};

export default Map;