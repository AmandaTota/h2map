import { MapPin } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Map from '@/components/MapGridAnimated';

export default function Dashboard() {
  return (
    <>
      <Navigation />
      
<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
  <div className="max-w-7xl mx-auto p-8">
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-emerald-600" />
        Mapa Interativo
      </h2>
      <Map />
    </div>
  </div>
</div>

    </>
  );
}
