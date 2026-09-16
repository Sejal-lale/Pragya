import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const envVars = {};
for (const line of env.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const k = trimmed.substring(0, eqIdx).trim();
    const v = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    envVars[k] = v;
  }
}

const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const key = envVars.VITE_SUPABASE_PUBLISHABLE_KEY || envVars.SUPABASE_PUBLISHABLE_KEY || envVars.SUPABASE_SECRET_KEY;

console.log('Target URL:', url);
const client = createClient(url, key);

async function run() {
  const { data, error } = await client.from('complaints').select('*').limit(5);
  if (error) {
    console.log('STATUS: PENDING_SCHEMA');
    console.log('Code:', error.code);
    console.log('Message:', error.message);
  } else {
    console.log('STATUS: READY');
    console.log('Found records:', data.length);
    if (data.length > 0) {
      console.log('Sample record:', data[0].title, '| Status:', data[0].status);
    }
  }
}

run();
