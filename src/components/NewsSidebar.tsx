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
  const [loading, setLoading] = useState(true);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const itemsToShow = newsItems.slice(0, maxItems);

  useEffect(() => {
    let mounted = true;
    const feedSources = [
      {
        category: "Clima",
        url: "https://g1.globo.com/rss/g1/meio-ambiente/",
      },
      {
        category: "Clima",
        url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      },
      {
        category: "Energia",
        url: "https://www.eia.gov/rss/todayinenergy.xml",
      },
    ];

    const stripHtml = (value: string) =>
      value
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    async function fetchFeeds() {
      if (mounted) {
        setLoading(true);
        setLoadError(null);
      }

      try {
        const aggregatedItems: NewsItem[] = [];

        for (const source of feedSources) {
          try {
            // Usa proxy para evitar bloqueios CORS em feeds RSS públicos.
            const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(source.url)}`;
            const res = await fetch(proxiedUrl);
            if (!res.ok) {
              continue;
            }

            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "application/xml");

            if (xml.querySelector("parsererror")) {
              continue;
            }

            const items = Array.from(xml.querySelectorAll("item")).map(
              (it, i) => {
                const link = it.querySelector("link")?.textContent || "";
                const guid =
                  it.querySelector("guid")?.textContent ||
                  link ||
                  `${source.url}-${i}`;
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
                  category: category || source.category,
                  time: pub
                    ? new Date(pub).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "",
                  summary: stripHtml(desc),
                  url: link,
                } as NewsItem;
              },
            );

            aggregatedItems.push(...items);
          } catch (err) {
            continue;
          }
        }

        const uniqueByUrl = new Map<string, NewsItem>();
        for (const item of aggregatedItems) {
          if (!item.url || uniqueByUrl.has(item.url)) {
            continue;
          }
          uniqueByUrl.set(item.url, item);
        }

        const finalItems = Array.from(uniqueByUrl.values()).slice(0, maxItems);

        if (mounted) {
          setNewsItems(finalItems);
          if (finalItems.length === 0) {
            setLoadError("Não foi possível carregar notícias no momento.");
          }
        }
      } catch (err) {
        if (mounted) {
          setNewsItems([]);
          setLoadError("Não foi possível carregar notícias no momento.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
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
        <div className="sticky top-20 bg-white rounded-xl shadow-md p-0 overflow-hidden">
          {/* Header fixed inside card */}
          <div className="p-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-0">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="p-4 max-h-[72vh] overflow-auto">
            {loading && <p className="text-sm text-slate-500">Carregando...</p>}
            {!loading && loadError && (
              <p className="text-sm text-slate-500">{loadError}</p>
            )}

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
          {!loading && loadError && (
            <p className="text-sm text-slate-500">{loadError}</p>
          )}

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
