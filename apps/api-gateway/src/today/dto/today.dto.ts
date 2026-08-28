export class ResourceDto {
  id!: string;
  type!: string;
  url!: string;
  title!: string;
  description?: string;
  thumbnail?: string;
}

export class TaskDto {
  id!: string;
  title!: string;
  description?: string;
  status!: 'pending' | 'in_progress' | 'completed' | 'paused';
  estimatedMinutes!: number;
  completedMinutes!: number;
  type!: string;
  moduleName?: string | null;
}

export class TodayMetricsDto {
  currentSkill!: string;
  currentModule!: string | null;
  dayNumber!: number | null;
  estimatedTotalTime!: number;
  completedTime!: number;
  remainingTime!: number;
  progressPercentage!: number;
  projectedCompletionDate!: string;
  delayComparedToBaseline!: number;
}

export class TodayResponseDto {
  todayTasks!: TaskDto[];
  overdueTasks!: TaskDto[];
  metrics!: TodayMetricsDto | null;
  objectives!: string[];
  resources!: ResourceDto[];
  activeGoal!: any | null;
  roadmap!: any | null;
}
