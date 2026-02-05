-- Script para aplicar a migration de perfil do usuário
-- Execute este script no SQL Editor do Supabase Studio
-- URL: https://supabase.com/dashboard/project/ernubxpsllxprtdylmcy/sql
-- 0. CRIAR TABELA user_profiles SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Adicionar constraint UNIQUE se não existir
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_user_id_key'
) THEN
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
END IF;
END $$;
-- Criar função de update se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE
UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 1. Adicionar novas colunas se não existirem
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS website TEXT;
-- 2. Adicionar constraints de validação (drop primeiro se já existirem)
DO $$ BEGIN -- Remove existing constraints if any
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_full_name_length;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_bio_length;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_location_length;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_website_format;
-- Add new constraints
ALTER TABLE public.user_profiles
ADD CONSTRAINT check_full_name_length CHECK (
        full_name IS NULL
        OR (
            char_length(full_name) >= 2
            AND char_length(full_name) <= 100
        )
    );
ALTER TABLE public.user_profiles
ADD CONSTRAINT check_bio_length CHECK (
        bio IS NULL
        OR char_length(bio) <= 500
    );
ALTER TABLE public.user_profiles
ADD CONSTRAINT check_location_length CHECK (
        location IS NULL
        OR char_length(location) <= 100
    );
ALTER TABLE public.user_profiles
ADD CONSTRAINT check_website_format CHECK (
        website IS NULL
        OR website ~ '^https?://.*'
    );
END $$;
-- 3. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON public.user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON public.user_profiles(updated_at);
-- 4. Adicionar comentários
COMMENT ON COLUMN public.user_profiles.location IS 'Localização do usuário (cidade, estado)';
COMMENT ON COLUMN public.user_profiles.phone IS 'Telefone do usuário';
COMMENT ON COLUMN public.user_profiles.website IS 'Website do usuário';
-- 5. Garantir que RLS está habilitado
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- 6. Verificar/adicionar políticas RLS
DO $$ BEGIN -- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
-- Create policies
-- SELECT: Todos podem ver perfis públicos
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR
SELECT USING (true);
-- INSERT: Usuários podem criar seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- UPDATE: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END $$;
-- 7. Verificar estrutura final
SELECT column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
ORDER BY ordinal_position;
-- Mensagem de sucesso
SELECT 'Migration aplicada com sucesso! ✅' as status;