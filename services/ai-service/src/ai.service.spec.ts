import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { ProviderRegistry } from './providers/provider-registry';
import axios from 'axios';

jest.mock('axios');

describe('AIService', () => {
  let service: AIService;

  const mockProvider = {
    generateRoadmap: jest.fn(),
    explainSkill: jest.fn(),
    generateQuiz: jest.fn(),
    generateDocument: jest.fn(),
    chat: jest.fn(),
    analyzeProgress: jest.fn(),
  };

  const mockRegistry = {
    getProvider: jest.fn().mockReturnValue(mockProvider),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ProviderRegistry,
          useValue: mockRegistry,
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    jest.clearAllMocks();
  });

  it('should generate roadmap successfully with resilience and config load', async () => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/ai-provider')) {
        return Promise.resolve({ data: { provider: 'gemini', model: 'gemini-1.5-pro' } });
      }
      if (url.includes('/decrypted-api-key')) {
        return Promise.resolve({ data: { apiKey: 'AIzaSyTestKey' } });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    mockProvider.generateRoadmap.mockResolvedValue({ skill: 'TypeScript', modules: [] });

    const result = await service.generateRoadmap('user-123', 'Learn TypeScript');
    expect(result).toBeDefined();
    expect(result.skill).toBe('TypeScript');
    expect(mockProvider.generateRoadmap).toHaveBeenCalled();
  });

  it('should retry on temporary failure and succeed', async () => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/ai-provider')) {
        return Promise.resolve({ data: { provider: 'gemini', model: 'gemini-1.5-pro' } });
      }
      if (url.includes('/decrypted-api-key')) {
        return Promise.resolve({ data: { apiKey: 'AIzaSyTestKey' } });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    mockProvider.explainSkill
      .mockRejectedValueOnce(new Error('Temporary rate limit or network issue'))
      .mockResolvedValueOnce({ skill: 'CSS', explanation: 'Cascading Style Sheets' });

    const result = await service.explainSkill('user-123', 'CSS');
    expect(result).toBeDefined();
    expect(result.skill).toBe('CSS');
    expect(mockProvider.explainSkill).toHaveBeenCalledTimes(2);
  });
});
