"use client";
import React, { useState, useEffect } from 'react';
import { ProgressData } from '../../hooks/useProgress';
import { Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function AIProgressInterpreter({ data }: { data: ProgressData }) {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInterpretation = async () => {
      setLoading(true);
      try {
        // We pass the deterministic raw numbers to the AI to write a natural language summary.
        // It DOES NOT calculate the metrics.
        const res = await apiClient.post('/ai/chat', { 
          message: "Interpret my progress metrics",
          context: { progressMetrics: data },
          systemPrompt: "You are an AI Tutor. Summarize the user's progress strictly based on the provided JSON data. Be motivating but honest about delays."
        });
        setInterpretation(res.data.content);
      } catch (err) {
        // Mock fallback
        setInterpretation(`You have completed ${data.overallCompletion}% of your journey. You are slightly behind by ${data.scheduleDelay} days, but maintaining a ${data.currentStreak} day streak! Keep pushing your average session time of ${data.avgSessionDuration} minutes.`);
      } finally {
        setLoading(false);
      }
    };
    fetchInterpretation();
  }, [data]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 flex items-start shadow-sm mb-8">
      <div className="bg-white p-2 rounded-full shadow-sm mr-4 mt-1 border border-blue-100 flex-shrink-0">
        <Sparkles className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-bold text-blue-900 mb-1">AI Insights</h3>
        {loading ? (
          <div className="flex items-center text-sm text-blue-600 font-medium">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing progress...
          </div>
        ) : (
          <p className="text-sm text-blue-800 leading-relaxed">
            {interpretation}
          </p>
        )}
      </div>
    </div>
  );
}

