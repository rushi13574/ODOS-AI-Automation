import { Injectable, BadRequestException } from '@nestjs/common';
import { ProviderRegistry } from './provider-registry';
import { AIProvider } from './ai-provider.interface';
import { ProviderConfig } from './provider-config.interface';

@Injectable()
export class AIProviderFactory {
  constructor(private readonly registry: ProviderRegistry) {}

  getProvider(config: ProviderConfig): AIProvider {
    if (!config || !config.provider) {
      throw new BadRequestException('AI provider configuration is missing or invalid');
    }
    return this.registry.getProvider(config.provider);
  }
}
