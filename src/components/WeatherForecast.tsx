import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Sun,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sunrise,
  Sunset,
  Loader2
} from 'lucide-react';

interface WeatherForecast {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    clouds: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    sunrise: number;
    sunset: number;
    timezone: number;
  };
  forecast: Array<{
    date: string;
    dayName: string;
    temp: {
      min: number;
      max: number;
      avg: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    humidity: number;
    windSpeed: number;
    pressure: number;
    rainfall: number;
    clouds: number;
  }>;
}

interface WeatherForecastProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

const WeatherForecastComponent = ({ location }: WeatherForecastProps) => {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    if (location) {
      loadForecast();
    }
  }, [location.lat, location.lng]);

  const loadForecast = async () => {
    setLoadingForecast(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-weather-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lng,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weather forecast');
      }

      const forecastData = await response.json();
      setForecast(forecastData);
    } catch (error) {
      console.error('Error loading forecast:', error);
    } finally {
      setLoadingForecast(false);
    }
  };

  if (loadingForecast) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-slate-600">Carregando previsão do tempo...</span>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6"
    >
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Sun className="w-5 h-5 mr-2 text-emerald-600" />
        Previsão do Tempo para {forecast.location.name}
      </h2>

      {/* Current Weather Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border border-blue-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Tempo Atual</h3>
            <p className="text-slate-600 capitalize">{forecast.current.weather.description}</p>
          </div>
          <img
            src={`https://openweathermap.org/img/wn/${forecast.current.weather.icon}@2x.png`}
            alt={forecast.current.weather.description}
            className="w-20 h-20"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-red-600" />
              <span className="text-xs text-slate-600">Temperatura</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{forecast.current.temp.toFixed(1)}°C</p>
            <p className="text-xs text-slate-600">Sensação: {forecast.current.feelsLike.toFixed(1)}°C</p>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600">Umidade</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{forecast.current.humidity}%</p>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600">Vento</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{forecast.current.windSpeed.toFixed(1)} m/s</p>
            <p className="text-xs text-slate-600">Dir: {forecast.current.windDirection}°</p>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-slate-600" />
              <span className="text-xs text-slate-600">Pressão</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{forecast.current.pressure}</p>
            <p className="text-xs text-slate-600">hPa</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/60 backdrop-blur rounded-lg p-3 flex items-center gap-3">
            <Sunrise className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-xs text-slate-600">Nascer do Sol</p>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(forecast.current.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-lg p-3 flex items-center gap-3">
            <Sunset className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-xs text-slate-600">Pôr do Sol</p>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(forecast.current.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="text-md font-semibold text-slate-900 mb-3">Próximos 5 Dias</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {forecast.forecast.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-slate-900">{day.dayName}</p>
                <p className="text-xs text-slate-600">{format(new Date(day.date), 'dd/MM')}</p>
              </div>
              
              <div className="flex justify-center mb-3">
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`}
                  alt={day.weather.description}
                  className="w-16 h-16"
                  onError={(e) => {
                    // Fallback para ícone quebrado
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <p className="text-xs text-slate-600 text-center mb-3 capitalize h-8">
                {day.weather.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Temp:</span>
                  <span className="font-semibold text-slate-900">
                    {day.temp.min.toFixed(0)}° / {day.temp.max.toFixed(0)}°
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Umidade:</span>
                  <span className="font-semibold text-slate-900">{day.humidity.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Vento:</span>
                  <span className="font-semibold text-slate-900">{day.windSpeed.toFixed(1)} m/s</span>
                </div>
                {day.rainfall > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Chuva:</span>
                    <span className="font-semibold text-blue-600">{day.rainfall.toFixed(1)} mm</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherForecastComponent;
