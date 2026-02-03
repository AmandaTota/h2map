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

console.log('🔧 Criando usuário de teste no Supabase...');
console.log(`📍 URL: ${SUPABASE_URL}`);

const testUser = {
  email: 'admin@test.com',
  password: 'TestAdmin2024!@#$'
};

const signUpData = JSON.stringify({
  email: testUser.email,
  password: testUser.password,
});

const urlObj = new URL(SUPABASE_URL);
const options = {
  hostname: urlObj.hostname,
  path: '/auth/v1/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': signUpData.length,
    'apikey': SUPABASE_KEY,
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
        console.log('✅ Usuário criado com sucesso!');
        console.log(`📧 Email: ${testUser.email}`);
        console.log(`🔑 Senha: ${testUser.password}`);
        console.log('\n💡 Você pode agora fazer login no aplicativo.');
      } else if (response.error_code === 'user_already_exists' || response.message?.includes('already registered')) {
        console.log('⚠️  Usuário já existe!');
        console.log(`📧 Email: ${testUser.email}`);
        console.log(`🔑 Senha: ${testUser.password}`);
        console.log('\n💡 Você pode agora fazer login no aplicativo.');
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

req.write(signUpData);
req.end();
