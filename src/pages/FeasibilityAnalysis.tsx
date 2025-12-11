import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sun,
  Wind,
  TreePine,
  Mountain,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Droplet,
  Zap,
  BarChart3,
  FileText,
  Loader2,
  Database,
  X,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import LocationSearch from "@/components/LocationSearch";
import RegionFilters from "@/components/RegionFilters";
import Map from "@/components/Map";
import SectorDemandByStateCard from "@/components/SectorDemandByStateCard";
// LayerControls removed — layers no longer toggled per-map
import { useLocationStore } from "@/store/locationStore";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

interface AnalysisPeriod {
  years: number;
  solarPotential: number;
  windPotential: number;
  hydrogenProduction: number;
  investment: number;
  roi: number;
}

interface EnergyCalculations {
  // Entrada de dados
  solarIrradiance: number; // W/m²
  windSpeed: number; // m/s

  // Parâmetros de instalação
  solarPanelArea: number; // m²
  solarEfficiency: number; // %
  windTurbineArea: number; // m²
  windEfficiency: number; // %

  // Potências geradas
  solarPower: number; // kW
  windPower: number; // kW
  totalPower: number; // kW

  // Energia disponível
  dailyEnergy: number; // kWh/dia
  annualEnergy: number; // kWh/ano

  // Produção de H2
  dailyH2Production: number; // kg/dia
  annualH2Production: number; // kg/ano (toneladas)
}

interface DailyData {
  date: string;
  solarIrradiance: number;
  windSpeed: number;
  temperature: number;
  humidity: number;
  precipitation: number;
}

interface WeatherData {
  avgTemperature: number;
  avgSolarIrradiance: number;
  avgWindSpeed: number;
  avgHumidity: number;
  avgPressure: number;
  totalRainfall: number;
  dataPoints: number;
  dailyData?: DailyData[];
}

interface SimulationResult {
  totalEnergyConsumed: number; // kWh/ano
  h2Production: number; // kg/ano
  capacityFactor: number; // %
  curtailment: number; // kWh perdido
  operatingHours: number; // horas no ano
  lcoh: number; // R$/kg
  capexAnnualized: number; // R$/ano
  opexAnnual: number; // R$/ano
}

interface TopographyData {
  latitude: number;
  longitude: number;
  averageSlope: number;
  slopeCategory: string;
  slopeStatus: "success" | "warning" | "error";
  terrainType: string;
  slopeDegrees: number;
  dataSource: string;
  timestamp: string;
  recommendations: string[];
}

// Helper function to format numbers with locale and remove unnecessary decimals
const formatCurrency = (value: number, decimals: number = 2): string => {
  const formatted = value.toLocaleString("pt-BR", { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  // Remove ".0" if the number has no significant decimal places
  if (decimals > 0 && formatted.endsWith(",0".repeat(decimals / 1))) {
    return formatted.substring(0, formatted.lastIndexOf(","));
  }
  // Remove trailing zeros after comma but keep at least one decimal place if decimals > 0
  if (decimals > 0) {
    return formatted.replace(/,?0+$/, "");
  }
  return formatted;
};

const FeasibilityAnalysis = () => {
  const { selectedLocation, setSelectedLocation } = useLocationStore();
  const [localLocation, setLocalLocation] = useState(
    selectedLocation || { lat: -23.5505, lng: -46.6333, name: "São Paulo, SP" }
  );
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analyzedLocation, setAnalyzedLocation] = useState(localLocation);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [topographyData, setTopographyData] = useState<TopographyData | null>(
    null
  );
  // Cenário selecionado para a seção de Viabilidade (1, 3 ou 5 anos)
  const [scenario, setScenario] = useState<"1" | "3" | "5">("1");
  const scenarioIndex = scenario === "1" ? 0 : scenario === "3" ? 1 : 2;
  const [simulationResults, setSimulationResults] = useState<{
    oneYear: SimulationResult | null;
    threeYears: SimulationResult | null;
    fiveYears: SimulationResult | null;
  }>({ oneYear: null, threeYears: null, fiveYears: null });

  const [mode, setMode] = useState<"cidade" | "regiao">("cidade");
  const [selectedRegion, setSelectedRegion] = useState<string>("Nordeste");
  const [compareRegionA, setCompareRegionA] = useState<string>("Nordeste");
  const [compareRegionB, setCompareRegionB] = useState<string>("Sudeste");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [selectedEstadoNome, setSelectedEstadoNome] = useState<string>("");
  const [selectedCidade, setSelectedCidade] = useState<string>("");
  const [selectedCidadeNome, setSelectedCidadeNome] = useState<string>("");

  // Estados para comparação de regiões intermediárias
  const [compareEstadoA, setCompareEstadoA] = useState<string>("");
  const [compareRegiaoIntermediariaA, setCompareRegiaoIntermediariaA] = useState<string>("");
  const [compareRegiaoIntermediariaNomeA, setCompareRegiaoIntermediariaNomeA] = useState<string>("");
  const [compareEstadoB, setCompareEstadoB] = useState<string>("");
  const [compareRegiaoIntermediariaB, setCompareRegiaoIntermediariaB] = useState<string>("");
  const [compareRegiaoIntermediariaNomeB, setCompareRegiaoIntermediariaNomeB] = useState<string>("");
  // Forçar remontagem de filtros regionais ao limpar
  const [regionFiltersKey, setRegionFiltersKey] = useState<number>(0);
  // Toggles para iniciar fechados
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showMapsComparison, setShowMapsComparison] = useState<boolean>(false);
  const [regioesIntermediariaCompareA, setRegioesIntermediariaCompareA] = useState<
    Array<{ id: string; nome: string }>
  >([]);
  const [regioesIntermediariaCompareB, setRegioesIntermediariaCompareB] = useState<
    Array<{ id: string; nome: string }>
  >([]);
  const [regioesImediataCompareA, setRegioesImediataCompareA] = useState<
    Array<{ id: string; nome: string }>
  >([]);
  const [regioesImediataCompareB, setRegioesImediataCompareB] = useState<
    Array<{ id: string; nome: string }>
  >([]);
  const [estadosCompare, setEstadosCompare] = useState<
    Array<{ sigla: string; nome: string }>
  >([]);
  const [coordsMicroA, setCoordsMicroA] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [coordsMicroB, setCoordsMicroB] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapKeyA, setMapKeyA] = useState<number>(0);
  const [mapKeyB, setMapKeyB] = useState<number>(0);

  const UF_SIGLA: Record<string, string> = {
    "11": "RO",
    "12": "AC",
    "13": "AM",
    "14": "RR",
    "15": "PA",
    "16": "AP",
    "17": "TO",
    "21": "MA",
    "22": "PI",
    "23": "CE",
    "24": "RN",
    "25": "PB",
    "26": "PE",
    "27": "AL",
    "28": "SE",
    "29": "BA",
    "31": "MG",
    "32": "ES",
    "33": "RJ",
    "35": "SP",
    "41": "PR",
    "42": "SC",
    "43": "RS",
    "50": "MS",
    "51": "MT",
    "52": "GO",
    "53": "DF",
  };

  const REGION_UF_CODES: Record<string, string[]> = {
    Norte: ["11", "12", "13", "14", "15", "16", "17"],
    Nordeste: ["21", "22", "23", "24", "25", "26", "27", "28", "29"],
    "Centro-Oeste": ["50", "51", "52", "53"],
    Sudeste: ["31", "32", "33", "35"],
    Sul: ["41", "42", "43"],
  };

  const UF_MAP: Record<string, string> = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapá",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceará",
    DF: "Distrito Federal",
    ES: "Espírito Santo",
    GO: "Goiás",
    MA: "Maranhão",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Pará",
    PB: "Paraíba",
    PR: "Paraná",
    PE: "Pernambuco",
    PI: "Piauí",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondônia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "São Paulo",
    SE: "Sergipe",
    TO: "Tocantins",
  };

  useEffect(() => {
    if (selectedLocation) {
      setLocalLocation(selectedLocation);
    }
  }, [selectedLocation]);

  // Buscar coordenadas das regiões intermediárias quando mudarem
  useEffect(() => {
    const fetchRegiaoIntermediariaCoords = async (regiaoId: string) => {
      if (!regiaoId) return null;
      try {
        // Buscar municípios da região intermediária via IBGE
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/regioes-intermediarias/${regiaoId}/municipios`
        );
        const municipios = await response.json();

        if (municipios && municipios.length > 0) {
          // Buscar coordenadas do primeiro município no Supabase
          const { data, error } = await supabase
            .from("municipalities")
            .select("latitude, longitude, nome")
            .ilike("nome", municipios[0].nome)
            .limit(1)
            .single();

          if (!error && data && data.latitude && data.longitude) {
            return {
              lat: parseFloat(String(data.latitude)),
              lng: parseFloat(String(data.longitude)),
            };
          }

          // Se não encontrar no Supabase, tentar calcular média de todos os municípios
          let totalLat = 0;
          let totalLng = 0;
          let count = 0;

          for (const municipio of municipios.slice(0, 5)) {
            // Pegar até 5 municípios
            const { data: mData } = await supabase
              .from("municipalities")
              .select("latitude, longitude")
              .ilike("nome", municipio.nome)
              .limit(1)
              .single();

            if (mData && mData.latitude && mData.longitude) {
              totalLat += parseFloat(String(mData.latitude));
              totalLng += parseFloat(String(mData.longitude));
              count++;
            }
          }

          if (count > 0) {
            return { lat: totalLat / count, lng: totalLng / count };
          }
        }
      } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
      }
      return null;
    };

    if (compareRegiaoIntermediariaA) {
      fetchRegiaoIntermediariaCoords(compareRegiaoIntermediariaA).then((coords) => {
        if (coords) {
          setCoordsMicroA(coords);
          setMapKeyA((prev) => prev + 1);
        }
      });
    } else {
      setCoordsMicroA(null);
    }
  }, [compareRegiaoIntermediariaA]);

  useEffect(() => {
    const fetchRegiaoIntermediariaCoords = async (regiaoId: string) => {
      if (!regiaoId) return null;
      try {
        // Buscar municípios da região intermediária via IBGE
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/regioes-intermediarias/${regiaoId}/municipios`
        );
        const municipios = await response.json();

        if (municipios && municipios.length > 0) {
          // Buscar coordenadas do primeiro município no Supabase
          const { data, error } = await supabase
            .from("municipalities")
            .select("latitude, longitude, nome")
            .ilike("nome", municipios[0].nome)
            .limit(1)
            .single();

          if (!error && data && data.latitude && data.longitude) {
            return {
              lat: parseFloat(String(data.latitude)),
              lng: parseFloat(String(data.longitude)),
            };
          }

          // Se não encontrar no Supabase, tentar calcular média de todos os municípios
          let totalLat = 0;
          let totalLng = 0;
          let count = 0;

          for (const municipio of municipios.slice(0, 5)) {
            // Pegar até 5 municípios
            const { data: mData } = await supabase
              .from("municipalities")
              .select("latitude, longitude")
              .ilike("nome", municipio.nome)
              .limit(1)
              .single();

            if (mData && mData.latitude && mData.longitude) {
              totalLat += parseFloat(String(mData.latitude));
              totalLng += parseFloat(String(mData.longitude));
              count++;
            }
          }

          if (count > 0) {
            return { lat: totalLat / count, lng: totalLng / count };
          }
        }
      } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
      }
      return null;
    };

    if (compareRegiaoIntermediariaB) {
      fetchRegiaoIntermediariaCoords(compareRegiaoIntermediariaB).then((coords) => {
        if (coords) {
          setCoordsMicroB(coords);
          setMapKeyB((prev) => prev + 1);
        }
      });
    } else {
      setCoordsMicroB(null);
    }
  }, [compareRegiaoIntermediariaB]);

  // Incrementar key quando região A mudar
  useEffect(() => {
    if (compareRegionA) {
      setMapKeyA((prev) => prev + 1);
    }
  }, [compareRegionA]);

  // Incrementar key quando região B mudar
  useEffect(() => {
    if (compareRegionB) {
      setMapKeyB((prev) => prev + 1);
    }
  }, [compareRegionB]);

  // Carregar análise automaticamente quando cidade for selecionada na aba Região
  useEffect(() => {
    const loadCityAnalysis = async () => {
      if (
        mode === "regiao" &&
        selectedCidade &&
        selectedCidade !== "all" &&
        selectedCidadeNome
      ) {
        try {
          // Buscar coordenadas da cidade via API IBGE
          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${selectedCidade}`
          );
          
          if (!response.ok) {
            throw new Error("Erro ao buscar dados da cidade");
          }

          const data = await response.json();
          
          // Extrair latitude e longitude (a API retorna no formato string)
          // Algumas cidades têm coordenadas disponíveis na API
          // Se não tiver, vamos usar o geocoding do navegador como fallback
          
          // Tentar buscar do geocoding.json local primeiro
          let lat: number | null = null;
          let lng: number | null = null;

          try {
            const geocodingResponse = await fetch('/data/geocoding.json');
            const geocodingData = await geocodingResponse.json();
            const cityKey = `${selectedCidadeNome}, ${selectedEstado}`.toLowerCase();
            
            if (geocodingData[cityKey]) {
              lat = geocodingData[cityKey].lat;
              lng = geocodingData[cityKey].lng;
            }
          } catch (error) {
            console.log("Geocoding file not available, will use alternative");
          }

          // Se não encontrou no geocoding.json, usar coordenadas aproximadas do estado
          if (!lat || !lng) {
            // Coordenadas aproximadas dos estados (centros geográficos)
            const estadoCoords: Record<string, {lat: number, lng: number}> = {
              'AC': {lat: -8.77, lng: -70.55},
              'AL': {lat: -9.71, lng: -35.73},
              'AP': {lat: 1.41, lng: -51.77},
              'AM': {lat: -3.47, lng: -65.10},
              'BA': {lat: -12.96, lng: -38.51},
              'CE': {lat: -3.71, lng: -38.54},
              'DF': {lat: -15.83, lng: -47.86},
              'ES': {lat: -19.19, lng: -40.34},
              'GO': {lat: -16.64, lng: -49.31},
              'MA': {lat: -2.55, lng: -44.30},
              'MT': {lat: -12.64, lng: -55.42},
              'MS': {lat: -20.51, lng: -54.54},
              'MG': {lat: -18.10, lng: -44.38},
              'PA': {lat: -5.53, lng: -52.29},
              'PB': {lat: -7.06, lng: -35.55},
              'PR': {lat: -24.89, lng: -51.55},
              'PE': {lat: -8.28, lng: -35.07},
              'PI': {lat: -8.28, lng: -43.68},
              'RJ': {lat: -22.84, lng: -43.15},
              'RN': {lat: -5.22, lng: -36.52},
              'RS': {lat: -30.01, lng: -51.22},
              'RO': {lat: -11.22, lng: -62.80},
              'RR': {lat: 1.99, lng: -61.33},
              'SC': {lat: -27.33, lng: -49.44},
              'SP': {lat: -23.55, lng: -46.64},
              'SE': {lat: -10.90, lng: -37.07},
              'TO': {lat: -10.25, lng: -48.25},
            };

            const coords = estadoCoords[selectedEstado];
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
            } else {
              // Fallback para centro do Brasil
              lat = -14.235;
              lng = -51.925;
            }
          }

          const location = {
            lat,
            lng,
            name: `${selectedCidadeNome}, ${selectedEstado}`,
          };

          // Atualizar localização e iniciar análise
          setLocalLocation(location);
          setSelectedLocation(location);
          await startAnalysisFor(location);

          toast.success(`✅ Análise iniciada para ${selectedCidadeNome}`);
        } catch (error) {
          console.error("Error loading city analysis:", error);
          toast.error(
            "Erro ao carregar análise da cidade. Tente novamente."
          );
        }
      }
    };

    loadCityAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCidade, selectedCidadeNome, mode]);

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    setLocalLocation(location);
    setSelectedLocation(location);
  };

  const startAnalysisFor = async (loc: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    setLoading(true);
    setAnalyzedLocation(loc);
    try {
      await Promise.all([
        fetchWeatherData(loc.lat, loc.lng),
        fetchTopographyData(loc.lat, loc.lng),
      ]);
      setAnalysisStarted(true);
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Erro ao buscar dados. Usando dados estimados.");
      setAnalysisStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    await startAnalysisFor(localLocation);
  };

  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      // Use data from last year for historical analysis
      const endDate = subDays(new Date(), 1); // Yesterday
      const startDate = subDays(endDate, 365); // 1 year before yesterday

      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");

      console.log("Fetching NASA POWER data for location:", {
        lat,
        lng,
        startDateStr,
        endDateStr,
      });

      const { data, error } = await supabase.functions.invoke(
        "fetch-nasa-power-data",
        {
          body: {
            lat,
            lon: lng,
            startDate: startDateStr,
            endDate: endDateStr,
          },
        }
      );

      if (error) {
        console.error("Error fetching NASA POWER data:", error);
        toast.warning(
          "Não foi possível carregar dados da NASA POWER. Usando estimativas regionais."
        );
        return;
      }

      if (data?.averages) {
        const avgData = data.averages;

        console.log("NASA POWER data received:", avgData);

        setWeatherData({
          avgTemperature: avgData.temperature,
          avgSolarIrradiance: avgData.solarIrradiance, // Already in kWh/m²/day
          avgWindSpeed: avgData.windSpeed,
          avgHumidity: avgData.humidity,
          avgPressure: 1013, // Standard atmospheric pressure
          totalRainfall: avgData.totalPrecipitation,
          dataPoints: data.daysAnalyzed,
          dailyData: data.dailyData,
        });

        toast.success(
          `✅ Dados reais da NASA POWER: ${
            data.daysAnalyzed
          } dias analisados com média de vento de ${avgData.windSpeed.toFixed(
            1
          )} m/s`
        );

        // Run simulation with real data
        if (data.dailyData && data.dailyData.length > 0) {
          runHourlySimulation(data.dailyData);
        }
      } else {
        console.log("No weather data available, using estimates");
        toast.warning("Usando estimativas regionais para análise.");
      }
    } catch (error) {
      console.error("Error in fetchWeatherData:", error);
      toast.error("Erro ao buscar dados. Usando estimativas regionais.");
      throw error;
    }
  };

  // Função para calcular dados baseados na localização analisada
  const calculateLocationData = (lat: number, lng: number) => {
    // Se temos dados reais da NASA POWER, usar eles com prioridade
    let solarBase = 4.0; // default kWh/m²/day
    let windBase = 5.0; // default m/s

    if (weatherData) {
      solarBase = weatherData.avgSolarIrradiance;
      windBase = weatherData.avgWindSpeed;

      console.log("Using real NASA POWER data:", {
        temperature: weatherData.avgTemperature,
        solarIrradiance: weatherData.avgSolarIrradiance,
        windSpeed: weatherData.avgWindSpeed,
        humidity: weatherData.avgHumidity,
        precipitation: weatherData.totalRainfall,
      });
    }
    let environmentalImpact = "Moderado";
    let environmentalStatus = "warning";
    let biodiversity = "Moderada";
    let biodiversityStatus = "warning";
    let slope = "12°";
    let slopeStatus = "success";
    let waterResources = "Adequado";
    let waterStatus = "success";

    // Se não temos dados reais, usar estimativas regionais
    if (!weatherData) {
      // Nordeste (maior potencial para H2 Verde)
      if (lat > -18 && lat < -2) {
        solarBase = 5.8;
        windBase = 8.5;
        environmentalImpact = "Baixo";
        environmentalStatus = "success";
        waterResources = "Moderado";
        waterStatus = "warning";
      }
      // Norte
      else if (lat >= -2) {
        solarBase = 5.2;
        windBase = 4.5;
        environmentalImpact = "Alto";
        environmentalStatus = "error";
        biodiversity = "Alta";
        biodiversityStatus = "error";
        waterResources = "Abundante";
        waterStatus = "success";
      }
      // Centro-Oeste
      else if (lat >= -18 && lat < -5 && lng > -55) {
        solarBase = 5.5;
        windBase = 4.2;
        environmentalImpact = "Moderado";
        environmentalStatus = "warning";
        slope = "8°";
      }
      // Sudeste
      else if (lat >= -25 && lat < -18) {
        solarBase = 4.8;
        windBase = 5.5;
        environmentalImpact = "Baixo";
        environmentalStatus = "success";
        waterResources = "Bom";
        waterStatus = "success";
      }
      // Sul
      else if (lat < -25) {
        solarBase = 4.2;
        windBase = 7.8;
        environmentalImpact = "Baixo";
        environmentalStatus = "success";
        biodiversity = "Baixa";
        biodiversityStatus = "success";
        slope = "15°";
        slopeStatus = "warning";
      }

      // Variação baseada na longitude (proximidade com o litoral)
      const coastalBonus = lng > -45 ? 0.3 : 0;
      windBase += coastalBonus;
    }

    return {
      solarBase,
      windBase,
      environmentalImpact,
      environmentalStatus,
      biodiversity,
      biodiversityStatus,
      slope,
      slopeStatus,
      waterResources,
      waterStatus,
    };
  };

  // Função para simular operação do eletrolisador hora a hora
  const runHourlySimulation = (dailyData: DailyData[]) => {
    console.log(
      "Starting hourly simulation with",
      dailyData.length,
      "days of data"
    );

    // Parâmetros do projeto para 1, 3 e 5 anos
    const scenarios = [
      { years: 1, electrolyzerNominalPower: 100, scaleFactor: 1 }, // kW
      { years: 3, electrolyzerNominalPower: 300, scaleFactor: 3 }, // kW - 3x capacidade
      { years: 5, electrolyzerNominalPower: 500, scaleFactor: 5 }, // kW - 5x capacidade
    ];

    const results: SimulationResult[] = [];

    for (const scenario of scenarios) {
      const { electrolyzerNominalPower, scaleFactor } = scenario;

      // Parâmetros da instalação (escalam com o cenário)
      const solarPanelArea = 1000 * scaleFactor; // m² - escala proporcionalmente
      const solarEfficiency = 0.2; // 20%
      const windTurbineArea = 314 * scaleFactor; // m² - escala proporcionalmente
      const windEfficiency = 0.4; // 40%
      const airDensity = 1.225; // kg/m³

      // Limites operacionais do eletrolisador
      const minOperatingLoad = 0.2; // 20% da capacidade nominal (mínimo técnico)
      const electrolyzerMinPower = electrolyzerNominalPower * minOperatingLoad; // kW

      // Parâmetros de eficiência
      const electrolyzerConsumption = 65; // kWh/kg H2
      const systemEfficiency = 0.85; // 85% eficiência do sistema

      // Custos OTIMISTAS (curva de aprendizado)
      const solarCapexPerKW = 2400; // R$/kW (-40%)
      const windCapexPerKW = 7500; // R$/kW (-25%)
      const electrolyzerCapexPerKW = 12000; // R$/kW (-25%)
      const infrastructureMultiplier = 0.25; // -25% por otimizações avançadas
      const projectLifetime = 20; // anos
      const discountRate = 0.06; // 6% taxa de desconto
      const opexPercentage = 0.015; // 1.5% do CAPEX por ano
      const waterCostPerKg = 0.01; // R$/kg H2

      // Variáveis da simulação
      let totalEnergyConsumed = 0; // kWh
      let totalCurtailment = 0; // kWh
      let operatingHours = 0; // horas

      // Simular cada dia com pressupostos OTIMISTAS
      for (const day of dailyData) {
        // Maior capacidade de solar/eólica graças a otimizações
        const dailySolarEnergy =
          day.solarIrradiance * solarPanelArea * solarEfficiency * 1.25; // +25% por otimizações
        const solarPowerPerHour = dailySolarEnergy / 12;

        const windPowerPeak =
          (0.5 *
            airDensity *
            windTurbineArea *
            Math.pow(day.windSpeed, 3) *
            windEfficiency) /
          1000;
        // Fator de capacidade otimista: 40% em vez de 30%
        const windPowerPerHour = windPowerPeak * 0.40;

        // Simular 24 horas com curtailment REDUZIDO
        for (let hour = 0; hour < 24; hour++) {
          const solarAvailable = hour >= 6 && hour < 18 ? solarPowerPerHour : 0;
          const windAvailable = windPowerPerHour;
          const totalPowerAvailable =
            (solarAvailable + windAvailable) * systemEfficiency;

          // Lógica de operação OTIMISTA: reduzir curtailment com flexibilidade
          if (totalPowerAvailable >= electrolyzerNominalPower) {
            // Utilizar 95% da potência nominal (com buffer para controle)
            const utilizableEnergy = electrolyzerNominalPower * 0.95;
            totalEnergyConsumed += utilizableEnergy;
            // Curtailment reduzido: apenas 35% do excesso é perdido
            totalCurtailment += (totalPowerAvailable - utilizableEnergy) * 0.35;
            operatingHours += 1;
          } else if (totalPowerAvailable >= electrolyzerMinPower) {
            totalEnergyConsumed += totalPowerAvailable;
            operatingHours += 1;
          }
        }
      }

      // Anualizar resultados (multiplicar pelos anos do cenário)
      const annualEnergyConsumed = totalEnergyConsumed;
      const annualH2Production = annualEnergyConsumed / electrolyzerConsumption; // kg/ano

      // Calcular Fator de Capacidade
      const totalHoursInPeriod = dailyData.length * 24;
      const capacityFactor =
        (totalEnergyConsumed /
          (electrolyzerNominalPower * totalHoursInPeriod)) *
        100;

      // Calcular custos (escalam com o cenário)
      const estimatedSolarPower = 50 * scaleFactor; // kW (escala com capacidade)
      const estimatedWindPower = 30 * scaleFactor; // kW (escala com capacidade)

      const totalCapex =
        estimatedSolarPower * solarCapexPerKW +
        estimatedWindPower * windCapexPerKW +
        electrolyzerNominalPower * electrolyzerCapexPerKW +
        (estimatedSolarPower * solarCapexPerKW +
          estimatedWindPower * windCapexPerKW) *
          infrastructureMultiplier;

      // Anualizar CAPEX com CRF otimista
      const crf =
        (discountRate * Math.pow(1 + discountRate, projectLifetime)) /
        (Math.pow(1 + discountRate, projectLifetime) - 1);
      const capexAnnualized = totalCapex * crf;

      // OPEX anual (reduzido)
      const opexAnnual =
        totalCapex * opexPercentage + annualH2Production * waterCostPerKg;

      // LCOH com bônus de escala (-15% para cenários 3 e 5 anos, -20% para 5 anos)
      const scalingBonus = scenario.years === 5 ? 0.80 : scenario.years === 3 ? 0.85 : 1.0;
      const lcoh = ((capexAnnualized + opexAnnual) / annualH2Production) * scalingBonus;

      results.push({
        totalEnergyConsumed: annualEnergyConsumed,
        h2Production: annualH2Production,
        capacityFactor: capacityFactor,
        curtailment: totalCurtailment,
        operatingHours: operatingHours,
        lcoh: lcoh,
        capexAnnualized: capexAnnualized,
        opexAnnual: opexAnnual,
      });

      const h2Price = 40;
      const annualRevenue = annualH2Production * h2Price;
      const netAnnual = annualRevenue - opexAnnual;
      const payback = netAnnual > 0 ? totalCapex / netAnnual : 999;
      const roi = netAnnual > 0 ? (netAnnual / totalCapex) * 100 : 0;

      console.log(`Scenario ${scenario.years} year(s) [OTIMISTA]:`, {
        electrolyzerPower: electrolyzerNominalPower,
        energyConsumed: Math.ceil(annualEnergyConsumed),
        h2Production: Math.ceil(annualH2Production),
        capacityFactor: Math.ceil(capacityFactor) + "%",
        lcoh: Math.ceil(lcoh),
      });
    }

    setSimulationResults({
      oneYear: results[0],
      threeYears: results[1],
      fiveYears: results[2],
    });

    toast.success("✅ Simulação horária completa com dados reais!");
  };

  const fetchTopographyData = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      console.log("Fetching topography data for:", { lat, lng });

      const { data, error } = await supabase.functions.invoke(
        "fetch-topography-data",
        {
          body: { latitude: lat, longitude: lng },
        }
      );

      if (error) {
        console.error("Error fetching topography data:", error);
        toast.error(
          "Erro ao buscar dados topográficos. Usando estimativa regional."
        );
        return;
      }

      if (data) {
        console.log("Topography data received:", data);
        setTopographyData(data);
        toast.success("✅ Dados topográficos obtidos com sucesso!");
      }
    } catch (error) {
      console.error("Error in fetchTopographyData:", error);
      toast.error("Erro ao processar dados topográficos");
    } finally {
      setLoading(false);
    }
  };

  const locationData = calculateLocationData(
    analyzedLocation.lat,
    analyzedLocation.lng
  );

  // Função para calcular energia e produção de H2 usando fórmulas reais e valores realistas da indústria
  const calculateEnergyProduction = (
    solarIrradiance: number,
    windSpeed: number,
    scaleFactor: number = 1
  ): EnergyCalculations => {
    // ============ PARÂMETROS REALISTAS DA INDÚSTRIA ============

    // Instalação Solar (escala modesta - típico para projetos piloto/pequeno porte)
    const solarPanelArea = 1000 * scaleFactor; // m² (1.000 m² para 1 ano - ~200 kW pico)
    const solarEfficiency = 0.2; // 20% eficiência de painéis comerciais
    const solarCapacityFactor = 0.2; // 20% fator de capacidade real (dias/noites, nuvens, etc.)

    // Instalação Eólica (1 turbina pequena de ~100 kW)
    const windTurbineArea = 314 * scaleFactor; // m² (π × r² onde r=10m - turbina pequena)
    const windEfficiency = 0.4; // 40% eficiência (Betz limit ~59%, real ~35-45%)
    const windCapacityFactor = 0.3; // 30% fator de capacidade real
    const airDensity = 1.225; // kg/m³ (densidade do ar ao nível do mar)

    // ============ CÁLCULO DE ENERGIA SOLAR ============
    const dailySolarEnergy =
      solarIrradiance * 24 * solarPanelArea * solarEfficiency; // kWh/dia (cálculo anterior)
    const annualSolarEnergy = dailySolarEnergy * 365; // kWh/ano
    const solarPower = dailySolarEnergy / 24; // kW médio ao longo do dia

    // ============ CÁLCULO DE ENERGIA EÓLICA ============
    // Fórmula: P = 0.5 × ρ × A × v³ × η
    // Mas aplicamos fator de capacidade porque v é velocidade MÉDIA
    const windPowerPeak =
      (0.5 *
        airDensity *
        windTurbineArea *
        Math.pow(windSpeed, 3) *
        windEfficiency) /
      1000; // kW pico
    const windPower = windPowerPeak * windCapacityFactor; // kW médio considerando intermitência
    const dailyWindEnergy = windPower * 24; // kWh/dia
    const annualWindEnergy = dailyWindEnergy * 365; // kWh/ano

    // ============ ENERGIA TOTAL ============
    const totalPower = solarPower + windPower; // kW médio
    const dailyEnergy = dailySolarEnergy + dailyWindEnergy; // kWh/dia
    const annualEnergy = annualSolarEnergy + annualWindEnergy; // kWh/ano

    // ============ PRODUÇÃO DE H2 (VALORES REALISTAS) ============
    // Eletrolisadores modernos: PEM ~55 kWh/kg, Alcalino ~50 kWh/kg
    // Considerando perdas do sistema completo (conversão DC/AC, compressão, etc.): ~65 kWh/kg
    const electrolyzerEfficiency = 65; // kWh/kg H2 (valor realista considerando perdas)
    const systemEfficiency = 0.85; // 85% eficiência do sistema completo (conversão, compressão)

    const usableEnergy = dailyEnergy * systemEfficiency;
    const dailyH2Production = usableEnergy / electrolyzerEfficiency; // kg/dia
    const annualH2Production =
      (annualEnergy * systemEfficiency) / electrolyzerEfficiency; // kg/ano

    return {
      solarIrradiance: (solarIrradiance * 1000) / 24, // Converte para W/m² para exibição
      windSpeed,
      solarPanelArea,
      solarEfficiency,
      windTurbineArea,
      windEfficiency,
      solarPower,
      windPower,
      totalPower,
      dailyEnergy,
      annualEnergy,
      dailyH2Production,
      annualH2Production,
    };
  };

  // Cálculos de energia para cada período
  const energyCalc1Year = calculateEnergyProduction(
    locationData.solarBase,
    locationData.windBase,
    1
  );
  const energyCalc3Years = calculateEnergyProduction(
    locationData.solarBase,
    locationData.windBase,
    3
  );
  const energyCalc5Years = calculateEnergyProduction(
    locationData.solarBase,
    locationData.windBase,
    5
  );

  const analysisPeriods: AnalysisPeriod[] = [
    {
      years: 1,
      solarPotential: Math.ceil(locationData.solarBase),
      windPotential: Math.ceil(locationData.windBase),
      hydrogenProduction: Math.ceil(energyCalc1Year.annualH2Production),
      // Custos realistas da indústria 2024-2025:
      // - Painéis solares: R$ 3.000-4.000/kW instalado
      // - Turbinas eólicas pequenas: R$ 8.000-12.000/kW instalado
      // - Eletrolisadores PEM: R$ 15.000-20.000/kW (equipamento mais caro!)
      // - Infraestrutura (armazenamento, compressão, controles): +40%
      investment: Math.ceil(
        energyCalc1Year.solarPower * 3500 + // Solar
          energyCalc1Year.windPower * 10000 + // Eólico (turbinas pequenas são mais caras por kW)
          energyCalc1Year.totalPower * 1.0 * 18000 + // Eletrolisador (dimensionado pela potência total)
          (energyCalc1Year.solarPower * 3500 +
            energyCalc1Year.windPower * 10000) *
            0.4 // Infraestrutura
      ),
      // ROI: Preço do H2 verde no Brasil: R$ 20-30/kg (usando R$ 25/kg)
      roi: Math.ceil(
          ((energyCalc1Year.annualH2Production * 25) /
            (energyCalc1Year.solarPower * 3500 +
              energyCalc1Year.windPower * 10000 +
              energyCalc1Year.totalPower * 1.0 * 18000 +
              (energyCalc1Year.solarPower * 3500 +
                energyCalc1Year.windPower * 10000) *
                0.4)) *
          100
      ),
    },
    {
      years: 3,
      solarPotential: Math.ceil(locationData.solarBase * 0.98),
      windPotential: Math.ceil(locationData.windBase * 1.02),
      hydrogenProduction: Math.ceil(energyCalc3Years.annualH2Production),
      investment: Math.ceil(
        energyCalc3Years.solarPower * 3500 +
          energyCalc3Years.windPower * 10000 +
          energyCalc3Years.totalPower * 1.0 * 18000 +
          (energyCalc3Years.solarPower * 3500 +
            energyCalc3Years.windPower * 10000) *
            0.4
      ),
      roi: Math.ceil(
          ((energyCalc3Years.annualH2Production * 25 * 3) /
            (energyCalc3Years.solarPower * 3500 +
              energyCalc3Years.windPower * 10000 +
              energyCalc3Years.totalPower * 1.0 * 18000 +
              (energyCalc3Years.solarPower * 3500 +
                energyCalc3Years.windPower * 10000) *
                0.4)) *
          100
      ),
    },
    {
      years: 5,
      solarPotential: Math.ceil(locationData.solarBase * 0.96),
      windPotential: Math.ceil(locationData.windBase * 1.04),
      hydrogenProduction: Math.ceil(energyCalc5Years.annualH2Production),
      investment: Math.ceil(
        energyCalc5Years.solarPower * 3500 +
          energyCalc5Years.windPower * 10000 +
          energyCalc5Years.totalPower * 1.0 * 18000 +
          (energyCalc5Years.solarPower * 3500 +
            energyCalc5Years.windPower * 10000) *
            0.4
      ),
      roi: Math.ceil(
          ((energyCalc5Years.annualH2Production * 25 * 5) /
            (energyCalc5Years.solarPower * 3500 +
              energyCalc5Years.windPower * 10000 +
              energyCalc5Years.totalPower * 1.0 * 18000 +
              (energyCalc5Years.solarPower * 3500 +
                energyCalc5Years.windPower * 10000) *
                0.4)) *
          100
      ),
    },
  ];

  const environmentalFactors = [
    {
      icon: TreePine,
      title: "Impacto Ambiental",
      value: locationData.environmentalImpact,
      status: locationData.environmentalStatus,
      description: `Área com ${locationData.environmentalImpact.toLowerCase()} impacto em vegetação nativa`,
    },
    {
      icon: Activity,
      title: "Biodiversidade",
      value: locationData.biodiversity,
      status: locationData.biodiversityStatus,
      description:
        locationData.biodiversity === "Alta"
          ? "Alta biodiversidade requer estudos ambientais detalhados"
          : locationData.biodiversity === "Moderada"
          ? "Presença de espécies sensíveis requer avaliação"
          : "Baixa sensibilidade ambiental na região",
    },
    {
      icon: Mountain,
      title: "Declividade",
      value: topographyData
        ? `${topographyData.slopeCategory} (${topographyData.slopeDegrees}°)`
        : locationData.slope,
      status: topographyData?.slopeStatus || locationData.slopeStatus,
      description: topographyData
        ? topographyData.terrainType
        : locationData.slopeStatus === "success"
        ? "Topografia adequada para instalação"
        : "Topografia requer planejamento especial",
    },
    {
      icon: Droplet,
      title: "Recursos Hídricos",
      value: locationData.waterResources,
      status: locationData.waterStatus,
      description: `Disponibilidade hídrica ${locationData.waterResources.toLowerCase()} para o projeto`,
    },
  ];

  const recommendations = [
    {
      text: "Realizar estudo detalhado de impacto ambiental (EIA/RIMA)",
      priority: "high",
    },
    {
      text: "Avaliar infraestrutura de conexão à rede elétrica",
      priority: "high",
    },
    {
      text: "Consultar comunidades locais e obter licenças necessárias",
      priority: "high",
    },
    { text: "Análise de viabilidade econômica detalhada", priority: "medium" },
    {
      text: "Estudo de armazenamento e distribuição de H2",
      priority: "medium",
    },
    { text: "Planejamento de manutenção e operação", priority: "low" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-emerald-600";
      case "warning":
        return "text-amber-600";
      case "error":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const regionProfiles: Record<
    string,
    {
      solar: number;
      wind: number;
      environmentalImpact: string;
      environmentalStatus: "success" | "warning" | "error";
      biodiversity: string;
      biodiversityStatus: "success" | "warning" | "error";
      slopeLabel: string;
      slopeStatus: "success" | "warning" | "error";
      water: string;
      waterStatus: "success" | "warning" | "error";
    }
  > = {
    Norte: {
      solar: 5.2,
      wind: 4.5,
      environmentalImpact: "Alto",
      environmentalStatus: "error",
      biodiversity: "Alta",
      biodiversityStatus: "error",
      slopeLabel: "Variável (6°–12°)",
      slopeStatus: "warning",
      water: "Abundante",
      waterStatus: "success",
    },
    Nordeste: {
      solar: 5.8,
      wind: 8.5,
      environmentalImpact: "Baixo",
      environmentalStatus: "success",
      biodiversity: "Moderada",
      biodiversityStatus: "warning",
      slopeLabel: "Suave (8°)",
      slopeStatus: "success",
      water: "Moderado",
      waterStatus: "warning",
    },
    "Centro-Oeste": {
      solar: 5.5,
      wind: 4.2,
      environmentalImpact: "Moderado",
      environmentalStatus: "warning",
      biodiversity: "Moderada",
      biodiversityStatus: "warning",
      slopeLabel: "Plano a suave (8°)",
      slopeStatus: "success",
      water: "Adequado",
      waterStatus: "success",
    },
    Sudeste: {
      solar: 4.8,
      wind: 5.5,
      environmentalImpact: "Baixo",
      environmentalStatus: "success",
      biodiversity: "Moderada",
      biodiversityStatus: "warning",
      slopeLabel: "Suave a moderada (12°)",
      slopeStatus: "success",
      water: "Bom",
      waterStatus: "success",
    },
    Sul: {
      solar: 4.2,
      wind: 7.8,
      environmentalImpact: "Baixo",
      environmentalStatus: "success",
      biodiversity: "Baixa",
      biodiversityStatus: "success",
      slopeLabel: "Moderada (15°)",
      slopeStatus: "warning",
      water: "Bom",
      waterStatus: "success",
    },
  };

  const getRegionFactors = (region: string) => {
    const p = regionProfiles[region];
    if (!p) return [] as any[];
    return [
      {
        icon: Sun,
        title: "Solar",
        value: `${Math.ceil(p.solar)} kWh/m²/dia`,
        status: "success",
        description: "Irradiância média diária típica",
      },
      {
        icon: Wind,
        title: "Eólica",
        value: `${Math.ceil(p.wind)} m/s`,
        status: "success",
        description: "Velocidade média do vento",
      },
      {
        icon: TreePine,
        title: "Impacto Ambiental",
        value: p.environmentalImpact,
        status: p.environmentalStatus,
        description: "Condições ambientais regionais",
      },
      {
        icon: Activity,
        title: "Biodiversidade",
        value: p.biodiversity,
        status: p.biodiversityStatus,
        description: "Sensibilidade ecológica",
      },
      {
        icon: Mountain,
        title: "Topografia",
        value: p.slopeLabel,
        status: p.slopeStatus,
        description: "Declividade e implantação",
      },
      {
        icon: Droplet,
        title: "Recursos Hídricos",
        value: p.water,
        status: p.waterStatus,
        description: "Disponibilidade para processos",
      },
    ];
  };

  const getTechnologyFactors = (region: string) => {
    const p = regionProfiles[region];
    if (!p) return [] as any[];
    const solarLevel =
      p.solar >= 5.5
        ? { label: "Alta", status: "success" }
        : p.solar >= 5.0
        ? { label: "Boa", status: "success" }
        : { label: "Moderada", status: "warning" };
    const windLevel =
      p.wind >= 7.0
        ? { label: "Alta", status: "success" }
        : p.wind >= 5.5
        ? { label: "Boa", status: "success" }
        : { label: "Moderada", status: "warning" };
    const transmission =
      region === "Sudeste" || region === "Sul"
        ? { label: "Boa", status: "success" }
        : region === "Nordeste" || region === "Centro-Oeste"
        ? { label: "Moderada", status: "warning" }
        : { label: "Limitada", status: "error" };
    const logistics =
      region === "Sudeste" || region === "Sul"
        ? { label: "Bom", status: "success" }
        : region === "Nordeste" || region === "Centro-Oeste"
        ? { label: "Moderado", status: "warning" }
        : { label: "Limitado", status: "error" };
    const coast =
      region === "Centro-Oeste"
        ? { label: "Limitada", status: "warning" }
        : { label: "Presença", status: "success" };
    const industrial =
      region === "Sudeste"
        ? { label: "Alta", status: "success" }
        : region === "Sul"
        ? { label: "Boa", status: "success" }
        : region === "Nordeste" || region === "Centro-Oeste"
        ? { label: "Moderada", status: "warning" }
        : { label: "Limitada", status: "error" };
    const useOfLand =
      p.environmentalStatus === "error" || p.biodiversityStatus === "error"
        ? { label: "Sensível", status: "error" }
        : p.environmentalStatus === "warning" ||
          p.biodiversityStatus === "warning"
        ? { label: "Misto", status: "warning" }
        : { label: "Diversificado", status: "success" };
    const topoLabel =
      p.slopeStatus === "success"
        ? "Favorável"
        : p.slopeStatus === "warning"
        ? "Média"
        : "Desafiadora";
    const temperature =
      region === "Sul"
        ? { label: "Baixa", status: "warning" }
        : region === "Sudeste"
        ? { label: "Moderada", status: "warning" }
        : { label: "Alta", status: "success" };
    const climate =
      region === "Norte"
        ? { label: "Equatorial úmido", status: "warning" }
        : region === "Nordeste"
        ? { label: "Semiárido/Tropical", status: "warning" }
        : region === "Centro-Oeste"
        ? { label: "Tropical", status: "success" }
        : region === "Sudeste"
        ? { label: "Tropical/Subtropical", status: "success" }
        : { label: "Subtropical", status: "success" };

    return [
      {
        icon: Sun,
        title: "Solar",
        factors: [
          {
            label: "Insolação",
            value: solarLevel.label,
            status: solarLevel.status,
          },
          {
            label: "Temperatura",
            value: temperature.label,
            status: temperature.status,
          },
          {
            label: "Latitude",
            value:
              region === "Sul"
                ? "Alta"
                : region === "Norte"
                ? "Baixa"
                : "Média",
            status: "success",
          },
          { label: "Topografia", value: topoLabel, status: p.slopeStatus },
          {
            label: "Uso do solo",
            value: useOfLand.label,
            status: useOfLand.status,
          },
          {
            label: "Linhas de transmissão",
            value: transmission.label,
            status: transmission.status,
          },
          {
            label: "Restrições ambientais",
            value: p.environmentalImpact,
            status: p.environmentalStatus,
          },
        ],
      },
      {
        icon: Wind,
        title: "Eólica",
        factors: [
          {
            label: "Velocidade/constância dos ventos",
            value: windLevel.label,
            status: windLevel.status,
          },
          { label: "Topografia", value: topoLabel, status: p.slopeStatus },
          {
            label: "Acesso logístico",
            value: logistics.label,
            status: logistics.status,
          },
          { label: "Costa", value: coast.label, status: coast.status },
          {
            label: "Transmissão",
            value: transmission.label,
            status: transmission.status,
          },
          {
            label: "Impactos ambientais",
            value: p.environmentalImpact,
            status: p.environmentalStatus,
          },
        ],
      },
      {
        icon: Zap,
        title: "Hidrogênio Verde",
        factors: [
          {
            label: "Energia renovável disponível",
            value:
              solarLevel.label === "Alta" || windLevel.label === "Alta"
                ? "Alta"
                : solarLevel.label === "Boa" || windLevel.label === "Boa"
                ? "Boa"
                : "Moderada",
            status: "success",
          },
          { label: "Água", value: p.water, status: p.waterStatus },
          {
            label: "Infraestrutura de transporte",
            value: logistics.label,
            status: logistics.status,
          },
          {
            label: "Áreas industriais",
            value: industrial.label,
            status: industrial.status,
          },
          {
            label: "Uso do solo",
            value: useOfLand.label,
            status: useOfLand.status,
          },
          { label: "Clima", value: climate.label, status: climate.status },
          {
            label: "Preservação ambiental",
            value: p.environmentalImpact,
            status: p.environmentalStatus,
          },
        ],
      },
    ];
  };

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const statusScore = (s: string) =>
    s === "success" ? 0.9 : s === "warning" ? 0.6 : 0.3;
  const regionLatitudeScore = (region: string) =>
    region === "Norte"
      ? 1
      : region === "Nordeste"
      ? 0.95
      : region === "Centro-Oeste"
      ? 0.9
      : region === "Sudeste"
      ? 0.85
      : 0.8;
  const transmissionScore = (region: string) =>
    region === "Sudeste" || region === "Sul"
      ? 1
      : region === "Nordeste" || region === "Centro-Oeste"
      ? 0.7
      : 0.5;
  const logisticsScore = (region: string) =>
    region === "Sudeste" || region === "Sul"
      ? 1
      : region === "Nordeste" || region === "Centro-Oeste"
      ? 0.7
      : 0.5;
  const coastScore = (region: string) =>
    region === "Centro-Oeste" ? 0.2 : region === "Norte" ? 0.6 : 1;
  const industrialScore = (region: string) =>
    region === "Sudeste"
      ? 1
      : region === "Sul"
      ? 0.9
      : region === "Nordeste" || region === "Centro-Oeste"
      ? 0.7
      : 0.5;
  const temperatureScore = (region: string) =>
    region === "Sul" ? 0.7 : region === "Sudeste" ? 0.85 : 0.9;
  const climateScore = (region: string) =>
    region === "Norte"
      ? 0.8
      : region === "Nordeste"
      ? 0.7
      : region === "Centro-Oeste"
      ? 0.9
      : region === "Sudeste"
      ? 0.9
      : 0.85;

  const normalizationBounds = {
    solarMin: 4.0,
    solarMax: 6.5,
    windMin: 4.0,
    windMax: 9.5,
  };

  const weightsConfig = {
    solar: {
      insolacao: 0.35,
      temperatura: 0.1,
      latitude: 0.05,
      topografia: 0.15,
      usoSolo: 0.1,
      transmissao: 0.15,
      ambiental: 0.1,
    },
    wind: {
      vento: 0.4,
      topografia: 0.15,
      logistica: 0.15,
      costa: 0.1,
      transmissao: 0.1,
      ambiental: 0.1,
    },
    h2: {
      renovavel: 0.4,
      agua: 0.15,
      transporte: 0.1,
      industrial: 0.1,
      usoSolo: 0.1,
      clima: 0.05,
      preservacao: 0.1,
    },
  };

  // Perfis de viabilidade por estado (estimativas baseadas em características regionais)
  const estadoProfiles: Record<
    string,
    { solar: number; wind: number; h2: number }
  > = {
    AC: { solar: 68, wind: 45, h2: 62 },
    AL: { solar: 82, wind: 78, h2: 79 },
    AP: { solar: 71, wind: 52, h2: 65 },
    AM: { solar: 69, wind: 48, h2: 61 },
    BA: { solar: 88, wind: 85, h2: 87 },
    CE: { solar: 91, wind: 92, h2: 91 },
    DF: { solar: 79, wind: 58, h2: 72 },
    ES: { solar: 81, wind: 68, h2: 76 },
    GO: { solar: 83, wind: 62, h2: 75 },
    MA: { solar: 84, wind: 81, h2: 82 },
    MT: { solar: 86, wind: 65, h2: 78 },
    MS: { solar: 84, wind: 61, h2: 74 },
    MG: { solar: 82, wind: 71, h2: 78 },
    PA: { solar: 73, wind: 54, h2: 66 },
    PB: { solar: 89, wind: 87, h2: 88 },
    PR: { solar: 76, wind: 72, h2: 75 },
    PE: { solar: 90, wind: 89, h2: 89 },
    PI: { solar: 87, wind: 83, h2: 84 },
    RJ: { solar: 79, wind: 66, h2: 74 },
    RN: { solar: 92, wind: 94, h2: 93 },
    RS: { solar: 74, wind: 81, h2: 77 },
    RO: { solar: 71, wind: 49, h2: 63 },
    RR: { solar: 72, wind: 51, h2: 64 },
    SC: { solar: 75, wind: 77, h2: 76 },
    SP: { solar: 80, wind: 64, h2: 74 },
    SE: { solar: 85, wind: 80, h2: 82 },
    TO: { solar: 85, wind: 67, h2: 77 },
  };

  const getEstadoViability = (estadoSigla: string) => {
    return estadoProfiles[estadoSigla] || { solar: 50, wind: 50, h2: 50 };
  };

  const getSuitabilityScores = (region: string) => {
    const p = regionProfiles[region];
    if (!p) return { solar: 0, wind: 0, h2: 0 } as any;

    const solarNorm = clamp01(
      (p.solar - normalizationBounds.solarMin) /
        (normalizationBounds.solarMax - normalizationBounds.solarMin)
    );
    const windNorm = clamp01(
      (p.wind - normalizationBounds.windMin) /
        (normalizationBounds.windMax - normalizationBounds.windMin)
    );
    const topo = statusScore(p.slopeStatus);
    const env = statusScore(p.environmentalStatus);
    const landUse =
      p.environmentalStatus === "error" || p.biodiversityStatus === "error"
        ? 0.3
        : p.environmentalStatus === "warning" ||
          p.biodiversityStatus === "warning"
        ? 0.6
        : 0.9;
    const water = statusScore(p.waterStatus);
    const trans = transmissionScore(region);
    const logi = logisticsScore(region);
    const lat = regionLatitudeScore(region);
    const temp = temperatureScore(region);
    const coast = coastScore(region);
    const ind = industrialScore(region);
    const clim = climateScore(region);

    const solarWeights = weightsConfig.solar;
    const windWeights = weightsConfig.wind;
    const h2Weights = weightsConfig.h2;

    const solarScore =
      solarWeights.insolacao * solarNorm +
      solarWeights.temperatura * temp +
      solarWeights.latitude * lat +
      solarWeights.topografia * topo +
      solarWeights.usoSolo * landUse +
      solarWeights.transmissao * trans +
      solarWeights.ambiental * env;

    const windScore =
      windWeights.vento * windNorm +
      windWeights.topografia * topo +
      windWeights.logistica * logi +
      windWeights.costa * coast +
      windWeights.transmissao * trans +
      windWeights.ambiental * env;

    const renewableAvail = 0.5 * solarNorm + 0.5 * windNorm;
    const h2Score =
      h2Weights.renovavel * renewableAvail +
      h2Weights.agua * water +
      h2Weights.transporte * logi +
      h2Weights.industrial * ind +
      h2Weights.usoSolo * landUse +
      h2Weights.clima * clim +
      h2Weights.preservacao * env;

    return {
      solar: Math.round(solarScore * 100),
      wind: Math.round(windScore * 100),
      h2: Math.round(h2Score * 100),
    };
  };

  const calculateRegionalEstimate = (lat: number, lng: number) => {
    let solarBase = 4.0;
    let windBase = 5.0;
    let environmentalStatus: "success" | "warning" | "error" = "warning";
    let slopeStatus: "success" | "warning" | "error" = "success";

    if (lat > -18 && lat < -2) {
      solarBase = 5.8;
      windBase = 8.5;
      environmentalStatus = "success";
    } else if (lat >= -2) {
      solarBase = 5.2;
      windBase = 4.5;
      environmentalStatus = "error";
    } else if (lat >= -18 && lat < -5 && lng > -55) {
      solarBase = 5.5;
      windBase = 4.2;
      environmentalStatus = "warning";
      slopeStatus = "success";
    } else if (lat >= -25 && lat < -18) {
      solarBase = 4.8;
      windBase = 5.5;
      environmentalStatus = "success";
    } else if (lat < -25) {
      solarBase = 4.2;
      windBase = 7.8;
      environmentalStatus = "success";
      slopeStatus = "warning";
    }

    const coastalBonus = lng > -45 ? 0.3 : 0;
    windBase += coastalBonus;

    return { solarBase, windBase, environmentalStatus, slopeStatus };
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mt-[30px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">
                    Análise de Viabilidade para Hidrogênio Verde
                  </h1>
                  {mode === "cidade" && (
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-slate-600">
                        Local: {localLocation.name} | Coordenadas:{" "}
                        {localLocation.lat.toFixed(4)},{" "}
                        {localLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full lg:w-auto">
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cidade">Cidade</TabsTrigger>
                    <TabsTrigger value="regiao">Região</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Location Search */}
            {mode === "cidade" && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-200">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  <div className="flex-1 max-w-md">
                    <LocationSearch
                      onLocationSelect={handleLocationSelect}
                      initialLocation={localLocation}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartAnalysis}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Carregando...</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5" />
                        <span>Iniciar Análise</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </Card>
            )}
          </motion.div>

          {mode === "cidade" ? (
            !analysisStarted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-20"
              >
                <Card className="p-12 bg-white/80 backdrop-blur-sm border-emerald-200">
                  <BarChart3 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Selecione uma localização e inicie a análise
                  </h3>
                  <p className="text-slate-600">
                    Escolha uma cidade no campo acima e clique em "Iniciar
                    Análise" para visualizar o potencial de hidrogênio verde da
                    região.
                  </p>
                </Card>
              </motion.div>
            ) : (
              <>
                <Accordion
                  type="multiple"
                  defaultValue={[
                    "producao",
                    "simulacao",
                    "financeiro",
                    "ambiental",
                    "viabilidade",
                    "recomendacoes",
                  ]}
                  className="space-y-4"
                >
                  {/* Cálculo de Produção de Energia */}
                  <AccordionItem value="producao" className="border-none">
                    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <Zap className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Cálculo de Projeção para Produção de Hidrogênio
                            Verde
                          </h2>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 ml-auto">
                            📐 Fórmulas Reais
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <Tabs defaultValue="1" className="w-full">
                          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 rounded-xl border border-emerald-200 shadow-sm">
                            <TabsTrigger
                              value="1"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg transition-all"
                            >
                              1 Ano
                            </TabsTrigger>
                            <TabsTrigger
                              value="3"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg transition-all"
                            >
                              3 Anos
                            </TabsTrigger>
                            <TabsTrigger
                              value="5"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg transition-all"
                            >
                              5 Anos
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="1">
                            <div className="space-y-6">
                              {/* Entrada de Dados */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Sun className="w-5 h-5 mr-2 text-amber-600" />
                                  1. Entrada de Energia Renovável
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      ☀️ <strong>Irradiância Solar:</strong>{" "}
                                      {Math.ceil(energyCalc1Year.solarIrradiance)}{" "}
                                      W/m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      📐 <strong>Área dos Painéis:</strong>{" "}
                                      {energyCalc1Year.solarPanelArea.toLocaleString()}{" "}
                                      m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      ⚡ <strong>Eficiência:</strong>{" "}
                                      {Math.ceil(
                                        energyCalc1Year.solarEfficiency * 100
                                      )}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> P
                                      <sub>solar</sub> = G × A × η
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600 mt-3">
                                      {Math.ceil(energyCalc1Year.solarPower)} kW
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Potência Solar Gerada
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      💨 <strong>Velocidade do Vento:</strong>{" "}
                                      {Math.ceil(energyCalc1Year.windSpeed)} m/s
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      📐 <strong>Área Varrida:</strong>{" "}
                                      {energyCalc1Year.windTurbineArea.toLocaleString()}{" "}
                                      m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      ⚡ <strong>Eficiência:</strong>{" "}
                                      {Math.ceil((
                                        energyCalc1Year.windEfficiency * 100
                                      ))}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> P
                                      <sub>eólica</sub> = ½ × ρ × A × v³ × η
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600 mt-3">
                                      {Math.ceil(energyCalc1Year.windPower)} kW
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Potência Eólica Gerada
                                    </p>
                                  </Card>
                                </div>
                              </div>

                              {/* Energia Total */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                  2. Energia Total Disponível
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Potência Total
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil(energyCalc1Year.totalPower)}
                                    </p>
                                    <p className="text-xs text-slate-600">kW</p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Energia Diária
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil(energyCalc1Year.dailyEnergy)}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      kWh/dia
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Energia Anual
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil((
                                        energyCalc1Year.annualEnergy / 1000
                                      ))}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      MWh/ano
                                    </p>
                                  </Card>
                                </div>
                              </div>

                              {/* Produção de H2 */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Droplet className="w-5 h-5 mr-2 text-emerald-600" />
                                  3. Produção de Hidrogênio Verde
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      💧 <strong>Produção Diária:</strong>
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {energyCalc1Year.dailyH2Production >= 1000
                                        ? Math.ceil(energyCalc1Year.dailyH2Production / 1000) + " t/dia"
                                        : Math.ceil(energyCalc1Year.dailyH2Production) + " kg/dia"}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Consumo eletrolisador:</strong> 65
                                      kWh/kg H₂ (incluindo perdas do sistema)
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1 p-2 bg-amber-50 rounded">
                                      ⚠️ Valores realistas considerando fator de
                                      capacidade solar (~20%) e eólico (~30%)
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      📊 <strong>Produção Anual:</strong>
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {Math.ceil(energyCalc1Year.annualH2Production)}{" "}
                                      Ton/ano
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> H₂ (kg) = E
                                      <sub>disponível</sub> / 50 kWh/kg
                                    </p>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="3">
                            <div className="space-y-6">
                              {/* Entrada de Dados */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Sun className="w-5 h-5 mr-2 text-amber-600" />
                                  1. Entrada de Energia Renovável (Expansão 3x)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      ☀️ <strong>Irradiância Solar:</strong>{" "}
                                      {energyCalc3Years.solarIrradiance.toFixed(
                                        0
                                      )}{" "}
                                      W/m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      📐 <strong>Área dos Painéis:</strong>{" "}
                                      {energyCalc3Years.solarPanelArea.toLocaleString()}{" "}
                                      m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      ⚡ <strong>Eficiência:</strong>{" "}
                                      {Math.ceil((
                                        energyCalc3Years.solarEfficiency * 100
                                      ))}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> P
                                      <sub>solar</sub> = G × A × η
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600 mt-3">
                                      {Math.ceil(energyCalc3Years.solarPower)}{" "}
                                      kW
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Potência Solar Gerada
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      💨 <strong>Velocidade do Vento:</strong>{" "}
                                      {Math.ceil(energyCalc3Years.windSpeed)}{" "}
                                      m/s
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      📐 <strong>Área Varrida:</strong>{" "}
                                      {energyCalc3Years.windTurbineArea.toLocaleString()}{" "}
                                      m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      ⚡ <strong>Eficiência:</strong>{" "}
                                      {Math.ceil((
                                        energyCalc3Years.windEfficiency * 100
                                      ))}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> P
                                      <sub>eólica</sub> = ½ × ρ × A × v³ × η
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600 mt-3">
                                      {Math.ceil(energyCalc3Years.windPower)} kW
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Potência Eólica Gerada
                                    </p>
                                  </Card>
                                </div>
                              </div>

                              {/* Energia Total */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                  2. Energia Total Disponível
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Potência Total
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil(energyCalc3Years.totalPower)}
                                    </p>
                                    <p className="text-xs text-slate-600">kW</p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Energia Diária
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil(energyCalc3Years.dailyEnergy)}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      kWh/dia
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Energia Anual
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil((
                                        energyCalc3Years.annualEnergy / 1000
                                      ))}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      MWh/ano
                                    </p>
                                  </Card>
                                </div>
                              </div>

                              {/* Produção de H2 */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Droplet className="w-5 h-5 mr-2 text-emerald-600" />
                                  3. Produção de Hidrogênio Verde
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      💧 <strong>Produção Diária:</strong>
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {energyCalc3Years.dailyH2Production >= 1000
                                        ? Math.ceil(energyCalc3Years.dailyH2Production / 1000) + " t/dia"
                                        : Math.ceil(energyCalc3Years.dailyH2Production) + " kg/dia"}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Consumo eletrolisador:</strong> 65
                                      kWh/kg H₂ (incluindo perdas do sistema)
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1 p-2 bg-amber-50 rounded">
                                      ⚠️ Valores realistas considerando fator de
                                      capacidade solar (~20%) e eólico (~30%)
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      📊 <strong>Produção Anual:</strong>
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {Math.ceil(energyCalc3Years.annualH2Production)}{" "}
                                      Toneladas/ano
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> H₂ (kg) = E
                                      <sub>disponível</sub> / 50 kWh/kg
                                    </p>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="5">
                            <div className="space-y-6">
                              {/* Entrada de Dados */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Sun className="w-5 h-5 mr-2 text-amber-600" />
                                  1. Entrada de Energia Renovável (Expansão 5x)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      ☀️ <strong>Irradiância Solar:</strong>{" "}
                                      {energyCalc5Years.solarIrradiance.toFixed(
                                        0
                                      )}{" "}
                                      W/m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      📐 <strong>Área dos Painéis:</strong>{" "}
                                      {energyCalc5Years.solarPanelArea.toLocaleString()}{" "}
                                      m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      ⚡ <strong>Eficiência:</strong>{" "}
                                      {Math.ceil((
                                        energyCalc5Years.solarEfficiency * 100
                                      ))}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> P
                                      <sub>solar</sub> = G × A × η
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600 mt-3">
                                      {Math.ceil(energyCalc5Years.solarPower)}{" "}
                                      kW
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Potência Solar Gerada
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      💨 <strong>Velocidade do Vento:</strong>{" "}
                                      {Math.ceil(energyCalc5Years.windSpeed)}{" "}
                                      m/s
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      📐 <strong>Área Varrida:</strong>{" "}
                                      {energyCalc5Years.windTurbineArea.toLocaleString()}{" "}
                                      m²
                                    </p>
                                    <p className="text-sm text-slate-700 mb-2">
                                      ⚡ <strong>Eficiência:</strong>{" "}
                                      {Math.ceil((
                                        energyCalc5Years.windEfficiency * 100
                                      ))}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> P
                                      <sub>eólica</sub> = ½ × ρ × A × v³ × η
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600 mt-3">
                                      {Math.ceil(energyCalc5Years.windPower)} kW
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Potência Eólica Gerada
                                    </p>
                                  </Card>
                                </div>
                              </div>

                              {/* Energia Total */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                  2. Energia Total Disponível
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Potência Total
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil(energyCalc5Years.totalPower)}
                                    </p>
                                    <p className="text-xs text-slate-600">kW</p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Energia Diária
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil(energyCalc5Years.dailyEnergy)}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      kWh/dia
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      Energia Anual
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil((
                                        energyCalc5Years.annualEnergy / 1000
                                      ))}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      MWh/ano
                                    </p>
                                  </Card>
                                </div>
                              </div>

                              {/* Produção de H2 */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                  <Droplet className="w-5 h-5 mr-2 text-emerald-600" />
                                  3. Produção de Hidrogênio Verde
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      💧 <strong>Produção Diária:</strong>
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {energyCalc5Years.dailyH2Production >= 1000
                                        ? Math.ceil(energyCalc5Years.dailyH2Production / 1000) + " t/dia"
                                        : Math.ceil(energyCalc5Years.dailyH2Production) + " kg/dia"}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Consumo eletrolisador:</strong> 65
                                      kWh/kg H₂ (incluindo perdas do sistema)
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1 p-2 bg-amber-50 rounded">
                                      ⚠️ Valores realistas considerando fator de
                                      capacidade solar (~20%) e eólico (~30%)
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-2">
                                      📊 <strong>Produção Anual:</strong>
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {Math.ceil(energyCalc5Years.annualH2Production)}{" "}
                                      Toneladas/ano
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                      <strong>Fórmula:</strong> H₂ (kg) = E
                                      <sub>disponível</sub> / 50 kWh/kg
                                    </p>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>

                  {/* Simulação Horária */}
                  {simulationResults.oneYear && (
                    <AccordionItem value="simulacao" className="border-none">
                      <Card className="bg-white/80 backdrop-blur-sm border-blue-200 overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-center space-x-3 w-full">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">
                              Simulação Horária
                            </h2>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <Tabs defaultValue="1" className="w-full">
                            <TabsList className="relative grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 h-[50px] rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                              <TabsTrigger
                                value="1"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                              >
                                <div className="text-sm font-medium">
                                  Cenário 1 Ano
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  100 kW
                                </div>
                              </TabsTrigger>
                              <TabsTrigger
                                value="3"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                              >
                                <div className="text-sm font-medium">
                                  Cenário 3 Anos
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  300 kW
                                </div>
                              </TabsTrigger>
                              <TabsTrigger
                                value="5"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                              >
                                <div className="text-sm font-medium">
                                  Cenário 5 Anos
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  500 kW
                                </div>
                              </TabsTrigger>
                            </TabsList>
                            {/* Cenário 1 Ano */}
                            <TabsContent value="1">
                              <div className="space-y-6">
                                {/* Métricas Principais */}
                                <div className="grid md:grid-cols-4 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⚡ Fator de Capacidade
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                      {simulationResults.oneYear.capacityFactor.toFixed(
                                        1
                                      )}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Eficiência operacional do eletrolisador
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      💰 LCOH
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600">
                                      R${" "}
                                      {simulationResults.oneYear.lcoh.toFixed(2).replace('.', ',')}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Por kg de H₂
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      🔋 Energia Consumida
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil((
                                        simulationResults.oneYear
                                          .totalEnergyConsumed / 1000
                                      ))}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      MWh/ano
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      💧 Produção H₂
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {Math.ceil((
                                        simulationResults.oneYear.h2Production /
                                        1000
                                      ))}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Toneladas/ano
                                    </p>
                                  </Card>
                                </div>

                                {/* Métricas Operacionais */}
                                <div className="grid md:grid-cols-3 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⏰ Horas de Operação
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600">
                                      {simulationResults.oneYear.operatingHours.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Horas/ano de{" "}
                                      {(weatherData?.dataPoints || 365) * 24}{" "}
                                      total
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⚠️ Curtailment
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">
                                      {Math.ceil((
                                        simulationResults.oneYear.curtailment /
                                        1000
                                      ))}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      MWh perdido/ano
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      📊 Potência Nominal
                                    </p>
                                    <p className="text-2xl font-bold text-slate-600">
                                      100 kW
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Eletrolisador dimensionado
                                    </p>
                                  </Card>
                                </div>

                                {/* Custos Detalhados */}
                                <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                    💵 Detalhamento de Custos (LCOH)
                                  </h3>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-slate-700 mb-1">
                                        CAPEX Anualizado:
                                      </p>
                                      <p className="text-xl font-bold text-indigo-600">
                                        R${" "}
                                        {formatCurrency(simulationResults.oneYear.capexAnnualized, 2)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-700 mb-1">
                                        OPEX Anual:
                                      </p>
                                      <p className="text-xl font-bold text-indigo-600">
                                        R${" "}
                                        {formatCurrency(simulationResults.oneYear.opexAnnual, 2)}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                    <strong>Fórmula LCOH:</strong> (CAPEX
                                    Anualizado + OPEX Anual) / Produção Anual de
                                    H₂
                                  </p>
                                </Card>
                              </div>
                            </TabsContent>

                            {/* Cenário 3 Anos */}
                            <TabsContent value="3">
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-4 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⚡ Fator de Capacidade
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                      {simulationResults.threeYears!.capacityFactor.toFixed(
                                        1
                                      )}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Eficiência operacional do eletrolisador
                                    </p>
                                  </Card>
                                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      💰 LCOH
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600">
                                      R${" "}
                                      {simulationResults.threeYears!.lcoh.toFixed(
                                        2
                                      )}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      por Kg de H₂
                                    </p>
                                  </Card>
                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      🔋 Energia Consumida
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil((
                                        simulationResults.threeYears!
                                          .totalEnergyConsumed / 1000
                                      ))}{" "}
                                      MWh
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      MWh/ano
                                    </p>
                                  </Card>
                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      💧 Produção H₂
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {Math.ceil((
                                        simulationResults.threeYears!
                                          .h2Production / 1000
                                      ))}{" "}
                                      t
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Toneladas/ano
                                    </p>
                                  </Card>
                                </div>

                                {/* Métricas Operacionais - Cenário 3 Anos */}
                                <div className="grid md:grid-cols-3 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⏰ Horas de Operação
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600">
                                      {simulationResults.threeYears!.operatingHours.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      horas/ano de {(weatherData?.dataPoints || 365) * 24} total
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⚠️ Curtailment
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">
                                      {Math.ceil((simulationResults.threeYears!.curtailment / 1000))}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">MWh perdido/ano</p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                                    <p className="text-sm text-slate-700 mb-1">📊 Potência Nominal</p>
                                    <p className="text-2xl font-bold text-slate-600">300 kW</p>
                                    <p className="text-xs text-slate-600 mt-2">Eletrolisador dimensionado</p>
                                  </Card>
                                </div>

                                <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                    💵 Custos (300 kW)
                                  </h3>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-slate-700">
                                        CAPEX Anualizado: R${" "}
                                        {formatCurrency(simulationResults.threeYears!.capexAnnualized, 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-700">
                                        OPEX Anual: R${" "}
                                        {formatCurrency(simulationResults.threeYears!.opexAnnual, 0)}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              </div>
                            </TabsContent>

                            {/* Cenário 5 Anos */}
                            <TabsContent value="5">
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-4 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⚡ Fator de Capacidade
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                      {simulationResults.fiveYears!.capacityFactor.toFixed(
                                        1
                                      )}
                                      %
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Eficiência operacional do eletrolisador
                                    </p>
                                  </Card>
                                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      💰 LCOH
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600">
                                      R${" "}
                                      {simulationResults.fiveYears!.lcoh.toFixed(
                                        2
                                      )}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      por Kg de H₂
                                    </p>
                                  </Card>
                                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      🔋 Energia Consumida
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                      {Math.ceil((
                                        simulationResults.fiveYears!
                                          .totalEnergyConsumed / 1000
                                      ))}{" "}
                                      MWh
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      MWh/ano
                                    </p>
                                  </Card>
                                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      💧 Produção H₂
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                      {Math.ceil((
                                        simulationResults.fiveYears!
                                          .h2Production / 1000
                                      ))}{" "}
                                      t
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      Toneladas/ano
                                    </p>
                                  </Card>
                                </div>

                                {/* Métricas Operacionais - Cenário 5 Anos */}
                                <div className="grid md:grid-cols-3 gap-4">
                                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⏰ Horas de Operação
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600">
                                      {simulationResults.fiveYears!.operatingHours.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      horas/ano de {(weatherData?.dataPoints || 365) * 24} total
                                    </p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                                    <p className="text-sm text-slate-700 mb-1">
                                      ⚠️ Curtailment
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">
                                      {Math.ceil((simulationResults.fiveYears!.curtailment / 1000))}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">MWh perdido/ano</p>
                                  </Card>

                                  <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                                    <p className="text-sm text-slate-700 mb-1">📊 Potência Nominal</p>
                                    <p className="text-2xl font-bold text-slate-600">500 kW</p>
                                    <p className="text-xs text-slate-600 mt-2">Eletrolisador dimensionado</p>
                                  </Card>
                                </div>

                                <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                    💵 Custos (500 kW)
                                  </h3>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-slate-700">
                                        CAPEX Anualizado: R${" "}
                                        {formatCurrency(simulationResults.fiveYears!.capexAnnualized, 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-700">
                                        OPEX Anual: R${" "}
                                        {formatCurrency(simulationResults.fiveYears!.opexAnnual, 0)}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              </div>
                            </TabsContent>
                          </Tabs>

                          {/* Explicação */}
                          <Card className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                              📊 Sobre a Simulação
                            </h3>
                            <p className="text-sm text-slate-700 mb-2">
                              Análise detalhada simulando operação hora a hora:
                            </p>
                            <ul className="text-sm text-slate-700 space-y-1 ml-4 list-disc">
                              <li>
                                <strong>Fator de Capacidade:</strong> Eficiência
                                real do eletrolisador
                              </li>
                              <li>
                                <strong>LCOH:</strong> Custo nivelado do H₂
                                (CAPEX + OPEX / Produção)
                              </li>
                              <li>
                                <strong>Curtailment:</strong> Energia renovável
                                desperdiçada
                              </li>
                              <li>
                                <strong>Operação:</strong> 20-100% quando
                                energia disponível nessa faixa
                              </li>
                            </ul>
                          </Card>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  )}

                  {/* Resumo Financeiro */}
                  {simulationResults.oneYear && (
                    <AccordionItem value="financeiro" className="border-none">
                      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                          <div className="flex items-center space-x-3 w-full">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-2xl font-bold text-slate-900">
                              Análise Financeira e Estudo de Viabilidade
                            </h2>
                            <Badge className="bg-green-100 text-green-800 border-green-300 ml-auto">
                              ✓ Baseado em Simulação Real
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <Tabs defaultValue="1" className="w-full">
                            <TabsList className="relative grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 h-[50px] rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                              <TabsTrigger
                                value="1"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center h-[35px] "
                              >
                                <div className="text-sm font-medium">
                                  Cenário 1 Ano
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  100 kW
                                </div>
                              </TabsTrigger>
                              <TabsTrigger
                                value="3"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                              >
                                <div className="text-sm font-medium">
                                  Cenário 3 Anos
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  300 kW
                                </div>
                              </TabsTrigger>
                              <TabsTrigger
                                value="5"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                              >
                                <div className="text-sm font-medium">
                                  Cenário 5 Anos
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  500 kW
                                </div>
                              </TabsTrigger>
                            </TabsList>

                            {/* Cenário 1 Ano */}
                            <TabsContent value="1">
                              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Droplet className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      LCOH
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    R${" "}
                                    {simulationResults.oneYear.lcoh.toFixed(2).replace('.', ',')}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    por kg de H₂
                                  </p>
                                  <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">
                                    {simulationResults.oneYear.lcoh < 8
                                      ? "✓ Competitivo"
                                      : simulationResults.oneYear.lcoh < 12
                                      ? "~ Razoável"
                                      : "⚠ Alto"}
                                  </Badge>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Fator Capacidade
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    {simulationResults.oneYear.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Eficiência operacional
                                  </p>
                                  <Badge className="mt-2 bg-emerald-100 text-emerald-800 text-xs">
                                    {simulationResults.oneYear.capacityFactor >
                                    40
                                      ? "✓ Excelente"
                                      : simulationResults.oneYear
                                          .capacityFactor > 25
                                      ? "~ Bom"
                                      : "⚠ Baixo"}
                                  </Badge>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Produção Anual
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    {simulationResults.oneYear.h2Production.toFixed(
                                      2
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Kg H₂/ano
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Receita Potencial
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    R${" "}
                                    {(
                                      simulationResults.oneYear.h2Production *
                                      25
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Por ano (R$ 25/kg H₂)
                                  </p>
                                </Card>
                              </div>

                              {/* Análise ROI */}
                              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                  📊 Análise de Retorno sobre Investimento
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      CAPEX Total:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      R${" "}
                                      {(
                                        simulationResults.oneYear
                                          .capexAnnualized / 0.117
                                      ).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      Payback Estimado:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      {Math.floor(
                                        simulationResults.oneYear
                                          .capexAnnualized /
                                        0.117 /
                                        (simulationResults.oneYear
                                          .h2Production *
                                          25 -
                                          simulationResults.oneYear.opexAnnual)
                                      )}{" "}
                                      anos
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      ROI Anual:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      {Math.ceil(
                                        ((simulationResults.oneYear
                                          .h2Production *
                                          25 -
                                          simulationResults.oneYear
                                            .opexAnnual) /
                                          (simulationResults.oneYear
                                            .capexAnnualized /
                                            0.117)) *
                                        100
                                      )}
                                      %
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                  💡 Assumindo preço de venda de R$ 25/Kg e taxa
                                  de desconto de 10% ao ano
                                </p>
                              </Card>
                            </TabsContent>

                            {/* Cenário 3 Anos */}
                            <TabsContent value="3">
                              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Droplet className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      LCOH
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    R${" "}
                                    {simulationResults.threeYears!.lcoh.toFixed(2).replace('.', ',')}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    por Kg de H₂
                                  </p>
                                  <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">
                                    {simulationResults.threeYears!.lcoh < 8
                                      ? "✓ Competitivo"
                                      : simulationResults.threeYears!.lcoh < 12
                                      ? "~ Razoável"
                                      : "⚠ Alto"}
                                  </Badge>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Fator Capacidade
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    {simulationResults.threeYears!.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Eficiência operacional
                                  </p>
                                  <Badge className="mt-2 bg-emerald-100 text-emerald-800 text-xs">
                                    {simulationResults.threeYears!
                                      .capacityFactor > 40
                                      ? "✓ Excelente"
                                      : simulationResults.threeYears!
                                          .capacityFactor > 25
                                      ? "~ Bom"
                                      : "⚠ Baixo"}
                                  </Badge>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Produção Anual
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    {simulationResults.threeYears!.h2Production.toFixed(
                                      2
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Kg H₂/ano
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Receita Potencial
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    R${" "}
                                    {(
                                      simulationResults.threeYears!
                                        .h2Production * 25
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Por ano (R$ 25/Kg H₂)
                                  </p>
                                </Card>
                              </div>

                              {/* Análise ROI */}
                              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                  📊 Análise de Retorno sobre Investimento
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      CAPEX Total:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      R${" "}
                                      {(
                                        simulationResults.threeYears!
                                          .capexAnnualized / 0.117
                                      ).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      Payback Estimado:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      {Math.floor(
                                        simulationResults.threeYears!
                                          .capexAnnualized /
                                        0.117 /
                                        (simulationResults.threeYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.threeYears!
                                            .opexAnnual)
                                      )}{" "}
                                      anos
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      ROI Anual:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      {Math.ceil(
                                        ((simulationResults.threeYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.threeYears!
                                            .opexAnnual) /
                                          (simulationResults.threeYears!
                                            .capexAnnualized /
                                            0.117)) *
                                        100
                                      )}
                                      %
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                  💡 Assumindo preço de venda de R$ 25/kg e taxa
                                  de desconto de 10% ao ano
                                </p>
                              </Card>
                            </TabsContent>

                            {/* Cenário 5 Anos */}
                            <TabsContent value="5">
                              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Droplet className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      LCOH
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    R${" "}
                                    {simulationResults.fiveYears!.lcoh.toFixed(2).replace('.', ',')}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    por kg de H₂
                                  </p>
                                  <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">
                                    {simulationResults.fiveYears!.lcoh < 8
                                      ? "✓ Competitivo"
                                      : simulationResults.fiveYears!.lcoh < 12
                                      ? "~ Razoável"
                                      : "⚠ Alto"}
                                  </Badge>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Fator Capacidade
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    {simulationResults.fiveYears!.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Eficiência operacional
                                  </p>
                                  <Badge className="mt-2 bg-emerald-100 text-emerald-800 text-xs">
                                    {simulationResults.fiveYears!
                                      .capacityFactor > 40
                                      ? "✓ Excelente"
                                      : simulationResults.fiveYears!
                                          .capacityFactor > 25
                                      ? "~ Bom"
                                      : "⚠ Baixo"}
                                  </Badge>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Produção Anual
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    {simulationResults.fiveYears!.h2Production.toFixed(
                                      2
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    kg H₂/ano
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Receita Potencial
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-slate-900">
                                    R${" "}
                                    {(
                                      simulationResults.fiveYears!
                                        .h2Production * 25
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Por ano (R$ 25/kg H₂)
                                  </p>
                                </Card>
                              </div>

                              {/* Análise ROI */}
                              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                  📊 Análise de Retorno sobre Investimento
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      CAPEX Total:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      R${" "}
                                      {(
                                        simulationResults.fiveYears!
                                          .capexAnnualized / 0.117
                                      ).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      Payback Estimado:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      {Math.floor(
                                        simulationResults.fiveYears!
                                          .capexAnnualized /
                                        0.117 /
                                        (simulationResults.fiveYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.fiveYears!
                                            .opexAnnual)
                                      )}{" "}
                                      anos
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      ROI Anual:
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      {Math.ceil(
                                        ((simulationResults.fiveYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.fiveYears!
                                            .opexAnnual) /
                                          (simulationResults.fiveYears!
                                            .capexAnnualized /
                                            0.117)) *
                                        100
                                      )}
                                      %
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                  💡 Assumindo preço de venda de R$ 25/kg e taxa
                                  de desconto de 10% ao ano
                                </p>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  )}

                  {/* Análise Ambiental */}
                  <AccordionItem value="ambiental" className="border-none">
                    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <TreePine className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Análise Ambiental
                          </h2>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {environmentalFactors.map((factor, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                            >
                              <Card className="p-4 h-full hover:shadow-lg transition-shadow">
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`p-2 rounded-lg ${getStatusColor(
                                      factor.status
                                    )} bg-opacity-10`}
                                  >
                                    <factor.icon
                                      className={`w-5 h-5 ${getStatusColor(
                                        factor.status
                                      )}`}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      {factor.title}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={getPriorityColor(
                                        factor.status
                                      )}
                                    >
                                      {factor.value}
                                    </Badge>
                                    <p className="text-xs text-slate-600 mt-2">
                                      {factor.description}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>

                  {/* Viabilidade do Projeto */}
                  {simulationResults.oneYear && (
                    <AccordionItem value="viabilidade" className="border-none">
                      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                          <div className="flex items-center space-x-3 w-full">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-2xl font-bold text-slate-900">
                              Viabilidade do Projeto
                            </h2>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <Tabs
                            value={scenario}
                            onValueChange={(v) => setScenario(v as "1" | "3" | "5")}
                            className="w-full"
                          >
                            <TabsList className="relative grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 h-[50px] rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                              <TabsTrigger
                                value="1"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center h-[35px] "
                              >
                                <div className="text-sm font-medium">
                                  Cenário 1 Ano
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  100 kW
                                </div>
                              </TabsTrigger>
                              <TabsTrigger
                                value="3"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                              >
                                <div className="text-sm font-medium">
                                  Cenário 3 Anos
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  300 kW
                                </div>
                              </TabsTrigger>
                              <TabsTrigger
                                value="5"
                                className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                              >
                                <div className="text-sm font-medium">
                                  Cenário 5 Anos
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  500 kW
                                </div>
                              </TabsTrigger>
                            </TabsList>

                            {/* Cenário 1 Ano */}
                            <TabsContent value="1">
                              <div className="space-y-4">
                                {/* Viabilidade Técnica */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.oneYear.capacityFactor >
                                    30
                                      ? "bg-emerald-50 border-emerald-200"
                                      : "bg-amber-50 border-amber-200"
                                  }`}
                                >
                                  {simulationResults.oneYear.capacityFactor >
                                  30 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Viabilidade Técnica
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Fator de Capacidade de{" "}
                                      {simulationResults.oneYear.capacityFactor.toFixed(
                                        1
                                      )}
                                      %
                                      {simulationResults.oneYear
                                        .capacityFactor > 40 &&
                                        " - Excelente! Acima da média do setor (30-35%)."}
                                      {simulationResults.oneYear
                                        .capacityFactor > 30 &&
                                        simulationResults.oneYear
                                          .capacityFactor <= 40 &&
                                        " - Bom! Dentro da média esperada para projetos de H₂ verde."}
                                      {simulationResults.oneYear
                                        .capacityFactor <= 30 &&
                                        " - Abaixo da média. Recomenda-se aumentar capacidade de geração renovável ou reduzir tamanho do eletrolisador."}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      📊 Benchmark da indústria: 30-40% para
                                      sistemas híbridos solar+eólico
                                    </p>
                                  </div>
                                </div>

                                {/* Viabilidade Econômica */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.oneYear.lcoh < 10
                                      ? "bg-emerald-50 border-emerald-200"
                                      : simulationResults.oneYear.lcoh < 15
                                      ? "bg-amber-50 border-amber-200"
                                      : "bg-red-50 border-red-200"
                                  }`}
                                >
                                  {simulationResults.oneYear.lcoh < 10 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Viabilidade Econômica
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      LCOH de R${" "}
                                      {simulationResults.oneYear.lcoh.toFixed(2).replace('.', ',')}
                                      /kg
                                      {simulationResults.oneYear.lcoh < 8 &&
                                        " - Altamente competitivo! Abaixo do H₂ cinza (R$ 8-10/kg)."}
                                      {simulationResults.oneYear.lcoh >= 8 &&
                                        simulationResults.oneYear.lcoh < 12 &&
                                        " - Competitivo com incentivos fiscais e créditos de carbono."}
                                      {simulationResults.oneYear.lcoh >= 12 &&
                                        " - Alto. Projeto pode necessitar de subsídios ou otimizações."}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      📊 H₂ Cinza: R$ 8-10/kg | H₂ Verde (Meta
                                      2030): R$ 6-8/kg | Preço Mercado Atual: R$
                                      20-30/kg
                                    </p>
                                  </div>
                                </div>

                                {/* Produção e Escala */}
                                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Produção e Escala
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Produção anual estimada de{" "}
                                      {Math.ceil((
                                        simulationResults.oneYear.h2Production /
                                        1000
                                      ))}{" "}
                                      kg de H₂ verde no cenário de 100 kW.
                                      Potencial de expansão para{" "}
                                      {simulationResults.fiveYears!.h2Production.toFixed(
                                        2
                                      )}{" "}
                                      kg/ano com eletrolisador de 500 kW.
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      💡 Projeto adequado para fase piloto.
                                      Escala comercial típica: 10–50 mil kg/ano.
                                    </p>
                                  </div>
                                </div>

                                {/* Retorno de Investimento */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.oneYear.capexAnnualized /
                                      0.117 /
                                      (simulationResults.oneYear.h2Production *
                                        25 -
                                        simulationResults.oneYear.opexAnnual) <
                                    7
                                      ? "bg-emerald-50 border-emerald-200"
                                      : "bg-amber-50 border-amber-200"
                                  }`}
                                >
                                  <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Retorno sobre Investimento
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Payback estimado de{" "}
                                      {Math.ceil((
                                        simulationResults.oneYear
                                          .capexAnnualized /
                                        0.117 /
                                        (simulationResults.oneYear
                                          .h2Production *
                                          25 -
                                          simulationResults.oneYear.opexAnnual)
                                      ))}{" "}
                                      anos considerando preço de venda de R$
                                      25/kg. ROI anual de{" "}
                                      {Math.ceil((
                                        ((simulationResults.oneYear
                                          .h2Production *
                                          25 -
                                          simulationResults.oneYear
                                            .opexAnnual) /
                                          (simulationResults.oneYear
                                            .capexAnnualized /
                                            0.117)) *
                                        100
                                      ))}
                                      %.
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      ⚠️ Sensível ao preço de venda do H₂. Com
                                      incentivos governamentais, payback pode
                                      reduzir 20-30%.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>

                            {/* Cenário 3 Anos */}
                            <TabsContent value="3">
                              <div className="space-y-4">
                                {/* Viabilidade Técnica */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.threeYears!
                                      .capacityFactor > 30
                                      ? "bg-emerald-50 border-emerald-200"
                                      : "bg-amber-50 border-amber-200"
                                  }`}
                                >
                                  {simulationResults.threeYears!
                                    .capacityFactor > 30 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Viabilidade Técnica
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Fator de Capacidade de{" "}
                                      {simulationResults.threeYears!.capacityFactor.toFixed(
                                        1
                                      )}
                                      %
                                      {simulationResults.threeYears!
                                        .capacityFactor > 40 &&
                                        " - Excelente! Acima da média do setor (30-35%)."}
                                      {simulationResults.threeYears!
                                        .capacityFactor > 30 &&
                                        simulationResults.threeYears!
                                          .capacityFactor <= 40 &&
                                        " - Bom! Dentro da média esperada para projetos de H₂ verde."}
                                      {simulationResults.threeYears!
                                        .capacityFactor <= 30 &&
                                        " - Abaixo da média. Recomenda-se aumentar capacidade de geração renovável ou reduzir tamanho do eletrolisador."}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      📊 Benchmark da indústria: 30-40% para
                                      sistemas híbridos solar+eólico
                                    </p>
                                  </div>
                                </div>

                                {/* Viabilidade Econômica */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.threeYears!.lcoh < 10
                                      ? "bg-emerald-50 border-emerald-200"
                                      : simulationResults.threeYears!.lcoh < 15
                                      ? "bg-amber-50 border-amber-200"
                                      : "bg-red-50 border-red-200"
                                  }`}
                                >
                                  {simulationResults.threeYears!.lcoh < 10 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Viabilidade Econômica
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      LCOH de R${" "}
                                      {simulationResults.threeYears!.lcoh.toFixed(2).replace('.', ',')}
                                      /kg
                                      {simulationResults.threeYears!.lcoh < 8 &&
                                        " - Altamente competitivo! Abaixo do H₂ cinza (R$ 8-10/kg)."}
                                      {simulationResults.threeYears!.lcoh >=
                                        8 &&
                                        simulationResults.threeYears!.lcoh <
                                          12 &&
                                        " - Competitivo com incentivos fiscais e créditos de carbono."}
                                      {simulationResults.threeYears!.lcoh >=
                                        12 &&
                                        " - Alto. Projeto pode necessitar de subsídios ou otimizações."}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      📊 H₂ Cinza: R$ 8-10/kg | H₂ Verde (Meta
                                      2030): R$ 6-8/kg | Preço Mercado Atual: R$
                                      20-30/kg
                                    </p>
                                  </div>
                                </div>

                                {/* Produção e Escala */}
                                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Produção e Escala
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Produção anual estimada de{" "}
                                      {Math.ceil((
                                        simulationResults.threeYears!
                                          .h2Production / 1000
                                      ))}{" "}
                                      toneladas de H₂ verde no cenário de 300
                                      kW. Este eletrolisador de média capacidade
                                      é adequado para projetos industriais de
                                      pequeno porte.
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      💡 Capacidade ideal para projetos em
                                      expansão. Escala comercial típica: 10–50
                                      mil kg/ano.
                                    </p>
                                  </div>
                                </div>

                                {/* Retorno de Investimento */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.threeYears!
                                      .capexAnnualized /
                                      0.117 /
                                      (simulationResults.threeYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.threeYears!
                                          .opexAnnual) <
                                    7
                                      ? "bg-emerald-50 border-emerald-200"
                                      : "bg-amber-50 border-amber-200"
                                  }`}
                                >
                                  <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Retorno sobre Investimento
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Payback estimado de{" "}
                                      {Math.ceil((
                                        simulationResults.threeYears!
                                          .capexAnnualized /
                                        0.117 /
                                        (simulationResults.threeYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.threeYears!
                                            .opexAnnual)
                                      ))}{" "}
                                      anos considerando preço de venda de R$
                                      25/kg. ROI anual de{" "}
                                      {Math.ceil((
                                        ((simulationResults.threeYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.threeYears!
                                            .opexAnnual) /
                                          (simulationResults.threeYears!
                                            .capexAnnualized /
                                            0.117)) *
                                        100
                                      ))}
                                      %.
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      ⚠️ Sensível ao preço de venda do H₂. Com
                                      incentivos governamentais, payback pode
                                      reduzir 20-30%.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>

                            {/* Cenário 5 Anos */}
                            <TabsContent value="5">
                              <div className="space-y-4">
                                {/* Viabilidade Técnica */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.fiveYears!
                                      .capacityFactor > 30
                                      ? "bg-emerald-50 border-emerald-200"
                                      : "bg-amber-50 border-amber-200"
                                  }`}
                                >
                                  {simulationResults.fiveYears!.capacityFactor >
                                  30 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Viabilidade Técnica
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Fator de Capacidade de{" "}
                                      {simulationResults.fiveYears!.capacityFactor.toFixed(
                                        1
                                      )}
                                      %
                                      {simulationResults.fiveYears!
                                        .capacityFactor > 40 &&
                                        " - Excelente! Acima da média do setor (30-35%)."}
                                      {simulationResults.fiveYears!
                                        .capacityFactor > 30 &&
                                        simulationResults.fiveYears!
                                          .capacityFactor <= 40 &&
                                        " - Bom! Dentro da média esperada para projetos de H₂ verde."}
                                      {simulationResults.fiveYears!
                                        .capacityFactor <= 30 &&
                                        " - Abaixo da média. Recomenda-se aumentar capacidade de geração renovável ou reduzir tamanho do eletrolisador."}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      📊 Benchmark da indústria: 30-40% para
                                      sistemas híbridos solar+eólico
                                    </p>
                                  </div>
                                </div>

                                {/* Viabilidade Econômica */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.fiveYears!.lcoh < 10
                                      ? "bg-emerald-50 border-emerald-200"
                                      : simulationResults.fiveYears!.lcoh < 15
                                      ? "bg-amber-50 border-amber-200"
                                      : "bg-red-50 border-red-200"
                                  }`}
                                >
                                  {simulationResults.fiveYears!.lcoh < 10 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Viabilidade Econômica
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      LCOH de R${" "}
                                      {simulationResults.fiveYears!.lcoh.toFixed(2).replace('.', ',')}
                                      /kg
                                      {simulationResults.fiveYears!.lcoh < 8 &&
                                        " - Altamente competitivo! Abaixo do H₂ cinza (R$ 8-10/kg)."}
                                      {simulationResults.fiveYears!.lcoh >= 8 &&
                                        simulationResults.fiveYears!.lcoh <
                                          12 &&
                                        " - Competitivo com incentivos fiscais e créditos de carbono."}
                                      {simulationResults.fiveYears!.lcoh >=
                                        12 &&
                                        " - Alto. Projeto pode necessitar de subsídios ou otimizações."}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      📊 H₂ Cinza: R$ 8-10/kg | H₂ Verde (Meta
                                      2030): R$ 6-8/kg | Preço Mercado Atual: R$
                                      20-30/kg
                                    </p>
                                  </div>
                                </div>

                                {/* Produção e Escala */}
                                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Produção e Escala
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Produção anual estimada de{" "}
                                      {Math.ceil((
                                        simulationResults.fiveYears!
                                          .h2Production / 1000
                                      ))}{" "}
                                      toneladas de H₂ verde no cenário de 500
                                      kW. Este eletrolisador de grande
                                      capacidade é ideal para operações
                                      comerciais de escala industrial.
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      💡 Escala comercial plena. Adequado para
                                      contratos de longo prazo com grandes
                                      consumidores industriais.
                                    </p>
                                  </div>
                                </div>

                                {/* Retorno de Investimento */}
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                    simulationResults.fiveYears!
                                      .capexAnnualized /
                                      0.117 /
                                      (simulationResults.fiveYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.fiveYears!
                                          .opexAnnual) <
                                    7
                                      ? "bg-emerald-50 border-emerald-200"
                                      : "bg-amber-50 border-amber-200"
                                  }`}
                                >
                                  <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                      Retorno sobre Investimento
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                      Payback estimado de{" "}
                                      {Math.ceil((
                                        simulationResults.fiveYears!
                                          .capexAnnualized /
                                        0.117 /
                                        (simulationResults.fiveYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.fiveYears!
                                            .opexAnnual)
                                      ))}{" "}
                                      anos considerando preço de venda de R$
                                      25/kg. ROI anual de{" "}
                                      {Math.ceil((
                                        ((simulationResults.fiveYears!
                                          .h2Production *
                                          25 -
                                          simulationResults.fiveYears!
                                            .opexAnnual) /
                                          (simulationResults.fiveYears!
                                            .capexAnnualized /
                                            0.117)) *
                                        100
                                      ))}
                                      %.
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                      ⚠️ Sensível ao preço de venda do H₂. Com
                                      incentivos governamentais, payback pode
                                      reduzir 20-30%.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  )}

                  {/* Recomendações Técnicas */}
                  {simulationResults.oneYear && (
                    <AccordionItem
                      value="recomendacoes"
                      className="border-none"
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                          <div className="flex items-center space-x-3 w-full">
                            <FileText className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-2xl font-bold text-slate-900">
                              Recomendações Técnicas e Estratégicas
                            </h2>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 ml-auto">
                              Baseadas na Simulação
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-3">
                            {/* Recomendações dinâmicas baseadas nos resultados */}
                            {simulationResults.oneYear.capacityFactor < 30 && (
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 flex items-center justify-between">
                                  <p className="text-slate-700">
                                    <strong>Otimizar Dimensionamento:</strong>{" "}
                                    Fator de capacidade baixo (
                                    {simulationResults.oneYear.capacityFactor.toFixed(
                                      1
                                    )}
                                    %). Considere reduzir tamanho do
                                    eletrolisador ou aumentar capacidade de
                                    geração renovável.
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="ml-4 bg-red-100 text-red-800 border-red-200"
                                  >
                                    Alta
                                  </Badge>
                                </div>
                              </motion.div>
                            )}

                            {simulationResults.oneYear.curtailment > 10000 && (
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 flex items-center justify-between">
                                  <p className="text-slate-700">
                                    <strong>Reduzir Curtailment:</strong>{" "}
                                    {Math.ceil((
                                      simulationResults.oneYear.curtailment /
                                      1000
                                    ))}{" "}
                                    MWh/ano de energia desperdiçada. Considere
                                    sistema de armazenamento (baterias) ou
                                    aumentar capacidade do eletrolisador.
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                                  >
                                    Média
                                  </Badge>
                                </div>
                              </motion.div>
                            )}

                            {simulationResults.oneYear.lcoh > 12 && (
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 flex items-center justify-between">
                                  <p className="text-slate-700">
                                    <strong>Buscar Incentivos Fiscais:</strong>{" "}
                                    LCOH alto (R${" "}
                                    {Math.ceil(simulationResults.oneYear.lcoh)}
                                    /kg). Projeto pode se beneficiar
                                    significativamente de programas como PNME,
                                    créditos de carbono e financiamento BNDES.
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="ml-4 bg-red-100 text-red-800 border-red-200"
                                  >
                                    Alta
                                  </Badge>
                                </div>
                              </motion.div>
                            )}

                            {/* Recomendações gerais */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>EIA/RIMA Completo:</strong> Realizar
                                  estudo detalhado de impacto ambiental conforme
                                  exigências do CONAMA e órgãos estaduais.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-red-100 text-red-800 border-red-200"
                                >
                                  Alta
                                </Badge>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>Conexão à Rede:</strong> Avaliar
                                  viabilidade técnica e custos de conexão ao
                                  sistema elétrico nacional (ONS) ou operação
                                  off-grid.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-red-100 text-red-800 border-red-200"
                                >
                                  Alta
                                </Badge>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>Contratos de Offtake:</strong>{" "}
                                  Negociar acordos de compra de longo prazo
                                  (10-15 anos) com potenciais clientes
                                  industriais para garantir receita.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                                >
                                  Média
                                </Badge>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>Licenciamento e Certificação:</strong>{" "}
                                  Obter certificação de H₂ verde (CertifHy,
                                  GreenH2 Standard) para acesso a mercados
                                  premium.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                                >
                                  Média
                                </Badge>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>
                                    Infraestrutura de Armazenamento:
                                  </strong>{" "}
                                  Dimensionar sistema de compressão e
                                  armazenamento adequado (350-700 bar) conforme
                                  aplicação final.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                                >
                                  Média
                                </Badge>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.35 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>Consulta Pública:</strong> Engajamento
                                  com comunidades locais, prefeituras e
                                  stakeholders para garantir licença social para
                                  operar.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-emerald-100 text-emerald-800 border-emerald-200"
                                >
                                  Baixa
                                </Badge>
                              </div>
                            </motion.div>

                            {/* Recomendações Topográficas Dinâmicas */}
                            {topographyData?.recommendations.map(
                              (recommendation, index) => (
                                <motion.div
                                  key={`topo-${index}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 + index * 0.05 }}
                                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                  <Mountain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 flex items-center justify-between">
                                    <p className="text-slate-700">
                                      <strong>Topografia:</strong>{" "}
                                      {recommendation}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`ml-4 ${
                                        topographyData.slopeStatus === "success"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : topographyData.slopeStatus ===
                                            "warning"
                                          ? "bg-amber-100 text-amber-800 border-amber-200"
                                          : "bg-red-100 text-red-800 border-red-200"
                                      }`}
                                    >
                                      {topographyData.slopeStatus === "success"
                                        ? "Baixa"
                                        : topographyData.slopeStatus ===
                                          "warning"
                                        ? "Média"
                                        : "Alta"}
                                    </Badge>
                                  </div>
                                </motion.div>
                              )
                            )}
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  )}
                </Accordion>
              </>
            )
          ) : (
            <>
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-200 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 font-semibold">
                      Filtros Regionais
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRegion("");
                        setSelectedEstado("");
                        setSelectedEstadoNome("");
                        setRegionFiltersKey((k) => k + 1);
                      }}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Limpar seleção
                    </Button>
                  </div>
                  <RegionFilters
                    key={regionFiltersKey}
                    onRegiaoChange={(regiao) =>
                      setSelectedRegion(regiao === "all" ? "Nordeste" : regiao)
                    }
                    onEstadoChange={(estado, estadoNome) => {
                      setSelectedEstado(estado);
                      setSelectedEstadoNome(estadoNome);
                    }}
                    onCidadeChange={(cidade, cidadeNome) => {
                      setSelectedCidade(cidade);
                      setSelectedCidadeNome(cidadeNome);
                    }}
                  />
                  
                  {/* Botão Iniciar Análise - aparece após selecionar cidade */}
                  {selectedCidade && selectedCidade !== "all" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartAnalysis}
                      disabled={loading}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Carregando...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-5 h-5" />
                          <span>Iniciar Análise</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </Card>

              {/* Passo 1: Demanda Setorial - mostra quando Estado é selecionado (após Região) */}
              {selectedEstado && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SectorDemandByStateCard
                    estado={selectedEstado}
                    estadoNome={selectedEstadoNome}
                  />
                </motion.div>
              )}
              
              {/* Passo 2: Viabilidade do Estado - mostra após seleção de Estado */}
              {selectedEstado && selectedEstado !== "all" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Accordion
                    type="multiple"
                    defaultValue={["estado"]}
                    className="mb-4"
                  >
                    <AccordionItem value="estado" className="border-none">
                      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                          <div className="flex items-center space-x-3 w-full">
                            <BarChart3 className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-2xl font-bold text-slate-900">
                              Viabilidade - {selectedEstadoNome} ({selectedEstado}
                              )
                            </h2>
                            <Badge className="ml-auto bg-emerald-100 text-emerald-800 border-emerald-300">
                              Estado
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          {(() => {
                            const scores = getEstadoViability(selectedEstado);
                            return (
                              <>
                                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
                                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Sun className="w-5 h-5 text-amber-600" />
                                      <span className="font-semibold text-slate-900">
                                        Solar
                                      </span>
                                    </div>
                                    <div className="mt-2">
                                      <div className="text-3xl font-bold text-amber-700">
                                        {scores.solar}
                                      </div>
                                      <div className="text-xs text-slate-600 mt-1">
                                        Pontuação de viabilidade
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-4 rounded-lg border border-sky-200 bg-sky-50/50">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Wind className="w-5 h-5 text-sky-600" />
                                      <span className="font-semibold text-slate-900">
                                        Eólica
                                      </span>
                                    </div>
                                    <div className="mt-2">
                                      <div className="text-3xl font-bold text-sky-700">
                                        {scores.wind}
                                      </div>
                                      <div className="text-xs text-slate-600 mt-1">
                                        Pontuação de viabilidade
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Zap className="w-5 h-5 text-emerald-600" />
                                      <span className="font-semibold text-slate-900">
                                        Hidrogênio Verde
                                      </span>
                                    </div>
                                    <div className="mt-2">
                                      <div className="text-3xl font-bold text-emerald-700">
                                        {scores.h2}
                                      </div>
                                      <div className="text-xs text-slate-600 mt-1">
                                        Pontuação de viabilidade
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-emerald-100">
                                  <p className="text-xs text-slate-500 italic text-center">
                                    * As notas são ponderadas de 0 a 100, sendo 100 a maior nota de viabilidade.
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              )}
              
              {/* Passo 4: Tipologias Regionais - mostra após seleção de Estado */}
              {selectedEstado && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Accordion
                    type="multiple"
                    defaultValue={["tipologias"]}
                    className="mb-4"
                  >
                    <AccordionItem value="tipologias" className="border-none">
                      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                          <div className="flex items-center space-x-3 w-full">
                            <Zap className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-2xl font-bold text-slate-900">
                              Tipologias Regionais
                            </h2>
                            <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-300">
                              {selectedRegion || "—"}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
                            {getTechnologyFactors(
                              selectedRegion || "Nordeste"
                            ).map((tech, tIndex) => (
                              <div
                                key={`tech-${tIndex}`}
                                className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center space-x-3 mb-3">
                                  <tech.icon className="w-5 h-5 text-emerald-600" />
                                  <h3 className="font-semibold text-slate-900">
                                    {tech.title}
                                  </h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {tech.factors.map((f, fIndex: number) => (
                                    <div
                                      key={`f-${tIndex}-${fIndex}`}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-sm text-slate-700">
                                        {f.label}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={getPriorityColor(f.status)}
                                      >
                                        {f.value}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              )}

              {/* Conteúdo da aba Cidade copiado para aba Região - Início */}
              {analysisStarted && (
                <>
                  <div className="mt-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Análise Detalhada por Cidade
                    </h3>
                    <p className="text-sm text-blue-800 mt-1">Os dados abaixo refletem análises específicas para a cidade selecionada</p>
                  </div>
                  
                  <Accordion
                type="multiple"
                defaultValue={[
                  "producao",
                  "simulacao",
                  "financeiro",
                  "ambiental",
                  "viabilidade",
                  "recomendacoes",
                ]}
                className="space-y-4"
              >
                {/* Cálculo de Produção de Energia */}
                <AccordionItem value="producao" className="border-none">
                  <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                      <div className="flex items-center space-x-3 w-full">
                        <Zap className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-2xl font-bold text-slate-900">
                          Cálculo de Projeção para Produção de Hidrogênio Verde
                        </h2>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 ml-auto">
                          📐 Fórmulas Reais
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <Tabs defaultValue="1" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 rounded-xl border border-emerald-200 shadow-sm">
                          <TabsTrigger
                            value="1"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg transition-all"
                          >
                            1 Ano
                          </TabsTrigger>
                          <TabsTrigger
                            value="3"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg transition-all"
                          >
                            3 Anos
                          </TabsTrigger>
                          <TabsTrigger
                            value="5"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 rounded-lg transition-all"
                          >
                            5 Anos
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="1">
                          <div className="space-y-6">
                            {/* Entrada de Dados */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Sun className="w-5 h-5 mr-2 text-amber-600" />
                                1. Entrada de Energia Renovável
                              </h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    ☀️ <strong>Irradiância Solar:</strong>{" "}
                                    {Math.ceil(energyCalc1Year.solarIrradiance)}{" "}
                                    W/m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    📐 <strong>Área dos Painéis:</strong>{" "}
                                    {energyCalc1Year.solarPanelArea.toLocaleString()}{" "}
                                    m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    ⚡ <strong>Eficiência:</strong>{" "}
                                    {Math.ceil(
                                      energyCalc1Year.solarEfficiency * 100
                                    )}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> P
                                    <sub>solar</sub> = G × A × η
                                  </p>
                                  <p className="text-2xl font-bold text-amber-600 mt-3">
                                    {Math.ceil(energyCalc1Year.solarPower)} kW
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    Potência Solar Gerada
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    💨 <strong>Velocidade do Vento:</strong>{" "}
                                    {Math.ceil(energyCalc1Year.windSpeed)} m/s
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    📐 <strong>Área Varrida:</strong>{" "}
                                    {energyCalc1Year.windTurbineArea.toLocaleString()}{" "}
                                    m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    ⚡ <strong>Eficiência:</strong>{" "}
                                    {Math.ceil((
                                      energyCalc1Year.windEfficiency * 100
                                    ))}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> P
                                    <sub>eólica</sub> = ½ × ρ × A × v³ × η
                                  </p>
                                  <p className="text-2xl font-bold text-blue-600 mt-3">
                                    {Math.ceil(energyCalc1Year.windPower)} kW
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    Potência Eólica Gerada
                                  </p>
                                </Card>
                              </div>
                            </div>

                            {/* Energia Total */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                2. Energia Total Disponível
                              </h3>
                              <div className="grid md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Potência Total
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil(energyCalc1Year.totalPower)}
                                  </p>
                                  <p className="text-xs text-slate-600">kW</p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Energia Diária
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil(energyCalc1Year.dailyEnergy)}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    kWh/dia
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Energia Anual
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil((
                                      energyCalc1Year.annualEnergy / 1000
                                    ))}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    MWh/ano
                                  </p>
                                </Card>
                              </div>
                            </div>

                            {/* Produção de H2 */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Droplet className="w-5 h-5 mr-2 text-emerald-600" />
                                3. Produção de Hidrogênio Verde
                              </h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    💧 <strong>Produção Diária:</strong>
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {energyCalc1Year.dailyH2Production >= 1000
                                      ? Math.ceil(energyCalc1Year.dailyH2Production / 1000) + " t/dia"
                                      : Math.ceil(energyCalc1Year.dailyH2Production) + " kg/dia"}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Consumo eletrolisador:</strong> 65
                                    kWh/kg H₂ (incluindo perdas do sistema)
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1 p-2 bg-amber-50 rounded">
                                    ⚠️ Valores realistas considerando fator de
                                    capacidade solar (~20%) e eólico (~30%)
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    📊 <strong>Produção Anual:</strong>
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {Math.ceil(energyCalc1Year.annualH2Production)}{" "}
                                    Ton/ano
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> H₂ (kg) = E
                                    <sub>disponível</sub> / 50 kWh/kg
                                  </p>
                                </Card>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="3">
                          <div className="space-y-6">
                            {/* Entrada de Dados */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Sun className="w-5 h-5 mr-2 text-amber-600" />
                                1. Entrada de Energia Renovável (Expansão 3x)
                              </h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    ☀️ <strong>Irradiância Solar:</strong>{" "}
                                    {energyCalc3Years.solarIrradiance.toFixed(
                                      0
                                    )}{" "}
                                    W/m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    📐 <strong>Área dos Painéis:</strong>{" "}
                                    {energyCalc3Years.solarPanelArea.toLocaleString()}{" "}
                                    m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    ⚡ <strong>Eficiência:</strong>{" "}
                                    {Math.ceil((
                                      energyCalc3Years.solarEfficiency * 100
                                    ))}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> P
                                    <sub>solar</sub> = G × A × η
                                  </p>
                                  <p className="text-2xl font-bold text-amber-600 mt-3">
                                    {Math.ceil(energyCalc3Years.solarPower)}{" "}
                                    kW
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    Potência Solar Gerada
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    💨 <strong>Velocidade do Vento:</strong>{" "}
                                    {Math.ceil(energyCalc3Years.windSpeed)}{" "}
                                    m/s
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    📐 <strong>Área Varrida:</strong>{" "}
                                    {energyCalc3Years.windTurbineArea.toLocaleString()}{" "}
                                    m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    ⚡ <strong>Eficiência:</strong>{" "}
                                    {Math.ceil((
                                      energyCalc3Years.windEfficiency * 100
                                    ))}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> P
                                    <sub>eólica</sub> = ½ × ρ × A × v³ × η
                                  </p>
                                  <p className="text-2xl font-bold text-blue-600 mt-3">
                                    {Math.ceil(energyCalc3Years.windPower)} kW
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    Potência Eólica Gerada
                                  </p>
                                </Card>
                              </div>
                            </div>

                            {/* Energia Total */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                2. Energia Total Disponível
                              </h3>
                              <div className="grid md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Potência Total
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil(energyCalc3Years.totalPower)}
                                  </p>
                                  <p className="text-xs text-slate-600">kW</p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Energia Diária
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil(energyCalc3Years.dailyEnergy)}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    kWh/dia
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Energia Anual
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil((
                                      energyCalc3Years.annualEnergy / 1000
                                    ))}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    MWh/ano
                                  </p>
                                </Card>
                              </div>
                            </div>

                            {/* Produção de H2 */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Droplet className="w-5 h-5 mr-2 text-emerald-600" />
                                3. Produção de Hidrogênio Verde
                              </h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    💧 <strong>Produção Diária:</strong>
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {energyCalc3Years.dailyH2Production >= 1000
                                      ? Math.ceil(energyCalc3Years.dailyH2Production / 1000) + " t/dia"
                                      : Math.ceil(energyCalc3Years.dailyH2Production) + " kg/dia"}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Consumo eletrolisador:</strong> 65
                                    kWh/kg H₂ (incluindo perdas do sistema)
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1 p-2 bg-amber-50 rounded">
                                    ⚠️ Valores realistas considerando fator de
                                    capacidade solar (~20%) e eólico (~30%)
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    📊 <strong>Produção Anual:</strong>
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {Math.ceil(energyCalc3Years.annualH2Production)}{" "}
                                    Toneladas/ano
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> H₂ (kg) = E
                                    <sub>disponível</sub> / 50 kWh/kg
                                  </p>
                                </Card>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="5">
                          <div className="space-y-6">
                            {/* Entrada de Dados */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Sun className="w-5 h-5 mr-2 text-amber-600" />
                                1. Entrada de Energia Renovável (Expansão 5x)
                              </h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    ☀️ <strong>Irradiância Solar:</strong>{" "}
                                    {energyCalc5Years.solarIrradiance.toFixed(
                                      0
                                    )}{" "}
                                    W/m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    📐 <strong>Área dos Painéis:</strong>{" "}
                                    {energyCalc5Years.solarPanelArea.toLocaleString()}{" "}
                                    m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    ⚡ <strong>Eficiência:</strong>{" "}
                                    {Math.ceil((
                                      energyCalc5Years.solarEfficiency * 100
                                    ))}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> P
                                    <sub>solar</sub> = G × A × η
                                  </p>
                                  <p className="text-2xl font-bold text-amber-600 mt-3">
                                    {Math.ceil(energyCalc5Years.solarPower)}{" "}
                                    kW
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    Potência Solar Gerada
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    💨 <strong>Velocidade do Vento:</strong>{" "}
                                    {Math.ceil(energyCalc5Years.windSpeed)}{" "}
                                    m/s
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    📐 <strong>Área Varrida:</strong>{" "}
                                    {energyCalc5Years.windTurbineArea.toLocaleString()}{" "}
                                    m²
                                  </p>
                                  <p className="text-sm text-slate-700 mb-2">
                                    ⚡ <strong>Eficiência:</strong>{" "}
                                    {Math.ceil((
                                      energyCalc5Years.windEfficiency * 100
                                    ))}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> P
                                    <sub>eólica</sub> = ½ × ρ × A × v³ × η
                                  </p>
                                  <p className="text-2xl font-bold text-blue-600 mt-3">
                                    {Math.ceil(energyCalc5Years.windPower)} kW
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    Potência Eólica Gerada
                                  </p>
                                </Card>
                              </div>
                            </div>

                            {/* Energia Total */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                2. Energia Total Disponível
                              </h3>
                              <div className="grid md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Potência Total
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil(energyCalc5Years.totalPower)}
                                  </p>
                                  <p className="text-xs text-slate-600">kW</p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Energia Diária
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil(energyCalc5Years.dailyEnergy)}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    kWh/dia
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    Energia Anual
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil((
                                      energyCalc5Years.annualEnergy / 1000
                                    ))}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    MWh/ano
                                  </p>
                                </Card>
                              </div>
                            </div>

                            {/* Produção de H2 */}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                <Droplet className="w-5 h-5 mr-2 text-emerald-600" />
                                3. Produção de Hidrogênio Verde
                              </h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    💧 <strong>Produção Diária:</strong>
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {energyCalc5Years.dailyH2Production >= 1000
                                      ? Math.ceil(energyCalc5Years.dailyH2Production / 1000) + " t/dia"
                                      : Math.ceil(energyCalc5Years.dailyH2Production) + " kg/dia"}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Consumo eletrolisador:</strong> 65
                                    kWh/kg H₂ (incluindo perdas do sistema)
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1 p-2 bg-amber-50 rounded">
                                    ⚠️ Valores realistas considerando fator de
                                    capacidade solar (~20%) e eólico (~30%)
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-2">
                                    📊 <strong>Produção Anual:</strong>
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {Math.ceil(energyCalc5Years.annualH2Production)}{" "}
                                    Toneladas/ano
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded">
                                    <strong>Fórmula:</strong> H₂ (kg) = E
                                    <sub>disponível</sub> / 50 kWh/kg
                                  </p>
                                </Card>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </Card>
                </AccordionItem>

                {/* Simulação Horária */}
                {simulationResults.oneYear && (
                  <AccordionItem value="simulacao" className="border-none">
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Simulação Horária
                          </h2>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <Tabs defaultValue="1" className="w-full">
                          <TabsList className="relative grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 h-[50px] rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                            <TabsTrigger
                              value="1"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                            >
                              <div className="text-sm font-medium">
                                Cenário 1 Ano
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                100 kW
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="3"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                            >
                              <div className="text-sm font-medium">
                                Cenário 3 Anos
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                300 kW
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="5"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                            >
                              <div className="text-sm font-medium">
                                Cenário 5 Anos
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                500 kW
                              </div>
                            </TabsTrigger>
                          </TabsList>
                          {/* Cenário 1 Ano */}
                          <TabsContent value="1">
                            <div className="space-y-6">
                              {/* Métricas Principais */}
                              <div className="grid md:grid-cols-4 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⚡ Fator de Capacidade
                                  </p>
                                  <p className="text-3xl font-bold text-green-600">
                                    {simulationResults.oneYear.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Eficiência operacional do eletrolisador
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    💰 LCOH
                                  </p>
                                  <p className="text-3xl font-bold text-blue-600">
                                    R${" "}
                                    {simulationResults.oneYear.lcoh.toFixed(2).replace('.', ',')}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Por kg de H₂
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    🔋 Energia Consumida
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil((
                                      simulationResults.oneYear
                                        .totalEnergyConsumed / 1000
                                    ))}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    MWh/ano
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    💧 Produção H₂
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {Math.ceil((
                                      simulationResults.oneYear.h2Production /
                                      1000
                                    ))}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Toneladas/ano
                                  </p>
                                </Card>
                              </div>

                              {/* Métricas Operacionais */}
                              <div className="grid md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⏰ Horas de Operação
                                  </p>
                                  <p className="text-2xl font-bold text-amber-600">
                                    {simulationResults.oneYear.operatingHours.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Horas/ano de{" "}
                                    {(weatherData?.dataPoints || 365) * 24}{" "}
                                    total
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⚠️ Curtailment
                                  </p>
                                  <p className="text-2xl font-bold text-red-600">
                                    {Math.ceil((
                                      simulationResults.oneYear.curtailment /
                                      1000
                                    ))}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    MWh perdido/ano
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    📊 Potência Nominal
                                  </p>
                                  <p className="text-2xl font-bold text-slate-600">
                                    100 kW
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Eletrolisador dimensionado
                                  </p>
                                </Card>
                              </div>

                              {/* Custos Detalhados */}
                              <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                  💵 Detalhamento de Custos (LCOH)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      CAPEX Anualizado:
                                    </p>
                                    <p className="text-xl font-bold text-indigo-600">
                                      R${" "}
                                      {formatCurrency(simulationResults.oneYear.capexAnnualized, 2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 mb-1">
                                      OPEX Anual:
                                    </p>
                                    <p className="text-xl font-bold text-indigo-600">
                                      R${" "}
                                      {formatCurrency(simulationResults.oneYear.opexAnnual, 2)}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                  <strong>Fórmula LCOH:</strong> (CAPEX
                                  Anualizado + OPEX Anual) / Produção Anual de
                                  H₂
                                </p>
                              </Card>
                            </div>
                          </TabsContent>

                          {/* Cenário 3 Anos */}
                          <TabsContent value="3">
                            <div className="space-y-6">
                              <div className="grid md:grid-cols-4 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⚡ Fator de Capacidade
                                  </p>
                                  <p className="text-3xl font-bold text-green-600">
                                    {simulationResults.threeYears!.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Eficiência operacional do eletrolisador
                                  </p>
                                </Card>
                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    💰 LCOH
                                  </p>
                                  <p className="text-3xl font-bold text-blue-600">
                                    R${" "}
                                    {simulationResults.threeYears!.lcoh.toFixed(
                                      2
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    por Kg de H₂
                                  </p>
                                </Card>
                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    🔋 Energia Consumida
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil((
                                      simulationResults.threeYears!
                                        .totalEnergyConsumed / 1000
                                    ))}{" "}
                                    MWh
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    MWh/ano
                                  </p>
                                </Card>
                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    💧 Produção H₂
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {Math.ceil((
                                      simulationResults.threeYears!
                                        .h2Production / 1000
                                    ))}{" "}
                                    t
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Toneladas/ano
                                  </p>
                                </Card>
                              </div>

                              {/* Métricas Operacionais - Cenário 3 Anos */}
                              <div className="grid md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⏰ Horas de Operação
                                  </p>
                                  <p className="text-2xl font-bold text-amber-600">
                                    {simulationResults.threeYears!.operatingHours.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    horas/ano de {(weatherData?.dataPoints || 365) * 24} total
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⚠️ Curtailment
                                  </p>
                                  <p className="text-2xl font-bold text-red-600">
                                    {Math.ceil((simulationResults.threeYears!.curtailment / 1000))}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">MWh perdido/ano</p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                                  <p className="text-sm text-slate-700 mb-1">📊 Potência Nominal</p>
                                  <p className="text-2xl font-bold text-slate-600">300 kW</p>
                                  <p className="text-xs text-slate-600 mt-2">Eletrolisador dimensionado</p>
                                </Card>
                              </div>

                              <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                  💵 Custos (300 kW)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-700">
                                      CAPEX Anualizado: R${" "}
                                      {formatCurrency(simulationResults.threeYears!.capexAnnualized, 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700">
                                      OPEX Anual: R${" "}
                                      {formatCurrency(simulationResults.threeYears!.opexAnnual, 0)}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </TabsContent>

                          {/* Cenário 5 Anos */}
                          <TabsContent value="5">
                            <div className="space-y-6">
                              <div className="grid md:grid-cols-4 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⚡ Fator de Capacidade
                                  </p>
                                  <p className="text-3xl font-bold text-green-600">
                                    {simulationResults.fiveYears!.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Eficiência operacional do eletrolisador
                                  </p>
                                </Card>
                                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    💰 LCOH
                                  </p>
                                  <p className="text-3xl font-bold text-blue-600">
                                    R${" "}
                                    {simulationResults.fiveYears!.lcoh.toFixed(
                                      2
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    por Kg de H₂
                                  </p>
                                </Card>
                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    🔋 Energia Consumida
                                  </p>
                                  <p className="text-3xl font-bold text-purple-600">
                                    {Math.ceil((
                                      simulationResults.fiveYears!
                                        .totalEnergyConsumed / 1000
                                    ))}{" "}
                                    MWh
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    MWh/ano
                                  </p>
                                </Card>
                                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    💧 Produção H₂
                                  </p>
                                  <p className="text-3xl font-bold text-emerald-600">
                                    {Math.ceil((
                                      simulationResults.fiveYears!
                                        .h2Production / 1000
                                    ))}{" "}
                                    t
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    Toneladas/ano
                                  </p>
                                </Card>
                              </div>

                              {/* Métricas Operacionais - Cenário 5 Anos */}
                              <div className="grid md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⏰ Horas de Operação
                                  </p>
                                  <p className="text-2xl font-bold text-amber-600">
                                    {simulationResults.fiveYears!.operatingHours.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    horas/ano de {(weatherData?.dataPoints || 365) * 24} total
                                  </p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                                  <p className="text-sm text-slate-700 mb-1">
                                    ⚠️ Curtailment
                                  </p>
                                  <p className="text-2xl font-bold text-red-600">
                                    {Math.ceil((simulationResults.fiveYears!.curtailment / 1000))}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">MWh perdido/ano</p>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                                  <p className="text-sm text-slate-700 mb-1">📊 Potência Nominal</p>
                                  <p className="text-2xl font-bold text-slate-600">500 kW</p>
                                  <p className="text-xs text-slate-600 mt-2">Eletrolisador dimensionado</p>
                                </Card>
                              </div>

                              <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                  💵 Custos (500 kW)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-700">
                                      CAPEX Anualizado: R${" "}
                                      {formatCurrency(simulationResults.fiveYears!.capexAnnualized, 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700">
                                      OPEX Anual: R${" "}
                                      {formatCurrency(simulationResults.fiveYears!.opexAnnual, 0)}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Explicação */}
                        <Card className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            📊 Sobre a Simulação
                          </h3>
                          <p className="text-sm text-slate-700 mb-2">
                            Análise detalhada simulando operação hora a hora:
                          </p>
                          <ul className="text-sm text-slate-700 space-y-1 ml-4 list-disc">
                            <li>
                              <strong>Fator de Capacidade:</strong> Eficiência
                              real do eletrolisador
                            </li>
                            <li>
                              <strong>LCOH:</strong> Custo nivelado do H₂
                              (CAPEX + OPEX / Produção)
                            </li>
                            <li>
                              <strong>Curtailment:</strong> Energia renovável
                              desperdiçada
                            </li>
                            <li>
                              <strong>Operação:</strong> 20-100% quando
                              energia disponível nessa faixa
                            </li>
                          </ul>
                        </Card>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                )}

                {/* Análise Financeira */}
                {simulationResults.oneYear && (
                  <AccordionItem value="financeiro" className="border-none">
                    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <TrendingUp className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Análise Financeira e Estudo de Viabilidade
                          </h2>
                          <Badge className="bg-green-100 text-green-800 border-green-300 ml-auto">
                            ✓ Baseado em Simulação Real
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <Tabs defaultValue="1" className="w-full">
                          <TabsList className="relative grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 h-[50px] rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                            <TabsTrigger
                              value="1"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center h-[35px] "
                            >
                              <div className="text-sm font-medium">
                                Cenário 1 Ano
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                100 kW
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="3"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                            >
                              <div className="text-sm font-medium">
                                Cenário 3 Anos
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                300 kW
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="5"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                            >
                              <div className="text-sm font-medium">
                                Cenário 5 Anos
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                500 kW
                              </div>
                            </TabsTrigger>
                          </TabsList>

                          {/* Cenário 1 Ano */}
                          <TabsContent value="1">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Droplet className="w-5 h-5 text-blue-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    LCOH
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  R${" "}
                                  {simulationResults.oneYear.lcoh.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  por kg de H₂
                                </p>
                                <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">
                                  {simulationResults.oneYear.lcoh < 8
                                    ? "✓ Competitivo"
                                    : simulationResults.oneYear.lcoh < 12
                                    ? "~ Razoável"
                                    : "⚠ Alto"}
                                </Badge>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Activity className="w-5 h-5 text-emerald-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Fator Capacidade
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  {simulationResults.oneYear.capacityFactor.toFixed(
                                    1
                                  )}
                                  %
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Eficiência operacional
                                </p>
                                <Badge className="mt-2 bg-emerald-100 text-emerald-800 text-xs">
                                  {simulationResults.oneYear.capacityFactor >
                                  40
                                    ? "✓ Excelente"
                                    : simulationResults.oneYear
                                        .capacityFactor > 25
                                    ? "~ Bom"
                                    : "⚠ Baixo"}
                                </Badge>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Zap className="w-5 h-5 text-purple-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Produção Anual
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  {simulationResults.oneYear.h2Production.toFixed(
                                    2
                                  )}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Kg H₂/ano
                                </p>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <TrendingUp className="w-5 h-5 text-amber-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Receita Potencial
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  R${" "}
                                  {(
                                    simulationResults.oneYear.h2Production *
                                    25
                                  ).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Por ano (R$ 25/kg H₂)
                                </p>
                              </Card>
                            </div>

                            {/* Análise ROI */}
                            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                📊 Análise de Retorno sobre Investimento
                              </h3>
                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    CAPEX Total:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    R${" "}
                                    {(
                                      simulationResults.oneYear
                                        .capexAnnualized / 0.117
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    Payback Estimado:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    {Math.floor(
                                      simulationResults.oneYear
                                        .capexAnnualized /
                                      0.117 /
                                      (simulationResults.oneYear
                                        .h2Production *
                                        25 -
                                        simulationResults.oneYear.opexAnnual)
                                    )}{" "}
                                    anos
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    ROI Anual:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    {Math.ceil(
                                      ((simulationResults.oneYear
                                        .h2Production *
                                        25 -
                                        simulationResults.oneYear
                                          .opexAnnual) /
                                        (simulationResults.oneYear
                                          .capexAnnualized /
                                          0.117)) *
                                      100
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                💡 Assumindo preço de venda de R$ 25/Kg e taxa
                                de desconto de 10% ao ano
                              </p>
                            </Card>
                          </TabsContent>

                          {/* Cenário 3 Anos */}
                          <TabsContent value="3">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Droplet className="w-5 h-5 text-blue-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    LCOH
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  R${" "}
                                  {simulationResults.threeYears!.lcoh.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  por Kg de H₂
                                </p>
                                <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">
                                  {simulationResults.threeYears!.lcoh < 8
                                    ? "✓ Competitivo"
                                    : simulationResults.threeYears!.lcoh < 12
                                    ? "~ Razoável"
                                    : "⚠ Alto"}
                                </Badge>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Activity className="w-5 h-5 text-emerald-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Fator Capacidade
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  {simulationResults.threeYears!.capacityFactor.toFixed(
                                    1
                                  )}
                                  %
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Eficiência operacional
                                </p>
                                <Badge className="mt-2 bg-emerald-100 text-emerald-800 text-xs">
                                  {simulationResults.threeYears!
                                    .capacityFactor > 40
                                    ? "✓ Excelente"
                                    : simulationResults.threeYears!
                                        .capacityFactor > 25
                                    ? "~ Bom"
                                    : "⚠ Baixo"}
                                </Badge>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Zap className="w-5 h-5 text-purple-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Produção Anual
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  {simulationResults.threeYears!.h2Production.toFixed(
                                    2
                                  )}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Kg H₂/ano
                                </p>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <TrendingUp className="w-5 h-5 text-amber-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Receita Potencial
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  R${" "}
                                  {(
                                    simulationResults.threeYears!
                                      .h2Production * 25
                                  ).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Por ano (R$ 25/kg H₂)
                                </p>
                              </Card>
                            </div>

                            {/* Análise ROI */}
                            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                📊 Análise de Retorno sobre Investimento
                              </h3>
                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    CAPEX Total:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    R${" "}
                                    {(
                                      simulationResults.threeYears!
                                        .capexAnnualized / 0.117
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    Payback Estimado:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    {Math.floor(
                                      simulationResults.threeYears!
                                        .capexAnnualized /
                                      0.117 /
                                      (simulationResults.threeYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.threeYears!
                                          .opexAnnual)
                                    )}{" "}
                                    anos
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    ROI Anual:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    {Math.ceil(
                                      ((simulationResults.threeYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.threeYears!
                                          .opexAnnual) /
                                        (simulationResults.threeYears!
                                          .capexAnnualized /
                                          0.117)) *
                                      100
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                💡 Assumindo preço de venda de R$ 25/Kg e taxa
                                de desconto de 10% ao ano
                              </p>
                            </Card>
                          </TabsContent>

                          {/* Cenário 5 Anos */}
                          <TabsContent value="5">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Droplet className="w-5 h-5 text-blue-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    LCOH
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  R${" "}
                                  {simulationResults.fiveYears!.lcoh.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  por Kg de H₂
                                </p>
                                <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">
                                  {simulationResults.fiveYears!.lcoh < 8
                                    ? "✓ Competitivo"
                                    : simulationResults.fiveYears!.lcoh < 12
                                    ? "~ Razoável"
                                    : "⚠ Alto"}
                                </Badge>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Activity className="w-5 h-5 text-emerald-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Fator Capacidade
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  {simulationResults.fiveYears!.capacityFactor.toFixed(
                                    1
                                  )}
                                  %
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Eficiência operacional
                                </p>
                                <Badge className="mt-2 bg-emerald-100 text-emerald-800 text-xs">
                                  {simulationResults.fiveYears!
                                    .capacityFactor > 40
                                    ? "✓ Excelente"
                                    : simulationResults.fiveYears!
                                        .capacityFactor > 25
                                    ? "~ Bom"
                                    : "⚠ Baixo"}
                                </Badge>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Zap className="w-5 h-5 text-purple-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Produção Anual
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  {simulationResults.fiveYears!.h2Production.toFixed(
                                    2
                                  )}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Kg H₂/ano
                                </p>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <TrendingUp className="w-5 h-5 text-amber-600" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Receita Potencial
                                  </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                  R${" "}
                                  {(
                                    simulationResults.fiveYears!
                                      .h2Production * 25
                                  ).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Por ano (R$ 25/kg H₂)
                                </p>
                              </Card>
                            </div>

                            {/* Análise ROI */}
                            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                📊 Análise de Retorno sobre Investimento
                              </h3>
                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    CAPEX Total:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    R${" "}
                                    {(
                                      simulationResults.fiveYears!
                                        .capexAnnualized / 0.117
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    Payback Estimado:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    {Math.floor(
                                      simulationResults.fiveYears!
                                        .capexAnnualized /
                                      0.117 /
                                      (simulationResults.fiveYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.fiveYears!
                                          .opexAnnual)
                                    )}{" "}
                                    anos
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-700 mb-1">
                                    ROI Anual:
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    {Math.ceil(
                                      ((simulationResults.fiveYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.fiveYears!
                                          .opexAnnual) /
                                        (simulationResults.fiveYears!
                                          .capexAnnualized /
                                          0.117)) *
                                      100
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 mt-3 p-2 bg-white/50 rounded">
                                💡 Assumindo preço de venda de R$ 25/Kg e taxa
                                de desconto de 10% ao ano
                              </p>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                )}

                {/* Análise Ambiental */}
                <AccordionItem value="ambiental" className="border-none">
                  <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                      <div className="flex items-center space-x-3 w-full">
                        <TreePine className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-2xl font-bold text-slate-900">
                          Análise Ambiental
                        </h2>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {environmentalFactors.map((factor, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <Card className="p-4 h-full hover:shadow-lg transition-shadow">
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${getStatusColor(
                                    factor.status
                                  )} bg-opacity-10`}
                                >
                                  <factor.icon
                                    className={`w-5 h-5 ${getStatusColor(
                                      factor.status
                                    )}`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    {factor.title}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={getPriorityColor(
                                      factor.status
                                    )}
                                  >
                                    {factor.value}
                                  </Badge>
                                  <p className="text-xs text-slate-600 mt-2">
                                    {factor.description}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>

                {/* Viabilidade do Projeto */}
                {simulationResults.oneYear && (
                  <AccordionItem value="viabilidade" className="border-none">
                    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Viabilidade do Projeto
                          </h2>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <Tabs
                          value={scenario}
                          onValueChange={(v) => setScenario(v as "1" | "3" | "5")}
                          className="w-full"
                        >
                          <TabsList className="relative grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 p-1 h-[50px] rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                            <TabsTrigger
                              value="1"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center h-[35px] "
                            >
                              <div className="text-sm font-medium">
                                Cenário 1 Ano
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                100 kW
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="3"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                            >
                              <div className="text-sm font-medium">
                                Cenário 3 Anos
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                300 kW
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="5"
                              className="relative z-10 data-[state=active]:text-emerald-700 rounded-lg transition-all text-center flex flex-col items-center py-1 h-[35px]"
                            >
                              <div className="text-sm font-medium">
                                Cenário 5 Anos
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                500 kW
                              </div>
                            </TabsTrigger>
                          </TabsList>

                          {/* Cenário 1 Ano */}
                          <TabsContent value="1">
                            <div className="space-y-4">
                              {/* Viabilidade Técnica */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.oneYear.capacityFactor >
                                  30
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-amber-50 border-amber-200"
                                }`}
                              >
                                {simulationResults.oneYear.capacityFactor >
                                30 ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Viabilidade Técnica
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Fator de Capacidade de{" "}
                                    {simulationResults.oneYear.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                    {simulationResults.oneYear
                                      .capacityFactor > 40 &&
                                      " - Excelente! Acima da média do setor (30-35%)."}
                                    {simulationResults.oneYear
                                      .capacityFactor > 30 &&
                                      simulationResults.oneYear
                                        .capacityFactor <= 40 &&
                                      " - Bom! Dentro da média esperada para projetos de H₂ verde."}
                                    {simulationResults.oneYear
                                      .capacityFactor <= 30 &&
                                      " - Abaixo da média. Recomenda-se aumentar capacidade de geração renovável ou reduzir tamanho do eletrolisador."}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    📊 Benchmark da indústria: 30-40% para
                                    sistemas híbridos solar+eólico
                                  </p>
                                </div>
                              </div>

                              {/* Viabilidade Econômica */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.oneYear.lcoh < 10
                                    ? "bg-emerald-50 border-emerald-200"
                                    : simulationResults.oneYear.lcoh < 15
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                              >
                                {simulationResults.oneYear.lcoh < 10 ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Viabilidade Econômica
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    LCOH de R${" "}
                                    {simulationResults.oneYear.lcoh.toFixed(2).replace('.', ',')}
                                    /kg
                                    {simulationResults.oneYear.lcoh < 8 &&
                                      " - Altamente competitivo! Abaixo do H₂ cinza (R$ 8-10/kg)."}
                                    {simulationResults.oneYear.lcoh >= 8 &&
                                      simulationResults.oneYear.lcoh < 12 &&
                                      " - Competitivo com incentivos fiscais e créditos de carbono."}
                                    {simulationResults.oneYear.lcoh >= 12 &&
                                      " - Alto. Projeto pode necessitar de subsídios ou otimizações."}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    📊 H₂ Cinza: R$ 8-10/kg | H₂ Verde (Meta
                                    2030): R$ 6-8/kg | Preço Mercado Atual: R$
                                    20-30/kg
                                  </p>
                                </div>
                              </div>

                              {/* Produção e Escala */}
                              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Produção e Escala
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Produção anual estimada de{" "}
                                    {Math.ceil((
                                      simulationResults.oneYear.h2Production /
                                      1000
                                    ))}{" "}
                                    kg de H₂ verde no cenário de 100 kW.
                                    Potencial de expansão para{" "}
                                    {simulationResults.fiveYears!.h2Production.toFixed(
                                      2
                                    )}{" "}
                                    kg/ano com eletrolisador de 500 kW.
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    💡 Projeto adequado para fase piloto.
                                    Escala comercial típica: 10–50 mil kg/ano.
                                  </p>
                                </div>
                              </div>

                              {/* Retorno de Investimento */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.oneYear.capexAnnualized /
                                    0.117 /
                                    (simulationResults.oneYear.h2Production *
                                      25 -
                                      simulationResults.oneYear.opexAnnual) <
                                  7
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-amber-50 border-amber-200"
                                }`}
                              >
                                <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Retorno sobre Investimento
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Payback estimado de{" "}
                                    {Math.ceil((
                                      simulationResults.oneYear
                                        .capexAnnualized /
                                      0.117 /
                                      (simulationResults.oneYear
                                        .h2Production *
                                        25 -
                                        simulationResults.oneYear.opexAnnual)
                                    ))}{" "}
                                    anos considerando preço de venda de R$
                                    25/kg. ROI anual de{" "}
                                    {Math.ceil((
                                      ((simulationResults.oneYear
                                        .h2Production *
                                        25 -
                                        simulationResults.oneYear
                                          .opexAnnual) /
                                        (simulationResults.oneYear
                                          .capexAnnualized /
                                          0.117)) *
                                      100
                                    ))}
                                    %.
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    ⚠️ Sensível ao preço de venda do H₂. Com
                                    incentivos governamentais, payback pode
                                    reduzir 20-30%.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Cenário 3 Anos */}
                          <TabsContent value="3">
                            <div className="space-y-4">
                              {/* Viabilidade Técnica */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.threeYears!
                                    .capacityFactor > 30
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-amber-50 border-amber-200"
                                }`}
                              >
                                {simulationResults.threeYears!
                                  .capacityFactor > 30 ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Viabilidade Técnica
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Fator de Capacidade de{" "}
                                    {simulationResults.threeYears!.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                    {simulationResults.threeYears!
                                      .capacityFactor > 40 &&
                                      " - Excelente! Acima da média do setor (30-35%)."}
                                    {simulationResults.threeYears!
                                      .capacityFactor > 30 &&
                                      simulationResults.threeYears!
                                        .capacityFactor <= 40 &&
                                      " - Bom! Dentro da média esperada para projetos de H₂ verde."}
                                    {simulationResults.threeYears!
                                      .capacityFactor <= 30 &&
                                      " - Abaixo da média. Recomenda-se aumentar capacidade de geração renovável ou reduzir tamanho do eletrolisador."}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    📊 Benchmark da indústria: 30-40% para
                                    sistemas híbridos solar+eólico
                                  </p>
                                </div>
                              </div>

                              {/* Viabilidade Econômica */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.threeYears!.lcoh < 10
                                    ? "bg-emerald-50 border-emerald-200"
                                    : simulationResults.threeYears!.lcoh < 15
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                              >
                                {simulationResults.threeYears!.lcoh < 10 ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Viabilidade Econômica
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    LCOH de R${" "}
                                    {simulationResults.threeYears!.lcoh.toFixed(2).replace('.', ',')}
                                    /kg
                                    {simulationResults.threeYears!.lcoh < 8 &&
                                      " - Altamente competitivo! Abaixo do H₂ cinza (R$ 8-10/kg)."}
                                    {simulationResults.threeYears!.lcoh >=
                                      8 &&
                                      simulationResults.threeYears!.lcoh <
                                        12 &&
                                      " - Competitivo com incentivos fiscais e créditos de carbono."}
                                    {simulationResults.threeYears!.lcoh >=
                                      12 &&
                                      " - Alto. Projeto pode necessitar de subsídios ou otimizações."}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    📊 H₂ Cinza: R$ 8-10/kg | H₂ Verde (Meta
                                    2030): R$ 6-8/kg | Preço Mercado Atual: R$
                                    20-30/kg
                                  </p>
                                </div>
                              </div>

                              {/* Produção e Escala */}
                              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Produção e Escala
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Produção anual estimada de{" "}
                                    {Math.ceil((
                                      simulationResults.threeYears!
                                        .h2Production / 1000
                                    ))}{" "}
                                    toneladas de H₂ verde no cenário de 300
                                    kW. Este eletrolisador de média capacidade
                                    é adequado para projetos industriais de
                                    pequeno porte.
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    💡 Capacidade ideal para projetos em
                                    expansão. Escala comercial típica: 10–50
                                    mil kg/ano.
                                  </p>
                                </div>
                              </div>

                              {/* Retorno de Investimento */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.threeYears!
                                    .capexAnnualized /
                                    0.117 /
                                    (simulationResults.threeYears!
                                      .h2Production *
                                      25 -
                                      simulationResults.threeYears!
                                        .opexAnnual) <
                                  7
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-amber-50 border-amber-200"
                                }`}
                              >
                                <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Retorno sobre Investimento
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Payback estimado de{" "}
                                    {Math.ceil((
                                      simulationResults.threeYears!
                                        .capexAnnualized /
                                      0.117 /
                                      (simulationResults.threeYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.threeYears!
                                          .opexAnnual)
                                    ))}{" "}
                                    anos considerando preço de venda de R$
                                    25/kg. ROI anual de{" "}
                                    {Math.ceil((
                                      ((simulationResults.threeYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.threeYears!
                                          .opexAnnual) /
                                        (simulationResults.threeYears!
                                          .capexAnnualized /
                                          0.117)) *
                                      100
                                    ))}
                                    %.
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    ⚠️ Sensível ao preço de venda do H₂. Com
                                    incentivos governamentais, payback pode
                                    reduzir 20-30%.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Cenário 5 Anos */}
                          <TabsContent value="5">
                            <div className="space-y-4">
                              {/* Viabilidade Técnica */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.fiveYears!
                                    .capacityFactor > 30
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-amber-50 border-amber-200"
                                }`}
                              >
                                {simulationResults.fiveYears!.capacityFactor >
                                30 ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Viabilidade Técnica
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Fator de Capacidade de{" "}
                                    {simulationResults.fiveYears!.capacityFactor.toFixed(
                                      1
                                    )}
                                    %
                                    {simulationResults.fiveYears!
                                      .capacityFactor > 40 &&
                                      " - Excelente! Acima da média do setor (30-35%)."}
                                    {simulationResults.fiveYears!
                                      .capacityFactor > 30 &&
                                      simulationResults.fiveYears!
                                        .capacityFactor <= 40 &&
                                      " - Bom! Dentro da média esperada para projetos de H₂ verde."}
                                    {simulationResults.fiveYears!
                                      .capacityFactor <= 30 &&
                                      " - Abaixo da média. Recomenda-se aumentar capacidade de geração renovável ou reduzir tamanho do eletrolisador."}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    📊 Benchmark da indústria: 30-40% para
                                    sistemas híbridos solar+eólico
                                  </p>
                                </div>
                              </div>

                              {/* Viabilidade Econômica */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.fiveYears!.lcoh < 10
                                    ? "bg-emerald-50 border-emerald-200"
                                    : simulationResults.fiveYears!.lcoh < 15
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                              >
                                {simulationResults.fiveYears!.lcoh < 10 ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Viabilidade Econômica
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    LCOH de R${" "}
                                    {simulationResults.fiveYears!.lcoh.toFixed(2).replace('.', ',')}
                                    /kg
                                    {simulationResults.fiveYears!.lcoh < 8 &&
                                      " - Altamente competitivo! Abaixo do H₂ cinza (R$ 8-10/kg)."}
                                    {simulationResults.fiveYears!.lcoh >= 8 &&
                                      simulationResults.fiveYears!.lcoh <
                                        12 &&
                                      " - Competitivo com incentivos fiscais e créditos de carbono."}
                                    {simulationResults.fiveYears!.lcoh >=
                                      12 &&
                                      " - Alto. Projeto pode necessitar de subsídios ou otimizações."}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    📊 H₂ Cinza: R$ 8-10/kg | H₂ Verde (Meta
                                    2030): R$ 6-8/kg | Preço Mercado Atual: R$
                                    20-30/kg
                                  </p>
                                </div>
                              </div>

                              {/* Produção e Escala */}
                              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Produção e Escala
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Produção anual estimada de{" "}
                                    {Math.ceil((
                                      simulationResults.fiveYears!
                                        .h2Production / 1000
                                    ))}{" "}
                                    toneladas de H₂ verde no cenário de 500
                                    kW. Este eletrolisador de grande
                                    capacidade é ideal para operações
                                    comerciais de escala industrial.
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    💡 Escala comercial plena. Adequado para
                                    contratos de longo prazo com grandes
                                    consumidores industriais.
                                  </p>
                                </div>
                              </div>

                              {/* Retorno de Investimento */}
                              <div
                                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                                  simulationResults.fiveYears!
                                    .capexAnnualized /
                                    0.117 /
                                    (simulationResults.fiveYears!
                                      .h2Production *
                                      25 -
                                      simulationResults.fiveYears!
                                        .opexAnnual) <
                                  7
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-amber-50 border-amber-200"
                                }`}
                              >
                                <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    Retorno sobre Investimento
                                  </h3>
                                  <p className="text-sm text-slate-700">
                                    Payback estimado de{" "}
                                    {Math.ceil((
                                      simulationResults.fiveYears!
                                        .capexAnnualized /
                                      0.117 /
                                      (simulationResults.fiveYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.fiveYears!
                                          .opexAnnual)
                                    ))}{" "}
                                    anos considerando preço de venda de R$
                                    25/kg. ROI anual de{" "}
                                    {Math.ceil((
                                      ((simulationResults.fiveYears!
                                        .h2Production *
                                        25 -
                                        simulationResults.fiveYears!
                                          .opexAnnual) /
                                        (simulationResults.fiveYears!
                                          .capexAnnualized /
                                          0.117)) *
                                      100
                                    ))}
                                    %.
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    ⚠️ Sensível ao preço de venda do H₂. Com
                                    incentivos governamentais, payback pode
                                    reduzir 20-30%.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                )}

                {/* Recomendações Técnicas */}
                {simulationResults.oneYear && (
                  <AccordionItem
                    value="recomendacoes"
                    className="border-none"
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <FileText className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Recomendações Técnicas e Estratégicas
                          </h2>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 ml-auto">
                            Baseadas na Simulação
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-3">
                          {/* Recomendações dinâmicas baseadas nos resultados */}
                          {simulationResults.oneYear.capacityFactor < 30 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>Otimizar Dimensionamento:</strong>{" "}
                                  Fator de capacidade baixo (
                                  {simulationResults.oneYear.capacityFactor.toFixed(
                                    1
                                  )}
                                  %). Considere reduzir tamanho do
                                  eletrolisador ou aumentar capacidade de
                                  geração renovável.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-red-100 text-red-800 border-red-200"
                                >
                                  Alta
                                </Badge>
                              </div>
                            </motion.div>
                          )}

                          {simulationResults.oneYear.curtailment > 10000 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>Reduzir Curtailment:</strong>{" "}
                                  {Math.ceil((
                                    simulationResults.oneYear.curtailment /
                                    1000
                                  ))}{" "}
                                  MWh/ano de energia desperdiçada. Considere
                                  sistema de armazenamento (baterias) ou
                                  aumentar capacidade do eletrolisador.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                                >
                                  Média
                                </Badge>
                              </div>
                            </motion.div>
                          )}

                          {simulationResults.oneYear.lcoh > 12 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-slate-700">
                                  <strong>Buscar Incentivos Fiscais:</strong>{" "}
                                  LCOH alto (R${" "}
                                  {Math.ceil(simulationResults.oneYear.lcoh)}
                                  /kg). Projeto pode se beneficiar
                                  significativamente de programas como PNME,
                                  créditos de carbono e financiamento BNDES.
                                </p>
                                <Badge
                                  variant="outline"
                                  className="ml-4 bg-red-100 text-red-800 border-red-200"
                                >
                                  Alta
                                </Badge>
                              </div>
                            </motion.div>
                          )}

                          {/* Recomendações gerais */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                              <p className="text-slate-700">
                                <strong>EIA/RIMA Completo:</strong> Realizar
                                estudo detalhado de impacto ambiental conforme
                                exigências do CONAMA e órgãos estaduais.
                              </p>
                              <Badge
                                variant="outline"
                                className="ml-4 bg-red-100 text-red-800 border-red-200"
                              >
                                Alta
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                              <p className="text-slate-700">
                                <strong>Conexão à Rede:</strong> Avaliar
                                viabilidade técnica e custos de conexão ao
                                sistema elétrico nacional (ONS) ou operação
                                off-grid.
                              </p>
                              <Badge
                                variant="outline"
                                className="ml-4 bg-red-100 text-red-800 border-red-200"
                              >
                                Alta
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                              <p className="text-slate-700">
                                <strong>Contratos de Offtake:</strong>{" "}
                                Negociar acordos de compra de longo prazo
                                (10-15 anos) com potenciais clientes
                                industriais para garantir receita.
                              </p>
                              <Badge
                                variant="outline"
                                className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                              >
                                Média
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                              <p className="text-slate-700">
                                <strong>Licenciamento e Certificação:</strong>{" "}
                                Obter certificação de H₂ verde (CertifHy,
                                GreenH2 Standard) para acesso a mercados
                                premium.
                              </p>
                              <Badge
                                variant="outline"
                                className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                              >
                                Média
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                              <p className="text-slate-700">
                                <strong>
                                  Infraestrutura de Armazenamento:
                                </strong>{" "}
                                Dimensionar sistema de compressão e
                                armazenamento adequado (350-700 bar) conforme
                                aplicação final.
                              </p>
                              <Badge
                                variant="outline"
                                className="ml-4 bg-amber-100 text-amber-800 border-amber-200"
                              >
                                Média
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                              <p className="text-slate-700">
                                <strong>Consulta Pública:</strong> Engajamento
                                com comunidades locais, prefeituras e
                                stakeholders para garantir licença social para
                                operar.
                              </p>
                              <Badge
                                variant="outline"
                                className="ml-4 bg-emerald-100 text-emerald-800 border-emerald-200"
                              >
                                Baixa
                              </Badge>
                            </div>
                          </motion.div>

                          {/* Recomendações Topográficas Dinâmicas */}
                          {topographyData?.recommendations.map(
                            (recommendation, index) => (
                              <motion.div
                                key={`topo-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <Mountain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 flex items-center justify-between">
                                  <p className="text-slate-700">
                                    <strong>Topografia:</strong>{" "}
                                    {recommendation}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`ml-4 ${
                                      topographyData.slopeStatus === "success"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : topographyData.slopeStatus ===
                                          "warning"
                                        ? "bg-amber-100 text-amber-800 border-amber-200"
                                        : "bg-red-100 text-red-800 border-red-200"
                                    }`}
                                  >
                                    {topographyData.slopeStatus === "success"
                                      ? "Baixa"
                                      : topographyData.slopeStatus ===
                                        "warning"
                                      ? "Média"
                                      : "Alta"}
                                  </Badge>
                                </div>
                              </motion.div>
                            )
                          )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                )}
              </Accordion>
              {/* Conteúdo da aba Cidade copiado para aba Região - Fim */}

              {/* Card de Viabilidade da Região */}
              {selectedRegion && selectedRegion !== "all" && (
                <Accordion
                  type="multiple"
                  defaultValue={["regiao"]}
                  className="mb-4"
                >
                  <AccordionItem value="regiao" className="border-none">
                    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mt-4">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <MapPin className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Análise de Viabilidade - {selectedRegion}
                          </h2>
                          <Badge className="ml-auto bg-emerald-100 text-emerald-800 border-emerald-300">
                            Região
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
                          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">📍 Localização Selecionada</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-slate-600 mb-1"><strong>Região</strong></p>
                                <p className="text-base font-semibold text-slate-900">{selectedRegion}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600 mb-1"><strong>Estado</strong></p>
                                <p className="text-base font-semibold text-slate-900">{selectedEstadoNome} ({selectedEstado})</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600 mb-1"><strong>Cidade</strong></p>
                                <p className="text-base font-semibold text-slate-900">{selectedCidadeNome || "Não selecionada"}</p>
                              </div>
                            </div>
                          </Card>

                          {loading ? (
                            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                              <div className="flex items-center justify-center space-x-3">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <p className="text-slate-700">Carregando dados meteorológicos e topográficos...</p>
                              </div>
                            </Card>
                          ) : analysisStarted && weatherData ? (
                            <>
                              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">🌤️ Dados Meteorológicos Reais</h3>
                                <div className="grid md:grid-cols-3 gap-3">
                                  <div className="p-3 rounded-lg bg-white border border-amber-200">
                                    <p className="text-xs text-slate-600 mb-1">☀️ <strong>Irradiância Solar</strong></p>
                                    <p className="text-xl font-bold text-amber-600">
                                      {weatherData.avgSolarIrradiance.toFixed(2)} kWh/m²/dia
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      {weatherData.avgSolarIrradiance > 5 ? "Excelente" : weatherData.avgSolarIrradiance > 4 ? "Bom" : "Regular"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-blue-200">
                                    <p className="text-xs text-slate-600 mb-1">💨 <strong>Velocidade do Vento</strong></p>
                                    <p className="text-xl font-bold text-blue-600">
                                      {weatherData.avgWindSpeed.toFixed(2)} m/s
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      {weatherData.avgWindSpeed > 7 ? "Excelente" : weatherData.avgWindSpeed > 5 ? "Bom" : "Regular"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-green-200">
                                    <p className="text-xs text-slate-600 mb-1">🌡️ <strong>Temperatura</strong></p>
                                    <p className="text-xl font-bold text-green-600">
                                      {weatherData.avgTemperature.toFixed(1)}°C
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">Média anual</p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-3 text-center">
                                  📊 Dados da NASA POWER - {weatherData.dataPoints} dias analisados
                                </p>
                              </Card>

                              {simulationResults.oneYear && (
                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-3">⚡ Resultados da Simulação</h3>
                                  <div className="grid md:grid-cols-3 gap-3">
                                    <div className="p-3 rounded-lg bg-white border border-emerald-200">
                                      <p className="text-xs text-slate-600 mb-1">💧 <strong>Produção H₂ (1 ano)</strong></p>
                                      <p className="text-xl font-bold text-emerald-600">
                                        {Math.ceil(simulationResults.oneYear.h2Production / 1000)} ton/ano
                                      </p>
                                      <p className="text-xs text-slate-600 mt-1">Eletrolisador 100 kW</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white border border-blue-200">
                                      <p className="text-xs text-slate-600 mb-1">💰 <strong>LCOH</strong></p>
                                      <p className="text-xl font-bold text-blue-600">
                                        R$ {simulationResults.oneYear.lcoh.toFixed(2)}/kg
                                      </p>
                                      <Badge className="mt-1 text-xs">
                                        {simulationResults.oneYear.lcoh < 8 ? "✓ Competitivo" : simulationResults.oneYear.lcoh < 12 ? "~ Razoável" : "⚠ Alto"}
                                      </Badge>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white border border-purple-200">
                                      <p className="text-xs text-slate-600 mb-1">📊 <strong>Fator Capacidade</strong></p>
                                      <p className="text-xl font-bold text-purple-600">
                                        {simulationResults.oneYear.capacityFactor.toFixed(1)}%
                                      </p>
                                      <Badge className="mt-1 text-xs">
                                        {simulationResults.oneYear.capacityFactor > 40 ? "✓ Excelente" : simulationResults.oneYear.capacityFactor > 30 ? "~ Bom" : "⚠ Baixo"}
                                      </Badge>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              <Card className="p-4 bg-blue-50 border-blue-200">
                                <p className="text-sm text-slate-700 mb-2"><strong>✨ Análise Completa Disponível:</strong></p>
                                <p className="text-xs text-slate-700">
                                  Todos os accordions de análise detalhada (Produção, Simulação, Financeiro, Ambiental, Viabilidade e Recomendações) 
                                  foram adicionados acima com os dados reais desta região. Role para cima para ver a análise completa.
                                </p>
                              </Card>
                            </>
                          ) : (
                            <Card className="p-4 bg-amber-50 border-amber-200">
                              <p className="text-sm text-slate-700 mb-2"><strong>⏳ Aguardando Carregamento:</strong></p>
                              <p className="text-xs text-slate-700">
                                Selecione uma região para carregar automaticamente os dados meteorológicos e iniciar a análise de viabilidade.
                              </p>
                            </Card>
                          )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Card de Viabilidade da Cidade */}
              {selectedCidade && selectedCidade !== "all" && (
                <Accordion
                  type="multiple"
                  defaultValue={["cidade"]}
                  className="mb-4"
                >
                  <AccordionItem value="cidade" className="border-none">
                    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden mt-4">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                        <div className="flex items-center space-x-3 w-full">
                          <MapPin className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">
                            Análise de Viabilidade - {selectedCidadeNome}
                          </h2>
                          <Badge className="ml-auto bg-emerald-100 text-emerald-800 border-emerald-300">
                            Cidade
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
                          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">📍 Localização Selecionada</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-slate-600 mb-1"><strong>Cidade</strong></p>
                                <p className="text-base font-semibold text-slate-900">{selectedCidadeNome}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600 mb-1"><strong>Estado</strong></p>
                                <p className="text-base font-semibold text-slate-900">{selectedEstadoNome} ({selectedEstado})</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600 mb-1"><strong>Região</strong></p>
                                <p className="text-base font-semibold text-slate-900">{selectedRegion}</p>
                              </div>
                            </div>
                          </Card>

                          {loading ? (
                            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                              <div className="flex items-center justify-center space-x-3">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <p className="text-slate-700">Carregando dados meteorológicos e topográficos...</p>
                              </div>
                            </Card>
                          ) : analysisStarted && weatherData ? (
                            <>
                              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">🌤️ Dados Meteorológicos Reais</h3>
                                <div className="grid md:grid-cols-3 gap-3">
                                  <div className="p-3 rounded-lg bg-white border border-amber-200">
                                    <p className="text-xs text-slate-600 mb-1">☀️ <strong>Irradiância Solar</strong></p>
                                    <p className="text-xl font-bold text-amber-600">
                                      {weatherData.avgSolarIrradiance.toFixed(2)} kWh/m²/dia
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      {weatherData.avgSolarIrradiance > 5 ? "Excelente" : weatherData.avgSolarIrradiance > 4 ? "Bom" : "Regular"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-blue-200">
                                    <p className="text-xs text-slate-600 mb-1">💨 <strong>Velocidade do Vento</strong></p>
                                    <p className="text-xl font-bold text-blue-600">
                                      {weatherData.avgWindSpeed.toFixed(2)} m/s
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      {weatherData.avgWindSpeed > 7 ? "Excelente" : weatherData.avgWindSpeed > 5 ? "Bom" : "Regular"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-green-200">
                                    <p className="text-xs text-slate-600 mb-1">🌡️ <strong>Temperatura</strong></p>
                                    <p className="text-xl font-bold text-green-600">
                                      {weatherData.avgTemperature.toFixed(1)}°C
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">Média anual</p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-3 text-center">
                                  📊 Dados da NASA POWER - {weatherData.dataPoints} dias analisados
                                </p>
                              </Card>

                              {simulationResults.oneYear && (
                                <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-3">⚡ Resultados da Simulação</h3>
                                  <div className="grid md:grid-cols-3 gap-3">
                                    <div className="p-3 rounded-lg bg-white border border-emerald-200">
                                      <p className="text-xs text-slate-600 mb-1">💧 <strong>Produção H₂ (1 ano)</strong></p>
                                      <p className="text-xl font-bold text-emerald-600">
                                        {Math.ceil(simulationResults.oneYear.h2Production / 1000)} ton/ano
                                      </p>
                                      <p className="text-xs text-slate-600 mt-1">Eletrolisador 100 kW</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white border border-blue-200">
                                      <p className="text-xs text-slate-600 mb-1">💰 <strong>LCOH</strong></p>
                                      <p className="text-xl font-bold text-blue-600">
                                        R$ {simulationResults.oneYear.lcoh.toFixed(2)}/kg
                                      </p>
                                      <Badge className="mt-1 text-xs">
                                        {simulationResults.oneYear.lcoh < 8 ? "✓ Competitivo" : simulationResults.oneYear.lcoh < 12 ? "~ Razoável" : "⚠ Alto"}
                                      </Badge>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white border border-purple-200">
                                      <p className="text-xs text-slate-600 mb-1">📊 <strong>Fator Capacidade</strong></p>
                                      <p className="text-xl font-bold text-purple-600">
                                        {simulationResults.oneYear.capacityFactor.toFixed(1)}%
                                      </p>
                                      <Badge className="mt-1 text-xs">
                                        {simulationResults.oneYear.capacityFactor > 40 ? "✓ Excelente" : simulationResults.oneYear.capacityFactor > 30 ? "~ Bom" : "⚠ Baixo"}
                                      </Badge>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              <Card className="p-4 bg-blue-50 border-blue-200">
                                <p className="text-sm text-slate-700 mb-2"><strong>✨ Análise Completa Disponível:</strong></p>
                                <p className="text-xs text-slate-700">
                                  Todos os accordions de análise detalhada (Produção, Simulação, Financeiro, Ambiental, Viabilidade e Recomendações) 
                                  foram adicionados acima com os dados reais desta cidade. Role para cima para ver a análise completa.
                                </p>
                              </Card>
                            </>
                          ) : (
                            <Card className="p-4 bg-amber-50 border-amber-200">
                              <p className="text-sm text-slate-700 mb-2"><strong>⏳ Aguardando Carregamento:</strong></p>
                              <p className="text-xs text-slate-700">
                                Selecione uma cidade para carregar automaticamente os dados meteorológicos e iniciar a análise de viabilidade.
                              </p>
                            </Card>
                          )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Ranking removido conforme solicitação */}
            </>
          )}
          </>
          )}
        </div>
      </div>
    </>
  );
};

export default FeasibilityAnalysis;
