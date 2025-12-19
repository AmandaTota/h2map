import { useState } from "react";
import { Settings, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlertPreferences } from "@/store/alertPreferencesStore";
import { motion } from "framer-motion";

export default function AlertSettingsDialog() {
  const [open, setOpen] = useState(false);
  const { preferences, setPreferences, resetPreferences } = useAlertPreferences();

  const handleReset = () => {
    resetPreferences();
  };

  const handleChange = (key: string, value: any) => {
    setPreferences({ [key]: value });
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="w-full justify-start text-slate-700 hover:text-blue-600 hover:bg-blue-50"
      >
        <Settings className="w-4 h-4 mr-2" />
        Configurar Alertas
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Configurar Alertas
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Temperatura */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tempAlerts"
                checked={preferences.enableTempAlerts}
                onChange={(e) =>
                  handleChange("enableTempAlerts", e.target.checked)
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <label
                htmlFor="tempAlerts"
                className="text-sm font-semibold text-slate-900 cursor-pointer"
              >
                🌡️ Alertas de Temperatura
              </label>
            </div>

            {preferences.enableTempAlerts && (
              <div className="ml-6 space-y-2">
                <div>
                  <label className="text-xs text-slate-600">
                    Temperatura Alta (°C)
                  </label>
                  <input
                    type="number"
                    value={preferences.highTempThreshold}
                    onChange={(e) =>
                      handleChange("highTempThreshold", parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">
                    Temperatura Baixa (°C)
                  </label>
                  <input
                    type="number"
                    value={preferences.lowTempThreshold}
                    onChange={(e) =>
                      handleChange("lowTempThreshold", parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Vento */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="windAlerts"
                checked={preferences.enableWindAlerts}
                onChange={(e) =>
                  handleChange("enableWindAlerts", e.target.checked)
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <label
                htmlFor="windAlerts"
                className="text-sm font-semibold text-slate-900 cursor-pointer"
              >
                💨 Alertas de Vento
              </label>
            </div>

            {preferences.enableWindAlerts && (
              <div>
                <label className="text-xs text-slate-600">
                  Velocidade de Vento (m/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={preferences.strongWindThreshold}
                  onChange={(e) =>
                    handleChange("strongWindThreshold", parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  ~{(preferences.strongWindThreshold * 3.6).toFixed(0)} km/h
                </p>
              </div>
            )}
          </div>

          {/* Chuva */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rainAlerts"
                checked={preferences.enableRainAlerts}
                onChange={(e) =>
                  handleChange("enableRainAlerts", e.target.checked)
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <label
                htmlFor="rainAlerts"
                className="text-sm font-semibold text-slate-900 cursor-pointer"
              >
                🌧️ Alertas de Chuva
              </label>
            </div>
          </div>

          {/* Poluição do Ar */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="airAlerts"
                checked={preferences.enableAirQualityAlerts}
                onChange={(e) =>
                  handleChange("enableAirQualityAlerts", e.target.checked)
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <label
                htmlFor="airAlerts"
                className="text-sm font-semibold text-slate-900 cursor-pointer"
              >
                💨 Alertas de Qualidade do Ar
              </label>
            </div>

            {preferences.enableAirQualityAlerts && (
              <div>
                <label className="text-xs text-slate-600">
                  Nível Mínimo de Alerta (1-5)
                </label>
                <select
                  value={preferences.airQualityThreshold}
                  onChange={(e) =>
                    handleChange("airQualityThreshold", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value={1}>1 - Boa</option>
                  <option value={2}>2 - Razoável</option>
                  <option value={3}>3 - Moderada</option>
                  <option value={4}>4 - Ruim</option>
                  <option value={5}>5 - Muito Ruim</option>
                </select>
              </div>
            )}
          </div>

          {/* Solar */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="solarAlerts"
                checked={preferences.enableSolarAlerts}
                onChange={(e) =>
                  handleChange("enableSolarAlerts", e.target.checked)
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <label
                htmlFor="solarAlerts"
                className="text-sm font-semibold text-slate-900 cursor-pointer"
              >
                ☀️ Alertas de Radiação Solar
              </label>
            </div>
          </div>

          {/* Tempestade */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="stormAlerts"
                checked={preferences.enableThunderstormAlerts}
                onChange={(e) =>
                  handleChange("enableThunderstormAlerts", e.target.checked)
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <label
                htmlFor="stormAlerts"
                className="text-sm font-semibold text-slate-900 cursor-pointer"
              >
                ⚡ Alertas de Tempestade
              </label>
            </div>
          </div>

          {/* Umidade */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="humidityAlerts"
                checked={preferences.enableHumidityAlerts}
                onChange={(e) =>
                  handleChange("enableHumidityAlerts", e.target.checked)
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <label
                htmlFor="humidityAlerts"
                className="text-sm font-semibold text-slate-900 cursor-pointer"
              >
                💧 Alertas de Umidade
              </label>
            </div>

            {preferences.enableHumidityAlerts && (
              <div>
                <label className="text-xs text-slate-600">
                  Umidade Alta (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={preferences.highHumidityThreshold}
                  onChange={(e) =>
                    handleChange("highHumidityThreshold", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Padrões
          </Button>
          <Button
            onClick={() => setOpen(false)}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
