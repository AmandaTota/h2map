import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  // Localizações brasileiras de exemplo para hidrogênio verde
  const brazilianLocations: Location[] = [
    { lat: -23.5505, lng: -46.6333, name: 'São Paulo, SP' },
    { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro, RJ' },
    { lat: -19.9167, lng: -43.9345, name: 'Belo Horizonte, MG' },
    { lat: -3.7172, lng: -38.5433, name: 'Fortaleza, CE' },
    { lat: -8.0476, lng: -34.8770, name: 'Recife, PE' },
    { lat: -12.9714, lng: -38.5014, name: 'Salvador, BA' },
    { lat: -15.7801, lng: -47.9292, name: 'Brasília, DF' },
    { lat: -30.0346, lng: -51.2177, name: 'Porto Alegre, RS' },
    { lat: -25.4284, lng: -49.2733, name: 'Curitiba, PR' },
    { lat: -5.7945, lng: -35.2110, name: 'Natal, RN' },
    { lat: -9.6658, lng: -35.7350, name: 'Maceió, AL' },
    { lat: -2.5297, lng: -44.3028, name: 'São Luís, MA' },
    { lat: -27.5954, lng: -48.5480, name: 'Florianópolis, SC' },
    { lat: -20.3155, lng: -40.3128, name: 'Vitória, ES' },
    { lat: -1.4558, lng: -48.4902, name: 'Belém, PA' },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);

    if (value.trim().length > 0) {
      const filtered = brazilianLocations.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
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

      {isSearching && suggestions.length > 0 && (
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

      {isSearching && searchTerm.length > 0 && suggestions.length === 0 && (
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
