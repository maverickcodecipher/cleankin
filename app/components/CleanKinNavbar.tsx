'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Megaphone, Menu, X } from 'lucide-react';

export const CLEANKIN_REPORT_EVENT = 'cleankin:open-report';

const CLEANKIN_LINKS = [
  { href: '/cleankin', label: 'Home' },
  { href: '/cleankin#map', label: 'Map' },
  { href: '/cleankin#drives', label: 'Active Drives' },
];

export default function CleanKinNavbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full left-0 right-0 bg-[#060A08]/92 backdrop-blur-md border-b border-[#1D2B23]">
        <div className="px-6 py-3 flex items-center justify-between gap-4 flex-nowrap whitespace-nowrap w-full">
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/cleankin"
              className="text-2xl font-black tracking-tight text-white transition-colors duration-200"
              onClick={closeMenu}
            >
              CleanKin<span className="text-[#35F27C]">.</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium shrink-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('cleankin:open-report'))}
              className="relative px-4 py-2 rounded-full transition-all duration-200 ease-in-out text-[#93A89A] hover:text-white"
            >
              Report Spot
            </button>
            {CLEANKIN_LINKS.filter(l => l.href !== '/cleankin').map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 rounded-full transition-all duration-200 ease-in-out text-[#93A89A] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('cleankin:open-report'))}
              className="h-10 px-5 rounded-full bg-[#35F27C] text-[#04120A] text-sm font-black transition-all duration-200 ease-in-out inline-flex items-center shadow-[0_0_18px_rgba(53,242,124,0.4)] hover:brightness-110 whitespace-nowrap"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Report a Dump Spot
            </button>

            <div className="flex items-center ml-2 border-l border-[#1D2B23] pl-4 h-8">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name ?? 'User'} className="w-10 h-10 rounded-full object-cover border-2 border-[#35F27C]/70 shadow-[0_0_12px_rgba(53,242,124,0.35)]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#35F27C] text-[#04120A] flex items-center justify-center font-black text-base shadow-sm">
                        {(user.name ?? '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-sm font-bold text-white leading-none mb-0.5">{user.name}</span>
                      <span className="text-[11px] font-bold text-[#35F27C] leading-none">Arena Player</span>
                    </div>
                  </div>
                  <button onClick={handleSignOut} className="px-4 py-2 rounded-full border border-[#1D2B23] text-xs font-bold text-[#93A89A] hover:text-[#FF5470] hover:bg-[#FF5470]/10 hover:border-[#FF5470]/40 transition-all flex items-center gap-1.5 focus:outline-none" aria-label="Sign out">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => window.dispatchEvent(new Event('cleankin:open-report'))} className="px-5 py-2.5 rounded-full text-[#35F27C] hover:bg-[#35F27C]/10 font-bold text-sm transition-all focus:outline-none flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#35F27C] hover:bg-[#35F27C]/10 transition-colors focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={closeMenu}
        >
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={closeMenu}
          />
            <div
              className="absolute top-0 right-0 bottom-0 w-72 bg-[#0B100D] border-l border-[#1D2B23] shadow-2xl overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col p-4 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event('cleankin:open-report'));
                    closeMenu();
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-[#35F27C] text-[#04120A] font-black flex items-center justify-center gap-2 transition-colors focus:outline-none"
                >
                  <Megaphone className="w-4 h-4" />
                  Report a Dump Spot
                </button>
                {CLEANKIN_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="px-4 py-3 rounded-xl text-[#E9F5ED] font-semibold hover:bg-[#35F27C]/10 transition-colors focus:outline-none"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-[#1D2B23] pt-4 mt-2">
                  {isAuthenticated && user ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 px-4">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name ?? 'User'} className="w-10 h-10 rounded-full object-cover border-2 border-[#35F27C]/70" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#35F27C] text-[#04120A] flex items-center justify-center font-black">
                            {(user.name ?? '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-xs font-bold text-[#35F27C]">Arena Player</p>
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-3 rounded-xl text-[#FF5470] font-semibold hover:bg-[#FF5470]/10 transition-colors text-left focus:outline-none"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { window.dispatchEvent(new Event('cleankin:open-report')); closeMenu(); }}
                      className="w-full text-left px-4 py-3 rounded-xl text-[#35F27C] font-semibold hover:bg-[#35F27C]/10 transition-colors focus:outline-none"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}
    </>
  );
}
