import { useEffect, useRef, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const cards = [
  {
    id: 'hidrogenio',
    title: 'O que é hidrogênio verde?',
    short: 'Hidrogênio produzido a partir de fontes renováveis.',
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1200&q=60&auto=format&fit=crop',
    content:
      'Hidrogênio verde é produzido por eletrólise da água usando eletricidade gerada por fontes renováveis (eólica, solar, hidro). Não emite CO₂ durante a produção e é visto como um vetor energético crucial para descarbonizar setores difíceis de eletrificar diretamente.',
  },
  {
    id: 'sustentabilidade',
    title: 'O que é sustentabilidade',
    short: 'Equilíbrio entre necessidades presentes e preservação futura.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=60&auto=format&fit=crop',
    content:
      'Sustentabilidade é a capacidade de atender às necessidades atuais sem comprometer a capacidade das futuras gerações atenderem às suas próprias. Engloba aspectos ambientais, sociais e econômicos, promovendo uso responsável de recursos, justiça social e desenvolvimento econômico de longo prazo.',
  },
  {
    id: 'energia',
    title: 'Energia limpa',
    short: 'Fontes de energia com baixo ou nenhum impacto de carbono.',
    image: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=1200&q=60&auto=format&fit=crop',
    content:
      'Energia limpa refere-se a fontes que geram pouca ou nenhuma emissão de gases de efeito estufa durante a geração de eletricidade — por exemplo, solar, eólica, hidroelétrica e geotérmica. A transição para energia limpa é essencial para reduzir as mudanças climáticas e melhorar a qualidade do ar.',
  },
  {
    id: 'preservacao',
    title: 'Preservação ambiental',
    short: 'Ações para conservar ecossistemas e biodiversidade.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=60&auto=format&fit=crop',
    content:
      'Preservação ambiental engloba práticas e políticas que protegem habitats naturais, espécies e serviços ecossistêmicos. Inclui áreas protegidas, restauração ecológica e manejo sustentável de recursos para garantir a saúde dos ecossistemas.',
  },
  {
    id: 'descarbonizacao',
    title: 'Descarbonização mundial',
    short: 'Redução das emissões de CO₂ e transição energética.',
    image: 'https://images.unsplash.com/photo-1509394727068-5a69a7e0d2f8?w=1200&q=60&auto=format&fit=crop',
    content:
      'Descarbonização significa reduzir as emissões líquidas de dióxido de carbono em nível global, por meio de eficiência energética, eletrificação, uso de fontes renováveis e tecnologias de captura de carbono. É crítico para limitar o aquecimento global.',
  },
  {
    id: 'aquecimento',
    title: 'Aumento da temperatura mundial',
    short: 'Impactos do aquecimento global e tendências recentes.',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=60&auto=format&fit=crop',
    content:
      'O aumento da temperatura média global está ligado à queima de combustíveis fósseis e ao desmatamento. Isso causa eventos climáticos extremos, elevação do nível do mar e impactos em agricultura, saúde e biodiversidade.',
  },
];

export default function InfoCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const autoplayRef = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof cards[number] | null>(null);

  useEffect(() => {
    if (!api) return;

    const stop = () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    const start = () => {
      stop();
      autoplayRef.current = window.setInterval(() => api.scrollNext(), 4000);
    };

    start();

    const handleVisibility = () => {
      if (document.hidden) stop(); else start();
    };

    // keep selected index in sync with embla
    const updateSelected = () => {
      try {
        setSelectedIndex(api.selectedScrollSnap());
      } catch (e) {
        // ignore
      }
    };

    api.on('select', updateSelected);
    updateSelected();

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      api.off('select', updateSelected);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [api]);

  const handleCardClick = (c: typeof cards[number]) => {
    setSelected(c);
    setOpen(true);
  };

  return (
    <div className="bg-white/50 rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Informações</h2>

      <div className="relative">
        <Carousel setApi={(a) => setApi(a)} opts={{ loop: true }} className="w-full">
          {/* arrows positioned like bootstrap (overlay) */}
          <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/50" />
          <CarouselNext className="right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/50" />

          {/* each slide occupies full width like bootstrap */}
          <CarouselContent className="items-stretch">
            {cards.map((c, idx) => (
              <CarouselItem key={c.id} className="min-w-full">
                <div
                  onClick={() => handleCardClick(c)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(c)}
                  className="relative w-full h-[420px] md:h-[480px] lg:h-[520px] cursor-pointer overflow-hidden"
                >
                  <img src={c.image} alt={c.title} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-end justify-left px-6 m-1">
                    <div className="max-w-2xl text-justify text-white mb-3 ml-3">
                      <h3 className="text-2xl md:text-3xl font-bold drop-shadow mb-2">{c.title}</h3>
                      <p className="text-sm md:text-base opacity-90 mb-4 font-bold">{c.short}</p>
                      <p className="hidden md:block text-sm text-white/90 mb-1 font-bold">{c.content.slice(0, 220)}...</p>
                    </div>
                      <div className="flex items-center justify-center gap-3">
                        <button className="m-[38px] ml-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded" onClick={(e) => { e.stopPropagation(); handleCardClick(c); }}>Saiba mais</button>
                      </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots / indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {api?.scrollSnapList().map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-2 w-8 rounded-full transition-all ${selectedIndex === i ? 'bg-emerald-700 w-10' : 'bg-emerald-200'}`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        {selected && (
          <DialogContent>
            <DialogTitle>{selected.title}</DialogTitle>
            <DialogDescription className="mt-2 whitespace-pre-line">{selected.content}</DialogDescription>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
