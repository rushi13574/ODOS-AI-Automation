import { Controller, Get, Patch, Post, Delete, Req, Res, UseGuards, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProxyController {
  constructor(private readonly httpService: HttpService) {}

  private async forward(req: Request, res: Response, targetUrl: string) {
    const user = req.user as { supabaseId: string; email: string } | undefined;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.supabaseId,
          },
        })
      );
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      if (err.response) {
        return res.status(err.response.status).json(err.response.data);
      }
      return res.status(500).json({
        message: 'Failed to communicate with downstream microservice',
        error: err.message,
      });
    }
  }

  // ============================================
  // User Service Proxies (Port 4001)
  // ============================================

  @Get('profile')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/profile');
  }

  @Patch('profile')
  async patchProfile(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/profile');
  }

  @Get('preferences')
  async getPreferences(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/preferences');
  }

  @Patch('preferences')
  async patchPreferences(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/preferences');
  }

  @Get('ai-provider')
  async getAiProvider(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/ai-provider');
  }

  @Patch('ai-provider')
  async patchAiProvider(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/ai-provider');
  }

  @Post('ai-provider/test')
  @HttpCode(200)
  async testAiProvider(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/ai-provider/test');
  }

  @Delete('ai-provider')
  async deleteAiProvider(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4001/ai-provider');
  }

  // ============================================
  // Learning Service Proxies (Port 4002)
  // ============================================

  @Post('learning-goals')
  async createLearningGoal(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4002/learning-goals');
  }

  @Get('learning-goals')
  async getLearningGoals(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'http://localhost:4002/learning-goals');
  }

  @Get('learning-goals/:id')
  async getLearningGoal(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, `http://localhost:4002/learning-goals/${req.params['id']}`);
  }

  @Patch('learning-goals/:id')
  async patchLearningGoal(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, `http://localhost:4002/learning-goals/${req.params['id']}`);
  }

  @Delete('learning-goals/:id')
  async deleteLearningGoal(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, `http://localhost:4002/learning-goals/${req.params['id']}`);
  }

  @Get('learning-goals/:id/skills')
  async getLearningGoalSkills(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, `http://localhost:4002/learning-goals/${req.params['id']}/skills`);
  }

  @Get('learning-goals/:id/progress')
  async getLearningGoalProgress(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, `http://localhost:4002/learning-goals/${req.params['id']}/progress`);
  }

  @Post('tasks/:id/progress')
  @HttpCode(200)
  async updateTaskProgress(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, `http://localhost:4002/tasks/${req.params['id']}/progress`);
  }
}
