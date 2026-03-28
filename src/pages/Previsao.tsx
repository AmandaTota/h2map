import WeatherForecast from "@/components/WeatherForecast";
import Navigation from "@/components/Navigation";
import LocationSearch from "@/components/LocationSearch";
import { useLocationStore } from "@/store/locationStore";

export default function Previsao() {
  const { selectedLocation } = useLocationStore();

  const location = selectedLocation ?? {
    lat: -23.5505,
    lng: -46.6333,
    name: "São Paulo, SP",
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <LocationSearch />
            </div>
            <div className="lg:col-span-2">
              <WeatherForecast location={location} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
