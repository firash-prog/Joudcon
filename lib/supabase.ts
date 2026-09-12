import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public / server-side reads (RLS enforces published-only)
export const supabasePublic = () => createSupabaseClient(url, anon);

// Admin (browser cookie session)
export const supabaseAdmin = () => {
  const store = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {} },
    },
  });
};

// Server-only service client (API routes). NEVER import into client components.
import { createClient as createServiceClient } from '@supabase/supabase-js';
export const supabaseService = () =>
  createServiceClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export const mediaUrl = (path: string | null, width = 1200) =>
  path ? `${url}/render/image/public/media/${path}?width=${width}&format=webp` : null;
export const rawMediaUrl = (bucket: string, path: string | null) =>
  path ? `${url}/storage/v1/object/public/${bucket}/${path}` : null;
