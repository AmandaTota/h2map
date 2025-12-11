import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  useWindyMapStore, 
  WEATHER_PRESETS, 
  WeatherLayer 
} from "@/store/windyMapStore";
import {
  Wind,
  Thermometer,
  CloudRain,
  Cloud,
  Gauge,
  Droplets,
  Waves,
  RefreshCw,
  Link2,
  Link2Off,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import { useState } from "react";

const LAYER_ICONS: Record<WeatherLayer, any> = {
  wind: Wind,
  temp: Thermometer,
  rain: CloudRain,
  clouds: Cloud,
  pressure: Gauge,
  humidity: Droplets,
  waves: Waves,
  swell: Waves,
  gust: Wind,
};

const WindyMapControls = () => {
  const {
    syncEnabled,
    currentLayer,
    showLabels,
    showParticles,
    showIsoliness,
    setSyncEnabled,
    setCurrentLayer,
    setShowLabels,
    setShowParticles,
    setShowIsolines,
  } = useWindyMapStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className="p-4 bg-white/95 backdrop-blur-sm border-emerald-200 mb-4">
      <div className="space-y-4">
        {/* Título e Sincronização */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Controles dos Mapas
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sync-maps" className="text-sm text-slate-700">
              {syncEnabled ? (
                <>
                  <Link2 className="w-4 h-4 inline mr-1 text-emerald-600" />
                  Sincronizados
                </>
              ) : (
                <>
                  <Link2Off className="w-4 h-4 inline mr-1 text-slate-400" />
                  Independentes
                </>
              )}
            </Label>
            <Switch
              id="sync-maps"
              checked={syncEnabled}
              onCheckedChange={setSyncEnabled}
            />
          </div>
        </div>

        {/* Presets de Camadas */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Camadas Meteorológicas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WEATHER_PRESETS.map((preset) => {
              const Icon = LAYER_ICONS[preset.layer];
              const isActive = currentLayer === preset.layer;
              
              return (
                <Button
                  key={preset.layer}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentLayer(preset.layer)}
                  className={`flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "hover:bg-emerald-50"
                  }`}
                  title={preset.description}
                >
                  <span className="text-lg">{preset.icon}</span>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{preset.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Controles Avançados */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between"
          >
            <span className="text-sm font-semibold text-slate-700">
              Opções Avançadas
            </span>
            <RefreshCw
              className={`w-4 h-4 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </Button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 border-t pt-3">
              {/* Rótulos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showLabels ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                  <Label htmlFor="show-labels" className="text-sm text-slate-700">
                    Rótulos de Grade
                  </Label>
                </div>
                <Switch
                  id="show-labels"
                  checked={showLabels}
                  onCheckedChange={setShowLabels}
                />
              </div>

              {/* Partículas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showParticles ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                  <Label htmlFor="show-particles" className="text-sm text-slate-700">
                    Animação de Partículas
                  </Label>
                </div>
                <Switch
                  id="show-particles"
                  checked={showParticles}
                  onCheckedChange={setShowParticles}
                />
              </div>

              {/* Isolinhas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showIsoliness ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                  <Label htmlFor="show-isolines" className="text-sm text-slate-700">
                    Linhas Isobáricas
                  </Label>
                </div>
                <Switch
                  id="show-isolines"
                  checked={showIsoliness}
                  onCheckedChange={setShowIsolines}
                />
              </div>
            </div>
          )}
        </div>

        {/* Informações */}
        {syncEnabled && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs text-emerald-800">
              <strong>Modo Sincronizado:</strong> Ambos os mapas A e B compartilham
              a mesma camada e movimentos. Use para comparar regiões com as mesmas
              condições meteorológicas.
            </p>
          </div>
        )}

        {/* Badge com camada atual */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-sm">
            Camada Ativa:{" "}
            <span className="font-bold ml-1">
              {WEATHER_PRESETS.find((p) => p.layer === currentLayer)?.name ||
                "Vento"}
            </span>
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default WindyMapControls;
