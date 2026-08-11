import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { z } from 'zod';

export const SkillSchema = z.object({
  title: z.string(),
  description: z.string(),
  objectives: z.array(z.string()).default([]),
  difficulty: z.string(),
  estimatedMinutes: z.number().int(),
  prerequisites: z.array(z.string()).default([]),
  learningType: z.string(),
  practice: z.array(z.string()).default([]),
  assessment: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
});

export const ModuleSchema = z.object({
  title: z.string(),
  skills: z.array(SkillSchema),
});

export const RoadmapResponseSchema = z.object({
  skill: z.string(),
  modules: z.array(ModuleSchema),
});

export type RoadmapResponse = z.infer<typeof RoadmapResponseSchema>;

@Injectable()
export class AiClientService {
  private readonly AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:4005';

  constructor(private readonly httpService: HttpService) {}

  async generateRoadmap(userId: string, prompt: string, correlationId: string): Promise<RoadmapResponse> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.AI_SERVICE_URL}/ai/roadmap`,
          { prompt },
          {
            headers: {
              'x-user-id': userId,
              'x-correlation-id': correlationId,
            },
          },
        ),
      );

      const parsed = RoadmapResponseSchema.safeParse(response.data);
      if (!parsed.success) {
        throw new Error(`Invalid response structure from AI Service: ${parsed.error.message}`);
      }

      return parsed.data;
    } catch (error: any) {
      if (error.response) {
        throw new InternalServerErrorException(
          `AI Service failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new InternalServerErrorException(`Failed to communicate with AI Service: ${error.message}`);
    }
  }
}
