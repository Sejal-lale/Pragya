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

const client = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_PUBLISHABLE_KEY);

async function testFK() {
  const { error } = await client.from('complaints').insert({
    id: 'PRG-TEST-FK',
    title: 'Test FK',
    description: 'Test FK',
    category: 'roads',
    sub_category: 'Pothole Repair',
    department_id: 'roads',
    address: 'Test Address',
    ward_id: 'Ward 12, Nagpur',
    latitude: 21.1458,
    longitude: 79.0882
  });
  if (error) {
    console.log('FK TEST ERROR:', error.code, '|', error.message);
  } else {
    console.log('FK TEST SUCCESS');
    await client.from('complaints').delete().eq('id', 'PRG-TEST-FK');
  }
}

testFK();

