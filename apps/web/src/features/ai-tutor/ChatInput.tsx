"use client";
import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface Props {
  onSend: (message: string) => Promise<void>;
  loading: boolean;
}

export function ChatInput({ onSend, loading }: Props) {
  const [text, setText] = useState('');

  const quickChips = [
    "Explain this topic.",
    "Give me an example.",
    "Quiz me.",
    "Summarize this lesson.",
    "I don't understand this.",
    "I only have one hour today.",
    "I have more time tomorrow.",
    "Why am I behind?",
    "What should I learn next?"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    const msg = text;
    setText('');
    await onSend(msg);
  };

  const handleChipClick = async (chip: string) => {
    if (loading) return;
    await onSend(chip);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 rounded-b-xl">
      <div className="flex flex-wrap gap-2 mb-3">
        {quickChips.map(chip => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            disabled={loading}
            className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask your AI Learning Tutor..."
          disabled={loading}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}

