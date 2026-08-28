import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TodayController } from './today.controller';
import { TodayService } from './today.service';

@Module({
  imports: [HttpModule],
  controllers: [TodayController],
  providers: [TodayService],
})
export class TodayModule {}
