import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { CapacityCalculator } from './capacity-calculator.service';
import { DependencyResolver } from './dependency-resolver.service';
import { SchedulingEngine } from './scheduling-engine.service';
import { Rescheduler } from './rescheduler.service';
import { CalendarComparator } from './calendar-comparator.service';
import { ScheduleConfig } from '../entities/schedule-config.entity';
import { ScheduledTask } from '../entities/scheduled-task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleConfig,
      ScheduledTask,
    ]),
  ],
  controllers: [SchedulerController],
  providers: [
    SchedulerService,
    CapacityCalculator,
    DependencyResolver,
    SchedulingEngine,
    Rescheduler,
    CalendarComparator,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule {}
