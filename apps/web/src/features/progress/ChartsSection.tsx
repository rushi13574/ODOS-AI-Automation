"use client";
import React from 'react';
import { ProgressData } from '../../hooks/useProgress';
import { BarChart3, Clock, TrendingUp, AlertCircle, CalendarDays } from 'lucide-react';

export function ChartsSection({ data }: { data: ProgressData }) {
  const maxWeeklyHour = Math.max(...data.chartData.weeklyLearning.map(d => d.hours), 1);
  const maxMonthlyHour = Math.max(...data.chartData.monthlyLearning.map(d => d.hours), 1);
  const maxTasksCompleted = Math.max(...data.chartData.tasksCompletedOverTime.map(d => d.count), 1);
  const maxDelay = Math.max(...data.chartData.scheduleDelayHistory.map(d => d.delay), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      {/* Planned vs Actual Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center text-gray-900 mb-6">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="font-bold">Planned vs Actual Hours</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-gray-500">Planned Hours</span>
              <span className="text-gray-900">{data.plannedHours}h</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-gray-400 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-gray-500">Actual Hours</span>
              <span className="text-gray-900">{data.actualHours}h</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${data.actualHours < data.plannedHours ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min((data.actualHours / Math.max(data.plannedHours, 1)) * 100, 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Completed Over Time */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center text-gray-900 mb-6">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="font-bold">Tasks Completed (Cumulative)</h3>
        </div>
        
        <div className="h-40 flex items-end justify-between space-x-2">
          {data.chartData.tasksCompletedOverTime.map((pt, i) => {
            const height = (pt.count / maxTasksCompleted) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-full bg-emerald-100 rounded-t-sm relative group transition-all hover:bg-emerald-200" style={{ height: `${Math.max(height, 5)}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                     {pt.count} tasks
                   </div>
                   <div className="w-full bg-emerald-500 rounded-t-sm absolute bottom-0" style={{ height: '100%' }} />
                </div>
                <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase truncate max-w-full">{pt.date.split(' ')[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center text-gray-900 mb-6">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="font-bold">Weekly Learning (Hours)</h3>
        </div>
        
        <div className="h-40 flex items-end justify-between space-x-2">
          {data.chartData.weeklyLearning.map((day, i) => {
            const height = (day.hours / maxWeeklyHour) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-full bg-blue-100 rounded-t-sm relative group transition-all hover:bg-blue-200" style={{ height: `${Math.max(height, 5)}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                     {day.hours}h
                   </div>
                   <div className="w-full bg-blue-500 rounded-t-sm absolute bottom-0" style={{ height: '100%' }} />
                </div>
                <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{day.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center text-gray-900 mb-6">
          <CalendarDays className="w-5 h-5 mr-2 text-purple-600" />
          <h3 className="font-bold">Monthly Learning (Hours)</h3>
        </div>
        
        <div className="h-40 flex items-end justify-between space-x-4">
          {data.chartData.monthlyLearning.map((week, i) => {
            const height = (week.hours / maxMonthlyHour) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-full bg-purple-100 rounded-t-sm relative group transition-all hover:bg-purple-200" style={{ height: `${Math.max(height, 5)}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                     {week.hours}h
                   </div>
                   <div className="w-full bg-purple-500 rounded-t-sm absolute bottom-0" style={{ height: '100%' }} />
                </div>
                <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{week.week}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Delay */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
        <div className="flex items-center text-gray-900 mb-6">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
          <h3 className="font-bold">Schedule Delay (Days)</h3>
        </div>
        
        <div className="h-40 flex items-end justify-between space-x-2">
          {data.chartData.scheduleDelayHistory.map((pt, i) => {
            const height = (pt.delay / maxDelay) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-full bg-red-100 rounded-t-sm relative group transition-all hover:bg-red-200" style={{ height: `${Math.max(height, 5)}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                     +{pt.delay}
                   </div>
                   <div className="w-full bg-red-500 rounded-t-sm absolute bottom-0" style={{ height: '100%' }} />
                </div>
                <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase truncate max-w-full">{pt.date.split(' ')[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

