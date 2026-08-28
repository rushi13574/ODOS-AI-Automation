"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { queryCache } from '@/lib/cache';

interface DynamicQuestion {
  id: string;
  question: string;
  type: 'single_select' | 'multi_select';
  options: string[];
}

export function OnboardingForm() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loadingStep, setLoadingStep] = useState(0); 
  const [error, setError] = useState<string | null>(null);
  const [createdGoalId, setCreatedGoalId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    topic: '',
    currentLevel: '',
    dailyTime: '',
  });

  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicQuestion[] | null>(null);
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string | string[]>>({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const fetchDynamicQuestions = async (skillName: string) => {
    setIsGeneratingQuestions(true);
    try {
      const res = await apiClient.post('/ai/onboarding-questions', { skillName });
      setDynamicQuestions(res.data.questions || []);
    } catch (err) {
      console.warn("AI questions generation failed, falling back.", err);
      // Fallback questions
      setDynamicQuestions([
        {
          id: 'goal',
          question: 'What do you want to achieve with this skill?',
          type: 'single_select',
          options: ['Personal interest', 'Career growth', 'Academic requirement', 'Professional proficiency']
        },
        {
          id: 'focus',
          question: 'Which area would you like to focus on?',
          type: 'multi_select',
          options: ['Fundamentals', 'Practical application', 'Advanced concepts', 'Everything']
        },
        {
          id: 'learning_style',
          question: 'How would you prefer to learn?',
          type: 'single_select',
          options: ['Build projects', 'Guided lessons', 'Reading materials', 'Combination']
        }
      ]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && formData.topic.trim()) {
      fetchDynamicQuestions(formData.topic);
    }
    setStep(s => s + 1);
  };
  
  const handleBack = () => setStep(s => s - 1);

  const toggleMultiSelect = (qId: string, option: string) => {
    setDynamicAnswers(prev => {
      const current = (prev[qId] as string[]) || [];
      if (current.includes(option)) {
        return { ...prev, [qId]: current.filter(o => o !== option) };
      }
      return { ...prev, [qId]: [...current, option] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFinalStep) {
      handleNext();
      return;
    }

    if (!formData.topic || !formData.currentLevel || !formData.dailyTime) {
      setError('Please fill in all fields to continue.');
      return;
    }

    let goalId: string | null = null;
    let currentStage = 1;

    try {
      setError(null);
      setLoadingStep(1);
      
      const formattedContext = dynamicQuestions?.map(q => {
        const ans = dynamicAnswers[q.id];
        return `${q.question}: ${Array.isArray(ans) ? ans.join(', ') : (ans || 'Not specified')}`;
      }).join(' | ') || '';

      const goalRes = await apiClient.post('/learning-goals', {
        skillName: formData.topic,
        currentLevel: formData.currentLevel,
        targetLevel: formData.currentLevel.includes('Advanced') ? 'expert' : 'advanced', 
        dailyMinutes: parseInt(formData.dailyTime.split(' ')[0]) || 30,
        learningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      });
      
      goalId = goalRes.data.id;
      setCreatedGoalId(goalId);

      currentStage = 2;
      setLoadingStep(2);
      await apiClient.post('/roadmaps/generate', {
        prompt: `Create a curriculum for ${formData.topic} from ${formData.currentLevel} to advanced. Additional learner context: ${formattedContext}`,
        learningGoalId: goalId
      }, { timeout: 90000 });

      currentStage = 3;
      setLoadingStep(3);
      const roadmapRes = await apiClient.get(`/roadmaps/by-goal/${goalId}`);
      const roadmap = roadmapRes.data;

      currentStage = 4;
      setLoadingStep(4);
      const tasks: any[] = [];
      if (roadmap.modules) {
        roadmap.modules.forEach((mod: any) => {
          if (mod.skills) {
            mod.skills.forEach((skill: any) => {
              const deps = roadmap.prerequisites
                ?.filter((p: any) => p.targetSkillNodeId === skill.id)
                .map((p: any) => p.requiredSkillNodeId) || [];
                
              tasks.push({
                skillNodeId: skill.id,
                estimatedMinutes: skill.estimatedMinutes || 30,
                prerequisites: deps
              });
            });
          }
        });
      }

      await apiClient.post('/schedule/baseline', {
        roadmapId: goalId,
        tasks
      });

      currentStage = 5;
      setLoadingStep(5);
      
      // Invalidate the learning-goals cache so layout.tsx doesn't redirect back to onboarding
      queryCache.invalidate('learning-goals');
      
      router.push(`/skill/${goalId}/main`);
    } catch (err: any) {
      console.error("[ONBOARDING ERROR]", err, err.response?.data);
      // Do not leave a failed, active goal behind. An active goal prevents the
      // onboarding gate from offering a retry even though its roadmap may not
      // exist yet.
      if (goalId) {
        try {
          await apiClient.patch(`/learning-goals/${goalId}`, { status: 'abandoned' });
        } catch (cleanupError) {
          console.error('[ONBOARDING CLEANUP ERROR]', cleanupError);
        }
      }
      const errDetail = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(`Failed at step ${currentStage}. Error: ${typeof errDetail === 'object' ? JSON.stringify(errDetail) : errDetail}`);
      setLoadingStep(0);
    }
  };

  const totalSteps = 3 + (dynamicQuestions ? dynamicQuestions.length : 0);
  const isFinalStep = dynamicQuestions && step === totalSteps;

  if (loadingStep > 0) {
    const steps = [
      { id: 1, label: 'Understanding your learning goal...' },
      { id: 2, label: 'Designing your learning journey...' },
      { id: 3, label: 'Organizing your skills...' },
      { id: 4, label: 'Planning your learning schedule...' },
      { id: 5, label: 'Your journey is ready.' },
    ];

    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center">
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.id} className={`flex items-center gap-4 text-left transition-opacity duration-500 ${loadingStep >= s.id ? 'opacity-100' : 'opacity-0'}`}>
              <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                {loadingStep > s.id || loadingStep === 5 ? (
                  <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
                ) : loadingStep === s.id ? (
                  <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-border-light)]" />
                )}
              </div>
              <span className={`text-lg ${loadingStep === s.id ? 'font-bold text-[var(--color-foreground)]' : loadingStep > s.id ? 'font-medium text-[var(--color-muted-foreground)]' : 'text-[var(--color-muted-foreground)]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {loadingStep === 5 && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button size="lg" onClick={() => router.push(`/skill/${createdGoalId}/main`)} className="w-full sm:w-auto font-semibold rounded-full px-8 py-6 text-lg group bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90">
              Start Learning <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Handle waiting for AI generation when arriving at step 4
  if (step >= 4 && !dynamicQuestions && isGeneratingQuestions) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 sm:px-6 text-center">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Personalizing your learning questions...</h2>
        <p className="text-[var(--color-muted-foreground)]">ODOS is tailoring the experience to {formData.topic}.</p>
      </div>
    );
  }

  // Determine current dynamic question index if step >= 4
  const dynamicQuestionIndex = step - 4;
  const currentDynamicQuestion = dynamicQuestions ? dynamicQuestions[dynamicQuestionIndex] : null;

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <Link 
          href="/home" 
          className="inline-flex items-center text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to My Learning
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-[var(--color-foreground)] tracking-tight">Let's personalize your journey</h1>
        
        {dynamicQuestions ? (
          <p className="text-[var(--color-muted-foreground)] font-medium">Step {step} of {totalSteps}</p>
        ) : (
          <p className="text-[var(--color-muted-foreground)] font-medium">Step {step}</p>
        )}
        
        {/* Progress indicator dots instead of large bar */}
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: dynamicQuestions ? totalSteps : 5 }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i + 1 <= step ? 'w-6 bg-[var(--color-primary)]' : 'w-2 bg-[var(--color-border-light)]'}`}
            />
          ))}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
          <h3 className="font-bold mb-1">ODOS couldn't finish creating your learning journey.</h3>
          <p className="text-sm opacity-80 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setError(null)} className="bg-white">Try Again</Button>
        </div>
      )}

      <div className="max-w-2xl mx-auto py-8">
        <form onSubmit={isFinalStep ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
              <label className="block text-xl font-bold text-[var(--color-foreground)] mb-4 tracking-tight">
                What would you like to learn?
              </label>
              <input 
                type="text" 
                autoFocus
                placeholder="e.g. Hindi, React, Photography, Cooking"
                className="w-full p-4 border border-[var(--color-border-light)] rounded-xl text-lg focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none bg-[var(--color-background)] transition-all"
                value={formData.topic}
                onChange={e => setFormData({...formData, topic: e.target.value})}
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-2 space-y-4">
              <label className="block text-xl font-bold text-[var(--color-foreground)] mb-4 tracking-tight">
                How would you describe your current level?
              </label>
              <div className="space-y-3">
                {['Absolute Beginner', 'Basic knowledge', 'Intermediate', 'Advanced'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, currentLevel: level});
                      handleNext();
                    }}
                    className={`w-full p-4 text-left border rounded-xl font-medium transition-all ${
                      formData.currentLevel === level 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' 
                        : 'border-[var(--color-border-light)] bg-[var(--color-background)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)] text-[var(--color-foreground)]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-2 space-y-4">
              <label className="block text-xl font-bold text-[var(--color-foreground)] mb-4 tracking-tight">
                How much time can you realistically spend learning each day?
              </label>
              <div className="space-y-3">
                {['15 minutes', '30 minutes', '1 hour', '2 hours', '4 hours'].map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, dailyTime: time});
                      handleNext();
                    }}
                    className={`w-full p-4 text-left border rounded-xl font-medium transition-all ${
                      formData.dailyTime === time 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' 
                        : 'border-[var(--color-border-light)] bg-[var(--color-background)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)] text-[var(--color-foreground)]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step >= 4 && currentDynamicQuestion && (
            <div className="animate-in fade-in slide-in-from-right-2 space-y-4">
              <label className="block text-xl font-bold text-[var(--color-foreground)] mb-4 tracking-tight">
                {currentDynamicQuestion.question}
                {currentDynamicQuestion.type === 'multi_select' && (
                  <span className="block text-sm font-normal text-[var(--color-muted-foreground)] mt-1">Select all that apply</span>
                )}
              </label>
              <div className="space-y-3">
                {currentDynamicQuestion.options.map(option => {
                  const qId = currentDynamicQuestion.id;
                  const isMulti = currentDynamicQuestion.type === 'multi_select';
                  const currentAns = dynamicAnswers[qId];
                  const isSelected = isMulti 
                    ? (currentAns as string[] || []).includes(option)
                    : currentAns === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (isMulti) {
                          toggleMultiSelect(qId, option);
                        } else {
                          setDynamicAnswers({ ...dynamicAnswers, [qId]: option });
                          if (!isFinalStep) {
                            setTimeout(handleNext, 300); // auto advance single select with slight delay
                          }
                        }
                      }}
                      className={`w-full p-4 text-left border rounded-xl font-medium transition-all ${
                        isSelected 
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' 
                          : 'border-[var(--color-border-light)] bg-[var(--color-background)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)] text-[var(--color-foreground)]'
                      }`}
                    >
                      <div className="flex items-center">
                        {isMulti && (
                          <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border ${isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border-light)]'}`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                        )}
                        {option}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 mt-4">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={handleBack} className="font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {!isFinalStep ? (
              <Button 
                type="submit" 
                className="font-semibold px-8 rounded-full"
                disabled={!!(
                  (step === 1 && !formData.topic.trim()) ||
                  (step === 2 && !formData.currentLevel) ||
                  (step === 3 && !formData.dailyTime) ||
                  (step >= 4 && currentDynamicQuestion && (!dynamicAnswers[currentDynamicQuestion.id] || (currentDynamicQuestion.type === 'multi_select' && dynamicAnswers[currentDynamicQuestion.id].length === 0)))
                )}
              >
                Continue
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="font-semibold px-8 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                disabled={!!(currentDynamicQuestion && (!dynamicAnswers[currentDynamicQuestion.id] || (currentDynamicQuestion.type === 'multi_select' && dynamicAnswers[currentDynamicQuestion.id].length === 0)))}
              >
                Generate Journey
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
