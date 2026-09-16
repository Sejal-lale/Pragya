-- Pragya Supabase Schema Init
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom Types
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

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hindi_name VARCHAR(100),
  marathi_name VARCHAR(100),
  default_sla_hours INT DEFAULT 48,
  escalation_email VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wards
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

-- Profiles
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

-- Complaints
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
  latitude NUMERIC(10, 7) DEFAULT 21.1458,
  longitude NUMERIC(10, 7) DEFAULT 79.0882,
  location_geom GEOMETRY(Point, 4326),
  address TEXT NOT NULL,
  ward_id VARCHAR(50) REFERENCES public.wards(id),
  landmark TEXT,
  citizen_id UUID REFERENCES public.profiles(id),
  guest_citizen_name VARCHAR(150),
  guest_citizen_phone VARCHAR(20),
  assigned_employee_id UUID REFERENCES public.profiles(id),
  cluster_id UUID,
  upvotes_count INT DEFAULT 1,
  idempotency_key UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Sync coordinates trigger
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

-- Evidence
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id VARCHAR(50) REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  evidence_type evidence_type NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by_id UUID REFERENCES public.profiles(id),
  uploaded_by_role user_role NOT NULL,
  stamped_address TEXT,
  stamped_geo GEOMETRY(Point, 4326),
  device_metadata JSONB,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events
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
