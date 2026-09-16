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

const client = createClient(url, key);

async function check() {
  const { data, error } = await client.from('complaints').select('*');
  if (error) {
    console.error('Error fetching complaints:', error);
    return;
  }
  console.log(`Found ${data.length} complaints in Supabase:`);
  for (const c of data) {
    console.log(`- ${c.id}: "${c.title}" (${c.status}) created_at: ${c.created_at}`);
  }

  const target = data.find(c => c.id.includes('37170') || c.id === 'PRG-37170');
  if (target) {
    console.log('\nMATCH FOUND:', JSON.stringify(target, null, 2));
  } else {
    console.log('\nPRG-37170 NOT found in database.');
  }
}

check();

