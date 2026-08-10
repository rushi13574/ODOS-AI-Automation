import axios, { AxiosInstance } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  getToken?: () => Promise<string | null> | string | null;
}

/**
 * Creates and configures a standardized Axios client instance for interacting
 * with the API Gateway. Supports request-intercepted bearer tokens.
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  if (config.getToken) {
    client.interceptors.request.use(
      async (reqConfig) => {
        const token = await config.getToken?.();
        if (token) {
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
        return reqConfig;
      },
      (error) => Promise.reject(error),
    );
  }

  // Response interceptor for standardized error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Formats downstream Axios errors into standard formats if needed
      return Promise.reject(error);
    },
  );

  return client;
}
