import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Sun,
  Wind,
  CloudRain,
  Zap,
  Droplets,
  Thermometer,
  Eye,
  CloudOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAlertPreferences } from "@/store/alertPreferencesStore";
import AlertSettingsDialog from "./AlertSettingsDialog";

interface WeatherAlertsProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

type Alert = {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

export default function WeatherAlerts({ location }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { preferences } = useAlertPreferences();

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        // Buscar dados climáticos
        const { data: weatherData, error: weatherError } =
          await supabase.functions.invoke("fetch-openweathermap-current", {
            body: { lat: location.lat, lon: location.lng },
          });

        if (weatherError) throw weatherError;

        // Buscar dados de poluição do ar
        const { data: pollutionData, error: pollutionError } =
          await supabase.functions.invoke("fetch-air-pollution", {
            body: { lat: location.lat, lon: location.lng },
          });

        if (weatherData) {
          const generatedAlerts = generateAlerts(weatherData, pollutionData, preferences);
          setAlerts(generatedAlerts);
        }
      } catch (err) {
        console.error("Erro ao buscar dados climáticos:", err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location.lat, location.lng]);

  const generateAlerts = (weatherData: any, pollutionData?: any, prefs?: any): Alert[] => {
    const alerts: Alert[] = [];
    
    // Usar preferências padrão se não fornecidas
    const p = prefs || {
      highTempThreshold: 30,
      lowTempThreshold: 10,
      enableTempAlerts: true,
      strongWindThreshold: 8.3,
      enableWindAlerts: true,
      enableRainAlerts: true,
      enableAirQualityAlerts: true,
      airQualityThreshold: 3,
      enableSolarAlerts: true,
      enableThunderstormAlerts: true,
      enableHumidityAlerts: true,
      highHumidityThreshold: 80,
    };

    // Dados principais da API OpenWeatherMap
    const temp = weatherData.main?.temp || 0;
    const humidity = weatherData.main?.humidity || 0;
    const windSpeed = weatherData.wind?.speed || 0;
    const visibility = weatherData.visibility || 10000;
    const weatherMain = weatherData.weather?.[0]?.main || "";
    const weatherDesc = weatherData.weather?.[0]?.description || "";

    // Dados de poluição do ar (índice AQI de 1-5, onde 5 é muito poluído)
    const aqi = pollutionData?.list?.[0]?.main?.aqi || 0;
    const components = pollutionData?.list?.[0]?.components || {};

    // Alerta de poluição do ar (AQI >= threshold configurado)
    if (p.enableAirQualityAlerts && aqi >= p.airQualityThreshold) {
      const aqiLabels = [
        "",
        "Boa",
        "Razoável",
        "Moderada",
        "Ruim",
        "Muito Ruim",
      ];
      const aqiLevel = aqiLabels[aqi] || "Desconhecida";

      let description = `Qualidade do ar: ${aqiLevel}. `;
      if (aqi >= 4) {
        description +=
          "Evite atividades ao ar livre prolongadas, especialmente exercícios";
      } else {
        description += "Pessoas sensíveis devem limitar atividades ao ar livre";
      }

      alerts.push({
        id: "air-pollution",
        icon: CloudOff,
        title: "Alerta de Poluição do Ar",
        description,
        color: aqi >= 4 ? "text-red-900" : "text-amber-900",
        bgColor: aqi >= 4 ? "bg-red-50" : "bg-amber-50",
        borderColor: aqi >= 4 ? "border-red-200" : "border-amber-200",
      });
    }

    // Alta temperatura (acima do limiar configurado)
    if (p.enableTempAlerts && temp > p.highTempThreshold) {
      alerts.push({
        id: "high-temp",
        icon: Thermometer,
        title: "Temperatura Elevada",
        description: `${Math.round(
          temp
        )}°C - Mantenha-se hidratado e evite exposição prolongada ao sol`,
        color: "text-red-900",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      });
    }

    // Baixa temperatura (abaixo do limiar configurado)
    if (p.enableTempAlerts && temp < p.lowTempThreshold) {
      alerts.push({
        id: "low-temp",
        icon: Thermometer,
        title: "Temperatura Baixa",
        description: `${Math.round(
          temp
        )}°C - Agasalhe-se bem e proteja-se do frio`,
        color: "text-blue-900",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      });
    }

    // Alta radiação solar
    if (p.enableSolarAlerts && weatherMain === "Clear" && temp > 25) {
      alerts.push({
        id: "high-radiation",
        icon: Sun,
        title: "Alta Radiação Solar",
        description:
          "Use protetor solar FPS 30+ e evite exposição entre 10h-16h",
        color: "text-orange-900",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      });
    }

    // Ventos fortes (acima do limiar configurado)
    if (p.enableWindAlerts && windSpeed > p.strongWindThreshold) {
      const windKmh = Math.round(windSpeed * 3.6);
      alerts.push({
        id: "strong-wind",
        icon: Wind,
        title: "Ventos Fortes",
        description: `Rajadas de até ${windKmh} km/h. Cuidado com objetos soltos e árvores`,
        color: "text-cyan-900",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
      });
    }

    // Possibilidade de chuva
    if (p.enableRainAlerts && (weatherMain === "Rain" || weatherMain === "Drizzle")) {
      alerts.push({
        id: "rain",
        icon: CloudRain,
        title: "Chuva Prevista",
        description: `${weatherDesc} - Leve guarda-chuva e dirija com cautela`,
        color: "text-blue-900",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      });
    }

    // Tempestade com raios
    if (p.enableThunderstormAlerts && weatherMain === "Thunderstorm") {
      alerts.push({
        id: "thunderstorm",
        icon: Zap,
        title: "Alerta de Tempestade",
        description: "Evite áreas abertas e desligue aparelhos eletrônicos",
        color: "text-purple-900",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      });
    }

    // Alta umidade (acima do limiar configurado)
    if (p.enableHumidityAlerts && humidity > p.highHumidityThreshold) {
      alerts.push({
        id: "high-humidity",
        icon: Droplets,
        title: "Umidade Elevada",
        description: `${humidity}% - Sensação de abafamento. Mantenha ambientes ventilados`,
        color: "text-teal-900",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
      });
    }

    // Baixa visibilidade (abaixo de 5000 metros)
    if (visibility < 5000) {
      const visKm = (visibility / 1000).toFixed(1);
      alerts.push({
        id: "low-visibility",
        icon: Eye,
        title: "Visibilidade Reduzida",
        description: `${visKm} km - Dirija com cuidado e use luzes baixas`,
        color: "text-slate-900",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
      });
    }

    // Se não houver alertas, adicionar mensagem positiva
    if (alerts.length === 0) {
      alerts.push({
        id: "all-clear",
        icon: Sun,
        title: "Condições Favoráveis",
        description: "Clima agradável sem alertas no momento. Aproveite o dia!",
        color: "text-emerald-900",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
      });
    }

    return alerts;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mt-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Dicas e Alertas
        </h3>
        <div className="text-xs text-slate-500 text-center py-4">
          Carregando alertas...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Dicas e Alertas
        </h3>
      </div>
      
      <AlertSettingsDialog />
      
      <div className="space-y-2 mt-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-2 p-2 ${alert.bgColor} border ${alert.borderColor} rounded-lg`}
            >
              <Icon
                className={`w-4 h-4 ${alert.color.replace(
                  "900",
                  "600"
                )} mt-0.5 flex-shrink-0`}
              />
              <div className="flex-1">
                <p className={`text-xs font-semibold ${alert.color}`}>
                  {alert.title}
                </p>
                <p
                  className={`text-xs ${alert.color.replace(
                    "900",
                    "700"
                  )} mt-0.5`}
                >
                  {alert.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
