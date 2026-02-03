import {
  MapPin,
  Star,
  Cloud,
  Layers,
  Navigation as NavigationIcon,
} from "lucide-react";
import Navigation from "@/components/Navigation";
{
  /*import Map from '@/components/Map';*/
}
import { Link } from "react-router-dom";
import LocationSearch from "@/components/LocationSearch";
import FavoritesList from "@/components/FavoritesList";
import LocationHistory from "@/components/LocationHistory";
import WeatherForecast from "@/components/WeatherForecast";
import WeatherAlerts from "@/components/WeatherAlerts";
import NewsSidebar from "@/components/NewsSidebar";
import WindyMap from "@/components/WindyMap";
import WindyMapControls from "@/components/WeatherForecastControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocationStore } from "@/store/locationStore";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const {
    selectedLocation: storeLocation,
    setSelectedLocation,
    addFavorite,
    removeFavorite,
    isFavorite,
    loadFavorites,
    addToHistory,
    getGeolocation,
  } = useLocationStore();
  const [localLocation, setLocalLocation] = useState(
    storeLocation || { lat: -23.5505, lng: -46.6333, name: "São Paulo, SP" },
  );
  const { toast } = useToast();
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsUser(!!user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const loadUserFavorites = async () => {
      await loadFavorites();
      setIsLoadingFavorites(false);
    };
    loadUserFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    if (storeLocation) {
      setLocalLocation(storeLocation);
    }
  }, [storeLocation]);

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    setLocalLocation(location);
    setSelectedLocation(location);
    addToHistory(location);
  };

  const handleGeolocation = async () => {
    setIsLoadingGeo(true);
    try {
      const location = await getGeolocation();
      if (location) {
        handleLocationSelect(location);
        toast({
          title: "Localização detectada",
          description: `Carregando dados de ${location.name}`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível obter sua localização",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      toast({
        title: "Erro",
        description: "Erro ao obter localização",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGeo(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isUser) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para usar favoritos",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite(localLocation.name)) {
      await removeFavorite(localLocation.name);
      toast({
        title: "Favorito removido",
        description: `${localLocation.name} foi removido dos favoritos`,
      });
    } else {
      await addFavorite(localLocation);
      toast({
        title: "Favorito adicionado",
        description: `${localLocation.name} foi adicionado aos favoritos`,
      });
    }
  };

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16 ">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
          {/* Layout: Sidebar (Search + Favorites) | Main Content (Weather) | News Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Sidebar: Location Search, Alerts & News (fixed) */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 z-30 space-y-4">
                <div className="bg-white rounded-xl shadow-md p-3 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    Localização
                  </h3>

                  <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    initialLocation={localLocation}
                  />

                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                    <Button
                      onClick={handleGeolocation}
                      disabled={isLoadingGeo}
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-colors text-sm sm:text-base"
                    >
                      <NavigationIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500" />
                      <div className="text-[10pt]">
                        {isLoadingGeo ? "..." : "Minha Localização"}
                      </div>
                    </Button>
                    <Button
                      onClick={handleToggleFavorite}
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-colors text-sm sm:text-base"
                    >
                      <Star
                        className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-all ${
                          isFavorite(localLocation.name)
                            ? "fill-amber-500 text-amber-500"
                            : "text-amber-500"
                        }`}
                      />
                      <div className="text-[10pt]">
                        {isFavorite(localLocation.name) ? (
                          "Desfavoritar"
                        ) : (
                          <div className="text-[10pt]">Favoritar</div>
                        )}
                      </div>
                    </Button>

                   
                  </div>

                  <div className="border-t border-slate-200 mt-5 pt-5">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Favoritos
                    </h3>
                    <FavoritesList onLocationSelect={handleLocationSelect} />
                  </div>

                  <LocationHistory onLocationSelect={handleLocationSelect} />
                </div>

                {/* Dicas e Alertas Dinâmicos */}
                <div className="hidden lg:block">
                  <WeatherAlerts location={localLocation} />
                </div>

                {/* Notícias Recentes */}
                <div className="hidden lg:block">
                  <NewsSidebar compact maxItems={6} />
                </div>
              </div>
            </div>

            {/* Main Content: Weather Forecast */}
            <div className="lg:col-span-3 space-y-6">
              {/* Inline Weather Forecast */}
              <WeatherForecast location={localLocation} />

              {/* Weather Map abaixo da previsão em telas pequenas/médias */}
              <div
                className="bg-white rounded-lg shadow-lg overflow-hidden lg:hidden"
                style={{ height: "auto" }}
              >
                {/* Sidebar de Controles - Acima do mapa em telas pequenas/médias */}
                <div className="bg-slate-50/95 backdrop-blur-sm z-10 p-4 border-b border-slate-200">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">
                      Mapas Meteorológicos
                    </h2>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {localLocation.name}
                    </p>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Visualizações
                    </h3>
                    <WindyMapControls />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      💡 Arraste o mapa para explorar outras regiões
                    </p>
                  </div>
                </div>

                {/* Mapa em Tela Cheia */}
                <div style={{ height: "600px" }}>
                  <WindyMap
                    initialLocation={localLocation}
                    zoom={9}
                    enableSync={false}
                    initialLayer="wind"
                  />
                </div>
              </div>

              {/* Quick Weather Info Card - Abaixo do mapa em telas pequenas/médias */}
              <Card className="p-4 sm:p-6 border-emerald-100 shadow-lg bg-white lg:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                      📍 Localização
                    </h3>
                    <p className="text-sm text-slate-600">
                      {localLocation.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Latitude: {localLocation.lat.toFixed(4)}°
                    </p>
                    <p className="text-xs text-slate-500">
                      Longitude: {localLocation.lng.toFixed(4)}°
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                      💡 Dica
                    </h3>
                    <p className="text-sm text-slate-600">
                      Mapa interativo mostrando sua localização. Arraste para
                      explorar a região e use zoom para mais detalhes.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Dicas e Alertas + Notícias abaixo da previsão em telas pequenas/médias */}
              <div className="space-y-4 lg:hidden">
                <WeatherAlerts location={localLocation} />
                <NewsSidebar compact maxItems={6} />
              </div>

              {/* Weather Map Section - Layout meteoblue com sidebar */}
              <div
                className="relative bg-white rounded-lg shadow-lg overflow-hidden hidden lg:block"
                style={{ height: "700px" }}
              >
                {/* Sidebar de Controles */}
                <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-50/95 backdrop-blur-sm z-10 p-4 border-r border-slate-200">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">
                      Mapas Meteorológicos
                    </h2>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {localLocation.name}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Visualizações
                    </h3>
                    <WindyMapControls />
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      💡 Arraste o mapa para explorar outras regiões
                    </p>
                  </div>
                </div>

                {/* Mapa em Tela Cheia */}
                <div className="absolute inset-0 pl-64">
                  <WindyMap
                    initialLocation={localLocation}
                    zoom={9}
                    enableSync={false}
                    initialLayer="wind"
                  />
                </div>
              </div>

              {/* Map Section (comentado)
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  Mapa Interativo
                </h2>
                <Map initialLocation={localLocation} />
              </div> */}
            </div>

            {/* Right Sidebar: (was News) — reserved for future widgets */}
            <div className="lg:col-span-1" />
          </div>
        </div>
      </div>
    </>
  );
}
