import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { HealthController } from './health.controller';
import { AIService } from './ai.service';
import { ProviderRegistry } from './providers/provider-registry';

// Adapters
import { GeminiProvider } from './providers/gemini.provider';
import { GrokProvider } from './providers/grok.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  controllers: [AIController, HealthController],
  providers: [
    AIService,
    ProviderRegistry,
    GeminiProvider,
    GrokProvider,
    ClaudeProvider,
    OpenAIProvider,
    OllamaProvider,
  ],
})
export class AppModule {}
