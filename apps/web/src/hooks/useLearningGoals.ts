"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useLearningGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Assuming a future endpoint for learning goals or part of profile
    setLoading(false);
  }, []);

  return { goals, loading, error };
}

