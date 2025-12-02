import { useState } from "react";
import { TreePine, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProtectedAreasCard() {
  const [macro, setMacro] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [microrregiao, setMicrorregiao] = useState<string>("");
  const [results, setResults] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const macroOptions = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

  const fetchAreas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("areas_protegidas")
        .select("id,name,category,source,macroregiao,estado,microrregiao");

      // Aplicar filtros quando preenchidos
      if (macro) query = query.eq("macroregiao", macro);
      if (estado) query = query.eq("estado", estado);
      if (microrregiao) query = query.eq("microrregiao", microrregiao);

      const { data, error } = await query;
      if (error) throw error;

      if (Array.isArray(data) && data.length > 0) {
        setResults(data as any[]);
      } else {
        setResults([]);
        toast.warning("Nenhuma área localizada para os filtros selecionados.");
      }
    } catch (e) {
      setResults([]);
      toast.error("Erro ao buscar áreas protegidas (ver console).");
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
      <div className="px-6 py-4 flex items-center">
        <TreePine className="w-6 h-6 text-emerald-600 mr-3" />
        <h2 className="text-2xl font-bold text-slate-900">
          Áreas de Proteção Ambiental
        </h2>
        <Badge className="ml-auto bg-emerald-100 text-emerald-800 border-emerald-200">
          Busca
        </Badge>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Macroregião
            </label>
            <select
              value={macro}
              onChange={(e) => setMacro(e.target.value)}
              className="mt-1 block w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas</option>
              {macroOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Estado (sigla ou nome)
            </label>
            <Input
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="Ex: SP ou São Paulo"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Microrregião (ID ou nome)
            </label>
            <Input
              value={microrregiao}
              onChange={(e) => setMicrorregiao(e.target.value)}
              placeholder="Ex: 3101 ou Vale do Paraíba"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchAreas}
            className="bg-emerald-600 hover:bg-emerald-700"
            size="sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Buscando
              </span>
            ) : (
              "Buscar"
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMacro("");
              setEstado("");
              setMicrorregiao("");
              setResults([]);
            }}
          >
            Limpar
          </Button>
        </div>

        <div className="mt-4">
          {results.length === 0 ? (
            <div className="text-sm text-slate-500">
              Resultados aparecerão aqui após a busca.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((r: any) => (
                <div key={r.id} className="p-3 rounded-md border bg-white">
                  <div className="text-sm font-semibold text-slate-900">
                    {r.name}
                  </div>
                  {r.category && (
                    <div className="text-xs text-slate-500">{r.category}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    Fonte: {r.source || "—"}
                  </div>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toast.success(`Exibir ${r.name} no mapa (implementar)`)
                      }
                    >
                      Mostrar no mapa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
