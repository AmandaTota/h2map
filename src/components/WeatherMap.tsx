import { useMemo, useEffect, useState } from "react";
import { Cloud, MapPin, Loader2 } from "lucide-react";

interface WeatherMapProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  main: string;
}

export default function WeatherMap({ location }: WeatherMapProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "6d8ebc864826b26923ca9f1309017215";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric&lang=pt_br`
        );
        
        if (response.ok) {
          const data = await response.json();
          setWeatherData({
            temp: data.main.temp,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            description: data.weather[0].description,
            main: data.weather[0].main,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do tempo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location.lat, location.lng]);

  // URL do mapa com marcador
  const mapUrl = useMemo(() => {
    const bbox = `${location.lng - 0.15},${location.lat - 0.15},${location.lng + 0.15},${location.lat + 0.15}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${location.lat},${location.lng}`;
  }, [location.lat, location.lng]);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Carregando mapa...
        </div>
      )}
      
      <div className="rounded-lg overflow-hidden shadow-md">
        <iframe
          title={`Mapa de ${location.name}`}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          style={{
            border: "none",
            display: "block",
          }}
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* Weather info overlay */}
      {weatherData && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Temperatura</p>
              <p className="text-xl font-bold text-slate-900">
                {weatherData.temp.toFixed(1)}°C
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Umidade</p>
              <p className="text-xl font-bold text-slate-900">
                {weatherData.humidity}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Vento</p>
              <p className="text-xl font-bold text-slate-900">
                {weatherData.windSpeed.toFixed(1)} m/s
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-slate-700 mt-3 capitalize">
            {weatherData.description}
          </p>
        </div>
      )}
    </div>
  );
}


