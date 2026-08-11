"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/documents');
        setDocuments(res.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const generateDocument = async (data: any) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/documents/generate', data);
      setDocuments((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = async (id: string) => {
    const res = await apiClient.get(`/documents/${id}/download`);
    return res.data.url;
  };

  return { documents, loading, error, generateDocument, getDownloadUrl };
}

