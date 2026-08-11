"use client";
import React from 'react';
import { ProgressData } from '../../hooks/useProgress';
import { CalendarRange, CalendarClock, ArrowRight } from 'lucide-react';

export function CompletionDatesCard({ data }: { data: ProgressData }) {
  const isDelayed = data.scheduleDelay > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
      
      <div className="flex-1 w-full mb-6 md:mb-0">
        <div className="flex items-center text-gray-500 mb-2">
          <CalendarRange className="w-5 h-5 mr-2" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Baseline Target</h3>
        </div>
        <div className="text-xl font-bold text-gray-900">{new Date(data.baselineCompletionDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <p className="text-xs text-gray-400 mt-1">Your immutable original goal.</p>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center px-8 flex-shrink-0">
        <ArrowRight className="w-6 h-6 text-gray-300 mb-1" />
        {isDelayed ? (
           <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">+{data.scheduleDelay} Days</span>
        ) : (
           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">On Track</span>
        )}
      </div>

      <div className="flex-1 w-full md:text-right">
        <div className="flex items-center md:justify-end text-blue-600 mb-2">
          <CalendarClock className="w-5 h-5 mr-2" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Current Projection</h3>
        </div>
        <div className={`text-xl font-bold ${isDelayed ? 'text-red-600' : 'text-emerald-600'}`}>
          {new Date(data.currentProjectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <p className="text-xs text-gray-400 mt-1">Adaptive based on your pacing.</p>
      </div>

    </div>
  );
}

