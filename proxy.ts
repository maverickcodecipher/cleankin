import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((c) => ({
            name: c.name,
            value: c.value,
            options: { path: '/' },
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              path: options?.path ?? '/',
              ...(options.maxAge ? { maxAge: options.maxAge } : {}),
              ...(options.domain ? { domain: options.domain } : {}),
              ...(options.secure ? { secure: options.secure } : {}),
              ...(options.sameSite ? { sameSite: options.sameSite } : {}),
            });
          });
        },
      },
    }
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // token refresh failure is non-fatal
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
