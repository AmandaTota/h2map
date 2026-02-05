# 🚀 Guia de Implantação - Sistema de Perfil v2.0

## 📋 Pré-requisitos

Antes de implantar em produção, verifique:

- [ ] Código revisado e aprovado
- [ ] Testes manuais realizados
- [ ] Documentação atualizada
- [ ] Backup do banco de dados criado
- [ ] Acesso ao Supabase Dashboard
- [ ] Acesso ao ambiente de produção

---

## 🔄 Passo a Passo

### 1. Backup do Banco de Dados ⚠️

**IMPORTANTE:** Sempre faça backup antes de aplicar migrations!

```bash
# Via Supabase CLI
supabase db dump -f backup_before_profile_v2.sql

# Ou via Dashboard
# Settings → Database → Backups → Create backup
```

✅ **Checklist:**

- [ ] Backup criado
- [ ] Backup testado (restauração simulada)
- [ ] Backup armazenado em local seguro

---

### 2. Aplicar Migração SQL

#### Opção A: Via Supabase CLI (Recomendado)

```bash
cd /workspaces/h2map

# Verificar migrations pendentes
supabase migration list

# Aplicar migration
supabase db push

# Verificar se foi aplicada
supabase migration list
```

#### Opção B: Via Supabase Dashboard

1. Abra o Supabase Dashboard
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Copie o conteúdo de:
   ```
   supabase/migrations/20260205_enhance_user_profiles.sql
   ```
5. Cole no editor
6. Clique em **Run**
7. Verifique se não há erros

✅ **Checklist:**

- [ ] Migration aplicada sem erros
- [ ] Colunas criadas: `location`, `phone`, `website`
- [ ] Constraints criados
- [ ] Índices criados
- [ ] Trigger criado

**Verificação:**

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles';

-- Verificar constraints
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'user_profiles';

-- Verificar índices
SELECT indexname
FROM pg_indexes
WHERE tablename = 'user_profiles';
```

---

### 3. Verificar Bucket de Storage

#### Configuração do Bucket `avatars`

1. Abra o Supabase Dashboard
2. Vá para **Storage**
3. Verifique se bucket `avatars` existe
4. Configure as políticas:

**Política de Leitura (Pública):**

```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Política de Escrita (Autenticados):**

```sql
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);
```

**Política de Atualização (Próprios arquivos):**

```sql
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

✅ **Checklist:**

- [ ] Bucket `avatars` existe
- [ ] Bucket é público
- [ ] Políticas configuradas
- [ ] Limite de tamanho: 5MB

---

### 4. Deploy do Código

#### Via Git / GitHub

```bash
# Commitar mudanças
git add .
git commit -m "feat: upgrade user profile system to v2.0"

# Push para repositório
git push origin main

# Se usar CI/CD, a build será automática
```

#### Via Vercel / Netlify

Se o projeto auto-deploys:

- [ ] Push realizado
- [ ] Build iniciada
- [ ] Deploy completo
- [ ] Sem erros de build

Se deploy manual:

```bash
# Build local
npm run build

# Deploy
vercel --prod
# ou
netlify deploy --prod
```

✅ **Checklist:**

- [ ] Código enviado para produção
- [ ] Build bem-sucedida
- [ ] Sem erros de TypeScript
- [ ] Sem erros de runtime

---

### 5. Limpar Cache de Usuários

**IMPORTANTE:** Usuários existentes precisam limpar cache!

#### Opção A: Via Script (Recomendado)

```javascript
// Adicionar em uma página de admin ou console
const clearAllUserCaches = () => {
  // Broadcast para todas as tabs
  localStorage.removeItem("user-profile-storage");

  // Recarregar
  window.location.reload();
};
```

#### Opção B: Comunicação aos Usuários

Enviar mensagem/email orientando:

1. Abrir console (F12)
2. Digitar: `localStorage.removeItem('user-profile-storage')`
3. Recarregar página (F5)

#### Opção C: Atualização Forçada

Incrementar versão do cache no código:

```typescript
// Em userProfileStore.ts
{
  name: 'user-profile-storage-v2', // Mudou de v1 para v2
  // ...
}
```

✅ **Checklist:**

- [ ] Estratégia de limpeza de cache definida
- [ ] Usuários comunicados (se necessário)
- [ ] Cache limpo testado

---

### 6. Testes em Produção

#### Smoke Tests (Testes Rápidos)

Execute estes testes imediatamente após deploy:

**6.1. Teste de Login**

- [ ] Login funciona
- [ ] Avatar aparece no header
- [ ] Nome é exibido

**6.2. Teste de Visualização**

- [ ] Abrir perfil
- [ ] Todos os campos são exibidos
- [ ] Avatar carrega corretamente

**6.3. Teste de Edição**

- [ ] Clicar em "Editar Perfil"
- [ ] Novos campos aparecem
- [ ] Validação funciona
- [ ] Mensagens de erro corretas

**6.4. Teste de Upload**

- [ ] Selecionar imagem
- [ ] Preview aparece
- [ ] Upload completa
- [ ] Avatar atualiza

**6.5. Teste de Cache**

- [ ] Abrir perfil
- [ ] Fechar e reabrir (< 5min)
- [ ] Verificar no Network: sem nova chamada

**6.6. Teste de Salvamento**

- [ ] Editar todos os campos
- [ ] Salvar
- [ ] Recarregar página
- [ ] Dados persistiram

✅ **Checklist:**

- [ ] Todos os smoke tests passaram
- [ ] Sem erros no console
- [ ] Performance aceitável

---

### 7. Monitoramento

#### Logs do Supabase

```sql
-- Ver últimas atualizações de perfil
SELECT
  user_id,
  full_name,
  updated_at
FROM user_profiles
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- Ver perfis recém-criados
SELECT
  user_id,
  created_at
FROM user_profiles
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

#### Métricas de Performance

Monitore:

- [ ] Tempo médio de carregamento
- [ ] Taxa de erros
- [ ] Tamanho médio de uploads
- [ ] Uso de storage

#### Alertas

Configure alertas para:

- [ ] Erro de upload > 5%
- [ ] Tempo de resposta > 2s
- [ ] Storage > 80% do limite
- [ ] Erros de validação frequentes

✅ **Checklist:**

- [ ] Logs configurados
- [ ] Métricas sendo coletadas
- [ ] Alertas ativos

---

### 8. Rollback Plan

**Se algo der errado:**

#### Rollback de Código

```bash
# Reverter último commit
git revert HEAD
git push origin main

# Ou voltar para versão anterior
git checkout [commit-anterior]
git push -f origin main
```

#### Rollback de Banco de Dados

```bash
# Restaurar backup
supabase db reset --db-url [backup-url]

# Ou via SQL
-- Remover colunas novas
ALTER TABLE user_profiles
DROP COLUMN location,
DROP COLUMN phone,
DROP COLUMN website;

-- Remover constraints
ALTER TABLE user_profiles
DROP CONSTRAINT check_full_name_length,
DROP CONSTRAINT check_bio_length,
DROP CONSTRAINT check_location_length,
DROP CONSTRAINT check_website_format;
```

⚠️ **ATENÇÃO:**

- Rollback de DB pode causar perda de dados
- Dados em `location`, `phone`, `website` serão perdidos
- Consultar equipe antes de fazer rollback

✅ **Checklist:**

- [ ] Plano de rollback documentado
- [ ] Backup verificado
- [ ] Equipe ciente do procedimento

---

### 9. Comunicação

#### Para Equipe Interna

**Mensagem sugerida:**

```
🚀 Deploy: Sistema de Perfil v2.0

✅ Status: Concluído
⏰ Data/Hora: [DATA/HORA]

📦 Novidades:
- Novos campos: localização, telefone, website
- Validação melhorada
- Upload de fotos mais rápido
- Cache otimizado

📋 Ações necessárias:
- Nenhuma! Sistema retrocompatível

🐛 Reportar bugs:
[LINK DO SISTEMA DE BUGS]

📖 Documentação:
[LINK DA DOCUMENTAÇÃO]
```

#### Para Usuários (Opcional)

**Mensagem sugerida:**

```
✨ Novidades no Seu Perfil! ✨

Acabamos de lançar uma versão melhorada do seu perfil:

🆕 Novos campos:
- Adicione sua localização
- Cadastre seu telefone
- Compartilhe seu website

⚡ Melhorias:
- Upload de fotos mais rápido
- Validação em tempo real
- Interface renovada

🎯 Como usar:
1. Clique no seu avatar
2. Clique em "Editar Perfil"
3. Preencha os novos campos
4. Salve!

Dúvidas? [LINK DE SUPORTE]
```

✅ **Checklist:**

- [ ] Equipe comunicada
- [ ] Release notes publicadas
- [ ] Usuários notificados (se aplicável)

---

### 10. Pós-Deploy

#### Primeiras 24h

**Monitorar atentamente:**

- [ ] Taxa de erros
- [ ] Performance
- [ ] Feedback de usuários
- [ ] Bugs críticos

**Métricas a coletar:**

```sql
-- Perfis atualizados nas últimas 24h
SELECT COUNT(*)
FROM user_profiles
WHERE updated_at > NOW() - INTERVAL '24 hours';

-- Novos uploads de avatar
SELECT COUNT(*)
FROM user_profiles
WHERE avatar_url IS NOT NULL
AND updated_at > NOW() - INTERVAL '24 hours';

-- Perfis com novos campos preenchidos
SELECT
  COUNT(*) FILTER (WHERE location IS NOT NULL) as with_location,
  COUNT(*) FILTER (WHERE phone IS NOT NULL) as with_phone,
  COUNT(*) FILTER (WHERE website IS NOT NULL) as with_website
FROM user_profiles;
```

#### Primeira Semana

- [ ] Coletar feedback
- [ ] Ajustar validações (se necessário)
- [ ] Otimizar queries
- [ ] Documentar bugs encontrados

#### Primeiro Mês

- [ ] Analisar métricas de uso
- [ ] Avaliar impacto na performance
- [ ] Planejar próximas iterações

✅ **Checklist:**

- [ ] Monitoramento ativo
- [ ] Métricas coletadas
- [ ] Feedback registrado

---

## 🎯 Critérios de Sucesso

### Técnicos

- ✅ Deploy sem erros
- ✅ Migration aplicada corretamente
- ✅ Todos os testes passando
- ✅ Performance dentro do esperado
- ✅ Zero downtime

### Negócio

- ✅ Sistema funcional para 100% dos usuários
- ✅ Nenhum bug crítico reportado
- ✅ Feedback positivo
- ✅ Métricas de uso satisfatórias

---

## 🐛 Troubleshooting

### Erro: "Column does not exist"

**Causa:** Migration não aplicada  
**Solução:** Aplicar migration manualmente

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;
```

### Erro: "Upload failed"

**Causa:** Bucket ou políticas não configuradas  
**Solução:** Verificar configuração do Storage

### Erro: "Validation error"

**Causa:** Dados antigos não compatíveis  
**Solução:** Atualizar dados existentes:

```sql
-- Exemplo: limpar dados inválidos
UPDATE user_profiles
SET phone = NULL
WHERE phone IS NOT NULL
AND phone !~ '^\+?55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$';
```

### Cache não limpa

**Causa:** localStorage não atualizado  
**Solução:** Forçar limpeza:

```javascript
// No console do navegador
localStorage.clear();
window.location.reload();
```

---

## ✅ Checklist Final de Implantação

### Pré-Deploy

- [ ] Código revisado
- [ ] Testes realizados
- [ ] Backup criado
- [ ] Documentação atualizada
- [ ] Equipe comunicada

### Deploy

- [ ] Migration aplicada
- [ ] Storage configurado
- [ ] Código enviado
- [ ] Build bem-sucedida
- [ ] Cache limpo (se necessário)

### Pós-Deploy

- [ ] Smoke tests executados
- [ ] Monitoramento ativo
- [ ] Métricas coletadas
- [ ] Comunicação enviada
- [ ] Rollback plan pronto

### Validação

- [ ] Sistema funcional
- [ ] Performance OK
- [ ] Sem erros críticos
- [ ] Feedback positivo

---

## 📞 Contatos de Emergência

**Em caso de problemas críticos:**

1. **Tech Lead:** [NOME/CONTATO]
2. **DevOps:** [NOME/CONTATO]
3. **DBA:** [NOME/CONTATO]
4. **Suporte Supabase:** https://supabase.com/support

---

## 📝 Registro de Deploy

**Data:** ******\_\_\_******  
**Hora:** ******\_\_\_******  
**Responsável:** ******\_\_\_******  
**Versão:** 2.0.0  
**Status:** ⏳ Pendente / ✅ Concluído

**Observações:**

---

---

---

---

**🎊 Boa sorte com o deploy! 🎊**

> Sistema de Perfil v2.0  
> Preparado para produção  
> Data: 05/02/2026
