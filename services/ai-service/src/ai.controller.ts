import { Controller, Post, Body, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AIService } from './ai.service';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class RoadmapDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}

export class ChatDto {
  @IsArray()
  @IsNotEmpty()
  messages!: any[];
}

export class SkillQueryDto {
  @IsString()
  @IsNotEmpty()
  skillName!: string;
}

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  private checkUserId(userId?: string): string {
    if (!userId) {
      throw new UnauthorizedException('Missing user identity header');
    }
    return userId;
  }

  @Post('roadmap')
  @HttpCode(200)
  async generateRoadmap(
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() body: RoadmapDto
  ) {
    const uid = this.checkUserId(userId);
    return this.aiService.generateRoadmap(uid, body.prompt, correlationId);
  }

  @Post('chat')
  @HttpCode(200)
  async chat(
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() body: ChatDto
  ) {
    const uid = this.checkUserId(userId);
    return this.aiService.chat(uid, body.messages, correlationId);
  }

  @Post('explain')
  @HttpCode(200)
  async explainSkill(
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() body: SkillQueryDto
  ) {
    const uid = this.checkUserId(userId);
    return this.aiService.explainSkill(uid, body.skillName, correlationId);
  }

  @Post('quiz')
  @HttpCode(200)
  async generateQuiz(
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() body: SkillQueryDto
  ) {
    const uid = this.checkUserId(userId);
    return this.aiService.generateQuiz(uid, body.skillName, correlationId);
  }

  @Post('document')
  @HttpCode(200)
  async generateDocument(
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() body: SkillQueryDto
  ) {
    const uid = this.checkUserId(userId);
    return this.aiService.generateDocument(uid, body.skillName, correlationId);
  }

  @Post('onboarding-questions')
  @HttpCode(200)
  async generateOnboardingQuestions(
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() body: SkillQueryDto
  ) {
    const uid = this.checkUserId(userId);
    return this.aiService.generateOnboardingQuestions(uid, body.skillName, correlationId);
  }
}
