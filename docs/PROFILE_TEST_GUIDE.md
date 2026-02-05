# 🧪 Guia de Testes - Sistema de Perfil v2.0

## 📋 Checklist de Testes

Use este documento para validar todas as funcionalidades implementadas.

---

## ⚙️ Pré-requisitos

- [ ] Migração SQL aplicada (`20260205_enhance_user_profiles.sql`)
- [ ] Bucket `avatars` criado e público no Supabase
- [ ] Usuário de teste criado
- [ ] Sistema rodando localmente (`npm run dev`)
- [ ] Console do navegador aberto (F12)

---

## 1. 🔐 Autenticação

### Login

- [ ] Fazer login com usuário válido
- [ ] Verificar se avatar aparece no header
- [ ] Verificar se nome aparece ao lado do avatar (desktop)

**Comando de debug:**

```javascript
// Verificar se usuário está logado
console.log(await supabase.auth.getSession());
```

**Resultado esperado:**

- ✅ Login bem-sucedido
- ✅ Avatar visível
- ✅ Nome exibido corretamente

---

## 2. 👤 Visualização de Perfil

### Abrir Modal

- [ ] Clicar no avatar no header
- [ ] Modal abre corretamente
- [ ] Avatar é exibido
- [ ] Nome é exibido
- [ ] Email é exibido
- [ ] Outros campos (se preenchidos) são exibidos

**Comando de debug:**

```javascript
// Verificar perfil carregado
console.log(useUserProfileStore.getState().profile);
```

**Resultado esperado:**

- ✅ Modal abre suavemente
- ✅ Todos os dados estão visíveis
- ✅ Layout está correto

---

## 3. ✏️ Edição de Perfil

### Modo de Edição

- [ ] Clicar em "Editar Perfil"
- [ ] Campos se tornam editáveis
- [ ] Botão "Trocar foto" aparece
- [ ] Botões "Salvar" e "Cancelar" aparecem

**Resultado esperado:**

- ✅ Interface muda para modo de edição
- ✅ Todos os campos ficam editáveis

---

## 4. ✅ Validação de Campos

### Nome Completo

- [ ] Deixar vazio → Sem erro (opcional agora)
- [ ] Digitar 1 caractere → Mostra erro
- [ ] Digitar nome válido → Erro desaparece
- [ ] Digitar 101+ caracteres → Mostra erro
- [ ] Digitar caracteres especiais inválidos → Mostra erro

**Comandos de teste:**

```javascript
// Validar nome
import { validateProfileForm } from "@/lib/profileValidation";

console.log(validateProfileForm({ full_name: "J" }));
// Esperado: { isValid: false, errors: { full_name: "..." } }

console.log(validateProfileForm({ full_name: "João Silva" }));
// Esperado: { isValid: true, errors: {} }
```

**Resultado esperado:**

- ✅ Validação funciona
- ✅ Mensagens de erro aparecem
- ✅ Ícone de erro visível

### Bio

- [ ] Digitar até 500 caracteres → OK
- [ ] Digitar 501+ caracteres → Mostra erro
- [ ] Contador de caracteres atualiza em tempo real

**Resultado esperado:**

- ✅ Contador: "0/500"
- ✅ Erro quando > 500

### Localização

- [ ] Digitar qualquer texto até 100 chars → OK
- [ ] Digitar 101+ chars → Mostra erro

**Resultado esperado:**

- ✅ Validação de tamanho funciona

### Telefone

- [ ] Digitar "(11) 98765-4321" → OK
- [ ] Digitar "(11) 3456-7890" → OK
- [ ] Digitar "123" → Mostra erro
- [ ] Digitar letras → Mostra erro

**Comandos de teste:**

```javascript
import { validateProfileForm } from "@/lib/profileValidation";

// Válido
console.log(
  validateProfileForm({
    full_name: "João",
    phone: "(11) 98765-4321",
  }),
);
// Esperado: { isValid: true }

// Inválido
console.log(
  validateProfileForm({
    full_name: "João",
    phone: "123",
  }),
);
// Esperado: { isValid: false, errors: { phone: "..." } }
```

**Resultado esperado:**

- ✅ Telefone válido: sem erro
- ✅ Telefone inválido: mostra erro

### Website

- [ ] Digitar "https://exemplo.com" → OK
- [ ] Digitar "http://exemplo.com" → OK
- [ ] Digitar "exemplo.com" → Adiciona https:// automaticamente
- [ ] Digitar "não é url" → Mostra erro

**Resultado esperado:**

- ✅ URL válida: sem erro
- ✅ URL inválida: mostra erro

---

## 5. 🖼️ Upload de Avatar

### Compressão e Preview

- [ ] Clicar em "Trocar foto"
- [ ] Selecionar imagem grande (> 1MB)
- [ ] Preview aparece instantaneamente
- [ ] Indicador de "Enviando..." aparece
- [ ] Upload completa
- [ ] Toast de sucesso aparece
- [ ] Avatar atualiza no header
- [ ] Avatar atualiza no modal

**Comandos de debug:**

```javascript
// Verificar tamanho da imagem antes/depois
const file = document.getElementById("avatar-input").files[0];
console.log("Tamanho original:", file.size);

// Depois do upload, verificar URL
console.log(useUserProfileStore.getState().profile?.avatar_url);
```

**Resultado esperado:**

- ✅ Preview instantâneo
- ✅ Compressão funciona
- ✅ Upload rápido (< 2s)
- ✅ Avatar atualiza em todos os lugares

### Validação de Arquivo

- [ ] Tentar upload de PDF → Mostra erro
- [ ] Tentar upload de arquivo > 5MB → Mostra erro
- [ ] Tentar upload de TIFF → Mostra erro

**Resultado esperado:**

- ✅ Apenas imagens aceitas
- ✅ Limite de tamanho respeitado
- ✅ Formatos validados

---

## 6. 💾 Salvar Alterações

### Fluxo Completo

- [ ] Preencher todos os campos
- [ ] Clicar em "Salvar Alterações"
- [ ] Indicador de "Salvando..." aparece
- [ ] Toast de sucesso aparece
- [ ] Modal volta ao modo visualização
- [ ] Dados atualizados são exibidos

**Comandos de debug:**

```javascript
// Verificar perfil atualizado
const profile = useUserProfileStore.getState().profile;
console.log("Perfil atualizado:", profile);
```

**Resultado esperado:**

- ✅ Salvamento rápido (< 1s)
- ✅ Feedback visual
- ✅ Dados persistidos

### Cancelar Edição

- [ ] Fazer alterações
- [ ] Clicar em "Cancelar"
- [ ] Modal volta ao estado original
- [ ] Alterações são descartadas

**Resultado esperado:**

- ✅ Dados não são salvos
- ✅ Formulário reseta

---

## 7. ⚡ Sistema de Cache

### Verificar Cache

- [ ] Abrir perfil pela primeira vez
- [ ] Verificar log no console: "Carregando do banco"
- [ ] Fechar e abrir perfil novamente (< 5min)
- [ ] Verificar log: "Usando cache"
- [ ] Aguardar 5+ minutos
- [ ] Abrir perfil novamente
- [ ] Verificar log: "Cache expirado, recarregando"

**Comandos de debug:**

```javascript
// Verificar cache
const { lastFetched } = useUserProfileStore.getState();
console.log("Último fetch:", new Date(lastFetched));
console.log("Tempo desde último fetch:", Date.now() - lastFetched, "ms");

// Limpar cache manualmente
localStorage.removeItem("user-profile-storage");
```

**Resultado esperado:**

- ✅ Cache funciona por 5 minutos
- ✅ Após 5min, recarrega do banco
- ✅ Menos chamadas ao banco

### Verificar localStorage

- [ ] Abrir DevTools → Application → Local Storage
- [ ] Verificar chave `user-profile-storage`
- [ ] Confirmar que perfil está armazenado

**Resultado esperado:**

- ✅ Dados persistidos
- ✅ JSON válido

---

## 8. 🎣 Hooks Personalizados

### useUserProfile

```typescript
const { profile, isLoading, updateProfile, refresh } = useUserProfile(user);

// Testes:
- [ ] profile está correto
- [ ] isLoading muda conforme esperado
- [ ] updateProfile funciona
- [ ] refresh força atualização
```

### useProfileCompletion

```typescript
const completion = useProfileCompletion(user);

// Testes:
- [ ] Retorna 0-100
- [ ] Aumenta ao preencher campos
- [ ] Chega a 100% quando tudo preenchido
```

**Comandos de teste:**

```javascript
import { useProfileCompletion } from "@/hooks/useUserProfile";

// Com todos os campos
console.log(useProfileCompletion(user)); // Esperado: 100

// Com alguns campos
console.log(useProfileCompletion(user)); // Esperado: 50-83
```

**Resultado esperado:**

- ✅ Cálculos corretos
- ✅ Atualiza em tempo real

---

## 9. 🧩 Componente ProfileStatsCard

### Renderização

- [ ] Card renderiza corretamente
- [ ] Avatar é exibido
- [ ] Nome é exibido
- [ ] Progress bar funciona
- [ ] Badges de informações aparecem
- [ ] Datas formatadas corretamente
- [ ] Botão "Editar Perfil" funciona

**Resultado esperado:**

- ✅ Design responsivo
- ✅ Todas as informações visíveis
- ✅ Interatividade funciona

---

## 10. 📱 Responsividade

### Desktop (> 768px)

- [ ] Modal com largura 600px
- [ ] Avatar e nome no header
- [ ] Layout em duas colunas

### Mobile (< 768px)

- [ ] Modal ocupa maior parte da tela
- [ ] Scroll funciona
- [ ] Campos empilhados
- [ ] Botões acessíveis

**Resultado esperado:**

- ✅ Funciona em todos os tamanhos
- ✅ UI adaptada para mobile

---

## 11. 🐛 Tratamento de Erros

### Erros de Rede

- [ ] Desconectar internet
- [ ] Tentar salvar perfil
- [ ] Erro é exibido claramente
- [ ] Toast com mensagem de erro

### Erros de Validação

- [ ] Preencher campo inválido
- [ ] Tentar salvar
- [ ] Toast de validação aparece
- [ ] Campos inválidos destacados

**Resultado esperado:**

- ✅ Erros são capturados
- ✅ Mensagens claras
- ✅ Sistema não quebra

---

## 12. 🔍 Testes de Performance

### Tempo de Carregamento

```javascript
console.time("loadProfile");
await loadProfile(userId);
console.timeEnd("loadProfile");
// Esperado: < 500ms (primeira vez), < 50ms (com cache)
```

### Tamanho de Imagem

```javascript
// Antes da compressão
const originalSize = file.size;

// Depois da compressão
const compressedFile = await compressImage(file);
console.log(
  "Redução:",
  ((1 - compressedFile.size / originalSize) * 100).toFixed(2) + "%",
);
// Esperado: 70-85% de redução
```

**Resultado esperado:**

- ✅ Carregamento rápido
- ✅ Compressão eficiente

---

## 13. 🔐 Segurança

### RLS (Row Level Security)

- [ ] Tentar acessar perfil de outro usuário via SQL
- [ ] Deve ser bloqueado pelo RLS
- [ ] Apenas próprio perfil é acessível

**Comando SQL:**

```sql
SELECT * FROM user_profiles WHERE user_id != auth.uid();
-- Esperado: Nenhum resultado
```

### Constraints SQL

- [ ] Tentar inserir nome com 1 caractere via SQL → Erro
- [ ] Tentar inserir bio > 500 chars → Erro
- [ ] Tentar inserir website sem http → Erro

**Resultado esperado:**

- ✅ Constraints funcionam
- ✅ Dados inválidos são rejeitados

---

## 14. 📊 Métricas

### Coleta de Dados

Durante os testes, anote:

| Métrica                       | Valor     |
| ----------------------------- | --------- |
| Tempo de upload (sem cache)   | **\_** ms |
| Tempo de upload (com cache)   | **\_** ms |
| Tamanho original da imagem    | **\_** KB |
| Tamanho comprimido            | **\_** KB |
| % de redução                  | **\_** %  |
| Chamadas ao banco (com cache) | **\_**    |
| Erros encontrados             | **\_**    |

---

## 15. ✅ Testes Finais

### Fluxo Completo

- [ ] Login
- [ ] Abrir perfil
- [ ] Editar todos os campos
- [ ] Upload de avatar
- [ ] Salvar
- [ ] Recarregar página
- [ ] Verificar se dados persistiram
- [ ] Logout
- [ ] Login novamente
- [ ] Verificar se cache funciona

**Resultado esperado:**

- ✅ Fluxo completo sem erros
- ✅ Dados persistem
- ✅ Cache funciona

---

## 🎯 Critérios de Aceitação

### Obrigatórios

- ✅ Todos os campos podem ser editados
- ✅ Validação funciona em todos os campos
- ✅ Upload de avatar com compressão
- ✅ Preview de avatar funciona
- ✅ Cache reduz chamadas ao banco
- ✅ Dados persistem após reload
- ✅ Sem erros no console
- ✅ Responsivo mobile e desktop

### Desejáveis

- ✅ Performance < 1s para todas as operações
- ✅ Redução de 70%+ em tamanho de imagem
- ✅ UI moderna e intuitiva
- ✅ Feedback visual em todas as ações

---

## 🐛 Bugs Conhecidos

Liste aqui qualquer bug encontrado durante os testes:

1. ***
2. ***
3. ***

---

## 📝 Notas Adicionais

Use este espaço para anotar observações:

---

---

---

---

## ✅ Aprovação

- [ ] Todos os testes passaram
- [ ] Bugs críticos corrigidos
- [ ] Performance aceitável
- [ ] Pronto para produção

---

**Testador:** ********\_********  
**Data:** ********\_********  
**Versão:** 2.0.0  
**Status:** ⏳ Em teste
