import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface RegiaoImediata {
  id: number;
  nome: string;
  'regiao-intermediaria': {
    UF: {
      sigla: string;
    };
  };
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
// Sanitize text coming from external APIs (IBGE) replacing stray inverted question marks
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

// Cache para cidades já carregadas (por região intermediária)
const cidadesCache = new Map<string, Municipio[]>();

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

  // Filtrar estados quando uma região é selecionada
  useEffect(() => {
    if (!selectedRegiao || selectedRegiao === "all") {
      setFilteredEstados(estados);
    } else {
      const ufsRegion = REGION_UF_MAP[selectedRegiao] || [];
      setFilteredEstados(estados.filter((e) => ufsRegion.includes(e.sigla)));
    }
    // Reset estado e regiões ao trocar de região
    setSelectedEstado("");
    setCidades([]);
    setSelectedCidade("");
  }, [selectedRegiao, estados]);

  // Carregar cidades quando um estado é selecionado
  useEffect(() => {
    const fetchCidadesDoEstado = async () => {
      if (!selectedEstado || selectedEstado === "all") {
        setCidades([]);
        setSelectedCidade("");
        return;
      }

      // Verificar cache primeiro
      if (cidadesCache.has(selectedEstado)) {
        setCidades(cidadesCache.get(selectedEstado) || []);
        setSelectedCidade("");
        return;
      }

      setLoadingCidades(true);
      try {
        // Buscar municípios do estado diretamente
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
        
        // Ordenar por nome
        sanitized.sort((a: Municipio, b: Municipio) => 
          a.nome.localeCompare(b.nome, "pt-BR")
        );
        
        // Armazenar no cache
        cidadesCache.set(selectedEstado, sanitized);
        
        setCidades(sanitized);
        setSelectedCidade("");
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
    };
    fetchCidadesDoEstado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEstado]);

  // Notificar mudanças
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
            <SelectValue placeholder="Selecione a região" />
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
          disabled={!selectedRegiao || selectedRegiao === "all"}
        >
          <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
            <SelectValue placeholder="Selecione o estado" />
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

      {/* Cidade - aparece após seleção de estado */}
      {selectedEstado && selectedEstado !== "all" && (
        <div>
          <p className="text-sm text-slate-600 mb-2">Cidade</p>
          <Select
            value={selectedCidade}
            onValueChange={setSelectedCidade}
            disabled={loadingCidades}
          >
            <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
              <SelectValue placeholder={loadingCidades ? "Carregando cidades..." : "Selecione a cidade"} />
            </SelectTrigger>
            <SelectContent>
              {cidades.map((cidade) => (
                <SelectItem key={cidade.id} value={cidade.id.toString()}>
                  {cidade.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default RegionFilters;
