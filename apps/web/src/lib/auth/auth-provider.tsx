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
import { queryCache } from '@/lib/cache';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;

  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{
    error: Error | null;
    session: Session | null;
    user: User | null;
  }>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Initialize the authentication state when the application loads.
   */
  useEffect(() => {
    const supabase = createClient();

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          // A refresh token can be invalidated when it is rotated in another
          // tab/device. Clear only local storage so a stale cookie cannot
          // repeatedly force the dashboard back to login.
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
          setUser(null);
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    /*
     * Keep the application state synchronized with Supabase.
     *
     * This catches:
     * - SIGNED_IN
     * - SIGNED_OUT
     * - TOKEN_REFRESHED
     * - USER_UPDATED
     * etc.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Sign in an existing user.
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        error: error as Error | null,
      };
    },
    [],
  );

  /*
   * Create a new user.
   *
   * Important:
   * When Supabase email confirmation is enabled,
   * data.session will be null after signup.
   *
   * That means:
   *
   * Account created
   *       +
   * Email confirmation required
   *       =
   * session === null
   *
   * The signup page uses this information to show
   * the "check your email" state instead of sending
   * the user directly to the dashboard.
   */
  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName,
          },
        },
      });

      return {
        error: error as Error | null,
        session: data.session,
        user: data.user,
      };
    },
    [],
  );

  /*
   * Sign out the current user.
   */
  const signOut = useCallback(async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }

    queryCache.clear();
    setSession(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
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
