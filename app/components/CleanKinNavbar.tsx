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
  const { isAuthenticated, user, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-teal-200">
        <div className="px-6 py-3 flex items-center justify-between gap-4 flex-nowrap whitespace-nowrap w-full">
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/cleankin"
              className="text-2xl font-bold tracking-tight transition-colors duration-200"
              style={{ color: '#0D5C75' }}
              onClick={closeMenu}
            >
              CleanKin
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium shrink-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('cleankin:open-report'))}
              className="relative px-4 py-2 rounded-full transition-all duration-200 ease-in-out text-gray-600 hover:text-gray-900"
            >
              Report Spot
            </button>
            {CLEANKIN_LINKS.filter(l => l.href !== '/cleankin').map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 rounded-full transition-all duration-200 ease-in-out text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('cleankin:open-report'))}
              className="h-10 px-5 rounded-full text-white text-sm font-bold transition-all duration-200 ease-in-out inline-flex items-center shadow-sm hover:brightness-110 whitespace-nowrap"
              style={{ backgroundColor: '#0D5C75' }}
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Report a Dump Spot
            </button>

            <div className="flex items-center ml-2 border-l border-slate-200 pl-4 h-8">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-teal-600 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-sm font-bold text-slate-800 leading-none mb-0.5">{user.name}</span>
                      <span className="text-[11px] font-medium text-slate-500 leading-none">Volunteer</span>
                    </div>
                  </div>
                  <button onClick={logout} className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-1.5 focus:outline-none" aria-label="Sign out">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => openAuthModal()} className="px-5 py-2.5 rounded-full text-teal-800 hover:bg-teal-50 font-bold text-sm transition-all focus:outline-none flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#0D5C75] hover:bg-slate-100 transition-colors focus:outline-none"
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
              className="absolute top-0 right-0 bottom-0 w-72 bg-white dark:bg-neutral-900 shadow-2xl overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col p-4 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event('cleankin:open-report'));
                    closeMenu();
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 dark:text-gray-100 font-semibold hover:bg-teal-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
                >
                  Report Spot
                </button>
                {CLEANKIN_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-100 font-semibold hover:bg-teal-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-slate-200 dark:border-neutral-700 pt-4 mt-2">
                  {isAuthenticated && user ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 px-4">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-teal-600" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-gray-100">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400">Volunteer</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { logout(); closeMenu(); }}
                        className="px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left focus:outline-none"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { openAuthModal(); closeMenu(); }}
                      className="w-full text-left px-4 py-3 rounded-xl text-teal-800 dark:text-teal-400 font-semibold hover:bg-teal-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
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
