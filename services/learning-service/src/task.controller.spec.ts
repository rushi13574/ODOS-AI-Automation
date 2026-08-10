import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { LearningService } from './learning.service';
import { UnauthorizedException } from '@nestjs/common';

describe('TaskController', () => {
  let controller: TaskController;
  let service: any;

  const mockLearningService = {
    updateTaskProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: LearningService,
          useValue: mockLearningService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<LearningService>(LearningService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw UnauthorizedException if header is missing', async () => {
    await expect(controller.updateTaskProgress(undefined, 'task-789', { status: 'completed' })).rejects.toThrow(
      UnauthorizedException
    );
  });

  it('should call updateTaskProgress successfully', async () => {
    const body = { status: 'completed', actualMinutes: 40 };
    service.updateTaskProgress.mockResolvedValue({ taskId: 'task-789', status: 'completed' });

    const result = await controller.updateTaskProgress('user-123', 'task-789', body);
    expect(service.updateTaskProgress).toHaveBeenCalledWith('user-123', 'task-789', body);
    expect(result.status).toBe('completed');
  });
});
