import { useWindyMapStore } from "@/store/windyMapStore";
import { Wind, Thermometer, CloudRain } from "lucide-react";

const WindyMapControls = () => {
  const { currentLayer, setCurrentLayer } = useWindyMapStore();

  const layers = [
    {
      id: "rain" as const,
      name: "Nuvens e Precipitação",
      shortName: "Nuvens/Chuva",
      icon: CloudRain,
      color: "#4A90E2",
    },
    {
      id: "temp" as const,
      name: "Temperatura",
      shortName: "Temperatura",
      icon: Thermometer,
      color: "#E85D45",
    },
    {
      id: "wind" as const,
      name: "Rajadas de Vento",
      shortName: "Rajadas",
      icon: Wind,
      color: "#50C878",
    },
  ];

  return (
    <div className="flex gap-2">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = currentLayer === layer.id;

        return (
          <button
            key={layer.id}
            onClick={() => setCurrentLayer(layer.id)}
            className={`
              flex items-center w-[100px] flex-wrap mb-4 mt-4 border w-full  gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
              }
            `}
            style={isActive ? { borderLeft: `4px solid ${layer.color}` } : {}}
          >
            <Icon className="w-5 h-5" style={{ color: layer.color }} />
            <span>{layer.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default WindyMapControls;
