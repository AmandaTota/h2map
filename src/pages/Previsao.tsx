import { useState } from "react";
import WeatherForecast from "@/components/WeatherForecast";
import Navigation from "@/components/Navigation";
import LocationSearch from "@/components/LocationSearch";

interface Location {
  lat: number;
  lng: number;
  name: string;
}

export default function Previsao() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <LocationSearch
                onLocationSelect={setSelectedLocation}
                startEmpty
              />
            </div>
            <div className="lg:col-span-2">
              {selectedLocation ? (
                <WeatherForecast location={selectedLocation} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
                  <p className="text-slate-600 text-center">
                    Selecione uma cidade para ver a previsão do tempo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
