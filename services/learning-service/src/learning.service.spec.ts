import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LearningService } from './learning.service';
import { LearningGoal } from './schemas/learning-goal.schema';
import { SkillNode } from './schemas/skill-node.schema';
import { SkillDependency } from './schemas/skill-dependency.schema';
import { TaskProgress } from './schemas/task-progress.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('LearningService', () => {
  let service: LearningService;
  let goalModel: any;
  let nodeModel: any;
  let dependencyModel: any;

  const mockDoc = (data: any) => {
    const doc = {
      ...data,
      save: jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      }),
    };
    return doc;
  };

  const mockModelFactory = () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: getModelToken(LearningGoal.name), useFactory: mockModelFactory },
        { provide: getModelToken(SkillNode.name), useFactory: mockModelFactory },
        { provide: getModelToken(SkillDependency.name), useFactory: mockModelFactory },
        { provide: getModelToken(TaskProgress.name), useFactory: mockModelFactory },
      ],
    }).compile();

    service = module.get<LearningService>(LearningService);
    goalModel = module.get(getModelToken(LearningGoal.name));
    nodeModel = module.get(getModelToken(SkillNode.name));
    dependencyModel = module.get(getModelToken(SkillDependency.name));

    jest.clearAllMocks();
  });

  describe('getAndVerifyGoal', () => {
    it('should return goal if found and user owns it', async () => {
      const fakeGoal = mockDoc({ _id: 'goal-123', userId: 'user-456', skillName: 'React' });
      goalModel.findById.mockResolvedValue(fakeGoal);

      const result = await service.getAndVerifyGoal('goal-123', 'user-456');
      expect(result).toBeDefined();
      expect(result.skillName).toBe('React');
    });

    it('should throw NotFoundException if goal does not exist', async () => {
      goalModel.findById.mockResolvedValue(null);

      await expect(service.getAndVerifyGoal('goal-123', 'user-456')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the goal', async () => {
      const fakeGoal = mockDoc({ _id: 'goal-123', userId: 'other-user', skillName: 'React' });
      goalModel.findById.mockResolvedValue(fakeGoal);

      await expect(service.getAndVerifyGoal('goal-123', 'user-456')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createGoal', () => {
    it('should create goal and seed nodes + dependencies', async () => {
      const dto = {
        skillName: 'TypeScript',
        currentLevel: 'beginner',
        targetLevel: 'advanced',
        dailyMinutes: 60,
        learningDays: ['monday'],
      };
      const fakeGoal = mockDoc({ _id: 'goal-123', userId: 'user-456', ...dto });
      goalModel.create.mockResolvedValue(fakeGoal);

      const fakeNode = { _id: 'node-999' };
      nodeModel.create.mockResolvedValue(fakeNode);

      const result = await service.createGoal('user-456', dto);
      expect(result).toBeDefined();
      expect(goalModel.create).toHaveBeenCalled();
      expect(nodeModel.create).toHaveBeenCalledTimes(3);
      expect(dependencyModel.create).toHaveBeenCalledTimes(2);
    });
  });
});
