export interface AIProvider {
  generateRoadmap(prompt: string, config: any): Promise<any>;
  explainSkill(skillName: string, config: any): Promise<any>;
  generateQuiz(skillName: string, config: any): Promise<any>;
  generateDocument(skillName: string, config: any): Promise<any>;
  chat(messages: any[], config: any): Promise<any>;
  analyzeProgress(progressData: any, config: any): Promise<any>;
}
