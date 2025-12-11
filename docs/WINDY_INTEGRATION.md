# Integração da API Windy

## Visão Geral
Este projeto integra a API do Windy nos mapas da seção "Mapas das regiões comparadas" da página de Análise de Viabilidade.

## Componente WindyMap

O componente `WindyMap` está localizado em `/src/components/WindyMap.tsx` e substitui o componente `Map` padrão nos mapas de comparação.

### Características
- **Mapas meteorológicos interativos**: Exibe dados do Windy em tempo real
- **Marcadores de localização**: Suporta marcadores personalizados
- **Zoom configurável**: Permite ajustar o nível de zoom inicial
- **Múltiplas instâncias**: Suporta vários mapas na mesma página
- **Gerenciamento inteligente de recursos**: Carrega o script do Windy apenas uma vez
- **Distribuição de carga**: Utiliza duas API keys alternadamente

### API Keys Configuradas
```
Key 1: tqexRyJzU1Tsu9pKo8TKfbFZutYe2KnE
Key 2: j1CAj41gDPTD4GaHGnSXs6xDyKfLh32a
```

As keys são selecionadas aleatoriamente a cada nova instância do mapa para distribuir a carga entre elas.

### Uso Básico
```tsx
import WindyMap from "@/components/WindyMap";

<WindyMap
  initialLocation={{
    lat: -14.235,
    lng: -51.9253,
    name: "Brasil"
  }}
  zoom={10}
/>
```

### Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|---------|-----------|
| `initialLocation` | `{ lat: number, lng: number, name: string }` | Não | Centro do Brasil | Localização inicial do mapa |
| `zoom` | `number` | Não | `10` | Nível de zoom inicial (1-18) |

### Exemplo com Múltiplos Mapas
```tsx
<div className="grid grid-cols-2 gap-4">
  <WindyMap
    initialLocation={{
      lat: -23.5505,
      lng: -46.6333,
      name: "São Paulo"
    }}
    zoom={9}
  />
  <WindyMap
    initialLocation={{
      lat: -22.9068,
      lng: -43.1729,
      name: "Rio de Janeiro"
    }}
    zoom={9}
  />
</div>
```

## Onde está sendo usado

O componente `WindyMap` é usado em:
- [FeasibilityAnalysis.tsx](../src/pages/FeasibilityAnalysis.tsx) - Seção "Mapa das Regiões Comparadas"
  - Mapa A (Região Intermediária) - Zoom 9
  - Mapa A (Região Macro) - Zoom 5.5
  - Mapa B (Região Intermediária) - Zoom 9
  - Mapa B (Região Macro) - Zoom 5.5

## Funcionalidades do Windy

O mapa Windy oferece:
- 🌬️ **Visualização de ventos**: Em tempo real e previsão
- 🌡️ **Temperatura**: Dados atuais e previsões
- 🌧️ **Precipitação**: Chuva, neve e outras formas de precipitação
- ☁️ **Cobertura de nuvens**: Visualização de formações de nuvens
- 🌊 **Ondas e correntes oceânicas**: Para regiões costeiras
- ⚡ **Raios**: Atividade de tempestades
- 🔆 **Radiação solar**: Útil para análise de energia solar
- 📊 **Múltiplas camadas**: Mais de 40 camadas de dados meteorológicos

## Detalhes Técnicos

### Gerenciamento de Script
O componente implementa um sistema de gerenciamento de script global para evitar carregamentos duplicados:

```typescript
let windyScriptLoaded = false;
let windyScriptLoading = false;
const windyCallbacks: Array<() => void> = [];
```

### Ciclo de Vida
1. **Montagem**: O script do Windy é carregado (se ainda não estiver)
2. **Inicialização**: Uma instância única do mapa é criada para cada componente
3. **Atualização**: Quando `initialLocation` ou `zoom` mudam, o mapa é atualizado
4. **Desmontagem**: Os marcadores são removidos e as referências são limpas

### IDs Únicos
Cada instância do mapa recebe um ID único:
```typescript
const [mapId] = useState(() => `windy-map-${mapIdCounter++}`);
```

### Limpeza de Recursos
```typescript
return () => {
  mounted = false;
  if (markerRef.current) {
    try {
      markerRef.current.remove();
    } catch (e) {
      // Ignora erro se o marcador já foi removido
    }
  }
  windyAPIRef.current = null;
};
```

## Tipos TypeScript

Os tipos para o Windy estão definidos em `/src/types/windy.d.ts`:

```typescript
interface Window {
  windyInit?: (options: WindyOptions, callback: (api: WindyAPI) => void) => void;
  L?: any; // Leaflet usado pelo Windy
}

interface WindyOptions {
  key: string;
  lat: number;
  lon: number;
  zoom: number;
}

interface WindyAPI {
  map: any;
  store: any;
  picker: any;
  utils: any;
  broadcast: any;
}
```

## Performance

- ✅ Script carregado apenas uma vez
- ✅ Instâncias de mapa isoladas
- ✅ Limpeza adequada de recursos
- ✅ Gerenciamento de memória otimizado
- ✅ Distribuição de carga entre API keys

## Limitações

- A API do Windy possui limites de uso gratuito
- Recomenda-se monitorar o uso das API keys
- O carregamento inicial pode levar alguns segundos
- Requer conexão com internet

## Troubleshooting

### Mapa não carrega
1. Verifique a conexão com internet
2. Verifique se as API keys estão válidas
3. Abra o console do navegador para verificar erros

### Múltiplos mapas não funcionam
1. Certifique-se de que cada mapa tem uma `key` única no React
2. Use o prop `key` com valores únicos (ex: `key={mapKeyA}`)

### Marcadores duplicados
1. O componente gerencia automaticamente os marcadores
2. Marcadores antigos são removidos antes de adicionar novos

## Recursos Adicionais

- [Documentação oficial do Windy API](https://api.windy.com/)
- [Leaflet Documentation](https://leafletjs.com/) (biblioteca usada pelo Windy)
- [Exemplos de uso do Windy](https://api.windy.com/examples)

## Suporte

Para questões relacionadas ao componente WindyMap, abra uma issue no repositório do projeto.
Para questões sobre a API do Windy, consulte a documentação oficial.
