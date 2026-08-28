import apiClient from './api/client';

// API Gateway URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export { apiClient };
