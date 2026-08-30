import { createApiClient } from '@odos/api-client';
import { createClient } from '@/lib/auth/supabase';

function getApiUrl(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (isProd && !url) {
    console.error('NEXT_PUBLIC_API_URL environment variable is strictly required in production.');
  }
  return url || 'http://localhost:4000/api/v1';
}

/**
 * Preconfigured API client communicating with the API Gateway.
 * Uses the shared @odos/api-client factory with Supabase JWT injection.
 */
const apiClient = createApiClient({
  baseURL: getApiUrl(),
  getToken: async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Rather than a destructive hard-reload that causes redirect loops 
      // on transient race conditions, we simply log it or dispatch an event.
      // The true authentication state is managed by Supabase and AuthProvider.
      console.warn('[API CLIENT] 401 Unauthorized received from backend');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
