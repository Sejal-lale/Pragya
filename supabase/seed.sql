-- ====================================================================
-- Pragya Civic Grievance Redressal Platform
-- Supabase Seed Data: seed.sql
-- Seed Departments, Nagpur Wards, Demo Profiles & Sample Complaints
-- ====================================================================

-- 1. DEPARTMENTS
INSERT INTO public.departments (id, name, hindi_name, marathi_name, default_sla_hours)
VALUES 
  ('roads', 'Roads & Infrastructure', 'सड़क एवं बुनियादी ढांचा', 'रस्ते आणि पायाभूत सुविधा', 48),
  ('sanitation', 'Sanitation & Solid Waste', 'स्वच्छता एवं ठोस अपशिष्ट', 'स्वच्छता आणि घनकचरा व्यवस्थापन', 24),
  ('electrical', 'Street Lighting & Electrical', 'स्ट्रीट लाइट एवं विद्युत', 'रस्त्यावरील दिवे आणि विद्युत', 24),
  ('water', 'Water Supply & Drainage', 'जल आपूर्ति एवं जल निकासी', 'पाणीपुरवठा आणि सांडपाणी', 36)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, hindi_name = EXCLUDED.hindi_name, marathi_name = EXCLUDED.marathi_name;

-- 2. WARDS (NAGPUR MUNICIPAL CORPORATION)
INSERT INTO public.wards (id, ward_number, ward_name, zone_name, center_point)
VALUES 
  ('ward-12', 12, 'Dharampeth - Laxmi Nagar', 'West Zone', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326)),
  ('ward-08', 8, 'Ramdaspeth - Sitabuldi', 'Central Zone', ST_SetSRID(ST_MakePoint(79.0820, 21.1390), 4326)),
  ('ward-15', 15, 'Pratap Nagar - Khamla', 'South-West Zone', ST_SetSRID(ST_MakePoint(79.0620, 21.1180), 4326))
ON CONFLICT (id) DO UPDATE
SET ward_name = EXCLUDED.ward_name, zone_name = EXCLUDED.zone_name;

-- 3. PROFILES (DEMO ACCOUNTS MATCHING FRONTEND DEMO CREDENTIALS)
INSERT INTO public.profiles (id, name, phone, email, role, department_id, assigned_ward_id, avatar_url)
VALUES 
  (
    'a1111111-1111-1111-1111-111111111111',
    'Pooja Rao',
    '+91 98230 14829',
    'pooja.rao@pragya.gov.in',
    'citizen',
    NULL,
    'ward-12',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Rahul Sharma (EMP-R042)',
    '+91 94221 88392',
    'rahul.sharma@nagpurmc.gov.in',
    'employee',
    'roads',
    'ward-12',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Priya Patel (EMP-S018)',
    '+91 98902 44190',
    'priya.patel@nagpurmc.gov.in',
    'employee',
    'sanitation',
    'ward-12',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80'
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'Er. Rajesh Kulkarni (SUP-NMC-01)',
    '+91 98220 55100',
    'rajesh.kulkarni@nagpurmc.gov.in',
    'supervisor',
    'roads',
    'ward-12',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80'
  )
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, role = EXCLUDED.role, department_id = EXCLUDED.department_id, avatar_url = EXCLUDED.avatar_url;

-- 4. SAMPLE COMPLAINTS (REALISTIC NAGPUR DATA)
INSERT INTO public.complaints (
  id, title, description, original_language, original_transcript, translated_description,
  category, sub_category, department_id, status, priority, sla_hours, deadline,
  location_geom, address, ward_id, citizen_id, assigned_employee_id, upvotes_count
) VALUES 
(
  'PRG-82914',
  'Dangerous Crater Pothole on Main Road',
  'हमारे रोड पर बहुत बड़ा गड्ढा है और गाड़ियां फिसल रही हैं',
  'hi',
  'हमारे रोड पर बहुत बड़ा गड्ढा है और गाड़ियां फिसल रही हैं',
  'Large crater on road causing hazard for two wheelers and school buses',
  'roads',
  'Pothole Repair',
  'roads',
  'in_progress',
  'high',
  48,
  NOW() + INTERVAL '28 hours',
  ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326),
  'Near Laxmi Nagar Square, Wardha Road',
  'ward-12',
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  14
),
(
  'PRG-71822',
  'Overflowing Garbage Dumpster near Market',
  'बाजारपेठेत चार दिवसांपासून कचरा उचललेला नाही, दुर्गंधी पसरली आहे',
  'mr',
  'बाजारपेठेत चार दिवसांपासून कचरा उचललेला नाही, दुर्गंधी पसरली आहे',
  'Garbage dumpster overflowing onto vegetable vendor area, severe stench',
  'sanitation',
  'Garbage Dumpster Clearing',
  'sanitation',
  'work_completed',
  'critical',
  24,
  NOW() - INTERVAL '2 hours',
  ST_SetSRID(ST_MakePoint(79.0820, 21.1390), 4326),
  'Vegetable Market Lane, Sitabuldi Main Rd',
  'ward-08',
  'a1111111-1111-1111-1111-111111111111',
  'c3333333-3333-3333-3333-333333333333',
  23
),
(
  'PRG-60419',
  'Non-functional Street Light on Corner Pole',
  'Street light pole #34 is off for the past week, creating security risk.',
  'en',
  'Street light pole #34 is off for the past week, creating security risk.',
  'Street light pole #34 is off for the past week, creating security risk.',
  'electrical',
  'Streetlight Repair',
  'electrical',
  'dept_assigned',
  'medium',
  24,
  NOW() + INTERVAL '16 hours',
  ST_SetSRID(ST_MakePoint(79.0620, 21.1180), 4326),
  'Near Khamla Water Tank, Ring Road',
  'ward-15',
  NULL, -- Filed as public guest without login!
  NULL,
  5
)
ON CONFLICT (id) DO NOTHING;

-- 5. EVIDENCE PHOTOS
INSERT INTO public.evidence (
  complaint_id, evidence_type, image_url, uploaded_by_id, uploaded_by_role, stamped_address
) VALUES 
(
  'PRG-82914',
  'problem_photo',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  'a1111111-1111-1111-1111-111111111111',
  'citizen',
  'Near Laxmi Nagar Square, Wardha Road'
),
(
  'PRG-82914',
  'citizen_verification_selfie',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'a1111111-1111-1111-1111-111111111111',
  'citizen',
  'Near Laxmi Nagar Square, Wardha Road, Ward 12, Nagpur'
),
(
  'PRG-71822',
  'problem_photo',
  'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
  'a1111111-1111-1111-1111-111111111111',
  'citizen',
  'Vegetable Market Lane, Sitabuldi Main Rd'
),
(
  'PRG-71822',
  'resolution_proof',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
  'c3333333-3333-3333-3333-333333333333',
  'employee',
  'Sitabuldi Market Cleaned & Sanitized'
);

-- 6. TIMELINE AUDIT EVENTS
INSERT INTO public.timeline_events (
  complaint_id, status, actor_name, actor_role, note
) VALUES
(
  'PRG-82914',
  'submitted',
  'Pooja Rao',
  'citizen',
  'Voice complaint registered with on-site verified photo stamp.'
),
(
  'PRG-82914',
  'dept_assigned',
  'Pragya AI Dispatcher',
  'admin',
  'Categorized as Roads & Infrastructure. Dispatched to Field Officer Rahul Sharma.'
),
(
  'PRG-82914',
  'in_progress',
  'Rahul Sharma (EMP-R042)',
  'employee',
  'Crew arrived on site with asphalt batch. Work in progress.'
),
(
  'PRG-71822',
  'work_completed',
  'Priya Patel (EMP-S018)',
  'employee',
  'Sanitation vehicle deployed. 2 tons of waste cleared and bin disinfected. Photo proof uploaded.'
);

