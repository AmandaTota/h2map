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
    <div className="flex flex-col md:flex-row gap-2 md:gap-3 lg:gap-4">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = currentLayer === layer.id;

        return (
          <button
            key={layer.id}
            onClick={() => setCurrentLayer(layer.id)}
            className={`
              m-3 sm:m-2 sm:mb-[10px] xs:w-[10px] sm:h-2 lg:mr-[50px] flex items-center justify-start md:justify-center gap-2 md:gap-3 
              px-3 py-2 md:px-4 md:py-3 lg:px-5 lg:py-3.5
              rounded-lg md:rounded-xl
              text-xs md:text-sm lg:text-base
              font-medium transition-all 
              flex-1 md:flex md:min-w-[140px] lg:min-w-[160px]
              border hover:scale-105 active:scale-95
              ${
                isActive
                  ? "bg-white text-slate-900 shadow-md ring-2 ring-offset-1"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-900 hover:shadow-sm"
              }
            `}
            style={
              isActive
                ? {
                    borderLeft: `4px solid ${layer.color}`,
                    ringColor: `${layer.color}20`,
                  }
                : {}
            }
          >
            <Icon
              className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0"
              style={{ color: layer.color }}
            />
            <span className="truncate font-semibold">{layer.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default WindyMapControls;
