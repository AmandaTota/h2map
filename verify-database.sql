-- Script para verificar o estado do banco de dados
-- Execute este script ANTES de aplicar a migration
-- URL: https://supabase.com/dashboard/project/ernubxpsllxprtdylmcy/sql
-- 1. Verificar se a tabela user_profiles existe
SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
                AND table_name = 'user_profiles'
        ) THEN '✅ Tabela user_profiles EXISTE'
        ELSE '❌ Tabela user_profiles NÃO EXISTE (será criada pela migration)'
    END as status_tabela;
-- 2. Se a tabela existir, mostrar suas colunas
SELECT column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
ORDER BY ordinal_position;
-- 3. Verificar políticas RLS existentes
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'user_profiles'
ORDER BY policyname;
-- 4. Verificar índices existentes
SELECT indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename = 'user_profiles'
ORDER BY indexname;