import { Injectable } from '@nestjs/common';
import { startOfDay } from 'date-fns';
import { SchedulingEngine } from './scheduling-engine.service';
import { TaskInput } from './dependency-resolver.service';
import { ScheduledTask } from '../entities/scheduled-task.entity';

@Injectable()
export class Rescheduler {
  constructor(private readonly schedulingEngine: SchedulingEngine) {}

  /**
   * Recalculates `currentDate` for all incomplete tasks.
   * Completed tasks remain exactly where they are.
   */
  recalculateCurrentSchedule(
    tasks: ScheduledTask[],
    taskInputs: TaskInput[],
    dailyCapacityMinutes: number,
  ): { skillNodeId: string; newCurrentDate: Date }[] {
    const now = startOfDay(new Date());

    // 1. Filter incomplete tasks
    const incompleteTasks = tasks.filter(t => !t.isCompleted);

    // 2. Identify the inputs for the incomplete tasks
    const incompleteSkillIds = new Set(incompleteTasks.map(t => t.skillNodeId.toString()));
    const pendingInputs = taskInputs.filter(t => incompleteSkillIds.has(t.skillNodeId.toString()));

    // 3. To respect dependencies properly, if a pending task depends on a completed task, 
    // we don't need to re-evaluate the completed task's date for capacity, but we DO need 
    // to know when it finished to avoid scheduling dependent tasks too early.
    // However, since completed tasks are in the past (or today), and all incomplete tasks 
    // will be scheduled starting from `now` (or later), dependencies on completed tasks 
    // are naturally satisfied.
    // So we can simply run the SchedulingEngine on `pendingInputs` starting from `now`.
    
    // Wait, if an incomplete task was scheduled in the past, it gets pulled to `now`.
    // If it was scheduled in the future, it gets re-evaluated (it could be pulled forward or pushed back).
    
    const rescheduled = this.schedulingEngine.generateSchedule(
      pendingInputs,
      now, // Start rescheduling from today
      dailyCapacityMinutes,
    );

    return rescheduled.map(r => ({
      skillNodeId: r.skillNodeId,
      newCurrentDate: r.assignedDate,
    }));
  }
}
