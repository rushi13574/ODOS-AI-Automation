import { Injectable, BadRequestException } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';

@Injectable()
export class OllamaProvider implements AIProvider {
  private throwNotImplemented(): never {
    throw new BadRequestException('Ollama integration is not functional yet');
  }

  async generateRoadmap(): Promise<any> {
    this.throwNotImplemented();
  }

  async explainSkill(): Promise<any> {
    this.throwNotImplemented();
  }

  async generateQuiz(): Promise<any> {
    this.throwNotImplemented();
  }

  async generateDocument(): Promise<any> {
    this.throwNotImplemented();
  }

  async chat(): Promise<any> {
    this.throwNotImplemented();
  }

  async analyzeProgress(): Promise<any> {
    this.throwNotImplemented();
  }
}
