import { Injectable } from '@nestjs/common';
import { differenceInDays, max } from 'date-fns';
import { ScheduledTask } from '../entities/scheduled-task.entity';

export interface CalendarComparisonResult {
  baselineCompletionDate: Date;
  currentProjectedCompletionDate: Date;
  delayDays: number;
}

@Injectable()
export class CalendarComparator {
  compare(tasks: ScheduledTask[]): CalendarComparisonResult {
    if (!tasks || tasks.length === 0) {
      const today = new Date();
      return {
        baselineCompletionDate: today,
        currentProjectedCompletionDate: today,
        delayDays: 0,
      };
    }

    const baselineDates = tasks.map(t => new Date(t.baselineDate));
    const currentDates = tasks.map(t => new Date(t.currentDate));

    const baselineCompletionDate = max(baselineDates);
    const currentProjectedCompletionDate = max(currentDates);

    // Calculate delay (how many days later the current projection is compared to baseline)
    const delayDays = differenceInDays(currentProjectedCompletionDate, baselineCompletionDate);

    return {
      baselineCompletionDate,
      currentProjectedCompletionDate,
      delayDays,
    };
  }
}
