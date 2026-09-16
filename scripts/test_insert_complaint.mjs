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

const normalizeWard = (raw) => {
  if (!raw) return 'ward-12';
  const c = raw.toLowerCase().trim();
  if (c.includes('12') || c.includes('dharampeth') || c.includes('laxmi')) return 'ward-12';
  if (c.includes('8') || c.includes('08') || c.includes('sitabuldi') || c.includes('ramdaspeth')) return 'ward-08';
  if (c.includes('15') || c.includes('khamla') || c.includes('pratap')) return 'ward-15';
  if (c.startsWith('ward-')) return c;
  return 'ward-12';
};

async function testCitizenDirectRegister() {
  const testId = 'PRG-' + Math.floor(10000 + Math.random() * 90000);
  console.log(`Testing direct citizen complaint registration for ${testId}...`);

  const rawWard = 'Ward 12, Nagpur';
  const normalizedWard = normalizeWard(rawWard);
  console.log(`Ward "${rawWard}" normalized to "${normalizedWard}"`);

  const { data, error } = await client.from('complaints').insert({
    id: testId,
    title: 'Pothole Repair',
    description: 'Direct citizen voice complaint test from frontend wizard',
    original_language: 'hi',
    category: 'roads',
    sub_category: 'Pothole Repair',
    department_id: 'roads',
    status: 'submitted',
    priority: 'high',
    sla_hours: 48,
    deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    latitude: 21.1458,
    longitude: 79.0882,
    address: 'Near Laxmi Nagar Square, Wardha Road',
    ward_id: normalizedWard,
    guest_citizen_name: 'Pooja Rao',
  }).select();

  if (error) {
    console.error('❌ Insert FAILED:', error.message);
  } else {
    console.log('✅ Direct Citizen Registration SUCCESSFUL! ID:', data[0].id);

    // Also attach evidence
    const { error: evErr } = await client.from('evidence').insert({
      complaint_id: testId,
      evidence_type: 'problem_photo',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      uploaded_by_role: 'citizen',
      stamped_address: 'Near Laxmi Nagar Square, Wardha Road',
    });

    if (evErr) console.warn('Evidence note:', evErr.message);
    else console.log('✅ Evidence successfully attached to', testId);

    // Verify retrieval
    const { data: fetchBack } = await client.from('complaints').select('*, evidence (*)').eq('id', testId).single();
    console.log('✅ Verified from Supabase:', fetchBack.id, '| Evidence items:', fetchBack.evidence.length);
  }
}

testCitizenDirectRegister();

