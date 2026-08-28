import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, BookOpen, Lightbulb, HelpCircle, FileText, PenTool, CheckCircle2, XCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { useSkillContext } from '@/hooks/useSkillContext';
import { useAuth } from '@/lib/auth/auth-provider';

interface AiTutorProps {
  task: any;
  onClose: () => void;
}

// ---------------------------------------------------------
// TYPE DEFINITIONS
// ---------------------------------------------------------

type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

type AIResponse = 
  | { type: 'text'; content: string }
  | { type: 'explain'; skill: string; explanation: string; keyTakeaways: string[]; codeExample?: string }
  | { type: 'quiz'; title: string; questions: QuizQuestion[] }
  | { type: 'document'; title: string; contentMarkdown: string; summary: string; suggestedReferences: string[] }
  | { type: 'chat'; message: string; suggestedFollowups: string[] }
  | { type: 'pdf_success'; documentId: string; skillId: string }
  | { type: 'resources'; message: string; resources: { title: string; url: string }[] };

type Message = {
  role: 'user';
  content: string;
} | {
  role: 'assistant';
  content: AIResponse;
};

// ---------------------------------------------------------
// NORMALIZATION
// ---------------------------------------------------------

function normalizeAIResponse(data: any): AIResponse {
  if (!data) return { type: 'text', content: "Received empty response" };

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return { type: 'text', content: data };
    }
  }
  
  if (data.quizTitle && data.questions) {
    return { type: 'quiz', title: data.quizTitle, questions: data.questions };
  }
  
  if (data.explanation && data.keyTakeaways) {
    return { type: 'explain', skill: data.skill || '', explanation: data.explanation, keyTakeaways: data.keyTakeaways, codeExample: data.codeExample };
  }
  
  if (data.contentMarkdown && data.summary) {
    return { type: 'document', title: data.title || '', contentMarkdown: data.contentMarkdown, summary: data.summary, suggestedReferences: data.suggestedReferences || [] };
  }
  
  if (data.message) {
    return { type: 'chat', message: data.message, suggestedFollowups: data.suggestedFollowups || [] };
  }
  
  const possibleText = data.text || data.response || data.result || data.content;
  if (typeof possibleText === 'string') {
    return { type: 'text', content: possibleText };
  }
  
  return { type: 'text', content: "Received a response that couldn't be formatted. Please try a different question." }; 
}

// ---------------------------------------------------------
// MARKDOWN RENDERER
// ---------------------------------------------------------

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+)`/);

    const matches = [
      { type: 'bold', match: boldMatch },
      { type: 'italic', match: italicMatch },
      { type: 'code', match: codeMatch },
    ].filter(m => m.match && m.match.index !== undefined);

    if (matches.length === 0) {
      parts.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    matches.sort((a, b) => a.match!.index! - b.match!.index!);
    const firstMatch = matches[0];
    const matchData = firstMatch.match!;
    const index = matchData.index!;

    if (index > 0) {
      parts.push(<span key={keyIdx++}>{remaining.substring(0, index)}</span>);
    }

    if (firstMatch.type === 'bold') {
      parts.push(<strong key={keyIdx++} className="font-bold">{matchData[1]}</strong>);
    } else if (firstMatch.type === 'italic') {
      parts.push(<em key={keyIdx++} className="italic">{matchData[1]}</em>);
    } else if (firstMatch.type === 'code') {
      parts.push(<code key={keyIdx++} className="bg-[var(--color-surface)] px-1 py-0.5 rounded text-[var(--color-primary)] text-xs font-mono border border-[var(--color-border-light)]">{matchData[1]}</code>);
    }

    remaining = remaining.substring(index + matchData[0].length);
  }

  return parts;
}

function SafeMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        nodes.push(
          <pre key={`code-${i}`} className="bg-gray-900 text-gray-100 p-3 rounded-xl overflow-x-auto text-xs font-mono my-3 shadow-inner">
            <code>{codeContent.trim()}</code>
          </pre>
        );
        inCodeBlock = false;
        codeContent = '';
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    if (line.match(/^### (.*$)/)) {
      nodes.push(<h3 key={`h3-${i}`} className="text-base font-extrabold mt-5 mb-2 tracking-tight text-[var(--color-foreground)]">{parseInlineMarkdown(line.replace(/^### /, ''))}</h3>);
      continue;
    }
    if (line.match(/^## (.*$)/)) {
      nodes.push(<h2 key={`h2-${i}`} className="text-lg font-extrabold mt-6 mb-3 tracking-tight text-[var(--color-foreground)]">{parseInlineMarkdown(line.replace(/^## /, ''))}</h2>);
      continue;
    }
    if (line.match(/^# (.*$)/)) {
      nodes.push(<h1 key={`h1-${i}`} className="text-xl font-black mt-6 mb-4 tracking-tight text-[var(--color-foreground)]">{parseInlineMarkdown(line.replace(/^# /, ''))}</h1>);
      continue;
    }
    
    const bulletMatch = line.match(/^\s*-\s+(.*)$/);
    if (bulletMatch) {
      nodes.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1.5 ml-1">
          <span className="text-[var(--color-primary)] font-bold mt-0.5">•</span>
          <div className="flex-1 leading-relaxed">{parseInlineMarkdown(bulletMatch[1])}</div>
        </div>
      );
      continue;
    }
    
    const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numMatch) {
      nodes.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1.5 ml-1">
          <span className="text-[var(--color-primary)] font-bold mt-0.5 text-xs w-4">{numMatch[1]}.</span>
          <div className="flex-1 leading-relaxed">{parseInlineMarkdown(numMatch[2])}</div>
        </div>
      );
      continue;
    }
    
    if (line.trim() === '') {
      continue; 
    }

    nodes.push(
      <p key={`p-${i}`} className="mb-3 leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  return <div className="text-sm text-[var(--color-foreground)] flex flex-col">{nodes}</div>;
}

// ---------------------------------------------------------
// QUIZ VIEW
// ---------------------------------------------------------

function QuizView({ title, questions }: { title: string, questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  return (
    <div className="flex flex-col gap-6 w-full mt-2">
      <div className="flex items-center gap-2 border-b border-[var(--color-border-light)] pb-4 mb-2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-foreground)] leading-tight">{title}</h3>
      </div>
      
      {questions.map((q, idx) => {
        const selected = answers[idx];
        const isAnswered = selected !== undefined;
        
        return (
          <div key={idx} className="flex flex-col bg-white border border-[var(--color-border-light)] rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-base mb-4 text-[var(--color-foreground)]">{idx + 1}. {q.questionText}</h4>
            
            <div className="flex flex-col gap-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selected === optIdx;
                const isCorrect = optIdx === q.correctAnswerIndex;
                
                let btnClass = "text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ";
                
                if (!isAnswered) {
                  btnClass += "border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)]";
                } else if (isCorrect) {
                  btnClass += "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected && !isCorrect) {
                  btnClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  btnClass += "border-[var(--color-border-light)] opacity-50 bg-gray-50 text-gray-500";
                }
                
                return (
                  <button 
                    key={optIdx} 
                    disabled={isAnswered}
                    onClick={() => setAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                    className={btnClass}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        isAnswered && isCorrect ? 'border-green-500 bg-green-500 text-white' :
                        isAnswered && isSelected ? 'border-red-500 bg-red-500 text-white' :
                        'border-gray-300'
                      }`}>
                        {isAnswered && isCorrect && <Check className="w-3 h-3" />}
                        {isAnswered && isSelected && !isCorrect && <X className="w-3 h-3" />}
                      </div>
                      <span className="leading-relaxed">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {isAnswered && (
              <div className={`mt-4 p-4 rounded-xl border ${selected === q.correctAnswerIndex ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {selected === q.correctAnswerIndex ? (
                    <span className="font-bold text-green-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct!</span>
                  ) : (
                    <span className="font-bold text-red-700 flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect</span>
                  )}
                </div>
                <div className="text-sm leading-relaxed text-gray-800">
                  <SafeMarkdown content={q.explanation} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------
// ASSISTANT MESSAGE RENDERER
// ---------------------------------------------------------

function AssistantMessage({ msg }: { msg: AIResponse }) {
  switch (msg.type) {
    case 'text':
      return <SafeMarkdown content={msg.content} />;
      
    case 'chat':
      return (
        <div className="flex flex-col gap-4 w-full">
          <SafeMarkdown content={msg.message} />
          {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {msg.suggestedFollowups.map((f, i) => (
                <div key={i} className="text-xs px-3 py-1.5 rounded-full bg-white border border-[var(--color-border-light)] text-[var(--color-primary)] font-medium shadow-sm">
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      );
      
    case 'explain':
      return (
        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-lg font-bold text-[var(--color-foreground)] border-b border-[var(--color-border-light)] pb-2 mb-2">
            What is {msg.skill}?
          </h3>
          <SafeMarkdown content={msg.explanation} />
          
          {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
            <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border-light)] mt-2">
              <h4 className="font-bold text-sm mb-3">Key Takeaways</h4>
              <ul className="space-y-2">
                {msg.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-[var(--color-primary)] mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {msg.codeExample && (
            <div className="mt-2">
              <h4 className="font-bold text-sm mb-2">Example</h4>
              <SafeMarkdown content={`\`\`\`\n${msg.codeExample}\n\`\`\``} />
            </div>
          )}
        </div>
      );
      
    case 'quiz':
      return <QuizView title={msg.title} questions={msg.questions} />;
      
    case 'document':
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-[var(--color-border-light)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-bold text-sm">{msg.title}</h3>
            </div>
            <div className="p-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Summary</h4>
              <p className="text-sm leading-relaxed mb-4">{msg.summary}</p>
              
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Details</h4>
              <SafeMarkdown content={msg.contentMarkdown} />
            </div>
          </div>
        </div>
      );
      
    case 'resources':
      return (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-sm font-medium">{msg.message}</p>
          <div className="flex flex-col gap-2">
            {msg.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-[var(--color-border-light)] rounded-xl hover:border-[var(--color-primary)] hover:shadow-sm transition-all group">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                  <div className="w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-red-600 border-b-4 border-b-transparent ml-0.5"></div>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold text-[var(--color-foreground)] truncate">{r.title}</span>
                  <span className="text-xs text-gray-500">YouTube</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      );
      
    case 'pdf_success':
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">PDF saved to Library</span>
          </div>
          <div className="flex gap-2 mt-2">
            {msg.documentId && (
              <Button 
                size="sm" 
                variant="default"
                className="flex-1 text-xs"
                onClick={async () => {
                  try {
                    const res = await apiClient.get(`/documents/${msg.documentId}/download`);
                    if (res.data?.url) {
                      window.open(res.data.url, "_blank", "noopener,noreferrer");
                    }
                  } catch(err) {
                    alert("Unable to open this PDF. Please try again.");
                  }
                }}
              >
                Open PDF
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 text-xs bg-white"
              onClick={() => {
                window.location.href = `/skill/${msg.skillId}/library`;
              }}
            >
              View in Library
            </Button>
          </div>
        </div>
      );
      
    default:
      return null;
  }
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------

export function AiTutor({ task, onClose }: AiTutorProps) {
  const { activeGoal } = useSkillContext();
  const { user } = useAuth();
  
  const storageKey = `odos-chat:${user?.id}:${activeGoal?.id}:${task.id}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch(e) {}
      }
    }
    return [
      { role: 'assistant', content: { type: 'text', content: `Hi! I'm your ODOS AI tutor for **${task.title}**. What would you like to explore?` } }
    ];
  });
  
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const savePdfToLibrary = async (normalized: AIResponse, taskTitle: string) => {
    try {
      let content = '';
      let title = `Study Notes: ${taskTitle}`;

      if (normalized.type === 'document') {
        content = normalized.contentMarkdown;
        title = normalized.title || title;
      } else if (normalized.type === 'explain') {
        content = `# What is ${normalized.skill || taskTitle}?\n\n${normalized.explanation}\n\n`;
        if (normalized.keyTakeaways && normalized.keyTakeaways.length > 0) {
          content += `## Key Takeaways\n${normalized.keyTakeaways.map(t => `- ${t}`).join('\n')}\n\n`;
        }
        if (normalized.codeExample) {
          content += `## Example\n\`\`\`\n${normalized.codeExample}\n\`\`\`\n`;
        }
      } else if (normalized.type === 'quiz') {
        content = `# Quiz: ${normalized.title}\n\n`;
        normalized.questions.forEach((q, i) => {
          content += `### ${i + 1}. ${q.questionText}\n\n`;
          q.options.forEach((opt, j) => {
            content += `- [${j === q.correctAnswerIndex ? 'x' : ' '}] ${opt}\n`;
          });
          content += `\n**Explanation:** ${q.explanation}\n\n`;
        });
        title = normalized.title || title;
      } else if (normalized.type === 'text') {
        content = normalized.content;
      } else if (normalized.type === 'chat') {
        content = normalized.message;
      } else {
        content = `# Notes on ${taskTitle}\n\nContent generated successfully.`;
      }

      if (!content || content.length < 10) return;

      const res = await apiClient.post('/documents/generate', {
        skillId: activeGoal?.id || task.id,
        title: title,
        type: 'pdf',
        content: content
      });
      
      const documentId = res.data?.documentId;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: { 
          type: 'pdf_success', 
          documentId,
          skillId: activeGoal?.id || task.id
        } 
      }]);
    } catch (saveErr) {
      console.error('Failed to save document to library:', saveErr);
      setMessages(prev => [...prev, { role: 'assistant', content: { type: 'text', content: '⚠️ The notes were generated, but I failed to save them as a PDF to your Library.' } }]);
    }
  };

  const handleContextAction = async (actionPath: string, userPrompt: string) => {
    if (loading) return;
    
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }]);
    setLoading(true);

    try {
      const res = await apiClient.post(`/ai/${actionPath}`, { skillName: task.title });
      const normalized = normalizeAIResponse(res.data);
      
      setMessages(prev => [...prev, { role: 'assistant', content: normalized }]);

      if (actionPath === 'document' || userPrompt.toLowerCase().includes('pdf')) {
        await savePdfToLibrary(normalized, task.title);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: { type: 'text', content: "I'm sorry, I couldn't generate a response right now. Please try again." } }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (overrideInput?: string) => {
    const userMsg = (overrideInput || input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // The chat endpoint takes { messages: any[] }
      const chatMessages = messages.map(m => {
        if (m.role === 'user') return { role: 'user', content: m.content as string };
        
        const asstMsg = m.content as AIResponse;
        let textContent = '';
        if (asstMsg.type === 'text') textContent = asstMsg.content;
        else if (asstMsg.type === 'chat') textContent = asstMsg.message;
        else if (asstMsg.type === 'explain') textContent = asstMsg.explanation;
        else if (asstMsg.type === 'quiz') textContent = `Quiz: ${asstMsg.title}`;
        else if (asstMsg.type === 'document') textContent = `Document: ${asstMsg.title}`;
        else textContent = "Response provided.";

        return { role: 'assistant', content: textContent };
      });

      chatMessages.push({ role: 'user', content: userMsg });
      
      const contextualMessages = [
        { 
          role: 'system', 
          content: `You are an expert ODOS AI tutor helping a student learn "${task.title}". 
You are acting as their personal tutor for this specific lesson within their broader goal of learning "${activeGoal?.targetSkill || 'a new skill'}".
The student's target proficiency level is: "${activeGoal?.targetLevel || 'Beginner'}".
The time allocated for today's lesson is: ${task.estimatedMinutes || activeGoal?.dailyMinutes || 30} minutes.

The current module is: "${task.moduleTitle || 'Learning Module'}".
The lesson description is: "${task.description || 'Focus on understanding this topic thoroughly.'}".

For educational questions, provide substantial depth appropriate for their question and allocated time. Where useful, include:
- A clear explanation (tailored to their ${activeGoal?.targetLevel || 'Beginner'} level)
- Why it matters
- An analogy
- Detailed examples (or code examples if programming)
- Common mistakes
- Practical applications
- Key takeaways

Match the depth to the complexity of the user's question and the length of the session. Do not force every section into every response, but do not provide artificially short answers. Ensure the content feels like a real, structured lesson. Keep formatting as clean Markdown.`
        },
        ...chatMessages
      ];

      const res = await apiClient.post('/ai/chat', { messages: contextualMessages });
      const normalized = normalizeAIResponse(res.data);
      
      setMessages(prev => [...prev, { role: 'assistant', content: normalized }]);
      
      if (normalized.type === 'document' || userMsg.toLowerCase().includes('pdf')) {
        await savePdfToLibrary(normalized, task.title);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: { type: 'text', content: "I'm sorry, I encountered an error connecting to the AI service." } }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPrompt = async (prompt: string) => {
    if (loading) return;
    setInput(prompt);
    setTimeout(() => handleChat(prompt), 0);
  };

  const handleFindVideos = async () => {
    if (loading) return;
    const prompt = 'Can you find some video resources for this topic?';
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setLoading(true);

    try {
      const res = await apiClient.get(`/resources/search?skillId=${task.id}&q=${encodeURIComponent(task.title + " tutorial youtube")}`);
      if (res.data && res.data.length > 0) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: { 
            type: 'resources', 
            message: 'Here are some helpful videos I found:', 
            resources: res.data.slice(0, 3) 
          } 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: { type: 'text', content: "No YouTube resources were found for this lesson. Try checking the Library!" } }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: { type: 'text', content: "I'm sorry, I encountered an error searching for resources." } }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-card)] border-l border-[var(--color-border-light)] shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)] bg-white/80 backdrop-blur-md">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
            <h3 className="font-bold text-sm text-[var(--color-foreground)] tracking-tight">ODOS AI</h3>
          </div>
          <p className="text-xs font-semibold text-[var(--color-foreground)]">Your tutor for: <span className="font-normal text-[var(--color-muted-foreground)]">{task.title}</span></p>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 rounded-full hover:bg-[var(--color-secondary)] text-[var(--color-muted-foreground)] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[var(--color-primary)] text-white rounded-br-none' 
                : 'bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-bl-none border border-[var(--color-border-light)] w-full'
            }`}>
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.content as string}</div>
              ) : (
                <AssistantMessage msg={msg.content as AIResponse} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="bg-[var(--color-secondary)] border border-[var(--color-border-light)] rounded-2xl rounded-bl-none px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-[var(--color-border-light)] space-y-3">
        {/* Contextual Action Chips */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 mask-edges">
          <button onClick={() => handleContextAction('explain', 'Can you explain this concept in simple terms?')} className="flex-shrink-0 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)]">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> Explain
          </button>
          <button onClick={() => handleContextAction('quiz', 'Can you give me a short quiz on this topic?')} className="flex-shrink-0 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)]">
            <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Quiz Me
          </button>
          <button onClick={() => handleChatPrompt('Can you give me a real-world example?')} className="flex-shrink-0 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)]">
            <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Example
          </button>
          <button onClick={() => handleChatPrompt('Can you give me a practice exercise?')} className="flex-shrink-0 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)]">
            <PenTool className="w-3.5 h-3.5 mr-1.5" /> Practice
          </button>
          <button onClick={() => handleContextAction('document', 'Can you summarize this into key study notes?')} className="flex-shrink-0 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)]">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Summarize
          </button>
          <button onClick={() => handleContextAction('document', 'Can you generate detailed notes for this topic and save them as a PDF?')} className="flex-shrink-0 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)]">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Save as PDF
          </button>
          <button onClick={handleFindVideos} className="flex-shrink-0 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)]">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Find Videos
          </button>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
            placeholder={`Ask ODOS about this lesson...`}
            className="w-full bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-xl py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
            disabled={loading}
          />
          <button 
            onClick={() => handleChat()}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
