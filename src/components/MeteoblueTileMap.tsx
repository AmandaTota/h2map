import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useWindyMapStore } from "@/store/windyMapStore";

type Location = {
  lat: number;
  lng: number;
  name: string;
};

interface MeteoblueTileMapProps {
  initialLocation?: Location;
  zoom?: number; // Leaflet zoom (3-10 recomendado para Brasil)
}

// Configuração de tiles via env por camada (URLs completas)
// Use placeholders padrão XYZ como {z}/{x}/{y}
const TILE_RAIN = import.meta.env.VITE_METEOBLUE_TILE_RAIN as string | undefined;
const TILE_TEMP = import.meta.env.VITE_METEOBLUE_TILE_TEMP as string | undefined;
const TILE_WIND = import.meta.env.VITE_METEOBLUE_TILE_WIND as string | undefined;

const FlyTo = ({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
};

export default function MeteoblueTileMap({ initialLocation, zoom = 6 }: MeteoblueTileMapProps) {
  const { currentLayer } = useWindyMapStore();

  const center = [
    initialLocation?.lat ?? -14.235,
    initialLocation?.lng ?? -51.9253,
  ] as [number, number];

  const overlayUrl =
    currentLayer === "temp"
      ? TILE_TEMP
      : currentLayer === "wind"
      ? TILE_WIND
      : TILE_RAIN;

  const tilesConfigured = Boolean(overlayUrl);

  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", minHeight: 700 }}
        className="leaflet-container rounded-none"
        zoomControl={false}
      >
        {/* Base OSM */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Overlay Meteoblue (se configurado) */}
        {tilesConfigured && overlayUrl ? (
          <TileLayer
            url={overlayUrl}
            opacity={0.85}
            zIndex={5}
          />
        ) : null}

        <FlyTo lat={center[0]} lng={center[1]} zoom={zoom} />
      </MapContainer>

      {!tilesConfigured && (
        <div className="absolute bottom-4 right-4 bg-white/90 text-slate-700 text-xs px-3 py-2 rounded shadow">
          Camadas Meteoblue (tiles) não configuradas.
          Defina VITE_METEOBLUE_TILES_BASE e VITE_METEOBLUE_API_KEY.
        </div>
      )}
    </div>
  );
}
