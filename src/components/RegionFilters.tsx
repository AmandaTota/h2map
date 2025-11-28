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

interface Microrregiao {
  id: number;
  nome: string;
  mesorregiao: {
    UF: {
      sigla: string;
    };
  };
}

interface RegionFiltersProps {
  onMacroregiaoChange?: (macrorregiao: string) => void;
  onEstadoChange?: (estado: string, estadoNome: string) => void;
  onMicrorregiaoChange?: (
    microrregiao: string,
    microrregiaoNome: string
  ) => void;
}

const MACROREGIOES = [
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

const RegionFilters = ({
  onMacroregiaoChange,
  onEstadoChange,
  onMicrorregiaoChange,
}: RegionFiltersProps) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [microrregioes, setMicrorregioes] = useState<Microrregiao[]>([]);
  const [selectedMacrorregiao, setSelectedMacrorregiao] = useState<string>("");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [selectedMicrorregiao, setSelectedMicrorregiao] = useState<string>("");
  const [filteredEstados, setFilteredEstados] = useState<Estado[]>([]);
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

  // Filtrar estados quando uma macrorregião é selecionada
  useEffect(() => {
    if (!selectedMacrorregiao || selectedMacrorregiao === "all") {
      setFilteredEstados(estados);
    } else {
      const ufsRegion = REGION_UF_MAP[selectedMacrorregiao] || [];
      setFilteredEstados(estados.filter((e) => ufsRegion.includes(e.sigla)));
    }
    // Reset estado e microrregião ao trocar de macrorregião
    setSelectedEstado("");
    setSelectedMicrorregiao("");
  }, [selectedMacrorregiao, estados]);

  // Carregar microrregiões quando um estado é selecionado
  useEffect(() => {
    const fetchMicrorregioes = async () => {
      if (!selectedEstado || selectedEstado === "all") {
        setMicrorregioes([]);
        setSelectedMicrorregiao("");
        return;
      }

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/microrregioes?orderBy=nome`
        );
        const data = await response.json();
        setMicrorregioes(data);
        setSelectedMicrorregiao(""); // Reset microrregião ao trocar de estado
      } catch (error) {
        console.error("Error fetching microrregiões:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar microrregiões",
          description: "Não foi possível carregar as microrregiões",
        });
      }
    };
    fetchMicrorregioes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEstado]);

  // Notificar mudanças
  useEffect(() => {
    if (onMacroregiaoChange) {
      onMacroregiaoChange(selectedMacrorregiao);
    }
  }, [selectedMacrorregiao, onMacroregiaoChange]);

  useEffect(() => {
    if (onEstadoChange) {
      const estadoObj = estados.find((e) => e.sigla === selectedEstado);
      const estadoNome = estadoObj ? estadoObj.nome : "";
      onEstadoChange(selectedEstado, estadoNome);
    }
  }, [selectedEstado, onEstadoChange, estados]);

  useEffect(() => {
    if (onMicrorregiaoChange) {
      const microObj = microrregioes.find(
        (m) => m.id.toString() === selectedMicrorregiao
      );
      const microNome = microObj ? microObj.nome : "";
      onMicrorregiaoChange(selectedMicrorregiao, microNome);
    }
  }, [selectedMicrorregiao, onMicrorregiaoChange, microrregioes]);

  return (
    <div className="space-y-3">
      {/* Macrorregião */}
      <div>
        <p className="text-sm text-slate-600 mb-2">Macrorregião</p>
        <Select
          value={selectedMacrorregiao}
          onValueChange={setSelectedMacrorregiao}
        >
          <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
            <SelectValue placeholder="Selecione a macrorregião" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as macrorregiões</SelectItem>
            {MACROREGIOES.map((macro) => (
              <SelectItem key={macro.value} value={macro.value}>
                {macro.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estado e Microrregião */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-slate-600 mb-2">Estado</p>
          <Select
            value={selectedEstado}
            onValueChange={setSelectedEstado}
            disabled={!selectedMacrorregiao || selectedMacrorregiao === "all"}
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
          <p className="text-sm text-slate-600 mb-2">Microrregião</p>
          <Select
            value={selectedMicrorregiao}
            onValueChange={setSelectedMicrorregiao}
            disabled={!selectedEstado || selectedEstado === "all"}
          >
            <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 bg-white">
              <SelectValue placeholder="Selecione a microrregião" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as microrregiões</SelectItem>
              {microrregioes.map((micro) => (
                <SelectItem key={micro.id} value={micro.id.toString()}>
                  {micro.nome}
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
