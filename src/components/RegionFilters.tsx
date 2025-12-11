import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import CidadeCombobox from "./CidadeCombobox";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Municipio {
  id: number;
  nome: string;
}

interface RegionFiltersProps {
  onRegiaoChange?: (regiao: string) => void;
  onEstadoChange?: (estado: string, estadoNome: string) => void;
  onCidadeChange?: (cidade: string, cidadeNome: string) => void;
 }

const sanitizeText = (value: string) =>
  typeof value === "string" ? value.replace(/¿/g, "-").trim() : value;

const REGIOES = [
  { value: "Norte", label: "Norte" },
  { value: "Nordeste", label: "Nordeste" },
  { value: "Centro-Oeste", label: "Centro-Oeste" },
  { value: "Sudeste", label: "Sudeste" },
  { value: "Sul", label: "Sul" },
];

const REGION_UF_MAP: Record<string, string[]> = {
  Norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
};

// Cache para cidades
const cidadesCache = new Map<string, Municipio[]>();
let todasCidadesCache: Municipio[] | null = null;

const RegionFilters = ({
  onRegiaoChange,
  onEstadoChange,
  onCidadeChange,
}: RegionFiltersProps) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Municipio[]>([]);
  const [selectedRegiao, setSelectedRegiao] = useState<string>("");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [selectedCidade, setSelectedCidade] = useState<string>("");
  const [filteredEstados, setFilteredEstados] = useState<Estado[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const { toast } = useToast();

  // Carregar estados do IBGE
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data = await response.json();
        const sanitized = data.map((estado: Estado) => ({
          ...estado,
          nome: sanitizeText(estado.nome),
        }));
        setEstados(sanitized);
        setFilteredEstados(sanitized);
      } catch (error) {
        console.error("Error fetching estados:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar estados",
          description: "Não foi possível carregar a lista de estados",
        });
      }
    };
    fetchEstados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar todos os municípios do Brasil na inicialização
  useEffect(() => {
    const fetchTodasCidades = async () => {
      if (todasCidadesCache !== null) {
        setCidades(todasCidadesCache);
        return;
      }

      setLoadingCidades(true);
      try {
        // Usar a API que retorna todos os municípios
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",
          {
            signal: AbortSignal.timeout(30000),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const sanitized = data.map((municipio: Municipio) => ({
          ...municipio,
          nome: sanitizeText(municipio.nome),
        }));

        sanitized.sort((a: Municipio, b: Municipio) =>
          a.nome.localeCompare(b.nome, "pt-BR")
        );

        todasCidadesCache = sanitized;
        setCidades(sanitized);
      } catch (error) {
        console.error("Error fetching todas as cidades:", error);

        const errorMessage = error instanceof Error && error.name === 'TimeoutError'
          ? "Tempo limite excedido. Tente novamente."
          : "Não foi possível carregar todas as cidades";

        toast({
          variant: "destructive",
          title: "Erro ao carregar cidades",
          description: errorMessage,
        });

        setCidades([]);
      } finally {
        setLoadingCidades(false);
      }
    };

    fetchTodasCidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar estados quando uma região é selecionada
  useEffect(() => {
    if (!selectedRegiao || selectedRegiao === "all") {
      setFilteredEstados(estados);
    } else {
      const ufsRegion = REGION_UF_MAP[selectedRegiao] || [];
      setFilteredEstados(estados.filter((e) => ufsRegion.includes(e.sigla)));
    }
  }, [selectedRegiao, estados]);

  // Carregar cidades quando um estado é selecionado
  useEffect(() => {
    const fetchCidadesDoEstado = async () => {
      // Se estado selecionado, carregar cidades daquele estado
      if (selectedEstado && selectedEstado !== "all") {
        if (cidadesCache.has(selectedEstado)) {
          setCidades(cidadesCache.get(selectedEstado) || []);
          return;
        }

        setLoadingCidades(true);
        try {
          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios?orderBy=nome`,
            {
              signal: AbortSignal.timeout(10000),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          const sanitized = data.map((municipio: Municipio) => ({
            ...municipio,
            nome: sanitizeText(municipio.nome),
          }));

          sanitized.sort((a: Municipio, b: Municipio) =>
            a.nome.localeCompare(b.nome, "pt-BR")
          );

          cidadesCache.set(selectedEstado, sanitized);
          setCidades(sanitized);
        } catch (error) {
          console.error("Error fetching cidades:", error);

          const errorMessage = error instanceof Error && error.name === 'TimeoutError'
            ? "Tempo limite excedido. Tente novamente."
            : "Não foi possível carregar as cidades";

          toast({
            variant: "destructive",
            title: "Erro ao carregar cidades",
            description: errorMessage,
          });

          setCidades([]);
        } finally {
          setLoadingCidades(false);
        }
      } else if (selectedEstado === "all") {
        // Se selecionou "Todos os estados", mostrar todas as cidades
        if (todasCidadesCache !== null) {
          setCidades(todasCidadesCache);
        }
      } else {
        // Nenhum estado selecionado - mostrar todas as cidades
        if (todasCidadesCache !== null) {
          setCidades(todasCidadesCache);
        }
      }
    };
    fetchCidadesDoEstado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEstado]);

  useEffect(() => {
    if (onRegiaoChange) {
      onRegiaoChange(selectedRegiao);
    }
  }, [selectedRegiao, onRegiaoChange]);

  useEffect(() => {
    if (onEstadoChange) {
      const estadoObj = estados.find((e) => e.sigla === selectedEstado);
      const estadoNome = estadoObj ? estadoObj.nome : "";
      onEstadoChange(selectedEstado, estadoNome);
    }
  }, [selectedEstado, onEstadoChange, estados]);

  // Notificar mudanças de cidade
  useEffect(() => {
    if (onCidadeChange) {
      const cidadeObj = cidades.find((c) => c.id.toString() === selectedCidade);
      const cidadeNome = cidadeObj ? cidadeObj.nome : "";
      onCidadeChange(selectedCidade, cidadeNome);
    }
  }, [selectedCidade, onCidadeChange, cidades]);

  return (
    <div className="space-y-3">
      {/* Região */}
      <div>
        <p className="text-sm text-slate-600 mb-2">Região</p>
        <Select
          value={selectedRegiao}
          onValueChange={setSelectedRegiao}
        >
          <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
            <SelectValue placeholder="Selecione a região (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as regiões</SelectItem>
            {REGIOES.map((macro) => (
              <SelectItem key={macro.value} value={macro.value}>
                {macro.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estado */}
      <div>
        <p className="text-sm text-slate-600 mb-2">Estado</p>
        <Select
          value={selectedEstado}
          onValueChange={setSelectedEstado}
        >
          <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
            <SelectValue placeholder="Selecione o estado (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {filteredEstados.map((estado) => (
              <SelectItem key={estado.id} value={estado.sigla}>
                {estado.nome} ({estado.sigla})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cidade - com todos os municípios brasileiros */}
      <div>
        <p className="text-sm text-slate-600 mb-2">Cidade</p>
        <CidadeCombobox
          cidades={cidades}
          value={selectedCidade}
          onValueChange={(id, nome) => {
            setSelectedCidade(id);
          }}
          loading={loadingCidades}
          placeholder="Digite ou selecione a cidade"
        />
      </div>
    </div>
  );
};

export default RegionFilters;
