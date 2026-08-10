import { Injectable, BadRequestException, GatewayTimeoutException, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ProviderRegistry } from './providers/provider-registry';
import { OdosLogger } from '@odos/logger';
import * as crypto from 'crypto';

@Injectable()
export class AIService {
  private readonly logger = new OdosLogger('AI Service');
  private readonly USER_SERVICE_URL = 'http://localhost:4001';

  constructor(private readonly registry: ProviderRegistry) {}

  /**
   * Internal helper to fetch user configurations and decrypted API Key from User Service.
   */
  private async loadUserConfig(userId: string, correlationId: string) {
    this.logger.log(`[${correlationId}] Fetching AI configs from User Service for ${userId}`);
    try {
      const [providerRes, keyRes] = await Promise.all([
        axios.get(`${this.USER_SERVICE_URL}/ai-provider`, {
          headers: { 'x-user-id': userId, 'x-correlation-id': correlationId },
        }),
        axios.get(`${this.USER_SERVICE_URL}/internal/user/${userId}/decrypted-api-key`, {
          headers: { 'x-correlation-id': correlationId },
        }),
      ]);

      return {
        provider: providerRes.data.provider,
        model: providerRes.data.model,
        apiKey: keyRes.data.apiKey,
      };
    } catch (err: any) {
      this.logger.error(`[${correlationId}] Failed to load User Service AI configs: ${err.message}`);
      throw new BadRequestException('Failed to load user AI credentials. Please configure your API key.');
    }
  }

  /**
   * Resilient execution wrapper supporting timeout, retries, backoff, and error mapping.
   */
  private async runWithResilience<T>(
    correlationId: string,
    operationName: string,
    fn: () => Promise<T>,
    timeoutMs = 30000,
    maxRetries = 3
  ): Promise<T> {
    let attempt = 0;
    let delay = 500; // ms

    while (attempt < maxRetries) {
      try {
        attempt++;
        this.logger.log(`[${correlationId}] Running ${operationName} (attempt ${attempt}/${maxRetries})`);

        // Promisified timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new GatewayTimeoutException(`${operationName} timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        // Run operation and race with timeout
        return await Promise.race([fn(), timeoutPromise]);
      } catch (err: any) {
        this.logger.error(`[${correlationId}] Attempt ${attempt} failed: ${err.message}`);

        // If rate limit (429) is hit, double the delay
        const isRateLimit = err.status === 429 || err.message?.includes('429');
        if (isRateLimit) {
          this.logger.log(`[${correlationId}] Rate limit hit. Backing off...`);
          delay *= 1.5;
        }

        if (attempt >= maxRetries) {
          if (err instanceof HttpException) {
            throw err;
          }
          throw new HttpException(
            {
              status: HttpStatus.BAD_GATEWAY,
              error: `AI provider error during ${operationName}: ${err.message}`,
              correlationId,
            },
            HttpStatus.BAD_GATEWAY
          );
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }
    throw new GatewayTimeoutException('Operation execution failed');
  }

  async generateRoadmap(userId: string, prompt: string, rawCorrelationId?: string): Promise<any> {
    const correlationId = rawCorrelationId || crypto.randomUUID();
    const config = await this.loadUserConfig(userId, correlationId);
    const provider = this.registry.getProvider(config.provider);

    return this.runWithResilience(correlationId, 'generateRoadmap', () =>
      provider.generateRoadmap(prompt, config)
    );
  }

  async explainSkill(userId: string, skillName: string, rawCorrelationId?: string): Promise<any> {
    const correlationId = rawCorrelationId || crypto.randomUUID();
    const config = await this.loadUserConfig(userId, correlationId);
    const provider = this.registry.getProvider(config.provider);

    return this.runWithResilience(correlationId, 'explainSkill', () =>
      provider.explainSkill(skillName, config)
    );
  }

  async generateQuiz(userId: string, skillName: string, rawCorrelationId?: string): Promise<any> {
    const correlationId = rawCorrelationId || crypto.randomUUID();
    const config = await this.loadUserConfig(userId, correlationId);
    const provider = this.registry.getProvider(config.provider);

    return this.runWithResilience(correlationId, 'generateQuiz', () =>
      provider.generateQuiz(skillName, config)
    );
  }

  async generateDocument(userId: string, skillName: string, rawCorrelationId?: string): Promise<any> {
    const correlationId = rawCorrelationId || crypto.randomUUID();
    const config = await this.loadUserConfig(userId, correlationId);
    const provider = this.registry.getProvider(config.provider);

    return this.runWithResilience(correlationId, 'generateDocument', () =>
      provider.generateDocument(skillName, config)
    );
  }

  async chat(userId: string, messages: any[], rawCorrelationId?: string): Promise<any> {
    const correlationId = rawCorrelationId || crypto.randomUUID();
    const config = await this.loadUserConfig(userId, correlationId);
    const provider = this.registry.getProvider(config.provider);

    return this.runWithResilience(correlationId, 'chat', () =>
      provider.chat(messages, config)
    );
  }

  async analyzeProgress(userId: string, progressData: any, rawCorrelationId?: string): Promise<any> {
    const correlationId = rawCorrelationId || crypto.randomUUID();
    const config = await this.loadUserConfig(userId, correlationId);
    const provider = this.registry.getProvider(config.provider);

    return this.runWithResilience(correlationId, 'analyzeProgress', () =>
      provider.analyzeProgress(progressData, config)
    );
  }
}
