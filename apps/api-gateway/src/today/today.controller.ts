import { Controller, Get, Req, UseGuards, UnauthorizedException, Query } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TodayService } from './today.service';

@Controller('today')
@UseGuards(JwtAuthGuard)
export class TodayController {
  constructor(private readonly todayService: TodayService) {}

  @Get()
  async getToday(@Req() req: Request, @Query('learningGoalId') learningGoalId?: string) {
    const user = req.user as { supabaseId: string; email: string } | undefined;
    if (!user || !user.supabaseId) {
      throw new UnauthorizedException('Missing user identity');
    }
    return this.todayService.getTodayDashboard(user.supabaseId, learningGoalId);
  }
}
