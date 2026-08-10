import { Test, TestingModule } from '@nestjs/testing';
import { LearningGoalController } from './learning-goal.controller';
import { LearningService } from './learning.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LearningGoalController', () => {
  let controller: LearningGoalController;
  let service: any;

  const mockLearningService = {
    createGoal: jest.fn(),
    getGoals: jest.fn(),
    getGoalById: jest.fn(),
    updateGoal: jest.fn(),
    deleteGoal: jest.fn(),
    getSkills: jest.fn(),
    getProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningGoalController],
      providers: [
        {
          provide: LearningService,
          useValue: mockLearningService,
        },
      ],
    }).compile();

    controller = module.get<LearningGoalController>(LearningGoalController);
    service = module.get<LearningService>(LearningService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw UnauthorizedException if header is missing', async () => {
    await expect(controller.getGoals(undefined)).rejects.toThrow(UnauthorizedException);
  });

  it('should call getGoals successfully', async () => {
    service.getGoals.mockResolvedValue([{ skillName: 'Kubernetes' }]);

    const result = await controller.getGoals('user-123');
    expect(service.getGoals).toHaveBeenCalledWith('user-123');
    expect(result).toHaveLength(1);
    expect(result[0].skillName).toBe('Kubernetes');
  });

  it('should call getSkills successfully', async () => {
    service.getSkills.mockResolvedValue({ nodes: [], dependencies: [] });

    const result = await controller.getSkills('user-123', 'goal-789');
    expect(service.getSkills).toHaveBeenCalledWith('user-123', 'goal-789');
    expect(result.nodes).toBeDefined();
  });
});
