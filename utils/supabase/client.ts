import { createBrowserClient } from '@supabase/ssr';

export interface SupabaseUser {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => document.cookie.split(';').map((c) => {
        const [name, ...rest] = c.trim().split('=');
        return { name, value: rest.join('=').trim() };
      }),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          document.cookie = `${name}=${value}; path=${options.path ?? '/'}; ${options.maxAge ? `max-age=${options.maxAge};` : ''} ${options.domain ? `domain=${options.domain};` : ''} ${options.secure ? 'secure;' : ''} ${options.sameSite ? `SameSite=${options.sameSite};` : ''}`;
        });
      },
    },
  });
}
