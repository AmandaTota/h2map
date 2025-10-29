import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
}

const LocationSearch = ({ onLocationSelect, initialLocation }: LocationSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(initialLocation?.name || '');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('municipalities')
        .select('nome, latitude, longitude, codigo_uf')
        .ilike('nome', `%${value}%`)
        .limit(10);

      if (error) {
        console.error('Error searching municipalities:', error);
        toast({
          title: 'Erro na busca',
          description: 'Não foi possível buscar as localidades.',
          variant: 'destructive',
        });
        setSuggestions([]);
        return;
      }

      const locations: Location[] = (data || []).map(muni => ({
        lat: parseFloat(muni.latitude.toString()),
        lng: parseFloat(muni.longitude.toString()),
        name: `${muni.nome}, ${muni.codigo_uf}`,
      }));

      setSuggestions(locations);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Erro na busca',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (location: Location) => {
    setSearchTerm(location.name);
    setSuggestions([]);
    setIsSearching(false);
    onLocationSelect(location);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar localidade (ex: São Paulo, Fortaleza...)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsSearching(true)}
          className="pl-10 pr-4 h-12 text-base border-emerald-200 focus:border-emerald-500"
        />
      </div>

      {isLoading && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg border-emerald-200">
          <div className="p-4 text-center text-slate-600">
            Buscando...
          </div>
        </Card>
      )}

      {isSearching && !isLoading && suggestions.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-64 overflow-y-auto z-50 shadow-lg border-emerald-200">
          <div className="p-2">
            {suggestions.map((location, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(location)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-700">{location.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {isSearching && !isLoading && searchTerm.length >= 2 && suggestions.length === 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg border-emerald-200">
          <div className="p-4 text-center text-slate-600">
            Nenhuma localidade encontrada
          </div>
        </Card>
      )}
    </div>
  );
};

export default LocationSearch;
