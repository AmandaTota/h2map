import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validatedData = requestSchema.parse(body);
    const { lat, lon } = validatedData;
    
    console.log('Fetching weather history data for:', { lat, lon });

    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!apiKey) {
      throw new Error('OPENWEATHERMAP_API_KEY not configured');
    }

    // Calculate timestamps for last year
    const endTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const startTimestamp = endTimestamp - (365 * 24 * 60 * 60); // 1 year ago
    
    console.log('Fetching history from:', new Date(startTimestamp * 1000).toISOString(), 'to', new Date(endTimestamp * 1000).toISOString());

    // Fetch hourly data from OpenWeatherMap History API
    const url = `https://history.openweathermap.org/data/3.0/history/city?lat=${lat}&lon=${lon}&type=hour&start=${startTimestamp}&end=${endTimestamp}&appid=${apiKey}&units=metric`;
    
    console.log('Requesting history data...');
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const historyData = await response.json();
    console.log('History data received, processing...');

    if (!historyData.list || historyData.list.length === 0) {
      throw new Error('No historical data available');
    }

    // Process hourly data into daily averages
    const dailyDataMap = new Map();

    for (const hour of historyData.list) {
      const date = new Date(hour.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyDataMap.has(dateKey)) {
        dailyDataMap.set(dateKey, {
          date: dateKey,
          windSpeeds: [],
          temperatures: [],
          humidities: [],
          pressures: [],
          precipitations: [],
          cloudCovers: []
        });
      }

      const dayData = dailyDataMap.get(dateKey);
      dayData.windSpeeds.push(hour.wind?.speed || 0);
      dayData.temperatures.push(hour.main?.temp || 0);
      dayData.humidities.push(hour.main?.humidity || 0);
      dayData.pressures.push(hour.main?.pressure || 0);
      dayData.precipitations.push(hour.rain?.['1h'] || 0);
      dayData.cloudCovers.push(hour.clouds?.all || 0);
    }

    // Calculate daily and overall averages
    const dailyData = [];
    let totalWindSpeed = 0;
    let totalTemp = 0;
    let totalHumidity = 0;
    let totalPressure = 0;
    let totalPrecipitation = 0;
    let totalCloudCover = 0;
    let dayCount = 0;

    for (const [date, data] of dailyDataMap) {
      const avgWindSpeed = data.windSpeeds.reduce((a: number, b: number) => a + b, 0) / data.windSpeeds.length;
      const avgTemp = data.temperatures.reduce((a: number, b: number) => a + b, 0) / data.temperatures.length;
      const avgHumidity = data.humidities.reduce((a: number, b: number) => a + b, 0) / data.humidities.length;
      const avgPressure = data.pressures.reduce((a: number, b: number) => a + b, 0) / data.pressures.length;
      const dailyPrecipitation = data.precipitations.reduce((a: number, b: number) => a + b, 0);
      const avgCloudCover = data.cloudCovers.reduce((a: number, b: number) => a + b, 0) / data.cloudCovers.length;

      dailyData.push({
        date,
        windSpeed: avgWindSpeed,
        temperature: avgTemp,
        humidity: avgHumidity,
        pressure: avgPressure,
        precipitation: dailyPrecipitation,
        cloudCover: avgCloudCover,
        solarIrradiance: calculateSolarFromCloudCover(avgCloudCover)
      });

      totalWindSpeed += avgWindSpeed;
      totalTemp += avgTemp;
      totalHumidity += avgHumidity;
      totalPressure += avgPressure;
      totalPrecipitation += dailyPrecipitation;
      totalCloudCover += avgCloudCover;
      dayCount++;
    }

    const summary = {
      location: { lat, lon },
      daysAnalyzed: dayCount,
      averages: {
        temperature: totalTemp / dayCount,
        humidity: totalHumidity / dayCount,
        windSpeed: totalWindSpeed / dayCount,
        pressure: totalPressure / dayCount,
        cloudCover: totalCloudCover / dayCount,
        totalPrecipitation: totalPrecipitation,
        solarIrradiance: calculateSolarFromCloudCover(totalCloudCover / dayCount)
      },
      dailyData: dailyData
    };

    console.log('Weather history summary:', summary.averages);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fetch-weather-data function:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates', details: error.errors }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
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

// Helper function to estimate solar irradiance from cloud cover
function calculateSolarFromCloudCover(cloudCover: number): number {
  // Maximum solar irradiance in kWh/m²/day for Brazil
  const maxSolarIrradiance = 6.0;
  // Cloud cover is 0-100%, convert to reduction factor
  const clearSkyFactor = 1 - (cloudCover / 100) * 0.75; // 75% max reduction
  return maxSolarIrradiance * clearSkyFactor;
}
