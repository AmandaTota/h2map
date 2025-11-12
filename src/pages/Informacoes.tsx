import Navigation from '@/components/Navigation';
import InfoCarousel from '@/components/InfoCarousel';

export default function Informacoes() {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Carousel em seu próprio container separado */}
          <InfoCarousel />
        </div>
      </div>
    </>
  );
}

