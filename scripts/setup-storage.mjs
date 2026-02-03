#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ler variáveis de ambiente
let envFile = path.join(__dirname, '..', '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envFile, 'utf8');
} catch (e) {
  envFile = path.join(__dirname, '..', '.env');
  try {
    envContent = fs.readFileSync(envFile, 'utf8');
  } catch (e2) {
    console.error('❌ Arquivo .env ou .env.local não encontrado');
    process.exit(1);
  }
}

// Parse das variáveis de ambiente
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    env[key.trim()] = rest.join('=').replace(/^"/, '').replace(/"$/, '');
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas corretamente');
  process.exit(1);
}

console.log('🔧 Criando bucket de storage para avatares...');
console.log(`📍 URL: ${SUPABASE_URL}`);

const bucketData = JSON.stringify({
  name: 'avatars',
  public: true,
  file_size_limit: 5242880, // 5MB
});

const urlObj = new URL(SUPABASE_URL);
const options = {
  hostname: urlObj.hostname,
  path: '/storage/v1/b',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': bucketData.length,
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Bucket criado com sucesso!');
        console.log(`📦 Bucket: avatars`);
        console.log(`🌐 Público: sim`);
        console.log(`📏 Tamanho máximo: 5MB`);
      } else if (response.message?.includes('already exists')) {
        console.log('⚠️  Bucket já existe!');
        console.log(`📦 Bucket: avatars`);
        console.log(`🌐 Público: sim`);
        console.log(`📏 Tamanho máximo: 5MB`);
      } else {
        console.error('❌ Erro:', response.message || data);
      }
    } catch (e) {
      console.error('❌ Erro ao processar resposta:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro de conexão:', e.message);
  process.exit(1);
});

req.write(bucketData);
req.end();
