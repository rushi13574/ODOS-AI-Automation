"use client";
import React from 'react';
import { ChatMessage as MsgType } from '../../hooks/useAITutor';
import { Bot, User, CheckCircle } from 'lucide-react';

interface Props {
  message: MsgType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  if (message.type === 'system_action') {
    return (
      <div className="flex w-full mb-6 justify-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-[85%] sm:max-w-[70%]">
          <div className="flex items-center text-amber-800 font-bold mb-2">
            <Bot className="w-5 h-5 mr-2" />
            System Action Proposed
          </div>
          <p className="text-amber-900 text-sm leading-relaxed mb-3">
            {message.content}
          </p>
          {message.actionDetails?.rescheduled && (
            <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4 mr-1" />
              Scheduler Service Validated: Calendar updated.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] sm:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 ml-3' : 'bg-gray-800 mr-3'}`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>
        
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm'
        }`}>
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          {message.type === 'recommendation' && (
            <div className="mt-3 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 inline-block">
              ODOS AI Recommendation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

