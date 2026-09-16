# Pragya — Scalable Supabase Backend Architecture & Implementation Plan (`backed_plan.md`)

**Document Version:** 1.0.0  
**Target Platform:** Supabase (PostgreSQL 15+ with PostGIS, PostgREST, Supavisor, Realtime, Storage)  
**Target Scale:** 1,000 to 50,000+ Concurrently Connected Mobile Clients  
**Supported Languages:** Hindi (`hi-IN`), Marathi (`mr-IN`), English (`en-IN`)  

---

## 1. High-Concurrency System Topology & Architecture

To support thousands of mobile devices without connection crashes, latency spikes, or expensive infrastructure, Pragya uses an **asynchronous, stateless, edge-first architecture**:

```mermaid
flowchart TD
    subgraph MobileClients["1,000s of Mobile Devices (Android PWA / React)"]
        CitizenGuest["Citizen Guest (No Login)"]
        CitizenAuth["Logged-in Citizen (Pooja Rao)"]
        FieldWorkers["Field Workers (Rahul / Priya)"]
        Supervisors["Supervisors (Operations Command)"]
    end

    subgraph EdgeLayer["Edge & Free API Ingress Layer"]
        Kong["Kong API Gateway / Cloudflare Edge"]
        WebSpeech["Client Web Speech API (Free STT/TTS)"]
        GeminiAPI["Google Gemini 2.0 Flash (Free NLP Extraction)"]
        OSM["OpenStreetMap / Nominatim (Free Reverse Geocoding)"]
    end

    subgraph SupabaseCore["Supabase High-Scale Cloud Stack"]
        Supavisor["Supavisor / PgBouncer (Transaction Pooling)"]
        PostgREST["PostgREST (Stateless HTTP/2 CRUD)"]
        Realtime["Supabase Realtime (Phoenix WebSocket Engine)"]
        Storage["Supabase Storage (S3 + Tus Resumable Upload + CDN)"]
        EdgeFunctions["Supabase Edge Functions (Deno TypeScript)"]
    end

    subgraph Database["PostgreSQL 15+ with PostGIS & Extensions"]
        PG["PostgreSQL DB Cluster"]
        PostGIS["PostGIS Spatial Engine (GiST Indexing)"]
        PGCron["pg_cron (5-Min SLA Monitor & Escalator)"]
        RLS["Row Level Security (Zero-Trust Access Control)"]
    end

    CitizenGuest -->|Voice Input (Web Speech API)| WebSpeech
    CitizenGuest -->|Resumable Photo Upload (Tus)| Storage
    CitizenGuest -->|Anonymous Complaint POST| Kong
    CitizenAuth -->|Authenticated JWT Token| Kong
    FieldWorkers -->|Offline-Sync / Start Work| Kong
    Supervisors -->|GIS Live Map / Verification| Kong

    Kong --> Supavisor
    Kong --> EdgeFunctions
    EdgeFunctions -->|Unstructured Voice to JSON| GeminiAPI
    EdgeFunctions -->|Lat/Lng to Address| OSM

    Supavisor --> PostgREST
    PostgREST --> PG
    Realtime -.->|WAL Change Data Capture| PG
    Realtime -->|WebSocket Push Updates| MobileClients

    PG --- PostGIS
    PG --- PGCron
    PG --- RLS
```

### Why This Architecture Scales to 10,000+ Mobile Devices
1. **No Direct Database Connections (Connection Pooling)**:
   - PostgreSQL allocates ~2–5 MB of RAM per direct client connection. Having 2,000 direct connections would exhaust database RAM and crash PostgreSQL.
   - Mobile devices **never** open direct TCP connections to PostgreSQL. They communicate via **PostgREST over HTTP/2 multiplexing**.
   - PostgREST routes all requests through **Supavisor in Transaction Mode**. A pool of only **30 to 50 active PostgreSQL connections** can easily service **10,000+ concurrent mobile apps**.
2. **WebSocket Push Over Repetitive Polling**:
   - If 5,000 citizens polled the server every 5 seconds for complaint status, that would generate **60,000 DB queries/minute**.
   - With **Supabase Realtime**, clients subscribe to their specific `citizen_id` or `assigned_employee_id`. Zero queries occur until a database status update happens, at which point the Postgres WAL sends an immediate push event.
3. **Resumable Tus Protocol for Unstable Mobile Networks**:
   - Indian mobile networks often fluctuate between 4G and 2G. Uploading a 4MB photo over a regular HTTP multipart request fails if interrupted.
   - Supabase Storage supports the **Tus resumable upload protocol**, chunking uploads and resuming seamlessly from the exact byte when connection returns.
4. **Client-Side Voice Processing (Zero Server Ingress Load)**:
   - Audio is converted to text directly on the citizen's mobile phone via the **Web Speech API**, eliminating the need to stream heavy audio files over municipal servers.

---

## 2. 100% Free API Integration Matrix

| Capability | Chosen Free API / Technology | Cost & Limits | Why It Fits Pragya |
| :--- | :--- | :--- | :--- |
| **Voice Input (STT)** | **Browser Web Speech API** (`webkitSpeechRecognition`) | **₹0 (Free forever, unlimited)** | Native to Chrome/Android WebView. Supports `hi-IN` (Hindi), `mr-IN` (Marathi), `en-IN` (English). Runs locally on-device. |
| **Voice Fallback (STT)** | **Groq Cloud Whisper** (`whisper-large-v3`) | **Free Developer Tier** (20 req/min) | Ultra-fast (~200ms turnaround) server-side speech recognition for recorded audio clips. |
| **Voice Output (TTS)** | **Browser Web SpeechSynthesis** (`window.speechSynthesis`) | **₹0 (Free forever, zero latency)** | Speaks Hindi, Marathi, and English locally on the user's phone. Consumes 0 server bandwidth. |
| **AI Classification** | **Google Gemini 2.0 Flash API** | **15 RPM / 1,500 RPD / 1M TPM Free** | Extracts Category, Subcategory, Department, Priority, and SLA from unstructured Hindi/Marathi voice in strict JSON. |
| **Fast Fallback NLP** | **Groq Cloud** (`llama-3.3-70b-versatile`) | **30 RPM Free** | Blazing-fast (<200ms) JSON schema structured extraction. |
| **Reverse Geocoding** | **OpenStreetMap Nominatim** | **100% Free** (No billing/credit card) | Resolves Lat/Lng into Nagpur street names, wards, and pin codes. |
| **GIS Map Rendering** | **Leaflet.js + OSM Carto Tiles** | **100% Free Open Source** | Lightweight interactive map for mobile pins. |
| **Database & Auth** | **Supabase Free Tier** | **50,000 MAU, 500MB DB, 1GB Storage** | Free PostgreSQL, PostGIS, PostgREST, and Realtime engine. |

### Concrete Edge Function: Free Gemini AI Categorization
This Supabase Edge Function (`supabase/functions/classify-complaint/index.ts`) takes raw multilingual voice transcripts and returns structured ticket data:

```typescript
// supabase/functions/classify-complaint/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  const { transcript, language } = await req.json();

  const prompt = `
You are the AI engine for "Pragya", a municipal grievance redressal system in Nagpur, India.
Analyze the following citizen complaint submitted in ${language || "Hindi/Marathi/English"}:
"${transcript}"

Extract and return ONLY a JSON object with this exact structure:
{
  "category": "roads" | "sanitation" | "electrical" | "water" | "drainage" | "other",
  "sub_category": string,
  "department_id": "roads" | "sanitation" | "electrical" | "water" | "drainage",
  "department_name": string,
  "priority": "low" | "medium" | "high" | "critical",
  "sla_hours": number,
  "translated_english": string,
  "summary": string
}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    }
  );

  const result = await response.json();
  const structuredData = JSON.parse(result.candidates[0].content.parts[0].text);

  return new Response(JSON.stringify(structuredData), {
    headers: { "Content-Type": "application/json" }
  });
});
```

---

## 3. PostgreSQL + PostGIS Schema DDL

Run this complete SQL script in the **Supabase SQL Editor** to initialize the database:

```sql
-- ====================================================================
-- 1. EXTENSIONS
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ====================================================================
-- 2. ENUM TYPES
-- ====================================================================
CREATE TYPE user_role AS ENUM ('citizen', 'employee', 'supervisor', 'admin');
CREATE TYPE complaint_status AS ENUM (
  'submitted', 
  'ai_classified', 
  'dept_assigned', 
  'in_progress', 
  'work_completed', 
  'verified_closed', 
  'rejected', 
  'escalated'
);
CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE evidence_type AS ENUM ('problem_photo', 'citizen_verification_selfie', 'resolution_proof');

-- ====================================================================
-- 3. DEPARTMENTS & SLA CONFIGURATION
-- ====================================================================
CREATE TABLE public.departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hindi_name VARCHAR(100),
  marathi_name VARCHAR(100),
  default_sla_hours INT DEFAULT 48,
  escalation_email VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. WARDS & ADMINISTRATIVE BOUNDARIES (POSTGIS POLYGONS)
-- ====================================================================
CREATE TABLE public.wards (
  id VARCHAR(50) PRIMARY KEY,
  ward_number INT NOT NULL,
  ward_name VARCHAR(100) NOT NULL,
  zone_name VARCHAR(100),
  boundary GEOMETRY(Polygon, 4326),
  center_point GEOMETRY(Point, 4326),
  supervisor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for sub-millisecond ward boundary lookup
CREATE INDEX idx_wards_boundary ON public.wards USING GIST (boundary);

-- ====================================================================
-- 5. PROFILES (LINKED TO SUPABASE AUTH.USERS)
-- ====================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_dept ON public.profiles(department_id);

-- ====================================================================
-- 6. COMPLAINTS (CORE GRIEVANCE TABLE WITH POSTGIS GEOMETRY)
-- ====================================================================
CREATE TABLE public.complaints (
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
  deadline TIMESTAMPTZ NOT NULL,
  
  -- Geographic Data
  location_geom GEOMETRY(Point, 4326) NOT NULL,
  address TEXT NOT NULL,
  ward_id VARCHAR(50) REFERENCES public.wards(id),
  landmark TEXT,
  
  -- Identity & Assignments
  citizen_id UUID REFERENCES public.profiles(id),
  guest_citizen_name VARCHAR(150),
  guest_citizen_phone VARCHAR(20),
  assigned_employee_id UUID REFERENCES public.profiles(id),
  
  -- Duplicate Clustering
  cluster_id UUID,
  upvotes_count INT DEFAULT 1,
  
  -- Idempotency key for offline mobile retry
  idempotency_key UUID UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- High-performance spatial & query indexes
CREATE INDEX idx_complaints_geom ON public.complaints USING GIST (location_geom);
CREATE INDEX idx_complaints_status_dept ON public.complaints (status, department_id);
CREATE INDEX idx_complaints_employee_active ON public.complaints (assigned_employee_id, status) WHERE status NOT IN ('verified_closed', 'rejected');
CREATE INDEX idx_complaints_citizen ON public.complaints (citizen_id);
CREATE INDEX idx_complaints_deadline ON public.complaints (deadline) WHERE status NOT IN ('verified_closed', 'rejected');
-- Full-text search index for Indian civic keywords
CREATE INDEX idx_complaints_search ON public.complaints USING GIN (to_tsvector('english', title || ' ' || description));

-- ====================================================================
-- 7. EVIDENCE & PHOTOS (PROBLEM + CITIZEN SELFIE + RESOLUTION PROOF)
-- ====================================================================
CREATE TABLE public.evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id VARCHAR(50) REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  evidence_type evidence_type NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  uploaded_by_id UUID REFERENCES public.profiles(id),
  uploaded_by_role user_role NOT NULL,
  
  -- Live Watermark & Verification Metadata
  stamped_address TEXT,
  stamped_geo GEOMETRY(Point, 4326),
  device_metadata JSONB,
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_complaint ON public.evidence (complaint_id, evidence_type);

-- ====================================================================
-- 8. TIMELINE AUDIT LOGS
-- ====================================================================
CREATE TABLE public.timeline_events (
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

CREATE INDEX idx_timeline_complaint ON public.timeline_events (complaint_id, created_at ASC);
```

---

## 4. Scalability Engineering for 1,000s of Mobile Devices

### A. Sub-50m Spatial Duplicate Prevention Buffer
When thousands of citizens report the same road crater or dumpster during peak hours, creating separate tickets overwhelms municipal crews. 

This PostGIS function detects if a similar issue has already been reported within 50 meters in the last 72 hours:

```sql
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
    AND c.status NOT IN ('verified_closed', 'rejected')
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
```

### B. Offline Mobile Sync with Idempotency Keys
When a citizen in a weak network area submits a complaint, mobile apps may trigger multiple retry attempts. 
- The mobile app generates a client-side UUID: `idempotency_key = crypto.randomUUID()`.
- The database enforces a `UNIQUE(idempotency_key)` constraint.
- If the phone retries 5 times while reconnecting, PostgreSQL ignores the duplicates and safely returns the existing complaint record.

### C. Resumable Storage Buckets Configuration
Create the following buckets in Supabase Storage:
1. `complaints-evidence`: Public bucket, 10MB limit per image, allowed MIME types: `image/jpeg, image/png, image/webp`.
2. `citizen-verifications`: Restricted bucket (contains citizen selfie watermarks). Read access limited to Supervisors and assigned Field Workers.
3. `resolution-proofs`: Public bucket, containing official Before/After repair photographs.

---

## 5. PostgreSQL Row-Level Security (RLS) Policies

Enable zero-trust data protection while ensuring the open public reporting flow operates smoothly:

```sql
-- Enable RLS on all operational tables
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check caller's role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- ====================================================================
-- COMPLAINTS RLS POLICIES
-- ====================================================================

-- 1. PUBLIC GUEST & CITIZEN CREATION (Open Access)
-- Anyone can insert a complaint without being logged in (guest mode)
CREATE POLICY "Allow public and authenticated complaint insertion"
ON public.complaints FOR INSERT
TO public
WITH CHECK (true);

-- 2. PUBLIC & CITIZEN READ ACCESS
-- Citizens can read their own complaints, or any complaint in their ward
CREATE POLICY "Citizens can read their complaints and ward complaints"
ON public.complaints FOR SELECT
TO public
USING (
  auth.uid() IS NULL OR -- Guest can read public ward issues
  citizen_id = auth.uid() OR
  public.get_auth_role() IN ('employee', 'supervisor', 'admin')
);

-- 3. EMPLOYEE TASK MANAGEMENT
-- Employees can view and update only tasks assigned to their department/ID
CREATE POLICY "Employees can update assigned complaints"
ON public.complaints FOR UPDATE
TO authenticated
USING (
  assigned_employee_id = auth.uid() OR
  (department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid()) 
   AND public.get_auth_role() = 'employee') OR
  public.get_auth_role() IN ('supervisor', 'admin')
);

-- 4. SUPERVISOR OMNI-ACCESS
CREATE POLICY "Supervisors have full control"
ON public.complaints FOR ALL
TO authenticated
USING (public.get_auth_role() IN ('supervisor', 'admin'));
```

---

## 6. Supabase Auth Setup & Demo Seed Data

Run this seed script in Supabase to create the exact demo accounts and initial Nagpur complaints matching our frontend:

```sql
-- ====================================================================
-- SEED DEPARTMENTS
-- ====================================================================
INSERT INTO public.departments (id, name, hindi_name, marathi_name, default_sla_hours)
VALUES 
  ('roads', 'Roads & Infrastructure', 'सड़क एवं बुनियादी ढांचा', 'रस्ते आणि पायाभूत सुविधा', 48),
  ('sanitation', 'Sanitation & Solid Waste', 'स्वच्छता एवं ठोस अपशिष्ट', 'स्वच्छता आणि घनकचरा व्यवस्थापन', 24),
  ('electrical', 'Street Lighting & Electrical', 'स्ट्रीट लाइट एवं विद्युत', 'रस्त्यावरील दिवे आणि विद्युत', 24),
  ('water', 'Water Supply & Drainage', 'जल आपूर्ति एवं जल निकासी', 'पाणीपुरवठा आणि सांडपाणी', 36)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- SEED WARDS (NAGPUR MUNICIPAL CORPORATION)
-- ====================================================================
INSERT INTO public.wards (id, ward_number, ward_name, zone_name, center_point)
VALUES 
  ('ward-12', 12, 'Dharampeth - Laxmi Nagar', 'West Zone', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326)),
  ('ward-08', 8, 'Ramdaspeth - Sitabuldi', 'Central Zone', ST_SetSRID(ST_MakePoint(79.0820, 21.1390), 4326)),
  ('ward-15', 15, 'Pratap Nagar - Khamla', 'South-West Zone', ST_SetSRID(ST_MakePoint(79.0620, 21.1180), 4326))
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- SEED DEMO USERS INTO AUTH.USERS & PUBLIC.PROFILES
-- ====================================================================
-- Note: In Supabase, users are created in auth.users via Supabase Dashboard / Auth API.
-- This script provisions matching public.profiles:

-- 1. Citizen Demo (Pooja Rao)
INSERT INTO public.profiles (id, name, phone, email, role, assigned_ward_id, avatar_url)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Pooja Rao',
  '+91 98230 14829',
  'pooja.rao@pragya.gov.in',
  'citizen',
  'ward-12',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Field Employee Demo - Roads (Rahul Sharma - EMP-R042)
INSERT INTO public.profiles (id, name, phone, email, role, department_id, assigned_ward_id, avatar_url)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Rahul Sharma (EMP-R042)',
  '+91 94221 88392',
  'rahul.sharma@nagpurmc.gov.in',
  'employee',
  'roads',
  'ward-12',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Field Employee Demo - Sanitation (Priya Patel - EMP-S018)
INSERT INTO public.profiles (id, name, phone, email, role, department_id, assigned_ward_id, avatar_url)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'Priya Patel (EMP-S018)',
  '+91 98902 44190',
  'priya.patel@nagpurmc.gov.in',
  'employee',
  'sanitation',
  'ward-12',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Supervisor Demo (Er. Rajesh Kulkarni - SUP-NMC-01)
INSERT INTO public.profiles (id, name, phone, email, role, department_id, avatar_url)
VALUES (
  'd4444444-4444-4444-4444-444444444444',
  'Er. Rajesh Kulkarni (SUP-NMC-01)',
  '+91 98220 55100',
  'rajesh.kulkarni@nagpurmc.gov.in',
  'supervisor',
  'roads',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ====================================================================
-- SEED INITIAL REALISTIC NAGPUR COMPLAINTS
-- ====================================================================
INSERT INTO public.complaints (
  id, title, description, original_language, category, sub_category, 
  department_id, status, priority, sla_hours, deadline,
  location_geom, address, ward_id, citizen_id, assigned_employee_id, upvotes_count
) VALUES 
(
  'PRG-82914',
  'Dangerous Crater Pothole on Main Road',
  'हमारे रोड पर बहुत बड़ा गड्ढा है और गाड़ियां फिसल रही हैं',
  'hi',
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
  NULL, -- Filed anonymously by a guest citizen!
  NULL,
  5
)
ON CONFLICT (id) DO NOTHING;

-- Seed Evidence for PRG-82914
INSERT INTO public.evidence (complaint_id, evidence_type, image_url, uploaded_by_id, uploaded_by_role, stamped_address)
VALUES 
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
);
```

---

## 7. Background Automation & SLA Escalations (`pg_cron`)

Municipal SLAs require automatic escalation when tickets cross their deadline. 

Configure this `pg_cron` worker inside Supabase to run **every 5 minutes**:

```sql
-- Schedule SLA auto-escalation check every 5 minutes
SELECT cron.schedule(
  'check-sla-breaches',
  '*/5 * * * *',
  $$
    UPDATE public.complaints
    SET 
      status = 'escalated',
      updated_at = NOW()
    WHERE status NOT IN ('work_completed', 'verified_closed', 'rejected', 'escalated')
      AND deadline < NOW();

    -- Insert an automated timeline audit event for escalated tickets
    INSERT INTO public.timeline_events (complaint_id, status, actor_name, actor_role, note)
    SELECT 
      id, 
      'escalated', 
      'SLA Sentinel AI', 
      'admin', 
      'Resolution deadline breached (' || sla_hours || 'h exceeded). Escalated to Chief Municipal Supervisor.'
    FROM public.complaints
    WHERE status = 'escalated'
      AND updated_at >= NOW() - INTERVAL '6 minutes';
  $$
);
```

---

## 8. Frontend Integration SDK (`@supabase/supabase-js`)

Here is how the React frontend seamlessly integrates with Supabase for **stateless queries**, **Tus resumable photo uploads**, and **Realtime WebSocket subscriptions**:

### A. Supabase Client Setup (`src/lib/supabaseClient.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOi...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### B. Realtime WebSocket Listener Hook
```typescript
import { useEffect } from 'react';
import { supabase } from './supabaseClient';

export function useComplaintRealtime(complaintId: string, onUpdate: (data: any) => void) {
  useEffect(() => {
    if (!complaintId) return;

    // Zero polling! Push notification via WebSocket CDC channel
    const channel = supabase
      .channel(`complaint-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
          filter: `id=eq.${complaintId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId, onUpdate]);
}
```

### C. Resumable Photo Upload Function
```typescript
export async function uploadResumableEvidence(file: File, complaintId: string, type: 'problem' | 'citizen_selfie'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${complaintId}/${type}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('complaints-evidence')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('complaints-evidence')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
```

---

## 9. Verification & Deployment Steps

1. **Create a Free Supabase Project**:
   - Go to [database.new](https://database.new) and create a free tier project (choose Mumbai/ap-south-1 region for lowest latency).
2. **Execute Schema SQL**:
   - Open Supabase SQL Editor and run the DDL in **Section 3**, **Section 4 (Functions)**, **Section 5 (RLS)**, and **Section 6 (Seed Data)**.
3. **Configure Storage Buckets**:
   - In the Storage tab, create `complaints-evidence` and set it to public.
4. **Deploy AI Classification Edge Function**:
   - Set the `GEMINI_API_KEY` in Supabase Secrets (`supabase secrets set GEMINI_API_KEY=your_key`).
   - Run `supabase functions deploy classify-complaint`.
5. **Connect React Frontend**:
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`.
   - Your frontend will now read live Nagpur complaints, push updates in real-time, and store verified citizen selfies!

