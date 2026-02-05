# 🎯 Guia Rápido - Sistema de Perfil v2.0

## 📦 Instalação e Setup

### 1. Aplicar Migração do Banco

Execute no Supabase SQL Editor:

```sql
-- Cole o conteúdo de:
-- supabase/migrations/20260205_enhance_user_profiles.sql
```

Ou via CLI:

```bash
cd /workspaces/h2map
supabase db push
```

### 2. Instalar Dependências (se necessário)

```bash
bun install
```

### 3. Limpar Cache (para upgrades)

```javascript
// Console do navegador (F12)
localStorage.removeItem("user-profile-storage");
window.location.reload();
```

---

## 🚀 Uso Básico

### Componente Principal

```tsx
import UserProfileDialog from "@/components/UserProfileDialog";

<UserProfileDialog user={user} onLogout={() => handleLogout()} />;
```

### Hook Personalizado

```tsx
import { useUserProfile } from "@/hooks/useUserProfile";

function MyComponent() {
  const { profile, isLoading, updateProfile, refresh } = useUserProfile(user);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1>{profile?.full_name}</h1>
      <button onClick={refresh}>Recarregar</button>
    </div>
  );
}
```

### Card de Estatísticas

```tsx
import ProfileStatsCard from "@/components/ProfileStatsCard";

<ProfileStatsCard user={user} onEditClick={() => setProfileDialogOpen(true)} />;
```

---

## 🔧 Funções da Store

### Carregar Perfil

```typescript
const { loadProfile } = useUserProfileStore();

// Com cache (padrão)
await loadProfile(userId);

// Forçar atualização
await loadProfile(userId, true);
```

### Atualizar Perfil

```typescript
const { updateProfile } = useUserProfileStore();

await updateProfile(userId, {
  full_name: "João Silva",
  bio: "Desenvolvedor",
  location: "São Paulo - SP", // Formato retornado pelo LocationSearch
  phone: "(11) 98765-4321",
  website: "https://joao.dev",
});
```

> **💡 Nota sobre Localização:** O campo de localização usa o componente `LocationSearch`
> que busca municípios brasileiros no banco de dados. O formato salvo é "Cidade - UF"
> (ex: "São Paulo - SP", "Rio de Janeiro - RJ").

### Upload de Avatar

```typescript
const { uploadAvatar } = useUserProfileStore();

const file = event.target.files[0];
await uploadAvatar(userId, file);
// Imagem será comprimida automaticamente!
```

---

## ✅ Validação

### Campos Validados

```typescript
import { validateProfileForm } from "@/lib/profileValidation";

const validation = validateProfileForm({
  full_name: "João Silva",
  bio: "Bio...",
  location: "São Paulo - SP", // Formato do LocationSearch
  phone: "(11) 98765-4321",
  website: "https://exemplo.com",
});

if (!validation.isValid) {
  console.log(validation.errors);
}
```

### Avatar

```typescript
import { validateAvatar } from "@/lib/profileValidation";

const validation = validateAvatar(file);
if (validation.isValid) {
  // Prosseguir com upload
}
```

---

## 🎨 Componentes Auxiliares

### Display Name

```tsx
import { useProfileDisplayName } from "@/hooks/useUserProfile";

const displayName = useProfileDisplayName(user);
// Retorna: full_name || email || "Usuário"
```

### Iniciais

```tsx
import { useProfileInitials } from "@/hooks/useUserProfile";

const initials = useProfileInitials(user);
// Exemplo: "JS" para "João Silva"
```

### Completude do Perfil

```tsx
import {
  useProfileComplete,
  useProfileCompletion,
} from "@/hooks/useUserProfile";

const isComplete = useProfileComplete(user);
const completion = useProfileCompletion(user); // 0-100

if (completion < 100) {
  return <Banner>Complete seu perfil: {completion}%</Banner>;
}
```

---

## 🖼️ Compressão de Imagens

```typescript
import { compressImage } from "@/lib/profileValidation";

const originalFile = event.target.files[0];

// Comprimir para 800x800 com qualidade 85%
const compressed = await compressImage(originalFile, 800, 800, 0.85);

// Usar arquivo comprimido
await uploadAvatar(userId, compressed);
```

---

## 📱 Formatação de Telefone

```typescript
import { formatPhone } from "@/lib/profileValidation";

const formatted = formatPhone("11987654321");
// Retorna: "(11) 98765-4321"

const formatted2 = formatPhone("1134567890");
// Retorna: "(11) 3456-7890"
```

---

## 📍 Busca de Localização

O campo de localização usa o componente `LocationSearch` que busca municípios brasileiros:

```tsx
import LocationSearch from "@/components/LocationSearch";

// No componente de perfil
<LocationSearch
  onLocationSelect={(location) => {
    // location.name contém: "São Paulo - SP"
    setFormData({ ...formData, location: location.name });
  }}
  initialLocation={
    formData.location
      ? {
          lat: 0,
          lng: 0,
          name: formData.location,
        }
      : undefined
  }
/>;
```

**Características:**

- ✅ Busca em tempo real ao digitar
- ✅ Busca em banco de dados de municípios (~5.570 cidades)
- ✅ Formato: "Cidade - UF" (ex: "Belo Horizonte - MG")
- ✅ Debounce de 200ms para otimizar requisições
- ✅ Dropdown com até 10 sugestões
- ✅ Componente reutilizado de outras partes da aplicação

---

## 🔍 Exemplos Práticos

### 1. Banner de Perfil Incompleto

```tsx
function IncompleteProfileBanner() {
  const completion = useProfileCompletion(user);

  if (completion === 100) return null;

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Seu perfil está {completion}% completo.
        <Button onClick={openProfile}>Complete agora</Button>
      </AlertDescription>
    </Alert>
  );
}
```

### 2. Avatar com Fallback

```tsx
function UserAvatar({ user }) {
  const { profile } = useUserProfile(user);
  const initials = useProfileInitials(user);

  return (
    <Avatar>
      <AvatarImage src={profile?.avatar_url} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
```

### 3. Formulário de Edição

```tsx
function EditProfileForm({ user }) {
  const { profile, updateProfile } = useUserProfile(user);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
  });

  const handleSubmit = async () => {
    const validation = validateProfileForm(formData);

    if (!validation.isValid) {
      showErrors(validation.errors);
      return;
    }

    await updateProfile(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.full_name}
        onChange={(e) =>
          setFormData({ ...formData, full_name: e.target.value })
        }
      />
      <Button type="submit">Salvar</Button>
    </form>
  );
}
```

### 4. Cache Manual

```tsx
// Limpar cache
const { clearProfile } = useUserProfileStore();
clearProfile();

// Forçar refresh
const { refresh } = useUserProfile(user);
refresh();
```

---

## 🐛 Debug

### Console Logs

```javascript
// Ver estado atual da store
console.log(useUserProfileStore.getState());

// Ver cache
console.log(localStorage.getItem("user-profile-storage"));

// Ver último fetch
const { lastFetched } = useUserProfileStore.getState();
console.log(`Último fetch: ${new Date(lastFetched).toLocaleString()}`);
```

### Erros Comuns

```typescript
// Limpar erros
const { clearError } = useUserProfileStore();
clearError();

// Verificar erro atual
const { error } = useUserProfileStore();
if (error) console.error(error);
```

---

## 📊 Performance

### Cache Duration

```typescript
// Padrão: 5 minutos
const CACHE_DURATION = 5 * 60 * 1000;

// Customizar no código da store se necessário
```

### Otimizar Uploads

```typescript
// Comprimir mais agressivamente
const compressed = await compressImage(file, 600, 600, 0.7);
// Menor tamanho, menor qualidade

// Ou manter qualidade
const compressed = await compressImage(file, 1024, 1024, 0.9);
// Maior tamanho, melhor qualidade
```

---

## 🔐 Segurança

### RLS Policies

As políticas já estão configuradas na migração:

```sql
-- Usuários podem ler todos os perfis
CREATE POLICY "Enable read access for all users"
ON user_profiles FOR SELECT USING (true);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### Validação no Backend

Constraints SQL garantem integridade:

- ✅ Nome: 2-100 caracteres
- ✅ Bio: Máximo 500 caracteres
- ✅ Website: Formato URL válido
- ✅ Updated_at: Atualizado automaticamente

---

## 📝 Checklist de Implementação

- [x] Migração SQL aplicada
- [x] Componentes atualizados
- [x] Hooks criados
- [x] Validações implementadas
- [x] Cache configurado
- [x] Compressão de imagens
- [x] Testes básicos
- [ ] Limpar localStorage antigo
- [ ] Testar em produção

---

## 🎓 Recursos Adicionais

- **Documentação completa:** `/docs/USER_PROFILE_V2.md`
- **Código de validação:** `/src/lib/profileValidation.ts`
- **Store Zustand:** `/src/store/userProfileStore.ts`
- **Hooks:** `/src/hooks/useUserProfile.tsx`
- **Componentes:** `/src/components/UserProfileDialog.tsx`

---

**Versão:** 2.0.0  
**Última atualização:** 05/02/2026
