import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, startDate, endDate } = await req.json();
    
    console.log('Fetching NASA POWER data for:', { lat, lon, startDate, endDate });

    // NASA POWER API - Daily data for solar and meteorological parameters
    // Parameters:
    // ALLSKY_SFC_SW_DWN: Solar radiation (kWh/m²/day)
    // WS10M: Wind speed at 10m (m/s)
    // T2M: Temperature at 2m (°C)
    // RH2M: Relative humidity at 2m (%)
    // PRECTOTCORR: Precipitation (mm/day)
    
    const params = [
      'ALLSKY_SFC_SW_DWN',  // Solar irradiance
      'WS10M',              // Wind speed
      'T2M',                // Temperature
      'RH2M',               // Humidity
      'PRECTOTCORR'         // Precipitation
    ].join(',');
    
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate.replace(/-/g, '')}&end=${endDate.replace(/-/g, '')}&format=JSON`;
    
    console.log('NASA POWER URL:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error('NASA POWER API error:', response.status, response.statusText);
      throw new Error(`NASA POWER API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('NASA POWER data received:', Object.keys(data.properties?.parameter || {}).length, 'parameters');

    // Extract and calculate averages
    const parameters = data.properties?.parameter;
    if (!parameters) {
      throw new Error('No data in NASA POWER response');
    }

    const solarData = parameters.ALLSKY_SFC_SW_DWN || {};
    const windData = parameters.WS10M || {};
    const tempData = parameters.T2M || {};
    const humidityData = parameters.RH2M || {};
    const precipData = parameters.PRECTOTCORR || {};

    // Filter out invalid values (-999 = missing data in NASA POWER)
    // Only use positive values for calculations
    const filterValid = (values: number[]) => values.filter(v => v > -999 && !isNaN(v));
    
    const solarValues = filterValid(Object.values(solarData) as number[]);
    const windValues = filterValid(Object.values(windData) as number[]);
    const tempValues = filterValid(Object.values(tempData) as number[]);
    const humidityValues = filterValid(Object.values(humidityData) as number[]);
    const precipValues = filterValid(Object.values(precipData) as number[]);

    console.log('Valid data points:', {
      solar: solarValues.length,
      wind: windValues.length,
      temp: tempValues.length,
      humidity: humidityValues.length,
      precip: precipValues.length
    });

    if (solarValues.length === 0 || windValues.length === 0) {
      throw new Error('No valid data available for this location/period');
    }

    // Calculate averages from valid data only
    const avgSolarIrradiance = solarValues.reduce((a, b) => a + b, 0) / solarValues.length;
    const avgWindSpeed = windValues.reduce((a, b) => a + b, 0) / windValues.length;
    const avgTemperature = tempValues.reduce((a, b) => a + b, 0) / tempValues.length;
    const avgHumidity = humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length;
    const totalPrecipitation = precipValues.reduce((a, b) => a + b, 0);

    const summary = {
      location: { lat, lon },
      dateRange: { start: startDate, end: endDate },
      daysAnalyzed: solarValues.length,
      averages: {
        solarIrradiance: avgSolarIrradiance, // kWh/m²/day
        windSpeed: avgWindSpeed,             // m/s
        temperature: avgTemperature,         // °C
        humidity: avgHumidity,               // %
        totalPrecipitation: totalPrecipitation // mm
      },
      source: 'NASA POWER'
    };

    console.log('NASA POWER summary:', summary.averages);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fetch-nasa-power-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
