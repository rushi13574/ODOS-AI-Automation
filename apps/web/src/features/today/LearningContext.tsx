"use client";
import React from 'react';
import { BookOpen, Link as LinkIcon, Lightbulb } from 'lucide-react';

interface LearningContextProps {
  objectives: string[];
  resources: any[];
}

export function LearningContext({ objectives, resources }: LearningContextProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <TargetIcon className="w-5 h-5 mr-2 text-blue-600" />
          Today's Objectives
        </h3>
        {objectives.length === 0 ? (
          <p className="text-gray-500 text-sm">No specific objectives for today.</p>
        ) : (
          <ul className="space-y-3">
            {objectives.map((obj, i) => (
              <li key={i} className="flex items-start text-sm text-gray-700">
                <span className="min-w-[24px] h-6 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md text-xs font-bold mr-3 mt-0.5">{i+1}</span>
                {obj}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Recommended Resources
        </h3>
        {resources.length === 0 ? (
          <p className="text-gray-500 text-sm">No resources linked for today's module.</p>
        ) : (
          <div className="space-y-3">
            {resources.map((res, i) => (
              <a 
                key={i} 
                href={res.url} 
                target="_blank" 
                rel="noreferrer"
                className="group flex flex-col p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-blue-700 mb-1">
                  <LinkIcon className="w-3 h-3 mr-1.5 opacity-50" />
                  {res.title}
                </div>
                <span className="text-xs text-gray-500 capitalize ml-5">{res.type}</span>
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex items-start space-x-3 text-blue-800">
        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          <strong>Tip:</strong> Don't worry if you don't finish a task! Submit partial progress and our AI Scheduler will automatically carry it forward to tomorrow without messing up your learning flow.
        </p>
      </div>
    </div>
  );
}

// Inline TargetIcon to avoid circular import if needed
function TargetIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

