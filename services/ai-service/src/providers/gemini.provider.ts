import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private getClient(apiKey: string): GoogleGenAI {
    if (!apiKey) {
      throw new BadRequestException('Gemini API key is required');
    }
    return new GoogleGenAI({ apiKey });
  }

  async generateRoadmap(prompt: string, config: any): Promise<any> {
    const ai = this.getClient(config.apiKey);
    const model = config.model || 'gemini-1.5-pro';

    const systemInstruction = `
      You are an expert curriculum designer. Generate a structured learning roadmap for learning a skill.
      You MUST NOT include any absolute calendar dates (e.g., 'October 1st') or relative dates ('next week').
      Instead, model the sequence structure using sequential indexes and estimated minutes.
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        skill: { type: Type.STRING },
        modules: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                    difficulty: { type: Type.STRING },
                    estimatedMinutes: { type: Type.INTEGER },
                    prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                    learningType: { type: Type.STRING },
                    practice: { type: Type.ARRAY, items: { type: Type.STRING } },
                    assessment: { type: Type.ARRAY, items: { type: Type.STRING } },
                    projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['title', 'description', 'difficulty', 'estimatedMinutes', 'learningType'],
                },
              },
            },
            required: ['title', 'skills'],
          },
        },
      },
      required: ['skill', 'modules'],
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}');
  }

  async explainSkill(skillName: string, config: any): Promise<any> {
    const ai = this.getClient(config.apiKey);
    const model = config.model || 'gemini-1.5-pro';

    const schema = {
      type: Type.OBJECT,
      properties: {
        skill: { type: Type.STRING },
        explanation: { type: Type.STRING },
        keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
        codeExample: { type: Type.STRING },
      },
      required: ['skill', 'explanation', 'keyTakeaways'],
    };

    const response = await ai.models.generateContent({
      model,
      contents: `Provide a detailed explanation of the skill: ${skillName}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}');
  }

  async generateQuiz(skillName: string, config: any): Promise<any> {
    const ai = this.getClient(config.apiKey);
    const model = config.model || 'gemini-1.5-pro';

    const schema = {
      type: Type.OBJECT,
      properties: {
        quizTitle: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['questionText', 'options', 'correctAnswerIndex', 'explanation'],
          },
        },
      },
      required: ['quizTitle', 'questions'],
    };

    const response = await ai.models.generateContent({
      model,
      contents: `Create a quiz with 3 multiple choice questions for the skill: ${skillName}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}');
  }

  async generateDocument(skillName: string, config: any): Promise<any> {
    const ai = this.getClient(config.apiKey);
    const model = config.model || 'gemini-1.5-pro';

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        contentMarkdown: { type: Type.STRING },
        summary: { type: Type.STRING },
        suggestedReferences: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['title', 'contentMarkdown', 'summary'],
    };

    const response = await ai.models.generateContent({
      model,
      contents: `Generate a comprehensive markdown documentation sheet for: ${skillName}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}');
  }

  async chat(messages: any[], config: any): Promise<any> {
    const ai = this.getClient(config.apiKey);
    const model = config.model || 'gemini-1.5-pro';

    const schema = {
      type: Type.OBJECT,
      properties: {
        message: { type: Type.STRING },
        suggestedFollowups: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['message'],
    };

    // Format chat history into Gemini contents format
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}');
  }

  async analyzeProgress(progressData: any, config: any): Promise<any> {
    const ai = this.getClient(config.apiKey);
    const model = config.model || 'gemini-1.5-pro';

    const schema = {
      type: Type.OBJECT,
      properties: {
        performanceSummary: { type: Type.STRING },
        completionPercentage: { type: Type.NUMBER },
        recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        motivationMessage: { type: Type.STRING },
      },
      required: ['performanceSummary', 'completionPercentage', 'recommendedActions'],
    };

    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this learning progress data: ${JSON.stringify(progressData)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}');
  }
}
