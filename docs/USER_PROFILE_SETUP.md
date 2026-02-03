# Setup do Sistema de Perfil de Usuário

## 📋 Requisitos

Antes de usar o sistema de perfil, você precisa:

### 1. Criar a tabela `user_profiles` no Supabase

A migração já foi criada em `/supabase/migrations/20260203_create_user_profiles.sql`

Para aplicar, execute:

```bash
# Se tiver Supabase CLI instalado
supabase migration up

# Ou copie e execute o SQL no editor do Supabase Dashboard
```

### 2. Criar o bucket de storage `avatars`

No **Supabase Dashboard**:

1. Vá para **Storage** (no menu lateral)
2. Clique em **Create a new bucket**
3. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ON (marque como público)
   - **File size limit**: 5242880 (5MB)
4. Clique em **Create bucket**

### 3. Configurar políticas de RLS (Row Level Security)

Para o bucket `avatars`, vá para **Policies** e adicione:

**Política de leitura:**

- Usuários podem ler todas as fotos

**Política de escrita:**

- Usuários autenticados podem fazer upload

## 🎯 Recursos

O sistema de perfil agora inclui:

- ✅ **Avatar do usuário** - Foto de perfil com upload
- ✅ **Nome completo** - Editar nome
- ✅ **Bio** - Adicionar uma descrição pessoal
- ✅ **Email** - Exibição do email cadastrado
- ✅ **Edição de dados** - Interface intuitiva para atualizar informações
- ✅ **Logout** - Botão para sair da conta

## 🚀 Como usar

1. Faça login com suas credenciais
2. Clique no avatar no canto superior direito (desktop) ou no menu (mobile)
3. Você pode:
   - Ver suas informações
   - Clicar em "Editar Perfil"
   - Trocar sua foto (clique em "Trocar foto")
   - Adicionar nome e bio
   - Salvar alterações
   - Fazer logout (clique no ícone vermelho)

## 📁 Arquivos criados

- `src/components/UserProfileDialog.tsx` - Componente principal do perfil
- `src/store/userProfileStore.ts` - Zustand store para gerenciar dados
- `supabase/migrations/20260203_create_user_profiles.sql` - Schema do banco

## 🔧 Variáveis de ambiente

Verifique se seu `.env` ou `.env.local` tem:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key-here
```

## ⚠️ Troubleshooting

### "Erro ao fazer upload da foto"

- Verifique se o bucket `avatars` foi criado
- Verifique se o bucket é público
- Verifique o tamanho do arquivo (máximo 5MB)

### "Falha ao atualizar perfil"

- Verifique se a migração foi aplicada
- Certifique-se de estar logado
- Verifique as policies do RLS na tabela

### "Perfil não carrega"

- Verifique a conexão com o Supabase
- Limpe o cache do navegador
- Verifique o console para erros
