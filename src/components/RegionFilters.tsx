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
  onRegiaoIntermediaria?: (
    regiaoIntermediaria: string,
    regiaoIntermediariaName: string
  ) => void;
  onRegiaoImediata?: (
    regiaoImediata: string,
    regiaoImediataName: string
  ) => void;
  onCidadeChange?: (cidade: string, cidadeNome: string) => void;
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
const regiaoIntermediariaCache = new Map<string, any[]>();
// Cache para regiões imediatas já carregadas
const regiaoImediataCache = new Map<string, RegiaoImediata[]>();
// Cache para cidades já carregadas
const cidadesCache = new Map<string, Municipio[]>();

const RegionFilters = ({
  onRegiaoChange,
  onEstadoChange,
  onRegiaoIntermediaria,
  onRegiaoImediata,
  onCidadeChange,
}: RegionFiltersProps) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [regioesIntermediarias, setRegioesIntermediarias] = useState<any[]>([]);
  const [regioesImediatas, setRegioesImediatas] = useState<RegiaoImediata[]>([]);
  const [cidades, setCidades] = useState<Municipio[]>([]);
  const [selectedRegiao, setSelectedRegiao] = useState<string>("");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [selectedRegiaoIntermediaria, setSelectedRegiaoIntermediaria] = useState<string>("");
  const [selectedRegiaoImediata, setSelectedRegiaoImediata] = useState<string>("");
  const [selectedCidade, setSelectedCidade] = useState<string>("");
  const [filteredEstados, setFilteredEstados] = useState<Estado[]>([]);
  const [loadingIntermediaria, setLoadingIntermediaria] = useState(false);
  const [loadingImediata, setLoadingImediata] = useState(false);
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
    // Reset estado e regiões ao trocar de região
    setSelectedEstado("");
    setSelectedRegiaoIntermediaria("");
    setSelectedRegiaoImediata("");
  }, [selectedRegiao, estados]);

  // Carregar Regiões Geográficas Intermediárias quando um estado é selecionado
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

      setLoadingIntermediaria(true);
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
          : "Não foi possível carregar as regiões geográficas intermediárias";
          
        toast({
          variant: "destructive",
          title: "Erro ao carregar regiões intermediárias",
          description: errorMessage,
        });
        
        setRegioesIntermediarias([]);
      } finally {
        setLoadingIntermediaria(false);
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
    if (onRegiaoIntermediaria) {
      const regiaoObj = regioesIntermediarias.find(
        (r) => r.id.toString() === selectedRegiaoIntermediaria
      );
      const regiaoNome = regiaoObj ? regiaoObj.nome : "";
      onRegiaoIntermediaria(selectedRegiaoIntermediaria, regiaoNome);
    }
  }, [selectedRegiaoIntermediaria, onRegiaoIntermediaria, regioesIntermediarias]);

  // Carregar Regiões Geográficas Imediatas quando uma região intermediária é selecionada
  useEffect(() => {
    const fetchRegioesImediatas = async () => {
      if (!selectedRegiaoIntermediaria || selectedRegiaoIntermediaria === "all") {
        setRegioesImediatas([]);
        setSelectedRegiaoImediata("");
        return;
      }

      // Verificar cache primeiro
      if (regiaoImediataCache.has(selectedRegiaoIntermediaria)) {
        setRegioesImediatas(regiaoImediataCache.get(selectedRegiaoIntermediaria)!);
        setSelectedRegiaoImediata("");
        return;
      }

      setLoadingImediata(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/regioes-intermediarias/${selectedRegiaoIntermediaria}/regioes-imediatas?orderBy=nome`,
          {
            signal: AbortSignal.timeout(10000), // timeout de 10s
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Armazenar no cache
        regiaoImediataCache.set(selectedRegiaoIntermediaria, data);
        
        setRegioesImediatas(data);
        setSelectedRegiaoImediata("");
      } catch (error) {
        console.error("Error fetching regiões imediatas:", error);
        
        const errorMessage = error instanceof Error && error.name === 'TimeoutError' 
          ? "Tempo limite excedido. Tente novamente."
          : "Não foi possível carregar as regiões geográficas imediatas";
          
        toast({
          variant: "destructive",
          title: "Erro ao carregar regiões imediatas",
          description: errorMessage,
        });
        
        setRegioesImediatas([]);
      } finally {
        setLoadingImediata(false);
      }
    };
    fetchRegioesImediatas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegiaoIntermediaria]);

  // Notificar mudanças de região imediata
  useEffect(() => {
    if (onRegiaoImediata) {
      const regiaoObj = regioesImediatas.find(
        (r) => r.id.toString() === selectedRegiaoImediata
      );
      const regiaoNome = regiaoObj ? regiaoObj.nome : "";
      onRegiaoImediata(selectedRegiaoImediata, regiaoNome);
    }
  }, [selectedRegiaoImediata, onRegiaoImediata, regioesImediatas]);

  // Carregar cidades quando uma região imediata é selecionada
  useEffect(() => {
    if (!selectedRegiaoImediata || selectedRegiaoImediata === "all") {
      setCidades([]);
      setSelectedCidade("");
      return;
    }

    setLoadingCidades(true);
    const fetchCidades = async () => {
      try {
        // Verificar cache
        if (cidadesCache.has(selectedRegiaoImediata)) {
          setCidades(cidadesCache.get(selectedRegiaoImediata) || []);
          setLoadingCidades(false);
          return;
        }

        // Buscar municípios da região imediata usando a API do IBGE
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/regioes-imediatas/${selectedRegiaoImediata}/municipios?orderBy=nome`,
          {
            signal: AbortSignal.timeout(10000), // timeout de 10s
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data: Municipio[] = await response.json();

        // Armazenar no cache
        cidadesCache.set(selectedRegiaoImediata, data);
        setCidades(data);
      } catch (error) {
        console.error("Error fetching cidades:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar cidades",
          description: "Não foi possível carregar a lista de cidades",
        });
        setCidades([]);
      } finally {
        setLoadingCidades(false);
      }
    };

    fetchCidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegiaoImediata]);

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
            disabled={!selectedEstado || selectedEstado === "all" || loadingIntermediaria}
          >
            <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
              <SelectValue placeholder={loadingIntermediaria ? "Carregando..." : "Selecione a região intermediária"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões intermediárias</SelectItem>
              {regioesIntermediarias.map((regiao) => (
                <SelectItem key={regiao.id} value={regiao.id.toString()}>
                  {regiao.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Região Geográfica Imediata - aparece após seleção de região intermediária */}
      {selectedRegiaoIntermediaria && selectedRegiaoIntermediaria !== "all" && (
        <div>
          <p className="text-sm text-slate-600 mb-2">Região Geográfica Imediata</p>
          <Select
            value={selectedRegiaoImediata}
            onValueChange={setSelectedRegiaoImediata}
            disabled={loadingImediata}
          >
            <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
              <SelectValue placeholder={loadingImediata ? "Carregando..." : "Selecione a região imediata"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões imediatas</SelectItem>
              {regioesImediatas.map((regiao) => (
                <SelectItem key={regiao.id} value={regiao.id.toString()}>
                  {regiao.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Cidade - aparece apenas após seleção de região imediata */}
      {selectedRegiaoImediata && selectedRegiaoImediata !== "all" && (
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
