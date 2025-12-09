# 🚀 Quick Start - Viabilidade de Transporte

## Usar Agora (Modo Desenvolvimento)

1. **Acesse a página**
   ```
   http://localhost:porta/viabilidade-transporte
   ```

2. **Teste com coordenadas diretas**
   - **Origem**: `-23.5505,-46.6333` (São Paulo, SP)
   - **Destino**: `-22.9068,-43.1729` (Rio de Janeiro, RJ)
   - **Consumo**: `10` km/L
   - **Preço combustível**: `5.89` R$/L

3. **Clique em "Calcular Rota"**

## Funcionalidades Disponíveis

### ✅ Já Funcionando
- Interface completa e moderna
- Formulário de entrada
- Cálculos de distância e custos
- Mapa interativo (tiles online temporariamente)
- Detecção de pedágios simulada
- Exportação GPX e GeoJSON
- Design responsivo

### 🔧 Precisa Configurar para Offline Completo
- OSRM local (roteamento offline)
- Tiles offline (PMTiles/MBTiles)
- Geocodificação offline (Photon/Pelias)

## Exemplos de Uso

### Exemplo 1: São Paulo → Rio de Janeiro
```
Origem: -23.5505,-46.6333
Destino: -22.9068,-43.1729
Perfil: Carro
Consumo: 10 km/L
Combustível: Gasolina
Preço: R$ 5.89/L
```

**Resultado esperado:**
- Distância: ~357 km (simulado: variável)
- Tempo: ~5-6 horas
- Consumo: ~35.7 L
- Custo combustível: ~R$ 210
- Pedágios: ~R$ 15-30 (se houver)

### Exemplo 2: Campinas → Santos
```
Origem: -22.9099,-47.0626
Destino: -23.9608,-46.3336
Perfil: Caminhão
Consumo: 3 km/L
Combustível: Diesel
Preço: R$ 6.50/L
```

### Exemplo 3: Com Paradas
```
Origem: São Paulo
Parada 1: Campinas
Parada 2: Ribeirão Preto
Destino: Belo Horizonte
```

## Atalhos de Teclado

- `Ctrl/Cmd + Enter` - Calcular rota
- `Esc` - Limpar formulário

## Recursos Adicionais

### Exportar Resultados
- **GPX**: Para usar em GPS
- **GeoJSON**: Para usar em sistemas GIS
- **PDF**: Relatório completo (em desenvolvimento)

### Preferências de Rota
- ☑️ Evitar pedágios
- ☑️ Evitar estradas não pavimentadas
- ☑️ Evitar ferries/balsas

### Perfis de Veículo
- 🚗 Carro
- 🚛 Caminhão
- 🏍️ Motocicleta

## Dicas

1. **Coordenadas precisas**: Use formato `-23.5505,-46.6333` (sem espaços extras)
2. **Nomes de cidades**: Disponíveis 30 capitais e cidades principais
3. **Waypoints**: Adicione quantos quiser usando o botão "+"
4. **Modo offline**: Após configurar OSRM local, funcionará sem internet

## Problemas Comuns

### "Não foi possível geocodificar"
- ✅ Use coordenadas diretas: `lat,lon`
- ✅ Ou configure geocodificação offline

### "Rota não encontrada"
- ✅ Verifique se OSRM local está rodando
- ✅ Modo desenvolvimento usa simulação

### Mapa não carrega
- ✅ Temporariamente usa tiles online
- ✅ Configure tiles offline para uso sem internet

## Para Desenvolvedores

### Estrutura do Código
```
src/pages/ViabilidadeTransporte.tsx  → Interface
src/types/transport.ts               → Tipos
src/utils/transportUtils.ts         → Utilitários
src/hooks/useServiceWorker.tsx      → PWA
data/tolls.json                      → Pedágios
data/geocoding.json                  → Cidades
```

### Testar
```bash
npm run test
```

### Build
```bash
npm run build
```

## Suporte

Consulte a documentação completa em:
- `VIABILIDADE_TRANSPORTE_OFFLINE.md` - Guia completo
- `RESUMO_IMPLEMENTACAO.md` - Resumo da implementação

## Status do Projeto

🟢 **Interface**: Completa e funcional  
🟢 **Cálculos**: Implementados  
🟢 **Exportação**: GPX e GeoJSON prontos  
🟡 **OSRM**: Simulado (configure local)  
🟡 **Tiles**: Online (configure offline)  
🟡 **Geocoding**: Básico (expanda conforme necessário)  
🟢 **PWA**: Service Worker configurado  

---

Criado para o projeto H2Map 🌱
