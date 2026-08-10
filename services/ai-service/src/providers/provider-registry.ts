import { Injectable, BadRequestException } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';
import { GeminiProvider } from './gemini.provider';
import { GrokProvider } from './grok.provider';
import { ClaudeProvider } from './claude.provider';
import { OpenAIProvider } from './openai.provider';
import { OllamaProvider } from './ollama.provider';

export interface ProviderConfig {
  provider: string;
  model?: string;
  apiKey?: string;
}

@Injectable()
export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();

  constructor(
    gemini: GeminiProvider,
    grok: GrokProvider,
    claude: ClaudeProvider,
    openai: OpenAIProvider,
    ollama: OllamaProvider
  ) {
    this.providers.set('gemini', gemini);
    this.providers.set('grok', grok);
    this.providers.set('claude', claude);
    this.providers.set('openai', openai);
    this.providers.set('ollama', ollama);
  }

  getProvider(providerName: string): AIProvider {
    const p = this.providers.get(providerName.toLowerCase());
    if (!p) {
      throw new BadRequestException(`AI Provider "${providerName}" is not supported`);
    }
    return p;
  }
}
