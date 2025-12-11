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

interface RegiaoIntermediaria {
  id: number;
  nome: string;
  UF: {
    id: number;
    sigla: string;
    nome: string;
    regiao: {
      id: number;
      sigla: string;
      nome: string;
    };
  };
}

interface RegionFiltersProps {
  onRegiaoChange?: (regiao: string) => void;
  onEstadoChange?: (estado: string, estadoNome: string) => void;
  onRegiaoIntermediariaChange?: (
    regiaoIntermediaria: string,
    regiaoIntermediariaNome: string
  ) => void;
}

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

// Cache para regiões intermediárias já carregadas
const regiaoIntermediariaCache = new Map<string, RegiaoIntermediaria[]>();

const RegionFilters = ({
  onRegiaoChange,
  onEstadoChange,
  onRegiaoIntermediariaChange,
}: RegionFiltersProps) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [regioesIntermediarias, setRegioesIntermediarias] = useState<RegiaoIntermediaria[]>([]);
  const [selectedRegiao, setSelectedRegiao] = useState<string>("");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [selectedRegiaoIntermediaria, setSelectedRegiaoIntermediaria] = useState<string>("");
  const [filteredEstados, setFilteredEstados] = useState<Estado[]>([]);
  const [loadingRegiaoIntermediaria, setLoadingRegiaoIntermediaria] = useState(false);
  const { toast } = useToast();

  // Carregar estados do IBGE
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data = await response.json();
        setEstados(data);
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
    // Reset estado e região intermediária ao trocar de região
    setSelectedEstado("");
    setSelectedRegiaoIntermediaria("");
  }, [selectedRegiao, estados]);

  // Carregar regiões intermediárias quando um estado é selecionado
  useEffect(() => {
    const fetchRegioesIntermediarias = async () => {
      if (!selectedEstado || selectedEstado === "all") {
        setRegioesIntermediarias([]);
        setSelectedRegiaoIntermediaria("");
        return;
      }

      // Verificar cache primeiro
      if (regiaoIntermediariaCache.has(selectedEstado)) {
        setRegioesIntermediarias(regiaoIntermediariaCache.get(selectedEstado)!);
        setSelectedRegiaoIntermediaria("");
        return;
      }

      setLoadingRegiaoIntermediaria(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/regioes-intermediarias?orderBy=nome`,
          {
            signal: AbortSignal.timeout(10000), // timeout de 10s
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Armazenar no cache
        regiaoIntermediariaCache.set(selectedEstado, data);
        
        setRegioesIntermediarias(data);
        setSelectedRegiaoIntermediaria("");
      } catch (error) {
        console.error("Error fetching regiões intermediárias:", error);
        
        // Mensagem de erro mais específica
        const errorMessage = error instanceof Error && error.name === 'TimeoutError' 
          ? "Tempo limite excedido. Tente novamente."
          : "Não foi possível carregar as regiões intermediárias";
          
        toast({
          variant: "destructive",
          title: "Erro ao carregar regiões intermediárias",
          description: errorMessage,
        });
        
        setRegioesIntermediarias([]);
      } finally {
        setLoadingRegiaoIntermediaria(false);
      }
    };
    fetchRegioesIntermediarias();
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

  useEffect(() => {
    if (onRegiaoIntermediariaChange) {
      const regiaoIntermediariaObj = regioesIntermediarias.find(
        (r) => r.id.toString() === selectedRegiaoIntermediaria
      );
      const regiaoIntermediariaNome = regiaoIntermediariaObj ? regiaoIntermediariaObj.nome : "";
      onRegiaoIntermediariaChange(selectedRegiaoIntermediaria, regiaoIntermediariaNome);
    }
  }, [selectedRegiaoIntermediaria, onRegiaoIntermediariaChange, regioesIntermediarias]);

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
            {REGIOES.map((regiao) => (
              <SelectItem key={regiao.value} value={regiao.value}>
                {regiao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estado e Região Geográfica Intermediária */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        <div>
          <p className="text-sm text-slate-600 mb-2">Região Geográfica Intermediária</p>
          <Select
            value={selectedRegiaoIntermediaria}
            onValueChange={setSelectedRegiaoIntermediaria}
            disabled={!selectedEstado || selectedEstado === "all" || loadingRegiaoIntermediaria}
          >
            <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
              <SelectValue placeholder={loadingRegiaoIntermediaria ? "Carregando..." : "Selecione a região intermediária"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões intermediárias</SelectItem>
              {regioesIntermediarias.map((regiaoIntermediaria) => (
                <SelectItem key={regiaoIntermediaria.id} value={regiaoIntermediaria.id.toString()}>
                  {regiaoIntermediaria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default RegionFilters;
