'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>({
    id: 'mock-user-123',
    email: 'demo@odos.app',
    user_metadata: { display_name: 'Demo User' },
  });
  const [session, setSession] = useState<any>({
    access_token: 'mock-token',
    user: {
      id: 'mock-user-123',
      email: 'demo@odos.app',
    },
  });
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(
    async (email: string, password: string) => {
      return { error: null };
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, _displayName: string) => {
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    // do nothing
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut }}
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
