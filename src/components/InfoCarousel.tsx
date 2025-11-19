import { useState } from 'react';
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
    image: './public/h2card.png',
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
      'Nas últimas décadas, a temperatura média global tem apresentado um crescimento significativo, fenômeno',
  },
  {
    id: 'h2-preservacao',
    title: 'H₂ Verde e Preservação Ambiental',
    short: 'Impactos ambientais positivos da produção de hidrogênio verde.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=60&auto=format&fit=crop',
    content:
      'A produção de hidrogênio verde contribui significativamente para a preservação ambiental ao eliminar emissões de CO₂ no processo de eletrólise. Diferente do hidrogênio cinza (produzido a partir de combustíveis fósseis), o H₂ verde utiliza apenas água e energia renovável, não gerando poluentes atmosféricos ou resíduos tóxicos. Além disso, plantas de produção podem ser integradas a parques eólicos e solares, otimizando o uso do solo e reduzindo a pressão sobre ecossistemas. A transição para hidrogênio verde em setores industriais pesados (siderurgia, química, transporte) diminui drasticamente a poluição do ar e hídrica, protegendo a biodiversidade e a saúde dos ecossistemas locais. Seu uso também reduz a dependência de extração de combustíveis fósseis, preservando habitats naturais ameaçados pela mineração e perfuração.',
  },
];

export default function InfoCarousel() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof cards[number] | null>(null);

  const handleCardClick = (c: typeof cards[number]) => {
    setSelected(c);
    setOpen(true);
  };

  return (
    <div className="bg-white/50 rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Informações</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <article
            key={c.id}
            className="group cursor-pointer overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow bg-white"
            onClick={() => handleCardClick(c)}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(c)}
            role="button"
            tabIndex={0}
            aria-labelledby={`title-${c.id}`}
          >
            <div className="relative h-44 sm:h-56">
              <img src={c.image} alt={c.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <h3 id={`title-${c.id}`} className="text-lg font-bold drop-shadow">{c.title}</h3>
                <p className="text-xs opacity-90 hidden sm:block max-w-xs">{c.short}</p>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm text-slate-700 line-clamp-3">{c.content}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCardClick(c); }}
                  className="text-emerald-700 hover:text-emerald-900 font-medium text-sm"
                >
                  Saiba mais
                </button>
              </div>
            </div>
          </article>
        ))}
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
