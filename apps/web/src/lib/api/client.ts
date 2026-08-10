import { createApiClient } from '@odos/api-client';
import { createClient } from '@/lib/auth/supabase';

/**
 * Preconfigured API client communicating with the API Gateway.
 * Uses the shared @odos/api-client factory with Supabase JWT injection.
 */
const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
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

export default apiClient;
