import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MunicipalityRow {
  codigo_ibge: string;
  nome: string;
  latitude: number;
  longitude: number;
  capital: boolean;
  codigo_uf: string;
  siafi_id?: string;
  ddd?: string;
  fuso_horario?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { csvData } = await req.json();

    if (!csvData || typeof csvData !== 'string') {
      throw new Error('CSV data is required');
    }

    console.log('Starting municipality import...');

    const lines = csvData.trim().split('\n');
    const municipalities: MunicipalityRow[] = [];

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(';');
      if (parts.length < 9) continue;

      const codigo_ibge = parts[1]?.trim();
      const nome = parts[2]?.trim();
      const latStr = parts[3]?.trim();
      const lngStr = parts[4]?.trim();
      const capitalStr = parts[5]?.trim();
      const codigo_uf = parts[6]?.trim();
      const siafi_id = parts[7]?.trim();
      const ddd = parts[8]?.trim();
      const fuso_horario = parts[9]?.trim();

      if (!codigo_ibge || !nome || !latStr || !lngStr) continue;

      // Convert latitude/longitude from format -234.332 to -23.4332
      const latitude = parseFloat(latStr) / 10;
      const longitude = parseFloat(lngStr) / 10;
      const capital = capitalStr === '1';

      municipalities.push({
        codigo_ibge,
        nome,
        latitude,
        longitude,
        capital,
        codigo_uf,
        siafi_id: siafi_id || undefined,
        ddd: ddd || undefined,
        fuso_horario: fuso_horario || undefined,
      });
    }

    console.log(`Parsed ${municipalities.length} municipalities`);

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < municipalities.length; i += batchSize) {
      const batch = municipalities.slice(i, i + batchSize);
      const { error } = await supabase
        .from('municipalities')
        .upsert(batch, { onConflict: 'codigo_ibge' });

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errors++;
      } else {
        inserted += batch.length;
        console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} records`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed: ${inserted} municipalities imported, ${errors} batch errors`,
        total: municipalities.length,
        inserted,
        errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
