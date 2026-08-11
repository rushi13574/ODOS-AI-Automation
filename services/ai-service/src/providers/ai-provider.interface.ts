import { ProviderConfig } from './provider-config.interface';

export interface AIProvider {
  generateRoadmap(prompt: string, config: ProviderConfig): Promise<any>;
  explainSkill(skillName: string, config: ProviderConfig): Promise<any>;
  generateQuiz(skillName: string, config: ProviderConfig): Promise<any>;
  generateDocument(skillName: string, config: ProviderConfig): Promise<any>;
  chat(messages: any[], config: ProviderConfig): Promise<any>;
  analyzeProgress(progressData: any, config: ProviderConfig): Promise<any>;
}
