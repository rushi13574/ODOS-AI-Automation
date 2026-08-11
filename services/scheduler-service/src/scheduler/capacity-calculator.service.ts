import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';

export interface DailyCapacity {
  dateStr: string; // 'yyyy-MM-dd'
  availableMinutes: number;
}

@Injectable()
export class CapacityCalculator {
  /**
   * Generates a capacity map starting from a given date for a large number of days
   * to ensure we have enough "buckets" to schedule all tasks.
   */
  generateCapacityBuckets(startDate: Date, dailyMinutes: number, daysToProject = 365): Map<string, number> {
    const buckets = new Map<string, number>();
    let current = new Date(startDate);
    
    // Normalize to midnight UTC (or local, depending on timezone strategy, let's just use string YYYY-MM-DD)
    for (let i = 0; i < daysToProject; i++) {
      const dateStr = format(current, 'yyyy-MM-dd');
      buckets.set(dateStr, dailyMinutes);
      current.setDate(current.getDate() + 1);
    }
    
    return buckets;
  }
}
