import { Injectable } from '@nestjs/common';

import { CapacityCalculator } from './capacity-calculator.service';
import { DependencyResolver, TaskInput } from './dependency-resolver.service';
import { nextScheduleDay, scheduleDateFromKey, scheduleDay } from './schedule-date';

export interface ScheduledTaskResult {
  skillNodeId: string;
  assignedDate: Date;
  estimatedMinutes: number;
}

@Injectable()
export class SchedulingEngine {
  constructor(
    private readonly capacityCalculator: CapacityCalculator,
    private readonly dependencyResolver: DependencyResolver,
  ) {}

  /**
   * Generates a deterministic schedule mapping skill nodes to specific dates.
   * Modifies the bucket states internally to keep track of remaining capacity.
   */
  generateSchedule(
    tasks: TaskInput[],
    startDate: Date,
    dailyCapacityMinutes: number,
  ): ScheduledTaskResult[] {
    const sortedTasks = this.dependencyResolver.topologicalSort(tasks);
    const buckets = this.capacityCalculator.generateCapacityBuckets(startDate, dailyCapacityMinutes);
    const results: ScheduledTaskResult[] = [];
    
    // Map to keep track of when a prerequisite was scheduled
    const completionDateMap = new Map<string, string>(); 

    let currentDate = new Date(startDate);

    for (const task of sortedTasks) {
      // Find the earliest possible start date for this task based on prerequisites
      let earliestStartDateStr = scheduleDay(startDate);
      
      for (const prereq of task.prerequisites) {
        const prereqDateStr = completionDateMap.get(prereq);
        if (prereqDateStr && prereqDateStr > earliestStartDateStr) {
          earliestStartDateStr = prereqDateStr;
        }
      }

      // Fast forward currentDate to the earliest possible start date if it's behind
      if (scheduleDay(currentDate) < earliestStartDateStr) {
        currentDate = scheduleDateFromKey(earliestStartDateStr);
      }

      let remainingMinutes = task.estimatedMinutes;
      let taskAssignedDateStr = scheduleDay(currentDate);

      // Schedule the task across days if it exceeds daily capacity
      while (remainingMinutes > 0) {
        const dateStr = scheduleDay(currentDate);
        const available = buckets.get(dateStr) || 0;

        if (available > 0) {
          // If this is the first day we are scheduling this task, this is its 'assignedDate'
          // Actually, a task might span multiple days. For simplicity of the model requested,
          // a task is assigned to the day it *starts* or *finishes*.
          // Given the user scenario (Aug 10 -> HTML, Aug 11 -> CSS), we assume a single task 
          // usually fits, or we just assign it to the date it finishes. 
          // Let's assign it to the date it starts.
          
          if (remainingMinutes === task.estimatedMinutes) {
            taskAssignedDateStr = dateStr;
          }

          const consumed = Math.min(available, remainingMinutes);
          buckets.set(dateStr, available - consumed);
          remainingMinutes -= consumed;
        }

        if (remainingMinutes > 0) {
          currentDate = nextScheduleDay(currentDate);
        }
      }

      completionDateMap.set(task.skillNodeId, scheduleDay(currentDate));
      
      results.push({
        skillNodeId: task.skillNodeId,
        assignedDate: scheduleDateFromKey(taskAssignedDateStr),
        estimatedMinutes: task.estimatedMinutes,
      });
    }

    return results;
  }
}
