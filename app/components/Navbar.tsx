'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import type { SupabaseUser } from '@/utils/supabase/client';
import MyReportsModal from './MyReportsModal';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showMyReports, setShowMyReports] = useState(false);
  const { signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name ?? null,
          email: (session.user.email ?? null) as string | null,
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
        });
      } else {
        setUser(null);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          id: user.id,
          name: user.user_metadata?.name ?? null,
          email: (user.email ?? null) as string | null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-[#060A08]/92 backdrop-blur-md border-b border-[#1D2B23]">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-tight text-white">CleanKin<span className="text-[#35F27C]">.</span></span>
            <span className="inline-block w-3 h-3 rounded-full bg-[#35F27C] shadow-[0_0_12px_rgba(53,242,124,0.9)]" />
          </Link>

          <div className="flex items-center gap-3">
            {!user ? (
              <button
                type="button"
                onClick={handleSignIn}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#35F27C] text-[#04120A] text-sm font-black hover:brightness-110 transition-all focus:outline-none shadow-[0_0_18px_rgba(53,242,124,0.4)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            ) : (
              <>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name ?? 'User'} className="w-9 h-9 rounded-full object-cover border-2 border-[#35F27C]/60" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#35F27C] text-[#04120A] flex items-center justify-center font-black text-sm">
                    {(user.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-bold text-white hidden sm:block">{user.name}</span>
                <button
                  type="button"
                  onClick={() => setShowMyReports(true)}
                  className="px-4 py-2 rounded-full text-sm font-black text-[#04120A] bg-[#35F27C] hover:brightness-110 transition-all focus:outline-none"
                >
                  My Reports
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full text-sm font-bold text-[#93A89A] hover:text-[#FF5470] hover:bg-[#FF5470]/10 border border-transparent hover:border-[#FF5470]/30 transition-all focus:outline-none"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      {showMyReports && (
        <MyReportsModal open={showMyReports} onClose={() => setShowMyReports(false)} />
      )}
    </>
  );
}
