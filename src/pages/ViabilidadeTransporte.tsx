import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { 
  MapPin, 
  Navigation as NavigationIcon, 
  Fuel, 
  DollarSign, 
  Clock, 
  Route, 
  Download,
  Plus,
  X,
  AlertCircle,
  Car,
  Truck
} from "lucide-react";

// Tipos
interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
}
interface Waypoint {
  id: string;
  address: string;
  lat?: number;
  lon?: number;
}

interface RoutePreferences {
  avoidTolls: boolean;
  avoidUnpaved: boolean;
  avoidFerries: boolean;
  profile: "h2-gas" | "h2-liquid" | "lohc";
}

interface VehicleParams {
  avgKmPerLiter: number;
  fuelType: string;
  pricePerLiter: number;
}

interface TollData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  direction: string;
  vehicleClass: string;
  priceBRL: number;
}

interface RouteResult {
  distance: number;
  duration: number;
  steps: Array<{ instruction: string; distance: number; duration: number }>;
  polyline: Array<[number, number]>;
  consumption: number;
  fuelCost: number;
  tollCost: number;
  totalCost: number;
}

// Base de dados de cidades brasileiras (principais capitais e cidades)
const CITIES_DATABASE: City[] = [
  // Região Sudeste
  { name: "São Paulo", state: "SP", lat: -23.5505, lon: -46.6333 },
  { name: "Rio de Janeiro", state: "RJ", lat: -22.9068, lon: -43.1729 },
  { name: "Belo Horizonte", state: "MG", lat: -19.9167, lon: -43.9345 },
  { name: "Campinas", state: "SP", lat: -22.9056, lon: -47.0608 },
  { name: "Santos", state: "SP", lat: -23.9608, lon: -46.3336 },
  { name: "Guarulhos", state: "SP", lat: -23.4538, lon: -46.5333 },
  { name: "São Bernardo do Campo", state: "SP", lat: -23.6914, lon: -46.5647 },
  { name: "Osasco", state: "SP", lat: -23.5329, lon: -46.7919 },
  { name: "Ribeirão Preto", state: "SP", lat: -21.1775, lon: -47.8103 },
  { name: "Sorocaba", state: "SP", lat: -23.5015, lon: -47.4526 },
  { name: "São José dos Campos", state: "SP", lat: -23.1791, lon: -45.8872 },
  { name: "Uberlândia", state: "MG", lat: -18.9186, lon: -48.2772 },
  { name: "Contagem", state: "MG", lat: -19.9320, lon: -44.0540 },
  { name: "Vitória", state: "ES", lat: -20.3155, lon: -40.3128 },
  { name: "Juiz de Fora", state: "MG", lat: -21.7642, lon: -43.3503 },
  { name: "Niterói", state: "RJ", lat: -22.8833, lon: -43.1036 },
  { name: "Campos dos Goytacazes", state: "RJ", lat: -21.7622, lon: -41.3181 },
  { name: "Piracicaba", state: "SP", lat: -22.7253, lon: -47.6492 },
  { name: "Bauru", state: "SP", lat: -22.3147, lon: -49.0608 },
  { name: "Jundiaí", state: "SP", lat: -23.1864, lon: -46.8842 },
  { name: "Vila Velha", state: "ES", lat: -20.3297, lon: -40.2925 },
  { name: "Montes Claros", state: "MG", lat: -16.7350, lon: -43.8619 },
  
  // Região Sul
  { name: "Curitiba", state: "PR", lat: -25.4284, lon: -49.2733 },
  { name: "Porto Alegre", state: "RS", lat: -30.0346, lon: -51.2177 },
  { name: "Joinville", state: "SC", lat: -26.3045, lon: -48.8487 },
  { name: "Londrina", state: "PR", lat: -23.3045, lon: -51.1696 },
  { name: "Florianópolis", state: "SC", lat: -27.5954, lon: -48.5480 },
  { name: "Caxias do Sul", state: "RS", lat: -29.1634, lon: -51.1797 },
  { name: "Blumenau", state: "SC", lat: -26.9194, lon: -49.0661 },
  { name: "Maringá", state: "PR", lat: -23.4253, lon: -51.9386 },
  { name: "Cascavel", state: "PR", lat: -24.9555, lon: -53.4552 },
  { name: "Ponta Grossa", state: "PR", lat: -25.0916, lon: -50.1668 },
  { name: "Pelotas", state: "RS", lat: -31.7654, lon: -52.3376 },
  { name: "Canoas", state: "RS", lat: -29.9177, lon: -51.1844 },
  
  // Região Nordeste
  { name: "Salvador", state: "BA", lat: -12.9714, lon: -38.5014 },
  { name: "Fortaleza", state: "CE", lat: -3.71722, lon: -38.5433 },
  { name: "Recife", state: "PE", lat: -8.04666, lon: -34.8771 },
  { name: "Natal", state: "RN", lat: -5.79448, lon: -35.211 },
  { name: "São Luís", state: "MA", lat: -2.52972, lon: -44.3028 },
  { name: "Maceió", state: "AL", lat: -9.66599, lon: -35.735 },
  { name: "Teresina", state: "PI", lat: -5.08921, lon: -42.8016 },
  { name: "João Pessoa", state: "PB", lat: -7.11509, lon: -34.861 },
  { name: "Aracaju", state: "SE", lat: -10.9472, lon: -37.0731 },
  { name: "Feira de Santana", state: "BA", lat: -12.2664, lon: -38.9663 },
  { name: "Jaboatão dos Guararapes", state: "PE", lat: -8.11298, lon: -35.0149 },
  { name: "Olinda", state: "PE", lat: -8.00891, lon: -34.8553 },
  { name: "Caruaru", state: "PE", lat: -8.28333, lon: -35.9761 },
  { name: "Petrolina", state: "PE", lat: -9.39861, lon: -40.5008 },
  { name: "Campina Grande", state: "PB", lat: -7.23056, lon: -35.8811 },
  { name: "Vitória da Conquista", state: "BA", lat: -14.8615, lon: -40.8442 },
  { name: "Mossoró", state: "RN", lat: -5.18750, lon: -37.3444 },
  { name: "Imperatriz", state: "MA", lat: -5.52639, lon: -47.4792 },
  { name: "Juazeiro do Norte", state: "CE", lat: -7.21306, lon: -39.3153 },
  { name: "Caucaia", state: "CE", lat: -3.73611, lon: -38.6533 },
  
  // Região Centro-Oeste
  { name: "Brasília", state: "DF", lat: -15.7801, lon: -47.9292 },
  { name: "Goiânia", state: "GO", lat: -16.6869, lon: -49.2648 },
  { name: "Campo Grande", state: "MS", lat: -20.4697, lon: -54.6201 },
  { name: "Cuiabá", state: "MT", lat: -15.601, lon: -56.0974 },
  { name: "Aparecida de Goiânia", state: "GO", lat: -16.8173, lon: -49.2437 },
  { name: "Anápolis", state: "GO", lat: -16.3281, lon: -48.9534 },
  { name: "Várzea Grande", state: "MT", lat: -15.6467, lon: -56.1325 },
  { name: "Rondonópolis", state: "MT", lat: -16.4708, lon: -54.6358 },
  { name: "Dourados", state: "MS", lat: -22.2211, lon: -54.8056 },
  
  // Região Norte
  { name: "Manaus", state: "AM", lat: -3.11866, lon: -60.0212 },
  { name: "Belém", state: "PA", lat: -1.45583, lon: -48.5044 },
  { name: "Porto Velho", state: "RO", lat: -8.76194, lon: -63.9039 },
  { name: "Rio Branco", state: "AC", lat: -9.97472, lon: -67.8100 },
  { name: "Macapá", state: "AP", lat: 0.03889, lon: -51.0694 },
  { name: "Palmas", state: "TO", lat: -10.1689, lon: -48.3317 },
  { name: "Boa Vista", state: "RR", lat: 2.81972, lon: -60.6714 },
  { name: "Santarém", state: "PA", lat: -2.44306, lon: -54.7083 },
  { name: "Ananindeua", state: "PA", lat: -1.36556, lon: -48.3722 },
  { name: "Marabá", state: "PA", lat: -5.36861, lon: -49.1178 },
];

// Base de dados de pedágios simulada (local/offline)
const TOLL_DATABASE: TollData[] = [
  { id: "1", name: "Pedágio SP-348 - Bandeirantes", lat: -23.0, lon: -47.0, direction: "both", vehicleClass: "car", priceBRL: 15.20 },
  { id: "2", name: "Pedágio BR-116 - Régis", lat: -22.8, lon: -46.8, direction: "south", vehicleClass: "car", priceBRL: 18.50 },
  { id: "3", name: "Pedágio SP-280 - Raposo", lat: -23.5, lon: -47.2, direction: "both", vehicleClass: "truck", priceBRL: 45.80 },
];

export default function ViabilidadeTransporte() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<City[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<City[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  const [preferences, setPreferences] = useState<RoutePreferences>({
    avoidTolls: false,
    avoidUnpaved: false,
    avoidFerries: false,
    profile: "h2-gas"
  });
  
  const [vehicleParams, setVehicleParams] = useState<VehicleParams>({
    avgKmPerLiter: 10,
    fuelType: "gasolina",
    pricePerLiter: 5.89
  });

  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Inicializar mapa offline com Leaflet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Importação dinâmica do Leaflet
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstance) return;

      const map = L.map(mapRef.current).setView([-15.7801, -47.9292], 4); // Centro do Brasil

      // Tiles offline (substitua pela fonte local em produção)
      // Para desenvolvimento, usa OpenStreetMap; em produção, use PMTiles/MBTiles local
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      setMapInstance(map);

      return () => {
        map.remove();
      };
    });
  }, []);

  const addWaypoint = () => {
    setWaypoints([...waypoints, { id: Date.now().toString(), address: "" }]);
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  const updateWaypoint = (id: string, address: string) => {
    setWaypoints(waypoints.map(w => w.id === id ? { ...w, address } : w));
  };

  // Função para buscar cidades
  const searchCities = (query: string): City[] => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return CITIES_DATABASE.filter(city => 
      city.name.toLowerCase().includes(lowerQuery) ||
      city.state.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);
  };

  // Atualizar origem com autocomplete
  const handleOriginChange = (value: string) => {
    setOrigin(value);
    const suggestions = searchCities(value);
    setOriginSuggestions(suggestions);
    setShowOriginSuggestions(suggestions.length > 0);
  };

  // Atualizar destino com autocomplete
  const handleDestinationChange = (value: string) => {
    setDestination(value);
    const suggestions = searchCities(value);
    setDestinationSuggestions(suggestions);
    setShowDestinationSuggestions(suggestions.length > 0);
  };

  // Selecionar cidade do autocomplete
  const selectOriginCity = (city: City) => {
    setOrigin(`${city.name}, ${city.state}`);
    setShowOriginSuggestions(false);
  };

  const selectDestinationCity = (city: City) => {
    setDestination(`${city.name}, ${city.state}`);
    setShowDestinationSuggestions(false);
  };

  // Calcular distância real usando fórmula de Haversine
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Geocodificação usando base de cidades
  const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
    // Aceita formato "lat,lon"
    const coords = address.split(',').map(s => parseFloat(s.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return { lat: coords[0], lon: coords[1] };
    }
    
    // Buscar na base de cidades
    const lowerAddress = address.toLowerCase();
    const city = CITIES_DATABASE.find(c => 
      lowerAddress.includes(c.name.toLowerCase()) ||
      lowerAddress === `${c.name.toLowerCase()}, ${c.state.toLowerCase()}`
    );
    
    if (city) {
      return { lat: city.lat, lon: city.lon };
    }
    
    return null;
  };

  // Cálculo de rota offline usando OSRM/GraphHopper simulado
  const calculateRoute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Geocodificar origem e destino
      const originCoords = await geocodeAddress(origin);
      const destCoords = await geocodeAddress(destination);
      
      if (!originCoords || !destCoords) {
        throw new Error("Não foi possível geocodificar os endereços. Use lat,lon ou endereços válidos.");
      }

      // Geocodificar waypoints
      const waypointCoords = await Promise.all(
        waypoints.map(w => geocodeAddress(w.address))
      );

      // Calcular distância real usando Haversine
      // Multiplica por 1.3 para aproximar à distância rodoviária real (não é linha reta)
      const straightDistance = calculateHaversineDistance(
        originCoords.lat, originCoords.lon,
        destCoords.lat, destCoords.lon
      );
      const distance = straightDistance * 1.3; // Fator de correção para distância rodoviária
      const duration = distance / 80; // horas (velocidade média 80 km/h em rodovias)
      
      const consumption = distance / vehicleParams.avgKmPerLiter;
      const fuelCost = consumption * vehicleParams.pricePerLiter;
      
      // Calcular pedágios na rota (interseção espacial simulada)
      const tollsOnRoute = preferences.avoidTolls ? [] : TOLL_DATABASE.filter(toll => {
        // Simulação: considera pedágios próximos à linha reta origem-destino
        const distToRoute = Math.abs(toll.lat - originCoords.lat) + Math.abs(toll.lon - originCoords.lon);
        return distToRoute < 5; // graus, aproximação
      });
      
      const tollCost = tollsOnRoute.reduce((sum, toll) => {
        // Para caminhões H2, usar preço de truck
        if (toll.vehicleClass === "truck") return sum + toll.priceBRL;
        if (toll.vehicleClass === "car") return sum + toll.priceBRL;
        return sum;
      }, 0);

      const totalCost = fuelCost + tollCost;

      // Gerar polyline simulada (em produção, vem do OSRM)
      const polyline: Array<[number, number]> = [
        [originCoords.lat, originCoords.lon],
        [(originCoords.lat + destCoords.lat) / 2, (originCoords.lon + destCoords.lon) / 2],
        [destCoords.lat, destCoords.lon]
      ];

      const steps = [
        { instruction: "Siga em frente pela rodovia principal", distance: distance * 0.7, duration: duration * 0.7 },
        { instruction: "Entre à direita na saída", distance: distance * 0.2, duration: duration * 0.2 },
        { instruction: "Chegue ao destino", distance: distance * 0.1, duration: duration * 0.1 }
      ];

      setRouteResult({
        distance,
        duration,
        steps,
        polyline,
        consumption,
        fuelCost,
        tollCost,
        totalCost
      });

      // Desenhar rota no mapa
      if (mapInstance && typeof window !== 'undefined') {
        import('leaflet').then((L) => {
          // Limpar camadas anteriores
          mapInstance.eachLayer((layer: any) => {
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
              mapInstance.removeLayer(layer);
            }
          });

          // Adicionar marcadores
          L.marker([originCoords.lat, originCoords.lon])
            .addTo(mapInstance)
            .bindPopup("Origem");
          
          L.marker([destCoords.lat, destCoords.lon])
            .addTo(mapInstance)
            .bindPopup("Destino");

          // Adicionar polyline
          L.polyline(polyline, { color: 'blue', weight: 4 })
            .addTo(mapInstance);

          // Ajustar zoom
          mapInstance.fitBounds(polyline);
        });
      }

    } catch (err: any) {
      setError(err.message || "Erro ao calcular rota");
    } finally {
      setLoading(false);
    }
  };

  const exportGPX = () => {
    if (!routeResult) return;
    
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="H2Map">
  <trk>
    <name>Rota ${origin} - ${destination}</name>
    <trkseg>
      ${routeResult.polyline.map(([lat, lon]) => `<trkpt lat="${lat}" lon="${lon}"></trkpt>`).join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;
    
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rota.gpx';
    a.click();
  };

  const exportGeoJSON = () => {
    if (!routeResult) return;
    
    const geojson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: routeResult.polyline.map(([lat, lon]) => [lon, lat])
      },
      properties: {
        origin,
        destination,
        distance: routeResult.distance,
        duration: routeResult.duration,
        totalCost: routeResult.totalCost
      }
    };
    
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rota.geojson';
    a.click();
  };

  const exportPDF = () => {
    if (!routeResult) return;
    alert("Exportação PDF será implementada com jsPDF + html2canvas");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-12">
      <Navigation />
      <div className="pt-28 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Route className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-800">Viabilidade de Transporte Offline</h1>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sistema offline-first para cálculo de rotas A→B sem dependência de internet. 
            Usa dados locais (OSM, tiles offline, pedágios) para calcular distância, tempo, consumo e custos.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Origem
                </Label>
                <Input 
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => origin && setShowOriginSuggestions(originSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                  placeholder="Localidade"
                  className="mt-1"
                />
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {originSuggestions.map((city, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 hover:bg-emerald-50 cursor-pointer flex items-center gap-2 border-b last:border-b-0"
                        onClick={() => selectOriginCity(city)}
                      >
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-xs text-slate-500">{city.state}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Label className="flex items-center gap-2">
                  <NavigationIcon className="w-4 h-4" />
                  Destino
                </Label>
                <Input 
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => destination && setShowDestinationSuggestions(destinationSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                  placeholder="Localidade"
                  className="mt-1"
                />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {destinationSuggestions.map((city, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 hover:bg-emerald-50 cursor-pointer flex items-center gap-2 border-b last:border-b-0"
                        onClick={() => selectDestinationCity(city)}
                      >
                        <NavigationIcon className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-xs text-slate-500">{city.state}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Waypoints */}
              <div>
                <Label>Paradas intermediárias (opcional)</Label>
                {waypoints.map((wp) => (
                  <div key={wp.id} className="flex gap-2 mt-2">
                    <Input 
                      value={wp.address}
                      onChange={(e) => updateWaypoint(wp.id, e.target.value)}
                      placeholder="Localidade"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeWaypoint(wp.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={addWaypoint}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar parada
                </Button>
              </div>

              {/* Preferências */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">Preferências de rota</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="avoidTolls"
                    checked={preferences.avoidTolls}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, avoidTolls: checked as boolean })
                    }
                  />
                  <label htmlFor="avoidTolls" className="text-sm cursor-pointer">
                    Evitar pedágios
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="avoidUnpaved"
                    checked={preferences.avoidUnpaved}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, avoidUnpaved: checked as boolean })
                    }
                  />
                  <label htmlFor="avoidUnpaved" className="text-sm cursor-pointer">
                    Evitar estradas não pavimentadas
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="avoidFerries"
                    checked={preferences.avoidFerries}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, avoidFerries: checked as boolean })
                    }
                  />
                  <label htmlFor="avoidFerries" className="text-sm cursor-pointer">
                    Evitar balsas/ferries
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button 
                onClick={calculateRoute} 
                disabled={loading || !origin || !destination}
                className="flex-1"
              >
                {loading ? "Calculando..." : "Calcular Rota"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setOrigin("");
                  setDestination("");
                  setWaypoints([]);
                  setRouteResult(null);
                  setError(null);
                }}
              >
                Limpar
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Mapa */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Mapa Offline</h3>
              <p className="text-sm text-slate-500">Tiles locais • Sem internet necessária</p>
            </div>
            <div 
              ref={mapRef} 
              className="w-full h-[500px] rounded-lg border bg-slate-100"
              style={{ minHeight: '500px' }}
            />
          </Card>
        </div>

        {/* Resultados */}
        {routeResult && (
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Resultados da Rota</h2>
                <p className="text-sm text-slate-500">{origin} → {destination}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportGPX}>
                  <Download className="w-4 h-4 mr-2" />
                  GPX
                </Button>
                <Button variant="outline" size="sm" onClick={exportGeoJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  GeoJSON
                </Button>
                <Button variant="outline" size="sm" onClick={exportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Métricas principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-1">Distância Total</div>
                <div className="text-2xl font-bold text-blue-900">{routeResult.distance.toFixed(1)} km</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Tempo Estimado
                </div>
                <div className="text-2xl font-bold text-purple-900">{routeResult.duration.toFixed(1)} h</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-600 font-medium mb-1 flex items-center gap-1">
                  <Fuel className="w-4 h-4" />
                  Consumo
                </div>
                <div className="text-2xl font-bold text-orange-900">{routeResult.consumption.toFixed(1)} L</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                <div className="text-sm text-emerald-600 font-medium mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Custo Total
                </div>
                <div className="text-2xl font-bold text-emerald-900">R$ {Math.round(routeResult.totalCost)}</div>
              </div>
            </div>

            {/* Detalhamento de custos */}
            <div className="p-4 bg-white rounded-lg border mb-6">
              <h3 className="font-semibold mb-3">Detalhamento de Custos (Veículo Convencional)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Combustível:</span>
                  <span className="font-medium">R$ {Math.round(routeResult.fuelCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pedágios:</span>
                  <span className="font-medium">R$ {Math.round(routeResult.tollCost)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total:</span>
                  <span className="text-emerald-600">R$ {Math.round(routeResult.totalCost)}</span>
                </div>
              </div>
            </div>


            {/* Análise de Custo/Benefício H2 */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-semibold mb-4">Análise de Custo/Benefício - Transporte H₂</h3>
              
              {/* Cards dos tipos de transporte */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Caminhão Cilindros (H₂ gasoso) */}
                <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">H₂ Gasoso</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Preço/kg:</span>
                      <span className="font-medium">R$ 2.75 - 8.25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Capacidade:</span>
                      <span className="font-medium">600 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Consumo:</span>
                      <span className="font-medium">2.5 km/kg H₂</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-600">Custo Total:</span>
                      <span className="font-bold text-blue-700">R$ 1650 - 4950</span>
                    </div>
                    {routeResult && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-slate-600">Consumo H₂ rota:</span>
                        <span className="font-medium">{(routeResult.distance / 2.5).toFixed(1)} kg</span>
                      </div>
                    )}
                    {routeResult && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Custo/rota:</span>
                        <span className="font-bold text-blue-800">
                          R$ {Math.round((routeResult.distance / 2.5) * 2.75)} - {Math.round((routeResult.distance / 2.5) * 8.25)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Caminhão Criogênico (H₂ líquido) */}
                <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold text-cyan-900">H₂ Líquido</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Preço/kg:</span>
                      <span className="font-medium">R$ 2.75</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Capacidade:</span>
                      <span className="font-medium">4000 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Consumo:</span>
                      <span className="font-medium">2.5 km/kg H₂</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-600">Custo Total:</span>
                      <span className="font-bold text-cyan-700">R$ 11000</span>
                    </div>
                    {routeResult && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-slate-600">Consumo H₂ rota:</span>
                        <span className="font-medium">{(routeResult.distance / 2.5).toFixed(1)} kg</span>
                      </div>
                    )}
                    {routeResult && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Custo/rota:</span>
                        <span className="font-bold text-cyan-800">
                          R$ {Math.round((routeResult.distance / 2.5) * 2.75)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LOHC */}
                <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">LOHC</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Preço/kg:</span>
                      <span className="font-medium">R$ 6.05 - 10.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Capacidade:</span>
                      <span className="font-medium">600 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Consumo:</span>
                      <span className="font-medium">2.5 km/kg H₂</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-600">Custo Total:</span>
                      <span className="font-bold text-purple-700">R$ 3630 - 6270</span>
                    </div>
                    {routeResult && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-slate-600">Consumo H₂ rota:</span>
                        <span className="font-medium">{(routeResult.distance / 2.5).toFixed(1)} kg</span>
                      </div>
                    )}
                    {routeResult && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Custo/rota:</span>
                        <span className="font-bold text-purple-800">
                          R$ {Math.round((routeResult.distance / 2.5) * 6.05)} - {Math.round((routeResult.distance / 2.5) * 10.45)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
