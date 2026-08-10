import { Test, TestingModule } from '@nestjs/testing';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AIController', () => {
  let controller: AIController;
  let service: any;

  const mockAIService = {
    generateRoadmap: jest.fn(),
    chat: jest.fn(),
    explainSkill: jest.fn(),
    generateQuiz: jest.fn(),
    generateDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [
        {
          provide: AIService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    controller = module.get<AIController>(AIController);
    service = module.get<AIService>(AIService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw UnauthorizedException if user header is missing', async () => {
    await expect(controller.generateRoadmap(undefined, 'corr-123', { prompt: 'Learn NestJS' })).rejects.toThrow(
      UnauthorizedException
    );
  });

  it('should generate roadmap successfully if user header is provided', async () => {
    service.generateRoadmap.mockResolvedValue({ skill: 'NestJS' });

    const result = await controller.generateRoadmap('user-123', 'corr-123', { prompt: 'Learn NestJS' });
    expect(service.generateRoadmap).toHaveBeenCalledWith('user-123', 'Learn NestJS', 'corr-123');
    expect(result.skill).toBe('NestJS');
  });

  it('should call chat successfully', async () => {
    service.chat.mockResolvedValue({ message: 'Hello Alice' });

    const result = await controller.chat('user-123', 'corr-123', { messages: [{ role: 'user', content: 'Hi' }] });
    expect(service.chat).toHaveBeenCalledWith('user-123', [{ role: 'user', content: 'Hi' }], 'corr-123');
    expect(result.message).toBe('Hello Alice');
  });
});
