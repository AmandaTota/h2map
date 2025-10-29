-- Create municipalities table
CREATE TABLE public.municipalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_ibge TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  capital BOOLEAN NOT NULL DEFAULT false,
  codigo_uf TEXT NOT NULL,
  siafi_id TEXT,
  ddd TEXT,
  fuso_horario TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster searches by name
CREATE INDEX idx_municipalities_nome ON public.municipalities USING gin(to_tsvector('portuguese', nome));

-- Create index for state code
CREATE INDEX idx_municipalities_codigo_uf ON public.municipalities(codigo_uf);

-- Enable RLS (public read access since this is reference data)
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- Allow public read access to municipalities
CREATE POLICY "Municipalities are viewable by everyone" 
ON public.municipalities 
FOR SELECT 
USING (true);