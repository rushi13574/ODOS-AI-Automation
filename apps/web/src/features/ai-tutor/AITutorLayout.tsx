"use client";
import React, { useRef, useEffect } from 'react';
import { useAITutor } from '../../hooks/useAITutor';
import { ContextSidebar } from './ContextSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function AITutorLayout({ roadmapId }: { roadmapId: string }) {
  const { messages, sendMessage, loading, error, currentContext } = useAITutor(roadmapId);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] pb-20 md:pb-8 flex flex-col md:flex-row gap-6">
      
      {/* Sidebar for Context (hidden on small mobile, takes 1/3 on desktop) */}
      <div className="hidden md:block w-1/3 flex-shrink-0 h-full">
        <ContextSidebar context={currentContext} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">ODOS Learning Tutor</h2>
            <p className="text-xs text-gray-500">Context-aware AI assistant</p>
          </div>
          {error && (
            <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
              Connection Error
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hello! I'm your ODOS AI Tutor.</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                I am directly integrated with your current `{currentContext?.today?.skill || 'learning'}` roadmap. Ask me to explain concepts, give examples, or even help adjust your schedule!
              </p>
            </div>
          )}

          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          <div ref={endOfMessagesRef} />
        </div>

        {/* Chat Input */}
        <ChatInput onSend={sendMessage} loading={loading} />
      </div>

    </div>
  );
}

