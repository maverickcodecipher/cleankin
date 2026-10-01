import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll().map((c) => ({
        name: c.name,
        value: c.value,
        options: { path: '/' },
      })),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => {
          cookieStore.set(name, value, { path: '/' });
        });
      },
    },
  });
}

export async function createSupabaseServerFromRequest() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll().map((c) => ({
        name: c.name,
        value: c.value,
        options: { path: '/' },
      })),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => {
          cookieStore.set(name, value, { path: '/' });
        });
      },
    },
  });
}
