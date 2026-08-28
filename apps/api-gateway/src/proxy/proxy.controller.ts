import { Controller, Get, Patch, Post, Delete, Req, Res, UseGuards, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

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
          params: req.query,
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
  // User Service Proxies
  // ============================================

  @Get('profile')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/profile`);
  }

  @Patch('profile')
  async patchProfile(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/profile`);
  }

  @Get('preferences')
  async getPreferences(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/preferences`);
  }

  @Patch('preferences')
  async patchPreferences(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/preferences`);
  }

  @Get('ai-provider')
  async getAiProvider(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai-provider`);
  }

  @Patch('ai-provider')
  async patchAiProvider(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai-provider`);
  }

  @Post('ai-provider/test')
  @HttpCode(200)
  async testAiProvider(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai-provider/test`);
  }

  @Delete('ai-provider')
  async deleteAiProvider(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai-provider`);
  }

  // ============================================
  // Learning Service Proxies
  // ============================================

  @Post('learning-goals')
  async createLearningGoal(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/learning-goals`);
  }

  @Get('learning-goals')
  async getLearningGoals(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/learning-goals`);
  }

  @Get('learning-goals/:id')
  async getLearningGoal(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/learning-goals/${req.params['id']}`);
  }

  @Patch('learning-goals/:id')
  async patchLearningGoal(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/learning-goals/${req.params['id']}`);
  }

  @Delete('learning-goals/:id')
  async deleteLearningGoal(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/learning-goals/${req.params['id']}`);
  }

  @Get('learning-goals/:id/skills')
  async getLearningGoalSkills(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/learning-goals/${req.params['id']}/skills`);
  }

  @Get('learning-goals/:id/progress')
  async getLearningGoalProgress(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/learning-goals/${req.params['id']}/progress`);
  }

  @Post('tasks/:id/progress')
  @HttpCode(200)
  async updateTaskProgress(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/tasks/${req.params['id']}/progress`);
  }

  // ============================================
  // Roadmap Service Proxies
  // ============================================

  @Post('roadmaps/generate')
  async generateRoadmap(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('ROADMAP_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/roadmaps/generate`);
  }

  @Get('roadmaps/by-goal/:learningGoalId')
  async getRoadmapByGoal(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('ROADMAP_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/roadmaps/by-goal/${req.params['learningGoalId']}`);
  }

  @Get('roadmaps/:id')
  async getRoadmap(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('ROADMAP_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/roadmaps/${req.params['id']}`);
  }

  @Get('roadmaps/:id/baseline')
  async getRoadmapBaseline(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('ROADMAP_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/roadmaps/${req.params['id']}/baseline`);
  }

  // ============================================
  // Scheduler Service Proxies
  // ============================================

  @Post('schedule/baseline')
  async createScheduleBaseline(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('SCHEDULER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/schedule/baseline`);
  }

  @Get('schedule/current')
  async getCurrentSchedule(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('SCHEDULER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/schedule/current`);
  }

  @Get('schedule/today')
  async getTodaySchedule(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('SCHEDULER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/schedule/today`);
  }

  @Post('schedule/recalculate')
  async recalculateSchedule(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('SCHEDULER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/schedule/recalculate`);
  }

  @Post('schedule/capacity')
  async updateScheduleCapacity(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('SCHEDULER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/schedule/capacity`);
  }

  @Post('schedule/task/:id/complete')
  async completeScheduleTask(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('SCHEDULER_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/schedule/task/${req.params['id']}/complete`);
  }

  // ============================================
  // AI Service Proxies
  // ============================================

  @Post('ai/roadmap')
  async generateAiRoadmap(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai/roadmap`);
  }

  @Post('ai/chat')
  async generateAiChat(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai/chat`);
  }

  @Post('ai/explain')
  async generateAiExplain(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai/explain`);
  }

  @Post('ai/quiz')
  async generateAiQuiz(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai/quiz`);
  }

  @Post('ai/onboarding-questions')
  async generateOnboardingQuestions(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai/onboarding-questions`);
  }

  @Post('ai/document')
  async generateAiDocument(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/ai/document`);
  }

  // ============================================
  // Resource & Document Service Proxies
  // ============================================

  @Get('resources/search')
  async searchResources(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('RESOURCE_DOCUMENT_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/resources/search`);
  }

  @Get('resources/skill/:skillId')
  async getSkillResources(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('RESOURCE_DOCUMENT_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/resources/skill/${req.params['skillId']}`);
  }

  @Post('documents/generate')
  async generateResourceDocument(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('RESOURCE_DOCUMENT_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/documents/generate`);
  }

  @Get('documents')
  async getResourceDocuments(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('RESOURCE_DOCUMENT_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/documents`);
  }

  @Get('documents/:id')
  async getResourceDocument(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('RESOURCE_DOCUMENT_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/documents/${req.params['id']}`);
  }

  @Get('documents/:id/download')
  async downloadResourceDocument(@Req() req: Request, @Res() res: Response) {
    const baseUrl = this.configService.get<string>('RESOURCE_DOCUMENT_SERVICE_URL');
    return this.forward(req, res, `${baseUrl}/documents/${req.params['id']}/download`);
  }
}
