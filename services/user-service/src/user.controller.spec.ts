import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: any;

  const mockUserService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
    getAiProvider: jest.fn(),
    updateAiProvider: jest.fn(),
    testAiProvider: jest.fn(),
    deleteAiProvider: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw UnauthorizedException if x-user-id is missing', async () => {
    await expect(controller.getProfile(undefined)).rejects.toThrow(UnauthorizedException);
  });

  it('should retrieve profile successfully if x-user-id is provided', async () => {
    service.getProfile.mockResolvedValue({ name: 'Alice' });

    const result = await controller.getProfile('user-123');
    expect(service.getProfile).toHaveBeenCalledWith('user-123');
    expect(result.name).toBe('Alice');
  });

  it('should call updatePreferences successfully', async () => {
    const body = { dailyMinutes: 95 };
    service.updatePreferences.mockResolvedValue(body);

    const result = await controller.updatePreferences('user-123', body);
    expect(service.updatePreferences).toHaveBeenCalledWith('user-123', body);
    expect(result.dailyMinutes).toBe(95);
  });
});
