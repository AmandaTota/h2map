import { Clock, Trash2 } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";
import { Button } from "@/components/ui/button";

interface LocationHistoryProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
}

export default function LocationHistory({ onLocationSelect }: LocationHistoryProps) {
  const { history, clearHistory, addToHistory } = useLocationStore();

  const handleSelectLocation = (location: any) => {
    onLocationSelect(location);
    addToHistory(location);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 mt-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Histórico
        </h3>
        <button
          onClick={clearHistory}
          className="text-xs text-slate-500 hover:text-red-600 transition-colors"
        >
          Limpar
        </button>
      </div>
      <div className="space-y-2">
        {history.map((location, index) => (
          <button
            key={`${location.name}-${index}`}
            onClick={() => handleSelectLocation(location)}
            className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors text-sm text-slate-700 hover:text-blue-700 border border-transparent hover:border-blue-200"
          >
            <div className="truncate">{location.name}</div>
            <div className="text-xs text-slate-500">
              {location.lat.toFixed(2)}° / {location.lng.toFixed(2)}°
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
