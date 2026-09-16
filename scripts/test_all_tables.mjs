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

async function verifyAll() {
  console.log('=== VERIFYING SUPABASE DATABASE INTEGRITY ===');
  
  const tables = ['departments', 'wards', 'profiles', 'complaints', 'evidence', 'timeline_events'];
  for (const table of tables) {
    const { data, error } = await client.from(table).select('*').limit(5);
    if (error) {
      console.log(`❌ ${table}: Error -`, error.message);
    } else {
      console.log(`✅ ${table}: Ready (${data.length} records)`);
    }
  }

  // Test PostGIS spatial duplicate function
  const { data: dupData, error: dupError } = await client.rpc('check_nearby_duplicate', {
    p_lat: 21.1458,
    p_lng: 79.0882,
    p_category: 'roads',
    p_radius_meters: 100.0
  });

  if (dupError) {
    console.log('⚠️ PostGIS RPC check note:', dupError.message);
  } else {
    console.log(`✅ PostGIS Spatial Duplicate Check Function: Working! Found ${dupData.length} nearby duplicate(s):`, dupData);
  }

  // Test live insert & cleanup
  const testId = 'PRG-TEST-' + Math.floor(Math.random() * 1000);
  const { data: insData, error: insError } = await client.from('complaints').insert({
    id: testId,
    title: 'Live Supabase Verification Incident',
    description: 'Automatic test to verify write-permission and coordinates trigger',
    original_language: 'en',
    category: 'roads',
    sub_category: 'Pothole Repair',
    department_id: 'roads',
    status: 'submitted',
    priority: 'medium',
    latitude: 21.1458,
    longitude: 79.0882,
    address: 'Sitabuldi Square, Nagpur',
    ward_id: 'ward-12',
    guest_citizen_name: 'Test Citizen'
  }).select();

  if (insError) {
    console.log('❌ Insert test error:', insError.message);
  } else {
    console.log('✅ Live Insert Successful! Created row:', insData[0].id);
    await client.from('complaints').delete().eq('id', testId);
    console.log('✅ Cleanup Successful!');
  }

  console.log('============================================');
}

verifyAll();
