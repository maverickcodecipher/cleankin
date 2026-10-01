'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthenticated, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-background border border-slate-200 rounded-3xl shadow-2xl overflow-hidden transform transition-all p-8 md:p-10 text-left outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Sign in to CleanKin</h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xs mx-auto leading-normal">
            Track cleanup drives and organize community action across Chennai.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700 text-center">You are already signed in.</p>
            <button
              type="button"
              onClick={() => { signOut(); setIsOpen(false); }}
              className="w-full py-3 rounded-full bg-dump-rose text-white font-bold text-sm hover:brightness-110 transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              }).catch((e: any) => console.error(e));
              setIsOpen(false);
            }}
            type="button"
            className="w-full flex items-center justify-center h-13 px-4 rounded-full border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 font-bold text-base transition-colors shadow-sm focus:outline-none"
          >
            <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        )}

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 border-t border-slate-200"></div>
          <span className="relative bg-background px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            or sign in with email/phone
          </span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setIsOpen(false); }} className="space-y-4">
          <div>
            <label htmlFor="auth-name" className="block text-sm font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="auth-name"
              type="text"
              required
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-600 focus:outline-none text-base text-slate-800 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="auth-email" className="block text-sm font-bold text-slate-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="auth-email"
              type="email"
              required
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-600 focus:outline-none text-base text-slate-800 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full h-13 mt-2 rounded-full bg-slate-800 text-white font-bold text-base hover:bg-slate-900 transition-colors focus:outline-none flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 shrink-0" />
            Continue
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6 font-medium leading-relaxed">
          We respect your privacy. No spam, ever.
        </p>
      </div>
    </div>
  );
}
