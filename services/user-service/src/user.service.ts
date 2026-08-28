import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { encrypt, decrypt } from './utils/crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Retrieves a user by userId. If not found, bootstraps a default record.
   */
  async findOrCreateUser(userId: string, emailFallback?: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      const newUser = this.userRepository.create({
        userId,
        profile: {
          name: '',
          email: emailFallback || `${userId}@odos.internal`,
          avatar: '',
          bio: '',
          timezone: 'UTC',
        },
        preferences: {
          dailyMinutes: 60,
          learningDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          learningStyle: 'practical',
          currentLevel: 'beginner',
          targetLevel: 'advanced',
        },
        aiPreferences: {
          provider: null,
          model: null,
          encryptedApiKey: null,
          configurationStatus: 'unconfigured',
        },
      });

      try {
        await this.userRepository.insert(newUser);
      } catch (error: any) {
        if (error.code !== '23505') {
          throw error;
        }
      }

      user = await this.userRepository.findOne({ where: { userId } });
    }
    return user!;
  }

  async getProfile(userId: string) {
    const user = await this.findOrCreateUser(userId);
    return user.profile;
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.findOrCreateUser(userId);
    
    // Partially update profile fields
    if (data.name !== undefined) user.profile.name = data.name;
    if (data.avatar !== undefined) user.profile.avatar = data.avatar;
    if (data.bio !== undefined) user.profile.bio = data.bio;
    if (data.timezone !== undefined) user.profile.timezone = data.timezone;
    
    await this.userRepository.save(user);
    return user.profile;
  }

  async getPreferences(userId: string) {
    const user = await this.findOrCreateUser(userId);
    return user.preferences;
  }

  async updatePreferences(userId: string, data: any) {
    const user = await this.findOrCreateUser(userId);

    if (data.dailyMinutes !== undefined) user.preferences.dailyMinutes = data.dailyMinutes;
    if (data.learningDays !== undefined) user.preferences.learningDays = data.learningDays;
    if (data.learningStyle !== undefined) user.preferences.learningStyle = data.learningStyle;
    if (data.currentLevel !== undefined) user.preferences.currentLevel = data.currentLevel;
    if (data.targetLevel !== undefined) user.preferences.targetLevel = data.targetLevel;

    await this.userRepository.save(user);
    return user.preferences;
  }

  async getAiProvider(userId: string) {
    const user = await this.findOrCreateUser(userId);
    
    // Check if server default is available (checking .env for default provider logic)
    const hasSystemDefault = !!process.env.DEFAULT_AI_PROVIDER;
    const systemProvider = process.env.DEFAULT_AI_PROVIDER || 'gemini';
    const systemModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash'; // Conceptual fallback if GEMINI_MODEL not set

    return {
      provider: user.aiPreferences.provider,
      model: user.aiPreferences.model,
      configurationStatus: user.aiPreferences.configurationStatus,
      hasSystemDefault,
      systemProvider,
      systemModel,
    };
  }

  async updateAiProvider(userId: string, data: any) {
    const user = await this.findOrCreateUser(userId);

    const allowedProviders = ['gemini', 'grok', 'claude', 'openai', 'ollama'];
    if (data.provider && !allowedProviders.includes(data.provider)) {
      throw new BadRequestException(`Provider must be one of: ${allowedProviders.join(', ')}`);
    }

    if (data.provider !== undefined) user.aiPreferences.provider = data.provider;
    if (data.model !== undefined) user.aiPreferences.model = data.model;
    
    if (data.apiKey !== undefined && data.apiKey !== '') {
      user.aiPreferences.encryptedApiKey = encrypt(data.apiKey);
      user.aiPreferences.configurationStatus = 'configured';
    }

    await this.userRepository.save(user);
    return {
      provider: user.aiPreferences.provider,
      model: user.aiPreferences.model,
      configurationStatus: user.aiPreferences.configurationStatus,
      hasSystemDefault: !!process.env.DEFAULT_AI_PROVIDER,
      systemProvider: process.env.DEFAULT_AI_PROVIDER || 'gemini',
      systemModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    };
  }

  async testAiProvider(userId: string) {
    const user = await this.findOrCreateUser(userId);
    const encryptedKey = user.aiPreferences.encryptedApiKey;

    if (!encryptedKey) {
      throw new BadRequestException('No API key configured to test');
    }

    try {
      const decryptedKey = decrypt(encryptedKey);

      // Only Gemini is functional initially. Simulate check
      if (user.aiPreferences.provider === 'gemini') {
        // Standard Google key format begins with 'AIzaSy'
        if (decryptedKey.startsWith('AIzaSy')) {
          user.aiPreferences.configurationStatus = 'active';
          await this.userRepository.save(user);
          return { success: true, message: 'Gemini provider API Key is valid and active' };
        } else {
          user.aiPreferences.configurationStatus = 'error';
          await this.userRepository.save(user);
          throw new BadRequestException('Invalid Gemini API Key format (must start with AIzaSy)');
        }
      }

      // Other providers are mock-succeeded for flow, but flagged as unfunctional
      throw new BadRequestException(`${user.aiPreferences.provider} integration is not functional yet`);
    } catch (err: any) {
      user.aiPreferences.configurationStatus = 'error';
      await this.userRepository.save(user);
      throw err;
    }
  }

  async deleteAiProvider(userId: string) {
    const user = await this.findOrCreateUser(userId);
    user.aiPreferences.provider = null;
    user.aiPreferences.model = null;
    user.aiPreferences.encryptedApiKey = null;
    user.aiPreferences.configurationStatus = 'unconfigured';
    await this.userRepository.save(user);
    return { success: true, message: 'AI credentials deleted' };
  }

  async getDecryptedApiKey(userId: string) {
    const user = await this.findOrCreateUser(userId);
    const encryptedKey = user.aiPreferences.encryptedApiKey;
    if (!encryptedKey) {
      return { apiKey: '' };
    }
    const decryptedKey = decrypt(encryptedKey);
    return { apiKey: decryptedKey };
  }
}
