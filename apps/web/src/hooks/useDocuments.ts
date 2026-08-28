"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export enum DocumentType {
  PDF = 'pdf',
  DOCX = 'docx',
  MD = 'md',
}

export enum DocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  EXPIRED = 'expired',
}

export interface GeneratedDocument {
  id: string;
  documentId: string;
  userId: string;
  skillId: string;
  title: string;
  type: DocumentType;
  version: string;
  storageKey: string;
  month: string;
  status: DocumentStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export function useDocuments(skillId?: string) {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = skillId ? { skillId } : {};
      const res = await apiClient.get('/documents', { params });
      setDocuments(res.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, refetch: fetchDocuments };
}

export function useDocumentDetails(documentId?: string) {
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!documentId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/documents/${documentId}`);
        if (isMounted) {
          setDocument(res.data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`Failed to fetch details for document ${documentId}:`, err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  return { document, loading, error };
}

export function useDocumentDownload() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getDownloadUrl = async (documentId: string): Promise<string | null> => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/documents/${documentId}/download`);
      setError(null);
      return res.data?.url || null;
    } catch (err: any) {
      console.error(`Failed to fetch download URL for document ${documentId}:`, err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getDownloadUrl, loading, error };
}
