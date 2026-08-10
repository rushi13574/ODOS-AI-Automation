import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let model: any;

  const mockUserDoc = (data: any) => {
    const doc = {
      ...data,
      save: jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      }),
    };
    return doc;
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get(getModelToken(User.name));
    jest.clearAllMocks();
  });

  it('should retrieve or create user record', async () => {
    const fakeUser = mockUserDoc({ userId: 'user-123', profile: { name: 'Alice', email: 'alice@test.com' } });
    model.findOne.mockResolvedValue(fakeUser);

    const result = await service.findOrCreateUser('user-123');
    expect(model.findOne).toHaveBeenCalledWith({ userId: 'user-123' });
    expect(result.profile.email).toBe('alice@test.com');
  });

  it('should update profile fields successfully', async () => {
    const fakeUser = mockUserDoc({
      userId: 'user-123',
      profile: { name: 'Alice', email: 'alice@test.com', bio: '' },
    });
    model.findOne.mockResolvedValue(fakeUser);

    const result = await service.updateProfile('user-123', { name: 'Alice Cooper', bio: 'Singer' });
    expect(result.name).toBe('Alice Cooper');
    expect(result.bio).toBe('Singer');
    expect(fakeUser.save).toHaveBeenCalled();
  });

  it('should update preferences fields successfully', async () => {
    const fakeUser = mockUserDoc({
      userId: 'user-123',
      preferences: { dailyMinutes: 60, learningStyle: 'visual' },
    });
    model.findOne.mockResolvedValue(fakeUser);

    const result = await service.updatePreferences('user-123', { dailyMinutes: 90, learningStyle: 'practical' });
    expect(result.dailyMinutes).toBe(90);
    expect(result.learningStyle).toBe('practical');
    expect(fakeUser.save).toHaveBeenCalled();
  });

  it('should encrypt and save AI provider keys', async () => {
    const fakeUser = mockUserDoc({
      userId: 'user-123',
      aiPreferences: { provider: 'gemini', model: 'gemini-1.5-pro', encryptedApiKey: '', configurationStatus: 'unconfigured' },
    });
    model.findOne.mockResolvedValue(fakeUser);

    const result = await service.updateAiProvider('user-123', { provider: 'gemini', apiKey: 'AIzaSyKey123' });
    expect(result.configurationStatus).toBe('configured');
    expect(fakeUser.aiPreferences.encryptedApiKey).not.toBe('AIzaSyKey123');
    expect(fakeUser.aiPreferences.encryptedApiKey).toContain(':');
  });

  it('should throw an error when configuring invalid provider', async () => {
    const fakeUser = mockUserDoc({
      userId: 'user-123',
      aiPreferences: {},
    });
    model.findOne.mockResolvedValue(fakeUser);

    await expect(service.updateAiProvider('user-123', { provider: 'invalid-provider' })).rejects.toThrow(
      BadRequestException
    );
  });
});
