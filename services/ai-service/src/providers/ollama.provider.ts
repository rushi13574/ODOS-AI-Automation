import { Injectable, NotImplementedException } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';
import { ProviderConfig } from './provider-config.interface';

@Injectable()
export class OllamaProvider implements AIProvider {
  private throwNotImplemented(methodName: string): never {
    throw new NotImplementedException(`Ollama provider method "${methodName}" is not implemented.`);
  }

  async generateRoadmap(_prompt: string, _config: ProviderConfig): Promise<any> {
    this.throwNotImplemented('generateRoadmap');
  }

  async explainSkill(_skillName: string, _config: ProviderConfig): Promise<any> {
    this.throwNotImplemented('explainSkill');
  }

  async generateQuiz(_skillName: string, _config: ProviderConfig): Promise<any> {
    this.throwNotImplemented('generateQuiz');
  }

  async generateDocument(_skillName: string, _config: ProviderConfig): Promise<any> {
    this.throwNotImplemented('generateDocument');
  }

  async chat(_messages: any[], _config: ProviderConfig): Promise<any> {
    this.throwNotImplemented('chat');
  }

  async analyzeProgress(_progressData: any, _config: ProviderConfig): Promise<any> {
    this.throwNotImplemented('analyzeProgress');
  }
}
