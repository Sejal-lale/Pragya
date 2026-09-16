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

async function restoreComplaint() {
  console.log('Restoring complaint PRG-37170 into Supabase...');

  const complaint = {
    id: 'PRG-37170',
    title: 'Damaged Road & Deep Potholes near Market',
    description: 'सड़क पर बड़ा गड्ढा है और पानी भरा हुआ है। आवाजाही में परेशानी हो रही है।',
    original_language: 'hi',
    original_transcript: 'सड़क पर बड़ा गड्ढा है और पानी भरा हुआ है। आवाजाही में परेशानी हो रही है।',
    translated_description: 'Large pothole with accumulated water near market area causing hazard for vehicles and pedestrians.',
    category: 'roads',
    sub_category: 'Pothole Repair',
    department_id: 'roads',
    status: 'dept_assigned',
    priority: 'high',
    sla_hours: 48,
    deadline: new Date(Date.now() + 42 * 3600 * 1000).toISOString(),
    latitude: 21.1458,
    longitude: 79.0882,
    address: 'Near Variety Square, Sitabuldi, Ward 12, Nagpur',
    ward_id: 'ward-12',
    guest_citizen_name: 'Verified Citizen',
    upvotes_count: 3,
  };

  const { data, error } = await client.from('complaints').upsert(complaint).select();
  if (error) {
    console.error('Error inserting PRG-37170:', error.message);
    return;
  }
  console.log('✅ Successfully inserted/restored complaint PRG-37170!');

  // Add evidence
  const evidenceItems = [
    {
      complaint_id: 'PRG-37170',
      evidence_type: 'problem_photo',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      uploaded_by_role: 'citizen',
      stamped_address: 'Near Variety Square, Sitabuldi, Nagpur (Lat: 21.1458, Lng: 79.0882)',
      note: 'Incident site photo captured via Pragya voice assistant'
    },
    {
      complaint_id: 'PRG-37170',
      evidence_type: 'citizen_verification_selfie',
      image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      uploaded_by_role: 'citizen',
      stamped_address: 'Geo-verified citizen at incident location',
      note: 'Facial & on-site location match verified'
    }
  ];

  const { error: evError } = await client.from('evidence').insert(evidenceItems);
  if (evError) {
    console.warn('Evidence insert note:', evError.message);
  } else {
    console.log('✅ Evidence attached to PRG-37170');
  }

  // Add timeline events
  const timelineItems = [
    {
      complaint_id: 'PRG-37170',
      status: 'submitted',
      actor_name: 'Citizen',
      actor_role: 'citizen',
      note: 'Voice grievance filed with geotagged photo & face verification.'
    },
    {
      complaint_id: 'PRG-37170',
      status: 'classified',
      actor_name: 'Pragya AI Core (Gemini 2.0)',
      actor_role: 'admin',
      note: 'Category: Roads & Infrastructure. Priority: High. SLA: 48 hours.'
    },
    {
      complaint_id: 'PRG-37170',
      status: 'dept_assigned',
      actor_name: 'Nagpur MC Dispatch',
      actor_role: 'supervisor',
      note: 'Dispatched to Road Maintenance Wing, Ward 12.'
    }
  ];

  const { error: tlError } = await client.from('timeline_events').insert(timelineItems);
  if (tlError) {
    console.warn('Timeline insert note:', tlError.message);
  } else {
    console.log('✅ Timeline audit logs created for PRG-37170');
  }
}

restoreComplaint();

