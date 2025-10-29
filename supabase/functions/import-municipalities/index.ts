import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Municipality {
  codigo_ibge: string;
  nome: string;
  latitude: number;
  longitude: number;
  capital: boolean;
  codigo_uf: string;
  siafi_id: string;
  ddd: string;
  fuso_horario: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Starting municipalities import...');
    console.log('Request received with sqlContent');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sqlContent } = requestBody;
    
    if (!sqlContent || typeof sqlContent !== 'string') {
      console.error('Invalid request: sqlContent is missing or not a string');
      throw new Error('SQL content is required');
    }

    console.log(`Processing SQL content... (${sqlContent.length} characters)`);
    
    // Parse INSERT statements - more flexible regex to handle different line endings
    // Match: INSERT INTO municipios VALUES followed by any content until semicolon
    const insertRegex = /INSERT\s+INTO\s+municipios\s+VALUES\s*([\s\S]+?);/gi;
    const matches = [...sqlContent.matchAll(insertRegex)];
    
    console.log(`Found ${matches.length} INSERT statement(s)`);
    
    if (matches.length === 0) {
      // Debug: show first 500 chars of SQL
      console.error('SQL preview:', sqlContent.substring(0, 500));
      throw new Error('No INSERT statements found in SQL');
    }

    const municipalities: Municipality[] = [];
    
    for (const match of matches) {
      const valuesString = match[1];
      // Parse each row
      const rowRegex = /\((\d+),'([^']+)',(-?\d+\.?\d*),(-?\d+\.?\d*),(TRUE|FALSE),(\d+),'(\d+)',(\d+),'([^']+)'\)/gi;
      const rows = [...valuesString.matchAll(rowRegex)];
      
      for (const row of rows) {
        municipalities.push({
          codigo_ibge: row[1],
          nome: row[2],
          latitude: parseFloat(row[3]),
          longitude: parseFloat(row[4]),
          capital: row[5] === 'TRUE',
          codigo_uf: row[6],
          siafi_id: row[7],
          ddd: row[8],
          fuso_horario: row[9],
        });
      }
    }

    console.log(`Parsed ${municipalities.length} municipalities`);

    // Insert in batches
    const batchSize = 100;
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < municipalities.length; i += batchSize) {
      const batch = municipalities.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(municipalities.length / batchSize)}`);
      
      const { error } = await supabase
        .from('municipalities')
        .upsert(batch, { 
          onConflict: 'codigo_ibge',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Batch error:', error);
        throw error;
      }

      inserted += batch.length;
    }

    console.log(`Import completed! Inserted: ${inserted}, Updated: ${updated}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: municipalities.length,
        inserted,
        updated
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Import error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
