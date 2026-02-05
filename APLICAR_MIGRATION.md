# 🔧 Aplicar Migration do Sistema de Perfil

## ⚠️ IMPORTANTE: Migration Pendente

Para que as mudanças do perfil sejam salvas corretamente, é necessário aplicar a migration no banco de dados Supabase.

## � PRIMEIRO: Verificar o Estado Atual

**Antes de aplicar a migration**, execute o script de verificação para entender o estado atual:

1. **Acesse o SQL Editor:**

   ```
   https://supabase.com/dashboard/project/ernubxpsllxprtdylmcy/sql
   ```

2. **Copie e execute o arquivo `verify-database.sql`**
   - Isso mostrará se a tabela `user_profiles` existe
   - Quais colunas ela possui
   - Quais políticas RLS estão configuradas

3. **Interprete o resultado:**
   - ✅ Se aparecer "Tabela user_profiles EXISTE" → A migration adicionará apenas as novas colunas
   - ❌ Se aparecer "Tabela user_profiles NÃO EXISTE" → A migration criará tudo do zero

## 📋 Passo a Passo

### Opção 1: Via Supabase Studio (Recomendado)

1. **Acesse o SQL Editor do Supabase:**

   ```
   https://supabase.com/dashboard/project/ernubxpsllxprtdylmcy/sql
   ```

2. **Copie o conteúdo do arquivo:**

   ```bash
   cat apply-profile-migration.sql
   ```

3. **Cole no SQL Editor** e clique em "Run"

4. **Verifique o resultado:**
   - Você deve ver a mensagem: "Migration aplicada com sucesso! ✅"
   - Uma tabela mostrando todas as colunas da tabela `user_profiles`

**📝 Nota:** O script agora é inteligente! Ele:

- ✅ Cria a tabela `user_profiles` se ela não existir
- ✅ Adiciona as novas colunas (`location`, `phone`, `website`)
- ✅ Configura validações, índices e políticas RLS
- ✅ Funciona mesmo que a tabela já exista parcialmente

### Opção 2: Via CLI do Supabase

Se você tem acesso ao projeto Supabase via CLI:

```bash
# 1. Login no Supabase (se ainda não fez)
npx supabase login

# 2. Link com o projeto remoto
npx supabase link --project-ref ernubxpsllxprtdylmcy

# 3. Aplicar migrations
npx supabase db push
```

## ✅ Como Verificar se Funcionou

### Teste 1: No Supabase Studio

1. Acesse: https://supabase.com/dashboard/project/ernubxpsllxprtdylmcy/editor
2. Selecione a tabela `user_profiles`
3. Verifique se as colunas existem:
   - ✅ `location` (text)
   - ✅ `phone` (text)
   - ✅ `website` (text)

### Teste 2: Na Aplicação

1. Abra a aplicação: http://localhost:8082
2. Faça login
3. Abra o perfil do usuário
4. Clique em "Editar"
5. Preencha os campos:
   - **Localização:** Use a busca de municípios (ex: "São Paulo - SP")
   - **Telefone:** Digite um telefone (ex: "(11) 98765-4321")
   - **Website:** Digite uma URL (ex: "https://exemplo.com")
6. Clique em "Salvar"
7. **Recarregue a página** (F5)
8. Abra o perfil novamente
9. ✅ Os dados devem estar salvos!

## 🐛 Problemas Comuns

### ❌ Erro: "relation user_profiles does not exist" (ERROR: 42P01)

**Causa:** A tabela `user_profiles` ainda não foi criada no banco de dados
**Solução:**

1. ✅ Use o script atualizado `apply-profile-migration.sql` - ele agora cria a tabela automaticamente!
2. Execute o script completo no SQL Editor
3. O script detecta se a tabela existe e age de acordo

**O que o script faz:**

- Se a tabela NÃO existir → Cria tudo do zero (tabela + colunas + políticas)
- Se a tabela JÁ existir → Adiciona apenas as colunas novas

### Erro: "column does not exist"

**Causa:** Migration não foi aplicada
**Solução:** Execute o script SQL conforme instruções acima

### Erro: "permission denied"

**Causa:** Políticas RLS não configuradas
**Solução:** O script já cria as políticas necessárias. Execute-o novamente.

### Dados não salvam

**Causa:** Pode ser cache do navegador ou migration não aplicada
**Solução:**

1. Aplique a migration
2. Abra o DevTools (F12)
3. Vá em Application > Storage > Clear site data
4. Recarregue a página (F5)
5. Faça login novamente

### Campos aparecem mas não salvam

**Causa:** Constraints de validação bloqueando
**Solução:** Verifique o DevTools Console (F12) para ver o erro específico

## 📊 O Que a Migration Faz

### 0. **Cria a tabela base** (se não existir):

- `user_profiles` com campos: id, user_id, full_name, bio, avatar_url
- Função `update_updated_at_column()` para atualizar timestamps
- Trigger automático para `updated_at`
- Constraint UNIQUE em `user_id`

### 1. **Adiciona 3 novas colunas:**

- `location` (TEXT) - Localização (cidade, estado)
- `phone` (TEXT) - Telefone
- `website` (TEXT) - Website

### 2. **Adiciona validações:**

- Nome: 2-100 caracteres
- Bio: máximo 500 caracteres
- Localização: máximo 100 caracteres
- Website: deve começar com http:// ou https://

### 3. **Adiciona índices para performance:**

- Índice em `location` para buscas rápidas
- Índice em `updated_at` para ordenação

### 4. **Configura RLS (Row Level Security):**

- ✅ Todos podem VER perfis (SELECT)
- ✅ Usuários podem CRIAR seu próprio perfil (INSERT)
- ✅ Usuários podem ATUALIZAR apenas seu próprio perfil (UPDATE)

## 🎯 Próximos Passos

Após aplicar a migration:

1. ✅ Teste o salvamento de dados
2. ✅ Teste a busca de localização
3. ✅ Teste o upload de avatar
4. ✅ Verifique se os dados persistem após reload

---

**Dúvidas?** Veja a documentação completa em:

- [docs/USER_PROFILE_V2.md](docs/USER_PROFILE_V2.md)
- [docs/USER_PROFILE_QUICK_START.md](docs/USER_PROFILE_QUICK_START.md)
