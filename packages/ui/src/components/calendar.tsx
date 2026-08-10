import * as React from 'react';
import { cn } from '../utils';

export interface CalendarProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  className?: string;
}

export const Calendar = ({ selectedDate, onDateChange, className }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDayClick = (dayNum: number) => {
    const newDate = new Date(year, month, dayNum);
    onDateChange?.(newDate);
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDaysBefore = Array.from({ length: firstDay }, (_, i) => i);

  const isToday = (dayNum: number) => {
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (dayNum: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === dayNum &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  return (
    <div className={cn('p-4 glass rounded-2xl w-full max-w-sm border border-border/60', className)}>
      {/* Header Month / Nav Buttons */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={prevMonth}
          type="button"
          className="rounded-lg p-1.5 border border-border/40 hover:bg-secondary/40 text-foreground transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-foreground">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          type="button"
          className="rounded-lg p-1.5 border border-border/40 hover:bg-secondary/40 text-foreground transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center gap-1 pb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-xs font-bold text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 text-center gap-1">
        {/* Empty cells before month start */}
        {emptyDaysBefore.map((idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Days */}
        {daysArray.map((dayNum) => {
          const active = isSelected(dayNum);
          const current = isToday(dayNum);

          return (
            <button
              key={dayNum}
              onClick={() => handleDayClick(dayNum)}
              type="button"
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : current
                  ? 'bg-secondary border border-primary/50 text-foreground'
                  : 'hover:bg-secondary/40 text-foreground'
              )}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

Calendar.displayName = 'Calendar';
