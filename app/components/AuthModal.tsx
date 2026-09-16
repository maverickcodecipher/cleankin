'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalPrompt,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Focus the first input or the close button for keyboard accessibility
    setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    loginWithEmail(email, name, phone);
    // Reset form fields
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-background border border-sage-200 rounded-3xl shadow-2xl overflow-hidden transform transition-all p-8 md:p-10 text-left outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Close authentication modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Custom Context-aware Prompt */}
        {authModalPrompt && (
          <div className="mb-6 p-4 bg-sage-50 border border-sage-200 rounded-2xl flex items-start gap-3 text-sage-800">
            <Sparkles className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold leading-relaxed">
              {authModalPrompt}
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center mb-8">
          <h2 id="auth-modal-title" className="text-3xl font-extrabold text-slate-900 mb-2">
            Sign in to NearKin
          </h2>
          <p id="auth-modal-description" className="text-slate-600 text-sm md:text-base max-w-xs mx-auto leading-normal">
            Track visits, read Pal notes, and ensure safe family coordination.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Google One-Tap Sign In */}
        <button
          onClick={loginWithGoogle}
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

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 border-t border-slate-200"></div>
          <span className="relative bg-background px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            or sign in with email/phone
          </span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-name" className="block text-sm font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="auth-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-sage-600 focus:outline-none text-base text-slate-800 transition-colors"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-sage-600 focus:outline-none text-base text-slate-800 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="auth-phone" className="block text-sm font-bold text-slate-700 mb-1.5">
              Mobile Number <span className="text-slate-400 font-medium">(optional)</span>
            </label>
            <input
              id="auth-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-sage-600 focus:outline-none text-base text-slate-800 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full h-13 mt-2 rounded-full bg-sage-800 text-white font-bold text-base hover:bg-sage-900 transition-colors focus:outline-none flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 shrink-0" />
            Continue
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6 font-medium leading-relaxed">
          We respect your privacy. No spam, ever.
        </p>
      </div>
    </div>
  );
}
