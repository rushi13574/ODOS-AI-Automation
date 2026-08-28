"use client";
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
import { queryCache } from '../lib/cache';
import { useAuth } from '../lib/auth/auth-provider';

/**
 * Fetches the current user's LearningGoals.
 *
 * LOADING CONTRACT:
 *   • `loading` starts as `true`.
 *   • `loading` becomes `false` ONLY after the API request has resolved
 *     (success or error). It is never set to `false` from cached data alone
 *     unless the cache proves the user has goals (length > 0).
 *   • This prevents the `(app)/layout.tsx` guard from seeing
 *     `loading=false, goals=[]` before the network request finishes, which
 *     would incorrectly redirect existing users to `/onboarding`.
 *
 * CACHE KEY is scoped to the authenticated user's ID:
 *   `learning-goals:${user.id}`
 */
export function useLearningGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);

  // Track whether we've completed at least one full network fetch for the
  // current user. This prevents treating stale/empty cache as authoritative.
  const hasFetchedRef = useRef(false);

  // DERIVED LOADING STATE:
  // If the hook is internally loading OR if the authenticated user has changed
  // and we haven't finished fetching their specific goals yet, force loading to true.
  // This completely eliminates the 1-render-cycle race condition that causes
  // the layout to incorrectly redirect to /onboarding on page refresh.
  const isActuallyLoading = loading || (!!user && fetchedUserId !== user.id);

  useEffect(() => {
    // Reset state when user changes (login/logout)
    hasFetchedRef.current = false;
    setGoals([]);
    setLoading(true);
    setError(null);

    if (!user) {
      setLoading(false);
      setFetchedUserId(null);
      return;
    }

    const cacheKey = `learning-goals:${user.id}`;
    let isMounted = true;

    const fetchGoals = async () => {
      try {
        // Read from cache immediately — but only use it to populate the UI
        // optimistically. Do NOT set loading=false from cache alone unless
        // we're confident (length > 0). An empty cache is ambiguous: it
        // could mean "new user" or "stale cache from a previous session".
        const cachedGoals = queryCache.getCache<any[]>(cacheKey);
        if (cachedGoals && isMounted) {
          setGoals(cachedGoals);
          if (cachedGoals.length > 0) {
            // User definitely has goals — safe to stop loading early for UI.
            setLoading(false);
            setFetchedUserId(user.id);
          }
          // If cachedGoals.length === 0, keep loading=true until network
          // confirms it. This avoids the premature redirect bug.
        }

        // Always hit the network to get fresh data
        const res = await queryCache.getOrFetch(cacheKey, async () => {
          const r = await apiClient.get('/learning-goals');
          return r.data;
        });

        if (isMounted) {
          setGoals(res || []);
          setError(null);
          hasFetchedRef.current = true;
          setFetchedUserId(user.id);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGoals();
    return () => { isMounted = false; };
  }, [user]);

  return { goals, loading: isActuallyLoading, error };
}
