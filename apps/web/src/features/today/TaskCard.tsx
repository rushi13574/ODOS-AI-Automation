"use client";
import React, { useState } from 'react';
import { Task } from '../../hooks/useToday';
import { Play, Pause, CheckCircle, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  onPartialComplete: (id: string, mins: number) => void;
}

export function TaskCard({ task, onStart, onPause, onComplete, onPartialComplete }: TaskCardProps) {
  const [partialMins, setPartialMins] = useState(task.completedMinutes);
  const [showPartialInput, setShowPartialInput] = useState(false);

  const getStatusColor = () => {
    switch(task.status) {
      case 'completed': return 'border-emerald-500 bg-emerald-50';
      case 'in_progress': return 'border-blue-500 bg-blue-50';
      case 'paused': return 'border-amber-400 bg-amber-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const handlePartialSubmit = () => {
    onPartialComplete(task.id, partialMins);
    setShowPartialInput(false);
  };

  return (
    <div className={`rounded-xl border-l-4 shadow-sm p-5 mb-4 transition-all ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
            {task.type}
          </span>
          <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {task.title}
          </h3>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-100">
          <Clock className="w-4 h-4 mr-1 text-gray-400"/>
          {task.completedMinutes} / {task.estimatedMinutes} m
        </div>
      </div>

      <div className="w-full bg-black/5 rounded-full h-1.5 mb-4 overflow-hidden">
        <div 
          className={`h-1.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
          style={{ width: `${Math.min(100, (task.completedMinutes / task.estimatedMinutes) * 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-2">
          {task.status !== 'completed' && task.status !== 'in_progress' && (
            <button onClick={() => onStart(task.id)} className="flex items-center text-sm font-medium bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors">
              <Play className="w-4 h-4 mr-1" /> Start
            </button>
          )}
          
          {task.status === 'in_progress' && (
            <button onClick={() => onPause(task.id)} className="flex items-center text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-md hover:bg-amber-200 transition-colors">
              <Pause className="w-4 h-4 mr-1" /> Pause
            </button>
          )}

          {task.status !== 'completed' && (
            <button onClick={() => onComplete(task.id)} className="flex items-center text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-md hover:bg-emerald-200 transition-colors">
              <CheckCircle className="w-4 h-4 mr-1" /> Complete
            </button>
          )}
        </div>

        {task.status !== 'completed' && (
          <div className="relative">
            {showPartialInput ? (
              <div className="flex items-center space-x-2 bg-white p-1 rounded-md border border-gray-200 shadow-sm">
                <input 
                  type="number" 
                  className="w-16 text-sm p-1 border border-gray-200 rounded" 
                  value={partialMins}
                  onChange={(e) => setPartialMins(Number(e.target.value))}
                  min={0}
                  max={task.estimatedMinutes}
                />
                <span className="text-xs text-gray-500">m</span>
                <button onClick={handlePartialSubmit} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Save</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowPartialInput(true)} 
                className="text-xs font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2"
              >
                Log partial progress
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

