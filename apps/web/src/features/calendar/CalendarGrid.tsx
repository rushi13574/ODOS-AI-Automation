"use client";
import React, { useState } from 'react';
import { CalendarTask } from '../../hooks/useCalendar';
import { format, addMonths, subMonths } from 'date-fns';
import { scheduleDayToLocalDate, scheduleDayWeekday, todayScheduleDay } from '@/lib/schedule-date';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  tasks: CalendarTask[];
  mode: 'baseline' | 'current';
  onSelectTask: (task: CalendarTask) => void;
}

function getTodayString() {
  return todayScheduleDay();
}

export function CalendarGrid({ tasks, mode, onSelectTask }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const todayStr = getTodayString();
  const isBaseline = mode === 'baseline';

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToday = () => setCurrentMonth(new Date());

  const currentMonthStr = format(currentMonth, 'yyyy-MM');

  // Filter tasks to the current month (and overdue tasks from previous months in current mode)
  const relevantTasks = tasks.filter(t => {
    const taskMonthStr = t.date.substring(0, 7);
    if (taskMonthStr === currentMonthStr) return true;
    
    // Include overdue tasks in the current month view if they haven't been completed
    if (!isBaseline && t.status === 'overdue' && t.date < todayStr && currentMonthStr === todayStr.substring(0, 7)) {
      return true;
    }
    return false;
  });

  // Group by date
  const groupedByDate = relevantTasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, CalendarTask[]>);

  // Always ensure 'Today' is included in the groups if we are looking at the current month
  if (currentMonthStr === todayStr.substring(0, 7) && !groupedByDate[todayStr]) {
    groupedByDate[todayStr] = [];
  }

  const sortedDates = Object.keys(groupedByDate).sort();

  // Group operational dates by week start date (Sunday)
  const weeksMap = new Map<string, string[]>();
  sortedDates.forEach(dateStr => {
    const dateObj = scheduleDayToLocalDate(dateStr);
    if (!dateObj) return;
    const weekStartDate = new Date(dateObj);
    weekStartDate.setDate(dateObj.getDate() - dateObj.getDay());
    const weekStart = todayScheduleDay(weekStartDate);
    if (!weeksMap.has(weekStart)) {
      weeksMap.set(weekStart, []);
    }
    weeksMap.get(weekStart)!.push(dateStr);
  });

  const sortedWeeks = Array.from(weeksMap.keys()).sort();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-light)] overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)] bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 border rounded hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={goToday} className="px-3 py-1 border rounded text-sm font-medium hover:bg-gray-100 transition-colors text-gray-700">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 border rounded hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {sortedDates.length === 0 ? (
        <div className="text-gray-500 py-16 text-center bg-gray-50/30">
          <p className="text-sm font-medium">No learning sessions scheduled for this month.</p>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center font-bold text-xs tracking-widest text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {sortedWeeks.map(weekStart => {
              const weekDates = weeksMap.get(weekStart)!;
              return (
                <div key={weekStart} className="grid grid-cols-7 gap-4">
                  {weekDates.map(dateStr => {
                    const isToday = dateStr === todayStr;
                    const dayTasks = groupedByDate[dateStr];
                    const displayDate = scheduleDayToLocalDate(dateStr);
                    const dayOfWeek = scheduleDayWeekday(dateStr);
                    if (!displayDate || dayOfWeek === null) return null;
                    const dateFormatted = format(displayDate, 'dd');
                    const monthFormatted = format(displayDate, 'MMM').toUpperCase();

                    return (
                      <div 
                        key={dateStr}
                        style={{ gridColumnStart: dayOfWeek + 1 }}
                        className={`flex flex-col rounded-xl border p-3 transition-colors ${
                          isToday 
                            ? 'bg-blue-50/30 border-blue-200 ring-1 ring-blue-50 shadow-sm' 
                            : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-black ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                              {dateFormatted}
                            </span>
                            <span className={`text-xs font-bold ${isToday ? 'text-blue-700' : 'text-gray-500'}`}>
                              {monthFormatted}
                            </span>
                          </div>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-blue-600 text-white">
                              TODAY
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          {dayTasks.length === 0 ? (
                            <div className="text-xs text-gray-400 font-medium py-1">No tasks</div>
                          ) : (
                            dayTasks.map(task => {
                              const isDone = task.status === 'completed' && !isBaseline;
                              const isOverdueTask = task.status === 'overdue' && !isBaseline;
                              
                              return (
                                <div key={task.id} className="flex flex-col gap-1.5 p-2 rounded-lg bg-gray-50/50 border border-transparent hover:border-gray-100 transition-colors">
                                  <div className="flex items-start gap-2">
                                    <div className="mt-0.5 shrink-0">
                                      {isDone ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : isOverdueTask ? (
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className={`text-xs font-bold truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`} title={task.title}>
                                        {task.title}
                                      </h4>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between pl-5.5">
                                    <span className="text-[10px] font-medium text-gray-500">{task.estimatedMinutes} min</span>
                                    {isOverdueTask && <span className="text-amber-600 bg-amber-100 px-1 py-0.5 rounded text-[9px] font-bold">OVERDUE</span>}
                                  </div>
                                  
                                  {!isBaseline && (
                                    <div className="pt-1.5 pl-5.5">
                                      <Button 
                                        onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                                        variant={isDone ? "outline" : isToday ? "default" : "secondary"}
                                        size="sm"
                                        className={`w-full h-7 text-[10px] font-semibold rounded-md px-2 ${isToday && !isDone ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                                      >
                                        {isDone ? 'Review' : 'Continue'}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

