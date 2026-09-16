'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Megaphone } from 'lucide-react';

const CLEANKIN_LINKS = [
  { href: '/cleankin', label: 'Home' },
  { href: '/cleankin#map', label: 'Chennai Map' },
  { href: '/cleankin#drives', label: 'Active Drives' },
];

export default function CleanKinNavbar() {
  const { isAuthenticated, user, openAuthModal, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-teal-200">
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-nowrap whitespace-nowrap w-full">
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/cleankin"
            className="text-2xl font-bold tracking-tight transition-colors duration-200"
            style={{ color: '#0D5C75' }}
          >
            CleanKin
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium shrink-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('cleankin:open-report'))}
            className="relative px-4 py-2 rounded-full transition-all duration-200 ease-in-out text-gray-600 hover:text-gray-900 hover:bg-slate-100"
          >
            Report Spot
          </button>
          {CLEANKIN_LINKS.filter(l => l.href !== '/cleankin').map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 rounded-full transition-all duration-200 ease-in-out text-gray-600 hover:text-gray-900 hover:bg-slate-100"
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
      </div>
    </nav>
  );
}
