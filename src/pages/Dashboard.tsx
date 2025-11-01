import { MapPin, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Map from '@/components/MapGridAnimated';
import WeatherForecast from '@/components/WeatherForecast';
import LocationSearch from '@/components/LocationSearch';
import FavoritesList from '@/components/FavoritesList';
import { Button } from '@/components/ui/button';
import { useLocationStore } from '@/store/locationStore';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { selectedLocation: storeLocation, setSelectedLocation, addFavorite, isFavorite } = useLocationStore();
  const [localLocation, setLocalLocation] = useState(
    storeLocation || { lat: -23.5505, lng: -46.6333, name: 'São Paulo, SP' }
  );
  const { toast } = useToast();

  useEffect(() => {
    if (storeLocation) {
      setLocalLocation(storeLocation);
    }
  }, [storeLocation]);

  const handleLocationSelect = (location: { lat: number; lng: number; name: string }) => {
    setLocalLocation(location);
    setSelectedLocation(location);
  };

  const handleAddFavorite = () => {
    if (isFavorite(localLocation.name)) {
      toast({
        title: 'Já favoritado',
        description: 'Esta cidade já está nos seus favoritos',
      });
      return;
    }
    addFavorite(localLocation);
    toast({
      title: 'Favorito adicionado',
      description: `${localLocation.name} foi adicionado aos favoritos`,
    });
  };

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16 w-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-6 flex">
          {/* Location Search */}
          <div className="bg-white rounded-xl shadow-lg p-4 h-fit flex-1 mr-[50px] max-w-[300px] mt-[25px]">
            <h3 className="text-md font-semibold text-slate-900 mb-4">Selecionar Localização</h3>
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              initialLocation={localLocation}
            />
            
            <Button
              onClick={handleAddFavorite}
              variant="outline"
              className="w-full mt-4 border-amber-300 hover:bg-amber-50 hover:border-amber-400"
            >
              <Star className={`w-4 h-4 mr-2 ${isFavorite(localLocation.name) ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
              {isFavorite(localLocation.name) ? 'Favoritado' : 'Adicionar aos Favoritos'}
            </Button>

            <div className="border-t border-slate-200 mt-4 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Favoritos</h3>
              <FavoritesList onLocationSelect={handleLocationSelect} />
            </div>
          </div>

          {/* Weather Forecast */}
         <div className=''> <WeatherForecast location={localLocation} /></div>

        </div>
          {/* Map */}
          <div className="bg-white rounded-xl shadow-lg p-8 m-[200px] mt-3">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-600 text-center" />
              Mapa Interativo
            </h2>
            <Map />
          </div>
      </div>
    </>
  );
}
