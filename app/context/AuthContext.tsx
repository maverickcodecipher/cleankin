'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, name: string, phone?: string) => void;
  logout: () => void;
  
  // Auth modal management state
  isAuthModalOpen: boolean;
  authModalPrompt: string | null;
  openAuthModal: (prompt?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Rehydrate auth state on mount
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('nearkin-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
  }, []);

  const loginWithGoogle = () => {
    const mockGoogleUser: User = {
      id: 'google-user-123',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
    };
    setUser(mockGoogleUser);
    localStorage.setItem('nearkin-user', JSON.stringify(mockGoogleUser));
    closeAuthModal();
  };

  const loginWithEmail = (email: string, name: string, phone?: string) => {
    const mockEmailUser: User = {
      id: `email-user-${Date.now()}`,
      name: name || 'Family Member',
      email: email,
      phone: phone || '',
      // Initial-based fallback or a clean geometric placeholder
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Family Member')}&background=4a6d5b&color=ffffff&size=120&bold=true`
    };
    setUser(mockEmailUser);
    localStorage.setItem('nearkin-user', JSON.stringify(mockEmailUser));
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nearkin-user');
  };

  const openAuthModal = (prompt?: string) => {
    setAuthModalPrompt(prompt || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalPrompt(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithEmail,
        logout,
        isAuthModalOpen,
        authModalPrompt,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
