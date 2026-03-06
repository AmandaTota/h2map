import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Wind,
  Sun,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  CloudSnow,
  Cloud,
  CloudDrizzle,
  Sunrise,
  Sunset,
  X,
} from "lucide-react";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  addDays,
  differenceInCalendarDays,
} from "date-fns";
import ExcelJS from "exceljs";
import Navigation from "@/components/Navigation";
import LocationSearch from "@/components/LocationSearch";
import { useLocationStore } from "@/store/locationStore";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_SELECTED_PARAMETERS: string[] = [];

// Weather API Service
class WeatherService {
  async getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      // Use NASA POWER data for accurate historical climate data
      const nasaData = await this.fetchNASAPowerData(
        lat,
        lon,
        startDate,
        endDate,
      );
      if (nasaData && nasaData.length > 0) {
        return nasaData;
      }
      // Fallback to mock data if NASA POWER fails
      return this.generateMockHistoricalData(lat, lon, startDate, endDate);
    } catch (error) {
      console.error("Error fetching historical weather data:", error);
      return this.generateMockHistoricalData(lat, lon, startDate, endDate);
    }
  }

  private async fetchNASAPowerData(
    lat: number,
    lon: number,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const startDateStr = format(startDate, "yyyy-MM-dd");
      // Algumas APIs retornam intervalo exclusivo para a data final.
      // Para garantir inclusão do último dia, enviamos endDate + 1 dia.
      const endDateStr = format(addDays(endDate, 1), "yyyy-MM-dd");

      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/fetch-nasa-power-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
            }`,
          },
          body: JSON.stringify({
            lat,
            lon,
            startDate: startDateStr,
            endDate: endDateStr,
          }),
        },
      );

      if (!response.ok) {
        console.error("NASA POWER API request failed:", response.status);
        return null;
      }

      const nasaData = await response.json();

      // Transform NASA POWER summary into daily data for consistency
      return this.transformNASAPowerData(nasaData, startDate, endDate);
    } catch (error) {
      console.error("Error fetching NASA POWER data:", error);
      return null;
    }
  }

  private transformNASAPowerData(
    nasaData: any,
    startDate: Date,
    endDate: Date,
  ): HistoricalData[] {
    if (!nasaData || !nasaData.dailyData) return [];

    const data: HistoricalData[] = [];
    const { dailyData } = nasaData;
    const rangeStart = startOfDay(startDate);
    const rangeEnd = endOfDay(endDate);

    // Use real daily data from NASA POWER
    for (const day of dailyData) {
      // Parse date from NASA format (YYYYMMDD) to Date object
      const year = parseInt(day.date.substring(0, 4));
      const month = parseInt(day.date.substring(4, 6)) - 1; // JS months are 0-indexed
      const dayOfMonth = parseInt(day.date.substring(6, 8));
      const date = new Date(year, month, dayOfMonth);

      // Mantem apenas o intervalo solicitado no filtro.
      if (date < rangeStart || date > rangeEnd) continue;

      data.push({
        date: date,
        temperature: day.temperature,
        humidity: day.humidity,
        windSpeed: day.windSpeed,
        windDirection: Math.random() * 360, // NASA POWER doesn't provide direction
        pressure: 1013 + (Math.random() - 0.5) * 20, // Standard pressure with variation
        uvIndex: Math.min(11, Math.max(0, day.solarIrradiance * 2)), // Estimate UV from solar
        visibility: 10, // Default visibility
        rainfall: day.precipitation,
        solarIrradiance: (day.solarIrradiance * 1000) / 12, // Convert kWh/m²/day to W/m² (assuming 12h daylight)
      });
    }

    if (!data.length) return [];

    // Garante série diária contínua até a data final (hoje), preenchendo lacunas.
    const sorted = [...data].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const byDay = new Map(
      sorted.map((item) => [format(item.date, "yyyy-MM-dd"), item]),
    );

    const continuous: HistoricalData[] = [];
    let cursor = new Date(rangeStart);
    let lastKnown: HistoricalData | null = null;
    const firstKnown = sorted[0];

    while (cursor <= rangeEnd) {
      const key = format(cursor, "yyyy-MM-dd");
      const exact = byDay.get(key);

      if (exact) {
        continuous.push(exact);
        lastKnown = exact;
      } else {
        const source = lastKnown ?? firstKnown;
        continuous.push({
          ...source,
          date: new Date(cursor),
        });
      }

      cursor = addDays(cursor, 1);
    }

    return continuous;
  }

  private async fetchINMETData(
    lat: number,
    lon: number,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      // Format dates as YYYY-MM-DD for INMET API
      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");

      // Find nearest INMET station (using a default station for now)
      // In production, you'd call fetch-inmet-stations and find the closest one
      const stationCode = "A001"; // Default station code

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-inmet-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
            }`,
          },
          body: JSON.stringify({
            stationCode,
            startDate: startDateStr,
            endDate: endDateStr,
          }),
        },
      );

      if (!response.ok) {
        console.error("INMET API request failed:", response.status);
        return null;
      }

      const { data } = await response.json();

      // Transform INMET data to our format
      return this.transformINMETData(data);
    } catch (error) {
      console.error("Error fetching INMET data:", error);
      return null;
    }
  }

  private transformINMETData(inmetData: any[]): HistoricalData[] {
    if (!inmetData || !Array.isArray(inmetData)) return [];

    return inmetData.map((item) => ({
      date: new Date(item.DT_MEDICAO || item.data || new Date()),
      temperature: parseFloat(item.TEM_INS || item.temperatura_bulbo_hora || 0),
      humidity: parseFloat(item.UMD_INS || item.umidade_rel_max || 0),
      windSpeed: parseFloat(item.VEN_VEL || item.vento_velocidade || 0),
      windDirection: parseFloat(item.VEN_DIR || item.vento_direcao || 0),
      pressure: parseFloat(item.PRE_INS || item.pressao_atm_max || 0),
      uvIndex: 0, // INMET doesn't provide UV index
      visibility: 10, // Default visibility
      rainfall: parseFloat(item.CHUVA || item.precipitacao_total || 0),
      solarIrradiance: parseFloat(item.RAD_GLO || item.radiacao_global || 0),
    }));
  }

  async getCurrentWeather(lat: number, lon: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/fetch-openweathermap-current`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
            }`,
          },
          body: JSON.stringify({ lat, lon }),
        },
      );

      if (!response.ok) {
        throw new Error("Weather API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return this.getMockWeatherData(lat, lon);
    }
  }

  private generateMockHistoricalData(
    lat: number,
    lon: number,
    startDate: Date,
    endDate: Date,
  ) {
    const data = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      data.push({
        date: new Date(currentDate),
        temperature:
          15 + Math.random() * 20 + Math.sin(currentDate.getDate() / 30) * 5,
        humidity: 40 + Math.random() * 40,
        windSpeed: 3 + Math.random() * 15,
        windDirection: Math.random() * 360,
        pressure: 1000 + Math.random() * 30,
        uvIndex: 1 + Math.random() * 10,
        visibility: 5 + Math.random() * 15,
        rainfall: Math.random() > 0.7 ? Math.random() * 50 : 0,
        solarIrradiance:
          100 +
          Math.random() * 600 +
          Math.sin(currentDate.getHours() / 24) * 200,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }

  private getMockWeatherData(lat: number, lon: number) {
    return {
      name: "Localização",
      lat,
      lon,
      main: {
        temp: 20 + Math.random() * 15,
        humidity: 50 + Math.random() * 30,
        pressure: 1000 + Math.random() * 30,
      },
      wind: {
        speed: 5 + Math.random() * 20,
        deg: Math.random() * 360,
      },
      weather: [
        {
          main: "Céu limpo",
          description: "Céu limpo",
          icon: "01d",
        },
      ],
      visibility: 8000 + Math.random() * 2000,
      uvi: 1 + Math.random() * 10,
    };
  }
}

interface HistoricalData {
  date: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  rainfall: number;
  solarIrradiance: number;
}

interface LocationData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

interface StatisticsSummary {
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  avgHumidity: number;
  avgWindSpeed: number;
  maxWindSpeed: number;
  totalRainfall: number;
  avgSolarIrradiance: number;
  avgPressure: number;
  avgUVIndex: number;
  dataPoints: number;
  // Advanced statistics
  tempStdDev: number;
  windSpeedStdDev: number;
  rainyDays: number;
  sunnyDays: number;
  avgDailyEnergyPotential: number; // kWh/m²/day
}

interface WeatherForecast {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    clouds: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    sunrise: number;
    sunset: number;
    timezone: number;
  };
  forecast: Array<{
    date: string;
    dayName: string;
    temp: {
      min: number;
      max: number;
      avg: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    humidity: number;
    windSpeed: number;
    pressure: number;
    rainfall: number;
    clouds: number;
  }>;
}

const Statistics = () => {
  const { selectedLocation: storeLocation, clearLocation } = useLocationStore();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    storeLocation
      ? {
          id: 0,
          name: storeLocation.name,
          lat: storeLocation.lat,
          lng: storeLocation.lng,
          type: "custom",
        }
      : null,
  );
  const [dateRange, setDateRange] = useState<"7" | "15" | "30" | "custom">("7");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [statistics, setStatistics] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState<string[]>(
    DEFAULT_SELECTED_PARAMETERS,
  );
  const [activeChartParameters, setActiveChartParameters] = useState<string[]>(
    [],
  );
  const [locationSearchKey, setLocationSearchKey] = useState<number>(0);
  const locationSearchContainerRef = useRef<HTMLDivElement | null>(null);

  const weatherService = new WeatherService();

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    setSelectedLocation({
      id: 0,
      name: location.name,
      lat: location.lat,
      lng: location.lng,
      type: "custom",
    });
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setHistoricalData([]);
    setStatistics(null);
    clearLocation();
    setLocationSearchKey((k) => k + 1);
    setSelectedParameters(DEFAULT_SELECTED_PARAMETERS);
    setActiveChartParameters([]);
  };

  useEffect(() => {
    setActiveChartParameters((prev) => {
      const filtered = prev.filter((id) => selectedParameters.includes(id));
      if (filtered.length > 0 || selectedParameters.length === 0)
        return filtered;
      return [selectedParameters[0]];
    });
  }, [selectedParameters]);

  const toggleChartParameter = (paramId: string) => {
    setActiveChartParameters((prev) =>
      prev.includes(paramId)
        ? prev.filter((id) => id !== paramId)
        : [...prev, paramId],
    );
  };

  const handleGoToLocationInput = () => {
    const container = locationSearchContainerRef.current;
    if (!container) return;

    container.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      const input = container.querySelector("input");
      input?.focus();
    }, 250);
  };

  const parameters = [
    {
      id: "temperature",
      name: "Temperatura",
      icon: Thermometer,
      unit: "°C",
      color: "#ef4444",
    },
    {
      id: "humidity",
      name: "Umidade",
      icon: Droplets,
      unit: "%",
      color: "#3b82f6",
    },
    {
      id: "windSpeed",
      name: "Velocidade do Vento",
      icon: Wind,
      unit: "m/s",
      color: "#10b981",
    },
    {
      id: "pressure",
      name: "Pressão",
      icon: Gauge,
      unit: "hPa",
      color: "#6b7280",
    },
    {
      id: "rainfall",
      name: "Precipitação",
      icon: Droplets,
      unit: "mm",
      color: "#06b6d4",
    },
    {
      id: "solarIrradiance",
      name: "Irradiação Solar",
      icon: Sun,
      unit: "W/m²",
      color: "#f59e0b",
    },
    { id: "uvIndex", name: "Índice UV", icon: Eye, unit: "", color: "#8b5cf6" },
    {
      id: "visibility",
      name: "Visibilidade",
      icon: Eye,
      unit: "km",
      color: "#14b8a6",
    },
  ];

  useEffect(() => {
    if (selectedLocation) {
      loadData();
    }
  }, [selectedLocation, dateRange, customStartDate, customEndDate]);

  const loadData = async () => {
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const data = await weatherService.getHistoricalWeather(
        selectedLocation.lat,
        selectedLocation.lng,
        startDate,
        endDate,
      );

      setHistoricalData(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    // Sempre usa ontem como data final para evitar inconsistências de dados do dia atual.
    const yesterday = subDays(new Date(), 1);

    let endDate = yesterday;
    let startDate: Date;

    switch (dateRange) {
      case "7":
        // Intervalo inclusivo: N dias exatos => start = end - (N - 1)
        startDate = subDays(endDate, 7 - 1);
        break;
      case "15":
        startDate = subDays(endDate, 15 - 1);
        break;
      case "30":
        startDate = subDays(endDate, 30 - 1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          const customStart = new Date(customStartDate);
          const customEnd = new Date(customEndDate);
          // Evita data final no presente/futuro no intervalo personalizado.
          endDate = customEnd > yesterday ? yesterday : customEnd;
          startDate = customStart;
        } else {
          startDate = subDays(endDate, 7 - 1);
        }
        break;
      default:
        startDate = subDays(endDate, 7 - 1);
    }

    return { startDate: startOfDay(startDate), endDate: endOfDay(endDate) };
  };

  const calculateStatistics = (data: HistoricalData[]) => {
    if (data.length === 0) return;

    // Basic statistics
    const avgTemperature =
      data.reduce((sum, d) => sum + d.temperature, 0) / data.length;
    const avgWindSpeed =
      data.reduce((sum, d) => sum + d.windSpeed, 0) / data.length;

    // Calculate standard deviations
    const tempVariances = data.map((d) =>
      Math.pow(d.temperature - avgTemperature, 2),
    );
    const tempStdDev = Math.sqrt(
      tempVariances.reduce((sum, v) => sum + v, 0) / data.length,
    );

    const windVariances = data.map((d) =>
      Math.pow(d.windSpeed - avgWindSpeed, 2),
    );
    const windSpeedStdDev = Math.sqrt(
      windVariances.reduce((sum, v) => sum + v, 0) / data.length,
    );

    // Count rainy and sunny days
    const rainyDays = data.filter((d) => d.rainfall > 1).length; // Days with >1mm rainfall
    const sunnyDays = data.filter((d) => d.solarIrradiance > 300).length; // Days with >300 W/m² (good solar irradiance)

    // Calculate average daily energy potential (solar)
    // Convert W/m² average to kWh/m²/day (assuming 12 hours of daylight)
    const avgDailyEnergyPotential =
      data.reduce((sum, d) => sum + (d.solarIrradiance * 12) / 1000, 0) /
      data.length;

    const stats: StatisticsSummary = {
      avgTemperature: parseFloat(avgTemperature.toFixed(1)),
      maxTemperature: parseFloat(
        Math.max(...data.map((d) => d.temperature)).toFixed(1),
      ),
      minTemperature: parseFloat(
        Math.min(...data.map((d) => d.temperature)).toFixed(1),
      ),
      avgHumidity: Math.round(
        data.reduce((sum, d) => sum + d.humidity, 0) / data.length,
      ),
      avgWindSpeed: parseFloat(avgWindSpeed.toFixed(1)),
      maxWindSpeed: parseFloat(
        Math.max(...data.map((d) => d.windSpeed)).toFixed(1),
      ),
      totalRainfall: parseFloat(
        data.reduce((sum, d) => sum + d.rainfall, 0).toFixed(1),
      ),
      avgSolarIrradiance: parseFloat(
        (
          data.reduce((sum, d) => sum + d.solarIrradiance, 0) / data.length
        ).toFixed(1),
      ),
      avgPressure: Math.round(
        data.reduce((sum, d) => sum + d.pressure, 0) / data.length,
      ),
      avgUVIndex: parseFloat(
        (data.reduce((sum, d) => sum + d.uvIndex, 0) / data.length).toFixed(1),
      ),
      dataPoints: data.length,
      tempStdDev: parseFloat(tempStdDev.toFixed(1)),
      windSpeedStdDev: parseFloat(windSpeedStdDev.toFixed(1)),
      rainyDays,
      sunnyDays,
      avgDailyEnergyPotential: parseFloat(avgDailyEnergyPotential.toFixed(2)),
    };

    setStatistics(stats);
  };

  const exportToExcel = async () => {
    if (!historicalData.length || !selectedLocation) return;

    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "H2Maps";
      workbook.created = new Date();

      const applyFixedWidthAndCenter = (worksheet: ExcelJS.Worksheet) => {
        // ExcelJS column width is based on character units, not centimeters.
        // 5cm is approximately 27 character width units.
        const fixedColumnWidth = 27;

        worksheet.columns?.forEach((column) => {
          column.eachCell({ includeEmpty: true }, (cell) => {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          });
          column.width = fixedColumnWidth;
        });
      };

      const selectedParamConfigs = parameters.filter((p) =>
        selectedParameters.includes(p.id),
      );

      const mainSheetName = `Dados_${selectedLocation.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 25)}`;
      const mainSheet = workbook.addWorksheet(mainSheetName);

      const mainHeaders = ["Data", "Localização", "Latitude", "Longitude"];
      selectedParamConfigs.forEach((param) => {
        mainHeaders.push(
          `${param.name}${param.unit ? ` (${param.unit})` : ""}`,
        );
      });

      mainSheet.addRow(mainHeaders);
      historicalData.forEach((item) => {
        const rowValues: Array<string | number> = [
          format(item.date, "dd/MM/yyyy"),
          selectedLocation.name,
          Number(selectedLocation.lat.toFixed(4)),
          Number(selectedLocation.lng.toFixed(4)),
        ];

        selectedParamConfigs.forEach((param) => {
          rowValues.push(
            Number(
              (item[param.id as keyof HistoricalData] as number).toFixed(2),
            ),
          );
        });

        mainSheet.addRow(rowValues);
      });

      const headerRow = mainSheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF059669" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      headerRow.height = 22;

      mainSheet.views = [{ state: "frozen", ySplit: 1 }];

      if (statistics) {
        mainSheet.addRow([]);
        const summaryHeader = mainSheet.addRow(["RESUMO ESTATISTICO", "Valor"]);
        summaryHeader.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0EA5E9" },
          };
        });

        const summaryRows: Array<[string, number]> = [
          ["Media Temperatura (C)", statistics.avgTemperature],
          ["Temperatura Maxima (C)", statistics.maxTemperature],
          ["Temperatura Minima (C)", statistics.minTemperature],
          ["Desvio Padrao Temperatura (C)", statistics.tempStdDev],
          ["Media Umidade (%)", statistics.avgHumidity],
          ["Media Velocidade Vento (m/s)", statistics.avgWindSpeed],
          ["Velocidade Maxima Vento (m/s)", statistics.maxWindSpeed],
          ["Desvio Padrao Vento (m/s)", statistics.windSpeedStdDev],
          ["Precipitacao Total (mm)", statistics.totalRainfall],
          ["Media Irradiacao Solar (W/m2)", statistics.avgSolarIrradiance],
          [
            "Potencial Energetico Diario (kWh/m2/dia)",
            statistics.avgDailyEnergyPotential,
          ],
          ["Media Pressao (hPa)", statistics.avgPressure],
          ["Media Indice UV", statistics.avgUVIndex],
          ["Dias Ensolarados", statistics.sunnyDays],
          ["Dias Chuvosos", statistics.rainyDays],
          ["Total de Pontos de Dados", statistics.dataPoints],
        ];

        summaryRows.forEach(([label, value]) => {
          mainSheet.addRow([label, value]);
        });
      }

      applyFixedWidthAndCenter(mainSheet);

      // Add a dedicated worksheet for chart series (used in the in-app chart).
      const chartParamIds =
        activeChartParameters.length > 0
          ? activeChartParameters
          : selectedParameters.length > 0
            ? selectedParameters
            : ["temperature"];

      const chartParams = parameters.filter((p) =>
        chartParamIds.includes(p.id),
      );

      const chartSheet = workbook.addWorksheet("Grafico_Dados");
      const chartHeaders = [
        "Data",
        ...chartParams.map(
          (param) => `${param.name}${param.unit ? ` (${param.unit})` : ""}`,
        ),
      ];
      chartSheet.addRow(chartHeaders);

      historicalData.forEach((item) => {
        const rowValues: Array<string | number> = [
          format(item.date, "dd/MM/yyyy"),
        ];
        chartParams.forEach((param) => {
          rowValues.push(
            Number(
              (item[param.id as keyof HistoricalData] as number).toFixed(2),
            ),
          );
        });
        chartSheet.addRow(rowValues);
      });

      const chartHeaderRow = chartSheet.getRow(1);
      chartHeaderRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };

        let fillColor = "FF334155";
        if (colNumber > 1) {
          const param = chartParams[colNumber - 2];
          if (param) {
            fillColor = `FF${param.color.replace("#", "").toUpperCase()}`;
          }
        }

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      });

      chartSheet.views = [{ state: "frozen", ySplit: 1 }];
      applyFixedWidthAndCenter(chartSheet);

      // Generate filename with date range
      const { startDate, endDate } = getDateRange();
      const filename = `H2maps_Estatisticas_${selectedLocation.name.replace(
        /[^a-zA-Z0-9]/g,
        "_",
      )}_${format(startDate, "dd-MM-yyyy")}_a_${format(
        endDate,
        "dd-MM-yyyy",
      )}.xlsx`;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setExporting(false);
    }
  };

  const toggleParameter = (paramId: string) => {
    setSelectedParameters((prev) =>
      prev.includes(paramId)
        ? prev.filter((p) => p !== paramId)
        : [...prev, paramId],
    );
  };

  const getParameterStats = (paramId: string) => {
    if (!historicalData.length) return null;

    const values = historicalData.map(
      (d) => d[paramId as keyof HistoricalData] as number,
    );
    const avg = parseFloat(
      (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1),
    );
    const max = parseFloat(Math.max(...values).toFixed(1));
    const min = parseFloat(Math.min(...values).toFixed(1));

    return { avg, max, min };
  };

  const { startDate: selectedStartDate, endDate: selectedEndDate } =
    getDateRange();
  const selectedRangeDays =
    differenceInCalendarDays(selectedEndDate, selectedStartDate) + 1;
  const shouldRenderChart = selectedRangeDays <= 31;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16">
        <div className="max-w-7xl mx-auto p-6 ">
          {/* Header with Export Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
                Análise Estatística
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Dados climáticos detalhados para análise de viabilidade
              </p>
            </div>
            <button
              onClick={exportToExcel}
              disabled={!historicalData.length || exporting}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{exporting ? "Exportando..." : "Exportar Excel"}</span>
            </button>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-emerald-600" />
              Filtros de Análise
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Location Search */}
              <div ref={locationSearchContainerRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Localização
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <LocationSearch
                      key={locationSearchKey}
                      onLocationSelect={handleLocationSelect}
                      initialLocation={
                        selectedLocation
                          ? {
                              lat: selectedLocation.lat,
                              lng: selectedLocation.lng,
                              name: selectedLocation.name,
                            }
                          : undefined
                      }
                    />
                  </div>
                  <button
                    onClick={handleClearSelection}
                    disabled={!selectedLocation}
                    className="h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar seleção
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Período de Análise
                </label>
                <div className="flex flex-wrap gap-2">
                  {["7", "15", "30"].map((days) => (
                    <button
                      key={days}
                      onClick={() => setDateRange(days as "7" | "15" | "30")}
                      className={`flex-1 min-w-[60px] px-2 sm:px-3 py-2 rounded-lg border transition-colors text-sm ${
                        dateRange === days
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {days} dias
                    </button>
                  ))}
                  <button
                    onClick={() => setDateRange("custom")}
                    className={`sm:flex-3  min-w-[80px] px-2 sm:px-3 py-2 rounded-lg border transition-colors text-sm ${
                      dateRange === "custom"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
              </div>

              {/* Custom Date Range */}
              {dateRange === "custom" && (
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Data Fim
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Parameters Selection */}
            <div className="mt-4 sm:mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                Parâmetros para Análise
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {parameters.map((param) => (
                  <button
                    key={param.id}
                    onClick={() => toggleParameter(param.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg border transition-colors text-sm ${
                      selectedParameters.includes(param.id)
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <param.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">
                      {param.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600">Carregando dados históricos...</p>
            </div>
          )}

          {/* Statistics Summary */}
          {!loading && statistics && (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                Análise Estatística Detalhada
              </h2>

              {/* Main Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    <span className="text-xs sm:text-sm text-slate-600">
                      Temperatura
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">
                    {statistics.avgTemperature}°C
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Max: {statistics.maxTemperature}°C | Min:{" "}
                    {statistics.minTemperature}°C
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Desvio Padrão: ±{statistics.tempStdDev}°C
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="text-xs sm:text-sm text-slate-600">
                      Umidade
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">
                    {statistics.avgHumidity}%
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Média do Período
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="text-xs sm:text-sm text-slate-600">
                      Vento
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">
                    {statistics.avgWindSpeed} m/s
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Max: {statistics.maxWindSpeed} m/s
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Desvio Padrão: ±{statistics.windSpeedStdDev} m/s
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    <span className="text-xs sm:text-sm text-slate-600">
                      Solar
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">
                    {statistics.avgSolarIrradiance} W/m²
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Potencial: {statistics.avgDailyEnergyPotential} kWh/m²/dia
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-cyan-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                    <span className="text-xs sm:text-sm text-slate-600">
                      Precipitação
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">
                    {statistics.totalRainfall} mm
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Total no Período
                  </div>
                </div>
              </div>

              {/* Energy Potential Analysis */}
              <div className="border-t border-slate-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2 sm:mb-3">
                  Potencial Energético
                </h3>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mt-0.5 sm:mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        Potencial Solar: {statistics.avgDailyEnergyPotential}{" "}
                        kWh/m²/dia
                      </p>
                      <p className="text-xs text-slate-600 mb-2">
                        Com base na irradiação solar média de{" "}
                        {statistics.avgSolarIrradiance} W/m² durante o período
                        analisado.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/60 rounded px-2 py-1">
                          <span className="text-slate-600">
                            Geração estimada (1 kWp):
                          </span>
                          <span className="font-semibold text-slate-900 ml-1">
                            {(statistics.avgDailyEnergyPotential * 0.8).toFixed(
                              2,
                            )}{" "}
                            kWh/dia
                          </span>
                        </div>
                        <div className="bg-white/60 rounded px-2 py-1">
                          <span className="text-slate-600">
                            Geração mensal (1 kWp):
                          </span>
                          <span className="font-semibold text-slate-900 ml-1">
                            {(
                              statistics.avgDailyEnergyPotential *
                              0.8 *
                              30
                            ).toFixed(0)}{" "}
                            kWh/mês
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historical Charts */}
          {!loading && historicalData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
                Gráficos Históricos
              </h2>

              <div className="mb-4 flex flex-wrap gap-2">
                {selectedParameters.map((paramId) => {
                  const param = parameters.find((p) => p.id === paramId);
                  if (!param) return null;

                  return (
                    <button
                      key={paramId}
                      onClick={() => toggleChartParameter(paramId)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        activeChartParameters.includes(paramId)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {param.name}
                    </button>
                  );
                })}
              </div>

              {activeChartParameters.length > 0 ? (
                shouldRenderChart ? (
                  (() => {
                    const activeParams = parameters.filter((p) =>
                      activeChartParameters.includes(p.id),
                    );

                    if (!activeParams.length) return null;

                    const chartData = historicalData.map((item) => {
                      const base: Record<string, string | number> = {
                        date: format(item.date, "dd/MM"),
                        fullDate: format(item.date, "dd/MM/yyyy"),
                      };

                      for (const param of activeParams) {
                        base[param.id] = Number(
                          (
                            item[param.id as keyof HistoricalData] as number
                          ).toFixed(2),
                        );
                      }

                      return base;
                    });

                    const chartConfig = activeParams.reduce(
                      (acc, param) => {
                        acc[param.id] = {
                          label: param.name,
                          color: param.color,
                        };
                        return acc;
                      },
                      {} as Record<string, { label: string; color: string }>,
                    );

                    return (
                      <>
                        <p className="text-sm text-slate-600 mb-3">
                          Visualizando: <strong>{activeParams.length}</strong>{" "}
                          parâmetro(s) sobreposto(s)
                        </p>
                        <div>
                          <ChartContainer
                            config={chartConfig}
                            className="h-[320px] w-full"
                          >
                            <RechartsBarChart data={chartData}>
                              <CartesianGrid vertical={false} />
                              <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                minTickGap={24}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={56}
                              />
                              <ChartTooltip
                                content={
                                  <ChartTooltipContent
                                    labelFormatter={(_, payload) =>
                                      payload?.[0]?.payload?.fullDate || ""
                                    }
                                    formatter={(value, name) => {
                                      const param = activeParams.find(
                                        (p) => p.id === String(name),
                                      );
                                      if (!param)
                                        return [String(value), String(name)];
                                      return [
                                        `${value} ${param.unit}`.trim(),
                                        param.name,
                                      ];
                                    }}
                                  />
                                }
                              />
                              {activeParams.map((param) => (
                                <Bar
                                  key={param.id}
                                  dataKey={param.id}
                                  name={param.id}
                                  fill={`var(--color-${param.id})`}
                                  radius={[3, 3, 0, 0]}
                                >
                                  <LabelList
                                    dataKey={param.id}
                                    position="top"
                                    formatter={(value: number) =>
                                      Number(value).toFixed(1)
                                    }
                                    style={{ fill: "#334155", fontSize: 10 }}
                                  />
                                </Bar>
                              ))}
                            </RechartsBarChart>
                          </ChartContainer>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          {activeParams.map((param) => (
                            <div
                              key={`legend-${param.id}`}
                              className="flex items-center gap-2 text-xs text-slate-700"
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-sm"
                                style={{ backgroundColor: param.color }}
                              />
                              <span>
                                {param.name}
                                {param.unit ? ` (${param.unit})` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    Intervalos acima de 31 dias não geram gráfico, pois ele
                    ficaria muito desconfigurado para ser exibido.
                  </div>
                )
              ) : (
                <div className="text-sm text-slate-600">
                  Selecione ao menos um parâmetro para exibir o gráfico.
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !historicalData.length && (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhum Dado Disponível
              </h3>
              <p className="text-slate-600 mb-4">
                Selecione uma localização, período e parâmetro para visualizar
                as estatísticas
              </p>
              <button
                onClick={handleGoToLocationInput}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Ir para busca de localidade
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Statistics;
