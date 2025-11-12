import { useEffect, useState } from 'react';

type Article = {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
  category: string;
};

const queries: { key: string; q: string; label: string }[] = [
  { key: 'energia', q: 'geracao de energia,energia renovavel,renewable energy', label: 'Geração de energia' },
  { key: 'preservacao', q: 'preservacao ambiental,conservacao ambiental,environmental preservation', label: 'Preservação ambiental' },
  { key: 'previsao', q: 'previsao do tempo,weather forecast', label: 'Previsão do tempo' },
];

// API details for apitube.io
const APITUBE_BASE = 'https://apitube.io/api';
const APITUBE_KEY = 'api_live_2deMM7p5x3KefczsW6iDp2ckIkLcXNYZeXClmWpmAKFgYJ';

async function fetchFromApitube(q: string) {
  // Construct a search endpoint. This is a reasonable assumption: /news/search?q=...
  const url = `${APITUBE_BASE}/news/search?q=${encodeURIComponent(q)}&limit=8&lang=pt`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': APITUBE_KEY,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`apitube fetch failed: ${res.status}`);
  const json = await res.json();
  return json;
}

export default function NewsSidebar() {
  const [articlesByCategory, setArticlesByCategory] = useState<Record<string, Article[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // lazy load on mount
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const results: Record<string, Article[]> = {};

      await Promise.all(
        queries.map(async (q) => {
          try {
            const data = await fetchFromApitube(q.q);
            // data.articles || data.items || data.results - be defensive
            const items = data.articles ?? data.items ?? data.results ?? [];
            const parsed: Article[] = (items as any[]).slice(0, 6).map((it) => ({
              title: it.title ?? it.headline ?? 'Sem título',
              link: it.url ?? it.link ?? it.source_url ?? '#',
              pubDate: it.publishedAt ?? it.pubDate ?? it.published ?? undefined,
              source: it.source?.name ?? it.source ?? undefined,
              category: q.label,
            }));
            results[q.key] = parsed;
          } catch (e) {
            results[q.key] = [];
          }
        })
      );

      setArticlesByCategory(results);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao buscar notícias');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 bg-white rounded-xl shadow-md p-4 max-h-[75vh] overflow-auto mt-[22px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Notícias Recentes</h3>
          <button
            onClick={fetchAll}
            className="text-sm text-emerald-700 hover:text-emerald-900"
            aria-label="Atualizar notícias"
          >
            Atualizar
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500">Carregando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {queries.map((q) => (
              <section key={q.key}>
                <h4 className="text-sm font-medium text-slate-800 mb-2">{q.label}</h4>
                <ul className="space-y-2">
                  {(articlesByCategory[q.key] ?? []).map((a, idx) => (
                    <li key={idx} className="text-sm">
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-emerald-50 rounded px-2 py-1"
                      >
                        <div className="font-medium text-slate-800 line-clamp-2">{a.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{a.pubDate ? new Date(a.pubDate).toLocaleString() : ''}</div>
                      </a>
                    </li>
                  ))}
                  {(articlesByCategory[q.key] ?? []).length === 0 && (
                    <li className="text-xs text-slate-500">Sem itens recentes.</li>
                  )}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
