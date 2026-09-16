import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';

// Support both new Supabase Publishable Key standard (sb_publishable_...) and legacy anon key
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  '';

// True if live Supabase project credentials are provided
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_KEY &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your-project')
);

// Instantiate Supabase client or null if in pure local mock mode
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Upload an image file or data URI to Supabase Storage
 */
export async function uploadEvidencePhoto(
  fileOrBase64: File | string,
  complaintId: string,
  type: 'problem' | 'citizen_selfie' | 'resolution_proof'
): Promise<string> {
  if (!supabase) {
    // If running in local demo mode, return the local base64/URL directly
    return typeof fileOrBase64 === 'string'
      ? fileOrBase64
      : URL.createObjectURL(fileOrBase64);
  }

  try {
    const timestamp = Date.now();
    const filePath = `${complaintId}/${type}_${timestamp}.jpg`;

    let blob: Blob;
    if (typeof fileOrBase64 === 'string') {
      const res = await fetch(fileOrBase64);
      blob = await res.blob();
    } else {
      blob = fileOrBase64;
    }

    const { error: uploadError } = await supabase.storage
      .from('complaints-evidence')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload warning:', uploadError.message);
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
    }

    const { data } = supabase.storage
      .from('complaints-evidence')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Failed to upload evidence to Supabase Storage:', err);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64 as File);
  }
}

