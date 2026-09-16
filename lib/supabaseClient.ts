import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mjdpnckgqqubmopmtjtz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Offline-safe stub: every chained call (from/insert/select/order/...)
 * returns an awaitable that resolves to { data: null, error }, so the app
 * never crashes when env keys are missing during local testing.
 */
function createOfflineStub(): SupabaseClient {
  const stubError = new Error('Supabase not configured (missing env keys)');
  const makeNode: any = () =>
    new Proxy(
      (..._args: unknown[]) => makeNode(),
      {
        get: (_target, prop) => {
          if (prop === 'then') {
            return (resolve: (v: unknown) => void) =>
              resolve({ data: null, error: stubError });
          }
          return (..._args: unknown[]) => makeNode();
        },
      }
    );
  return makeNode() as SupabaseClient;
}

function createSafeClient(): SupabaseClient {
  try {
    if (!supabaseAnonKey) throw new Error('Missing Supabase anon key');
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    console.warn(
      'Supabase is not configured (missing env keys). Using offline stub; data stays local.'
    );
    return createOfflineStub();
  }
}

export const supabase: SupabaseClient = createSafeClient();
