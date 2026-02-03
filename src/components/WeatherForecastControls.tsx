import { useWindyMapStore } from "@/store/windyMapStore";
import { Wind, Thermometer, CloudRain } from "lucide-react";

const WeatherForecastControls = () => {
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
    <div className="flex flex-col gap-2 flex-wrap">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = currentLayer === layer.id;

        return (
          <button
            key={layer.id}
            onClick={() => setCurrentLayer(layer.id)}
            className={`
              flex items-center gap-2 px-3 py-2 w-[200px] rounded-md text-xs font-medium transition-all
              ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900 border border-slate-200/50"
              }
            `}
            style={isActive ? { borderLeft: `3px solid ${layer.color}` } : {}}
            title={layer.name}
          >
            <Icon className="w-4 h-4" style={{ color: layer.color }} />
            <span className="hidden sm:inline">{layer.shortName}</span>
          </button>
        );
      })}
    </div>
  );
};

export default WeatherForecastControls;
