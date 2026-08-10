import { Injectable, BadRequestException } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';

@Injectable()
export class GrokProvider implements AIProvider {
  private throwNotImplemented(): never {
    throw new BadRequestException('Grok integration is not functional yet');
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
