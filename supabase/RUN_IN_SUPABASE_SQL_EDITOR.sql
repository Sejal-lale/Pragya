-- ====================================================================
-- Pragya Civic Platform - COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Target Project: https://cogrkbbmraghegsbifib.supabase.co
--
-- INSTRUCTIONS FOR USER:
-- 1. Open your browser: https://supabase.com/dashboard/project/cogrkbbmraghegsbifib/sql/new
-- 2. Paste this entire file into the SQL Editor
-- 3. Click the green "Run" button (or Ctrl+Enter)
-- Everything is idempotent and safe to run multiple times.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Fix PostGIS spatial_ref_sys Supabase linter warning
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only access to spatial_ref_sys" ON public.spatial_ref_sys;
CREATE POLICY "Allow public read-only access to spatial_ref_sys"
ON public.spatial_ref_sys FOR SELECT
TO public
USING (true);

-- 2. CUSTOM ENUM TYPES (IF NOT EXISTS)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'employee', 'supervisor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM (
    'submitted', 
    'classified', 
    'dept_assigned', 
    'employee_assigned',
    'accepted',
    'in_progress', 
    'completed', 
    'verified', 
    'resolved', 
    'reopened',
    'rejected', 
    'escalated'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_type AS ENUM ('problem_photo', 'citizen_verification_selfie', 'resolution_proof');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. DEPARTMENTS & SLA
CREATE TABLE IF NOT EXISTS public.departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hindi_name VARCHAR(100),
  marathi_name VARCHAR(100),
  default_sla_hours INT DEFAULT 48,
  escalation_email VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WARDS (NAGPUR MUNICIPAL CORPORATION)
CREATE TABLE IF NOT EXISTS public.wards (
  id VARCHAR(50) PRIMARY KEY,
  ward_number INT NOT NULL,
  ward_name VARCHAR(100) NOT NULL,
  zone_name VARCHAR(100),
  boundary GEOMETRY(Polygon, 4326),
  center_point GEOMETRY(Point, 4326),
  supervisor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wards_boundary ON public.wards USING GIST (boundary);

-- 5. PROFILES (USERS / CITIZENS / EMPLOYEES / SUPERVISORS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(150),
  role user_role NOT NULL DEFAULT 'citizen',
  department_id VARCHAR(50) REFERENCES public.departments(id),
  assigned_ward_id VARCHAR(50) REFERENCES public.wards(id),
  avatar_url TEXT,
  fcm_push_token TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON public.profiles(department_id);

-- 6. COMPLAINTS (CORE GRIEVANCE TABLE WITH LAT/LNG + POSTGIS GEOMETRY)
CREATE TABLE IF NOT EXISTS public.complaints (
  id VARCHAR(50) PRIMARY KEY DEFAULT ('PRG-' || UPPER(SUBSTRING(uuid_generate_v4()::text, 1, 8))),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  original_language VARCHAR(10) DEFAULT 'en',
  original_transcript TEXT,
  translated_description TEXT,
  
  category VARCHAR(50) NOT NULL,
  sub_category VARCHAR(100) NOT NULL,
  department_id VARCHAR(50) REFERENCES public.departments(id) NOT NULL,
  
  status complaint_status DEFAULT 'submitted',
  priority complaint_priority DEFAULT 'medium',
  sla_hours INT DEFAULT 48,
  deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  
  -- Coordinates & Location
  latitude NUMERIC(10, 7) DEFAULT 21.1458,
  longitude NUMERIC(10, 7) DEFAULT 79.0882,
  location_geom GEOMETRY(Point, 4326),
  address TEXT NOT NULL,
  ward_id VARCHAR(50) REFERENCES public.wards(id),
  landmark TEXT,
  
  -- Identity & Assignment
  citizen_id UUID REFERENCES public.profiles(id),
  guest_citizen_name VARCHAR(150),
  guest_citizen_phone VARCHAR(20),
  assigned_employee_id UUID REFERENCES public.profiles(id),
  
  -- Duplicate Prevention Clustering & Upvotes
  cluster_id UUID,
  upvotes_count INT DEFAULT 1,
  
  -- Idempotency key for mobile retry
  idempotency_key UUID UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Trigger to auto-sync latitude/longitude with location_geom
CREATE OR REPLACE FUNCTION public.sync_complaint_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_geom := ST_SetSRID(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision), 4326);
  ELSIF NEW.location_geom IS NOT NULL THEN
    NEW.longitude := ST_X(NEW.location_geom);
    NEW.latitude := ST_Y(NEW.location_geom);
  ELSE
    NEW.latitude := 21.1458;
    NEW.longitude := 79.0882;
    NEW.location_geom := ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_complaint_coords ON public.complaints;
CREATE TRIGGER trg_sync_complaint_coords
BEFORE INSERT OR UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.sync_complaint_coordinates();

-- Trigger to auto-normalize ward_id before foreign key constraint check
CREATE OR REPLACE FUNCTION public.normalize_complaint_ward()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ward_id IS NOT NULL THEN
    IF NEW.ward_id ILIKE '%12%' OR NEW.ward_id ILIKE '%dharampeth%' OR NEW.ward_id ILIKE '%laxmi%' THEN
      NEW.ward_id := 'ward-12';
    ELSIF NEW.ward_id ILIKE '%8%' OR NEW.ward_id ILIKE '%08%' OR NEW.ward_id ILIKE '%sitabuldi%' OR NEW.ward_id ILIKE '%ramdaspeth%' THEN
      NEW.ward_id := 'ward-08';
    ELSIF NEW.ward_id ILIKE '%15%' OR NEW.ward_id ILIKE '%khamla%' OR NEW.ward_id ILIKE '%pratap%' THEN
      NEW.ward_id := 'ward-15';
    ELSIF NOT EXISTS (SELECT 1 FROM public.wards WHERE id = NEW.ward_id) THEN
      NEW.ward_id := 'ward-12';
    END IF;
  ELSE
    NEW.ward_id := 'ward-12';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_complaint_ward ON public.complaints;
CREATE TRIGGER trg_normalize_complaint_ward
BEFORE INSERT OR UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.normalize_complaint_ward();

-- High-performance spatial & query indexes
CREATE INDEX IF NOT EXISTS idx_complaints_geom ON public.complaints USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_complaints_status_dept ON public.complaints (status, department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_employee_active ON public.complaints (assigned_employee_id, status) WHERE status NOT IN ('verified', 'resolved', 'rejected');
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints (citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON public.complaints (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_search ON public.complaints USING GIN (to_tsvector('english', title || ' ' || description));

-- 7. EVIDENCE (PROBLEM PHOTO + CITIZEN SELFIE WITH GEO-STAMP + RESOLUTION PROOF)
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id VARCHAR(50) REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  evidence_type evidence_type NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  uploaded_by_id UUID REFERENCES public.profiles(id),
  uploaded_by_role user_role NOT NULL,
  
  -- Stamped Live Watermark Metadata
  stamped_address TEXT,
  stamped_geo GEOMETRY(Point, 4326),
  device_metadata JSONB,
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON public.evidence (complaint_id, evidence_type);

-- 8. TIMELINE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id VARCHAR(50) REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  status complaint_status NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  actor_name VARCHAR(150) NOT NULL,
  actor_role user_role NOT NULL,
  note TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_complaint ON public.timeline_events (complaint_id, created_at ASC);

-- 9. POSTGIS SPATIAL DUPLICATE DETECTION BUFFER (Within 50 Meters)
CREATE OR REPLACE FUNCTION public.check_nearby_duplicate(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_category VARCHAR,
  p_radius_meters DOUBLE PRECISION DEFAULT 50.0
)
RETURNS TABLE (
  complaint_id VARCHAR,
  title VARCHAR,
  distance_meters DOUBLE PRECISION,
  status complaint_status,
  upvotes INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS complaint_id,
    c.title,
    ST_Distance(
      c.location_geom::geography, 
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_meters,
    c.status,
    c.upvotes_count AS upvotes
  FROM public.complaints c
  WHERE c.category = p_category
    AND c.status NOT IN ('verified', 'resolved', 'rejected')
    AND c.created_at > (NOW() - INTERVAL '72 hours')
    AND ST_DWithin(
      c.location_geom::geography, 
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, 
      p_radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT 3;
END;
$$;

-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;

-- Complaints policies
DROP POLICY IF EXISTS "Allow public and authenticated complaint insertion" ON public.complaints;
CREATE POLICY "Allow public and authenticated complaint insertion"
ON public.complaints FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public reading of complaints" ON public.complaints;
CREATE POLICY "Allow public reading of complaints"
ON public.complaints FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow updating complaints" ON public.complaints;
CREATE POLICY "Allow updating complaints"
ON public.complaints FOR UPDATE
TO public
USING (true);

-- Evidence policies
DROP POLICY IF EXISTS "Allow evidence upload" ON public.evidence;
CREATE POLICY "Allow evidence upload"
ON public.evidence FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow viewing evidence" ON public.evidence;
CREATE POLICY "Allow viewing evidence"
ON public.evidence FOR SELECT
TO public
USING (true);

-- Timeline policies
DROP POLICY IF EXISTS "Allow timeline view" ON public.timeline_events;
CREATE POLICY "Allow timeline view"
ON public.timeline_events FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow timeline insert" ON public.timeline_events;
CREATE POLICY "Allow timeline insert"
ON public.timeline_events FOR INSERT
TO public
WITH CHECK (true);

-- Profiles policies
DROP POLICY IF EXISTS "Allow profiles view" ON public.profiles;
CREATE POLICY "Allow profiles view"
ON public.profiles FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow profiles insert or update" ON public.profiles;
CREATE POLICY "Allow profiles insert or update"
ON public.profiles FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Departments & Wards policies
DROP POLICY IF EXISTS "Allow departments view" ON public.departments;
CREATE POLICY "Allow departments view" ON public.departments FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow wards view" ON public.wards;
CREATE POLICY "Allow wards view" ON public.wards FOR SELECT TO public USING (true);

-- 11. ENABLE REALTIME WEBSOCKET BROADCAST
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'timeline_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;
  END IF;
END $$;

-- 12. STORAGE BUCKET CONFIGURATION (For Citizen & Officer Evidence Photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaints-evidence', 'complaints-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public upload to complaints-evidence" ON storage.objects;
CREATE POLICY "Allow public upload to complaints-evidence"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'complaints-evidence');

DROP POLICY IF EXISTS "Allow public read from complaints-evidence" ON storage.objects;
CREATE POLICY "Allow public read from complaints-evidence"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'complaints-evidence');

-- ====================================================================
-- 13. SEED INITIAL DEPARTMENTS, WARDS, DEMO USERS, & COMPLAINTS
-- ====================================================================
INSERT INTO public.departments (id, name, hindi_name, marathi_name, default_sla_hours)
VALUES 
  ('roads', 'Roads & Infrastructure', 'सड़क एवं बुनियादी ढांचा', 'रस्ते आणि पायाभूत सुविधा', 48),
  ('sanitation', 'Sanitation & Solid Waste', 'स्वच्छता एवं ठोस अपशिष्ट', 'स्वच्छता आणि घनकचरा व्यवस्थापन', 24),
  ('electrical', 'Street Lighting & Electrical', 'स्ट्रीट लाइट एवं विद्युत', 'रस्त्यावरील दिवे आणि विद्युत', 24),
  ('lighting', 'Street Lighting & Electrical', 'स्ट्रीट लाइट एवं विद्युत', 'रस्त्यावरील दिवे आणि विद्युत', 24),
  ('water', 'Water Supply & Drainage', 'जल आपूर्ति एवं जल निकासी', 'पाणीपुरवठा आणि सांडपाणी', 36),
  ('infrastructure', 'Public Infrastructure', 'सार्वजनिक बुनियादी ढांचा', 'सार्वजनिक पायाभूत सुविधा', 72)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, hindi_name = EXCLUDED.hindi_name, marathi_name = EXCLUDED.marathi_name;

INSERT INTO public.wards (id, ward_number, ward_name, zone_name, center_point)
VALUES 
  ('ward-12', 12, 'Dharampeth - Laxmi Nagar', 'West Zone', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326)),
  ('ward-08', 8, 'Ramdaspeth - Sitabuldi', 'Central Zone', ST_SetSRID(ST_MakePoint(79.0820, 21.1390), 4326)),
  ('ward-15', 15, 'Pratap Nagar - Khamla', 'South-West Zone', ST_SetSRID(ST_MakePoint(79.0620, 21.1180), 4326))
ON CONFLICT (id) DO UPDATE
SET ward_name = EXCLUDED.ward_name, zone_name = EXCLUDED.zone_name;

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

INSERT INTO public.complaints (
  id, title, description, original_language, original_transcript, translated_description,
  category, sub_category, department_id, status, priority, sla_hours, deadline,
  latitude, longitude, address, ward_id, citizen_id, assigned_employee_id, upvotes_count
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
  21.1458,
  79.0882,
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
  'completed',
  'critical',
  24,
  NOW() - INTERVAL '2 hours',
  21.1390,
  79.0820,
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
  21.1180,
  79.0620,
  'Near Khamla Water Tank, Ring Road',
  'ward-15',
  NULL,
  NULL,
  5
)
ON CONFLICT (id) DO NOTHING;

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
  'completed',
  'Priya Patel (EMP-S018)',
  'employee',
  'Sanitation vehicle deployed. 2 tons of waste cleared and bin disinfected. Photo proof uploaded.'
);

