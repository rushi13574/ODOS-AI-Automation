import apiClient from './api/client';

// API Gateway URL
function getApiUrl(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (isProd && !url) {
    console.error('NEXT_PUBLIC_API_URL environment variable is strictly required in production.');
  }
  return url || 'http://localhost:4000/api/v1';
}

export const API_URL = getApiUrl();

export { apiClient };
