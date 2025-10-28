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
    
    console.log('Fetching weather data for:', { lat, lon, startDate, endDate });

    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!apiKey) {
      throw new Error('OPENWEATHERMAP_API_KEY not configured');
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Collect data for each day in the range
    const weatherData = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      try {
        const url = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=${dateStr}&appid=${apiKey}&units=metric&lang=pt_br`;
        
        console.log(`Fetching data for ${dateStr}`);
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          weatherData.push({
            date: dateStr,
            ...data
          });
        } else {
          console.error(`Failed to fetch data for ${dateStr}:`, response.status);
        }
      } catch (error) {
        console.error(`Error fetching data for ${dateStr}:`, error);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate averages
    if (weatherData.length === 0) {
      throw new Error('No weather data retrieved');
    }

    const avgTemp = weatherData.reduce((sum, day) => sum + (day.temperature?.afternoon || 0), 0) / weatherData.length;
    const avgHumidity = weatherData.reduce((sum, day) => sum + (day.humidity?.afternoon || 0), 0) / weatherData.length;
    const avgWindSpeed = weatherData.reduce((sum, day) => sum + (day.wind?.max?.speed || 0), 0) / weatherData.length;
    const avgPressure = weatherData.reduce((sum, day) => sum + (day.pressure?.afternoon || 0), 0) / weatherData.length;
    const avgCloudCover = weatherData.reduce((sum, day) => sum + (day.cloud_cover?.afternoon || 0), 0) / weatherData.length;
    const totalPrecipitation = weatherData.reduce((sum, day) => sum + (day.precipitation?.total || 0), 0);

    const summary = {
      location: { lat, lon },
      dateRange: { start: startDate, end: endDate },
      daysAnalyzed: weatherData.length,
      averages: {
        temperature: avgTemp,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
        pressure: avgPressure,
        cloudCover: avgCloudCover,
        totalPrecipitation
      },
      dailyData: weatherData
    };

    console.log('Weather data summary:', summary.averages);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in fetch-weather-data function:', error);
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
