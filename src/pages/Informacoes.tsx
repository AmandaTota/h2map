import Navigation from '@/components/Navigation';
import InfoCarousel from '@/components/InfoCarousel';
import NewsSidebar from '@/components/NewsSidebar';

export default function Informacoes() {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Informações / cards */}
              <InfoCarousel />
            </div>

            <div className="lg:col-span-1">
              <NewsSidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

