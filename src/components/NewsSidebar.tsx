import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  compact?: boolean; // when true, render a compact block suitable to place below the location card
  title?: string;
  maxItems?: number;
};

type NewsItem = {
  id: string;
  title: string;
  category: "Clima" | "Ambiente" | "Energia" | string;
  time: string;
  summary?: string;
  url?: string;
};

export default function NewsSidebar({
  compact = false,
  title = "Notícias Recentes",
  maxItems = 4,
}: Props) {
  const [loading] = useState(false);

  // Placeholder sample news — swap for real data fetching later
  const sampleNews: NewsItem[] = [
    {
      id: "1",
      title: "Frente fria traz instabilidade para o sul do país",
      category: "Clima",
      time: "2h",
      url: "https://example.com/noticias/frente-fria-sul",
      summary:
        "Previsões apontam chuvas e queda de temperatura nas próximas 48 horas.",
    },
    {
      id: "2",
      title: "Projeto de energia solar avança no interior",
      category: "Energia",
      time: "6h",
      url: "https://example.com/noticias/energia-solar-interno",
      summary: "Nova usina comunitária deve reduzir custo energético local.",
    },
    {
      id: "3",
      title: "Proteção de áreas verdes recebe investimento",
      category: "Ambiente",
      time: "1d",
      url: "https://example.com/noticias/areas-verdes-investimento",
      summary:
        "Recursos irão para recuperação de nascentes e restauração florestal.",
    },
    {
      id: "4",
      title: "Pesquisadores monitoram mudanças climáticas regionais",
      category: "Clima",
      time: "2d",
      url: "https://example.com/noticias/pesquisa-mudancas-climaticas",
      summary: "Estudo aponta tendências de seca em áreas específicas.",
    },
    {
      id: "5",
      title: "Iniciativa de eficiência energética em prédios públicos",
      category: "Energia",
      time: "3d",
      url: "https://example.com/noticias/eficiencia-energetica-predios",
      summary: "Programa piloto deve reduzir consumo em até 20%.",
    },
  ];

  const [newsItems, setNewsItems] = useState<NewsItem[]>(
    sampleNews.slice(0, maxItems)
  );
  const itemsToShow = newsItems.slice(0, maxItems);

  useEffect(() => {
    let mounted = true;
    const rssProxies = [
      // try multiple portals via a simple http proxy that returns the URL content
      "https://r.jina.ai/http://g1.globo.com/index.xml",
      "https://r.jina.ai/http://feeds.bbci.co.uk/news/rss.xml",
      "https://r.jina.ai/http://rss.cnn.com/rss/edition.rss",
    ];

    async function fetchFeeds() {
      try {
        for (const src of rssProxies) {
          try {
            const res = await fetch(src);
            if (!res.ok) continue;
            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "application/xml");
            const items = Array.from(xml.querySelectorAll("item")).map(
              (it, i) => {
                const link = it.querySelector("link")?.textContent || "";
                const guid =
                  it.querySelector("guid")?.textContent ||
                  link ||
                  `${src}-${i}`;
                const title =
                  it.querySelector("title")?.textContent || "Sem título";
                const desc =
                  it.querySelector("description")?.textContent ||
                  it.querySelector("summary")?.textContent ||
                  "";
                const category =
                  it.querySelector("category")?.textContent || "";
                const pub = it.querySelector("pubDate")?.textContent || "";
                return {
                  id: guid,
                  title: title,
                  category: category || "Notícia",
                  time: pub ? new Date(pub).toLocaleString() : "",
                  summary: desc.replace(/<[^>]+>/g, "").trim(),
                  url: link,
                } as NewsItem;
              }
            );

            if (items.length > 0) {
              if (mounted) setNewsItems(items.slice(0, maxItems));
              return;
            }
          } catch (err) {
            // try next source
            continue;
          }
        }
      } catch (err) {
        // ignore and fallback
      } finally {
        // if nothing loaded, keep sampleNews (already set)
      }
    }

    fetchFeeds();
    return () => {
      mounted = false;
    };
  }, [maxItems]);

  // Default (right sidebar): hidden on small screens and sticky
  if (!compact) {
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-20 bg-white rounded-xl shadow-md p-0 mt-[22px] overflow-hidden">
          {/* Header fixed inside card */}
          <div className="p-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-0">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="p-4 max-h-[72vh] overflow-auto">
            {loading && <p className="text-sm text-slate-500">Carregando...</p>}

            <div className="space-y-4">
              {itemsToShow.length === 0 && (
                <p className="text-sm text-slate-500">
                  Nenhuma notícia disponível.
                </p>
              )}
              {itemsToShow.map((n) => (
                <article key={n.id} className="border-b last:border-b-0 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900">
                        {n.title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">{n.summary}</p>
                    </div>
                    <div className="text-xs text-slate-500">{n.time}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-emerald-600">{n.category}</div>
                    {n.url && (
                      <Button asChild variant="link" size="sm">
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Saiba mais...
                        </a>
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Compact variant: visible on all sizes and suited to appear below the location card
  return (
    <div className="block">
      <div className="bg-white rounded-xl shadow-md p-0 mt-4 overflow-hidden">
        {/* Fixed header */}
        <div className="p-3 sm:p-4 border-b bg-white sticky top-0 z-10">
          <h4 className="text-sm sm:text-base font-semibold text-slate-900">
            {title}
          </h4>
        </div>

        {/* Scrollable list */}
        <div className="p-3 sm:p-4 max-h-[40vh] overflow-auto">
          {loading && <p className="text-sm text-slate-500">Carregando...</p>}

          <div className="space-y-3">
            {itemsToShow.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhuma notícia disponível.
              </p>
            )}
            {itemsToShow.map((n) => (
              <article key={n.id} className="">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-slate-900">
                      {n.title}
                    </h5>
                    <p className="text-sm text-slate-500 mt-1">{n.summary}</p>
                  </div>
                  <div className="text-xs text-slate-500">{n.time}</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-emerald-600">{n.category}</div>
                  {n.url && (
                    <Button asChild variant="link" size="sm">
                      <a href={n.url} target="_blank" rel="noopener noreferrer">
                        Saiba mais...
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
