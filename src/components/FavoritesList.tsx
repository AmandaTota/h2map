import { Star, Trash2 } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';

interface FavoritesListProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
}

const FavoritesList = ({ onLocationSelect }: FavoritesListProps) => {
  const { favorites, removeFavorite } = useLocationStore();

  if (favorites.length === 0) {
    return (
      <div className="text-center text-sm text-slate-500 mt-4">
        Nenhuma cidade favorita ainda
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {favorites.map((location, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 transition-colors group"
        >
          <button
            onClick={() => onLocationSelect(location)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
            <span className="text-sm text-slate-700 group-hover:text-slate-900 truncate">
              {location.name}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFavorite(location.name);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
            title="Remover favorito"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
