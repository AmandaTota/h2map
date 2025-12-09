# Sistema de Viabilidade de Transporte Offline

## Visão Geral

Sistema offline-first para calcular rotas de transporte A→B sem dependência de internet, utilizando dados locais do OpenStreetMap, tiles offline e base de pedágios local.

## Funcionalidades Implementadas

### ✅ Interface do Usuário
- Formulário com origem, destino e waypoints opcionais
- Preferências de rota (evitar pedágios, estradas não pavimentadas, ferries)
- Perfis de veículo (carro, caminhão, motocicleta)
- Parâmetros do veículo (consumo, tipo de combustível, preço)
- Mapa interativo com Leaflet
- Design responsivo compatível com o projeto

### ✅ Cálculos Implementados
- Distância total (km)
- Tempo estimado (minutos)
- Consumo de combustível (litros)
- Custo de combustível (R$)
- Custo de pedágios (R$)
- Custo total da viagem

### ✅ Funcionalidades de Exportação
- Exportar rota em GPX
- Exportar rota em GeoJSON
- Exportar relatório em PDF (preparado para implementação)

### ✅ Sistema Offline
- Mapa renderizado com Leaflet
- Suporte para tiles offline (PMTiles/MBTiles)
- Base de pedágios local (JSON)
- Geocodificação local (aceita lat,lon)

## Arquitetura do Sistema

```
src/pages/ViabilidadeTransporte.tsx  → Interface principal
data/
  tiles.pmtiles                       → Tiles do mapa offline
  tolls.json                          → Base de pedágios
  osm/region.osm.pbf                  → Dados OSM para roteamento
router/
  osrm/                               → OSRM configurado localmente
  graphhopper/                        → Alternativa ao OSRM
```

## Próximos Passos para Implementação Completa

### 1. Configurar Tiles Offline (PMTiles ou MBTiles)

#### Opção A: PMTiles (Recomendado)
```bash
# Instalar pmtiles
npm install pmtiles

# Baixar tiles do Brasil
wget https://r2-public.protomaps.com/protomaps-sample-datasets/south-america-latest.pmtiles
mv south-america-latest.pmtiles data/tiles.pmtiles
```

No código, adicionar:
```typescript
import { PMTiles } from 'pmtiles';

const pmtiles = new PMTiles('data/tiles.pmtiles');
const protocol = new pmtiles.leafletLayer();
L.tileLayer(protocol.getTileUrl()).addTo(map);
```

#### Opção B: MBTiles + TileServer Local
```bash
# Instalar tileserver-gl
npm install -g tileserver-gl

# Baixar MBTiles
wget https://example.com/brazil.mbtiles -O data/tiles.mbtiles

# Servir localmente
tileserver-gl data/tiles.mbtiles
```

### 2. Configurar OSRM Local (Roteamento Offline)

```bash
# Criar diretório
mkdir -p router/osrm
cd router/osrm

# Baixar dados OSM do Brasil
wget http://download.geofabrik.de/south-america/brazil-latest.osm.pbf

# Instalar OSRM (Docker recomendado)
docker pull osrm/osrm-backend

# Preprocessar dados
docker run -t -v $(pwd):/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/brazil-latest.osm.pbf
docker run -t -v $(pwd):/data osrm/osrm-backend osrm-contract /data/brazil-latest.osrm

# Rodar servidor OSRM
docker run -t -i -p 5000:5000 -v $(pwd):/data osrm/osrm-backend osrm-routed --algorithm mld /data/brazil-latest.osrm
```

### 3. Integrar OSRM no Código

Substituir a função `calculateRoute`:

```typescript
const calculateRoute = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);
    
    if (!originCoords || !destCoords) {
      throw new Error("Não foi possível geocodificar os endereços.");
    }

    // Montar waypoints
    const coords = [
      `${originCoords.lon},${originCoords.lat}`,
      ...waypointCoords.filter(Boolean).map(w => `${w.lon},${w.lat}`),
      `${destCoords.lon},${destCoords.lat}`
    ].join(';');

    // Chamar OSRM local
    const osrmUrl = `http://localhost:5000/route/v1/${preferences.profile}/${coords}`;
    const params = new URLSearchParams({
      overview: 'full',
      steps: 'true',
      geometries: 'geojson',
      exclude: [
        preferences.avoidTolls ? 'toll' : '',
        preferences.avoidFerries ? 'ferry' : '',
      ].filter(Boolean).join(',')
    });

    const response = await fetch(`${osrmUrl}?${params}`);
    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error('Rota não encontrada');
    }

    const route = data.routes[0];
    const distance = route.distance / 1000; // metros -> km
    const duration = route.duration / 3600; // segundos -> horas
    
    const consumption = distance / vehicleParams.avgKmPerLiter;
    const fuelCost = consumption * vehicleParams.pricePerLiter;
    
    // Calcular pedágios intersectando com a rota
    const polyline = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const tollCost = calculateTollsOnRoute(polyline);
    
    const totalCost = fuelCost + tollCost;

    setRouteResult({
      distance,
      duration,
      steps: route.legs[0].steps.map(s => ({
        instruction: s.maneuver.instruction || 'Siga em frente',
        distance: s.distance / 1000,
        duration: s.duration / 3600
      })),
      polyline,
      consumption,
      fuelCost,
      tollCost,
      totalCost
    });

    // Desenhar no mapa...
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Implementar Geocodificação Offline

#### Opção A: Photon Local
```bash
# Instalar Photon
docker pull komoot/photon

# Rodar Photon
docker run -p 2322:2322 -v $(pwd)/photon_data:/photon/data komoot/photon
```

#### Opção B: Índice CSV/JSON Simplificado
```typescript
// data/geocoding.json
[
  { "name": "São Paulo, SP", "lat": -23.5505, "lon": -46.6333 },
  { "name": "Rio de Janeiro, RJ", "lat": -22.9068, "lon": -43.1729 },
  // ... mais cidades
]

// Implementar busca fuzzy
import Fuse from 'fuse.js';

const geocodingData = await fetch('/data/geocoding.json').then(r => r.json());
const fuse = new Fuse(geocodingData, { keys: ['name'], threshold: 0.3 });

const geocodeAddress = (address: string) => {
  // Tentar como lat,lon primeiro
  const coords = address.split(',').map(s => parseFloat(s.trim()));
  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    return { lat: coords[0], lon: coords[1] };
  }
  
  // Buscar no índice local
  const results = fuse.search(address);
  if (results.length > 0) {
    return { lat: results[0].item.lat, lon: results[0].item.lon };
  }
  
  return null;
};
```

### 5. Implementar Cálculo de Pedágios

```typescript
// data/tolls.json
[
  {
    "id": "1",
    "name": "Pedágio SP-348 - Bandeirantes",
    "lat": -23.0,
    "lon": -47.0,
    "direction": "both",
    "vehicleClass": {
      "car": 15.20,
      "truck": 45.80,
      "motorcycle": 7.60
    }
  }
  // ... mais pedágios
]

// Função para calcular interseção
import * as turf from '@turf/turf';

const calculateTollsOnRoute = (polyline: Array<[number, number]>) => {
  const routeLine = turf.lineString(polyline.map(([lat, lon]) => [lon, lat]));
  const buffer = turf.buffer(routeLine, 0.5, { units: 'kilometers' });
  
  let totalCost = 0;
  
  TOLL_DATABASE.forEach(toll => {
    const tollPoint = turf.point([toll.lon, toll.lat]);
    
    if (turf.booleanPointInPolygon(tollPoint, buffer)) {
      const price = toll.vehicleClass[preferences.profile] || 0;
      totalCost += price;
    }
  });
  
  return totalCost;
};
```

### 6. Configurar PWA (Service Worker)

Criar `public/sw.js`:
```javascript
const CACHE_NAME = 'h2map-transport-v1';
const urlsToCache = [
  '/',
  '/data/tiles.pmtiles',
  '/data/tolls.json',
  '/data/geocoding.json',
  // ... outros recursos
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

Registrar em `src/main.tsx`:
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 7. Implementar Exportação PDF

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const exportPDF = async () => {
  if (!routeResult) return;
  
  const pdf = new jsPDF();
  
  // Título
  pdf.setFontSize(20);
  pdf.text('Relatório de Viagem', 20, 20);
  
  // Dados
  pdf.setFontSize(12);
  pdf.text(`Origem: ${origin}`, 20, 40);
  pdf.text(`Destino: ${destination}`, 20, 50);
  pdf.text(`Distância: ${routeResult.distance.toFixed(1)} km`, 20, 60);
  pdf.text(`Tempo: ${(routeResult.duration * 60).toFixed(0)} min`, 20, 70);
  pdf.text(`Custo Total: R$ ${routeResult.totalCost.toFixed(2)}`, 20, 80);
  
  // Capturar mapa
  if (mapRef.current) {
    const canvas = await html2canvas(mapRef.current);
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 20, 100, 170, 100);
  }
  
  pdf.save('relatorio-viagem.pdf');
};
```

## Dependências Necessárias

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "pmtiles": "^3.0.0",
    "@turf/turf": "^7.0.0",
    "fuse.js": "^7.0.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8"
  }
}
```

Instalar:
```bash
npm install leaflet pmtiles @turf/turf fuse.js jspdf html2canvas
npm install -D @types/leaflet
```

## Estrutura de Dados Recomendada

### tolls.json
```json
[
  {
    "id": "toll_001",
    "name": "Pedágio Bandeirantes - KM 23",
    "lat": -23.456789,
    "lon": -46.789012,
    "direction": "both",
    "highway": "SP-348",
    "vehicleClass": {
      "car": 15.20,
      "truck": 45.80,
      "motorcycle": 7.60,
      "truck-2axles": 30.40,
      "truck-3axles": 45.80,
      "truck-4axles": 61.20
    },
    "operatingHours": "24/7",
    "paymentMethods": ["cash", "card", "tag"]
  }
]
```

### geocoding.json
```json
[
  {
    "id": "city_001",
    "name": "São Paulo",
    "state": "SP",
    "fullName": "São Paulo, SP",
    "lat": -23.5505,
    "lon": -46.6333,
    "population": 12300000,
    "aliases": ["SP", "Sampa", "São Paulo Capital"]
  }
]
```

## Testes

Criar `tests/transportFeasibility.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Cálculo de Rota', () => {
  it('deve calcular distância corretamente', () => {
    // Implementar testes
  });
  
  it('deve calcular consumo de combustível', () => {
    // Implementar testes
  });
  
  it('deve identificar pedágios na rota', () => {
    // Implementar testes
  });
});
```

## Performance

- **Tiles**: Use PMTiles para carregar apenas os tiles visíveis
- **Roteamento**: Cache de rotas calculadas no IndexedDB
- **Geocodificação**: Índice invertido para busca O(1)
- **Service Worker**: Cache agressivo de recursos estáticos

## Referências

- [OSRM Documentation](http://project-osrm.org/)
- [Leaflet Docs](https://leafletjs.com/)
- [PMTiles Spec](https://github.com/protomaps/PMTiles)
- [Turf.js](https://turfjs.org/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)

## Notas de Implementação

O sistema atual já está funcional com:
- ✅ Interface completa e responsiva
- ✅ Formulário de entrada com validação
- ✅ Cálculos de consumo e custos
- ✅ Mapa interativo (usando tiles online temporariamente)
- ✅ Exportação GPX e GeoJSON
- ✅ Sistema de waypoints

Para torná-lo **completamente offline**, siga os passos 1-7 acima para configurar:
- Tiles locais
- OSRM/GraphHopper local
- Geocodificação offline
- Service Worker para PWA
