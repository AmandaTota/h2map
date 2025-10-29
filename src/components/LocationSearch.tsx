import { useState, useEffect } from 'react';
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

interface Municipality {
  nome: string;
  latitude: number;
  longitude: number;
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

  // Buscar municípios no banco de dados
  const searchMunicipalities = async (term: string) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using any cast because municipalities table types are not yet generated
      const supabaseClient = supabase as any;
      const { data, error } = await supabaseClient
        .from('municipalities')
        .select('nome, latitude, longitude')
        .ilike('nome', `%${term}%`)
        .order('nome')
        .limit(10);

      if (error) {
        console.error('Error searching municipalities:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar municípios',
          description: 'Não foi possível carregar as sugestões',
        });
        setSuggestions([]);
        return;
      }

      if (data) {
        const municipalities = data as Municipality[];
        const locations: Location[] = municipalities.map(m => ({
          lat: m.latitude,
          lng: m.longitude,
          name: m.nome
        }));
        setSuggestions(locations);
      }
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para evitar muitas requisições
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMunicipalities(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);
  };

  const handleSelectLocation = (location: Location) => {
    setSearchTerm(location.name);
    setIsSearching(false);
    onLocationSelect(location);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Digite o nome da cidade..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsSearching(true)}
          className="pl-10 pr-4 h-12 text-base border-emerald-200 focus:border-emerald-500"
        />
      </div>

      {isSearching && isLoading && (
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
