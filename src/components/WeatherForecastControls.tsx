import { useWindyMapStore } from "@/store/windyMapStore";
import { Wind, Thermometer, CloudRain } from "lucide-react";

const WeatherForecastControls = () => {
  const { currentLayer, setCurrentLayer } = useWindyMapStore();

  const layers = [
    {
      id: "rain" as const,
      name: "Nuvens e Precipitação",
      shortName: "Chuva",
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
      shortName: "Ventos",
      icon: Wind,
      color: "#50C878",
    },
  ];

  return (
    <div className="flex w-[100%] justify-center gap-2 xl:flex-col lg:flex-col md:row sm:row">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = currentLayer === layer.id;

        return (
          <button
            key={layer.id}
            onClick={() => setCurrentLayer(layer.id)}
            className={`
              flex gap-2 text-center justify-center px-3 py-4 rounded-md text-xs font-medium transition-all border border-slate-200 whitespace-nowrap md:w-[500px] lg:w-auto sm:w-[500px] md:h-[50px]
              ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900 border border-slate-200/50 "
              }
            `}
            style={isActive ? { borderLeft: `3px solid ${layer.color}` } : {}}
            title={layer.name}
          >
            <Icon
              className="w-4 h-4 flex-shrink-0"
              style={{ color: layer.color }}
            />
            <span className="text-center flex-1">{layer.shortName}</span>
          </button>
        );
      })}
    </div>
  );
};

export default WeatherForecastControls;
