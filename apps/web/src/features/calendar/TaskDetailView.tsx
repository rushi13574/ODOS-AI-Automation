"use client";
import React from 'react';
import Link from 'next/link';
import { CalendarTask } from '../../hooks/useCalendar';
import { X, Play, Clock, CheckCircle2 } from 'lucide-react';
import { useSkillContext } from '@/hooks/useSkillContext';

interface Props {
  task: CalendarTask | null;
  onClose: () => void;
}

export function TaskDetailView({ task, onClose }: Props) {
  const { activeGoal } = useSkillContext();
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Task Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span className="bg-gray-100 px-2 py-1 rounded-md">{task.date}</span>
              <span>•</span>
              <span>{task.module}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span className={`text-sm font-bold capitalize ${task.status === 'completed' ? 'text-emerald-600' :
                  task.status === 'in_progress' ? 'text-blue-600' :
                    'text-gray-600'
                }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-600">Estimated Duration</span>
              <span className="text-sm font-bold text-gray-900 flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                {task.estimatedMinutes} mins
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            {task.status !== 'completed' ? (
              <Link 
                href={`/skill/${activeGoal?.id}/learn/${task.skillNodeId}`}
                className="flex-1 flex justify-center items-center py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Task
              </Link>
            ) : (
              <button className="flex-1 flex justify-center items-center py-3 bg-emerald-100 text-emerald-800 font-bold rounded-lg cursor-default border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Completed
              </button>
            )}
            <button onClick={onClose} className="flex-1 flex justify-center items-center py-3 bg-white text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

