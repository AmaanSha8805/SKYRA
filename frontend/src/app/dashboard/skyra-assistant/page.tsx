'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How do I analyze my resume?",
  "How to find matching jobs?",
  "How does Interview Coach work?",
  "Generate my career roadmap",
  "What is skill gap analysis?",
  "How to create a cover letter?",
  "Who built SKYRA?",
  "What can SKYRA do for me?"
];

function SkyraAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = authClient.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

      const limitedHistory = messages.slice(-20).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: content.trim(),
          conversation_history: limitedHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to get response');
      }

      const data = await response.json();

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error calling chat API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[rgba(139,92,246,0.2)]">
        <div className="flex items-center gap-3">
          <img
            src="/skyra-logo.png"
            alt="SKYRA"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-semibold text-white">SKYRA Assistant</h1>
            <p className="text-sm text-white/60">Your AI career companion</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <img
              src="/skyra-logo.png"
              alt="SKYRA"
              className="w-24 h-24 object-contain opacity-50"
            />
            <div className="text-center">
              <p className="text-white/60 text-lg mb-4">What can I help you with?</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className={cn(
                      'px-4 py-2 text-sm',
                      'bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]',
                      'text-white/80 rounded-full',
                      'hover:bg-[rgba(233,30,140,0.2)] hover:border-[rgba(233,30,140,0.3)]',
                      'transition-all duration-200'
                    )}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4 max-w-4xl mx-auto',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <img
                    src="/skyra-logo.png"
                    alt="SKYRA"
                    className="w-8 h-8 object-contain mt-1"
                  />
                )}
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-6 py-4',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#E91E8C] to-[#8b5cf6] text-white'
                      : 'glass border border-[rgba(139,92,246,0.2)] text-white/90'
                  )}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs mt-2 opacity-60">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-center">
                <img
                  src="/skyra-logo.png"
                  alt="SKYRA"
                  className="w-8 h-8 object-contain mt-1"
                />
                <div className="glass border border-[rgba(139,92,246,0.2)] rounded-2xl px-6 py-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-[rgba(139,92,246,0.2)]">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
            placeholder="Ask me anything about your career..."
            className={cn(
              'flex-1 px-6 py-3',
              'bg-[rgba(255,255,255,0.05)] border border-[rgba(139,92,246,0.2)]',
              'rounded-xl text-white text-base',
              'placeholder:text-white/40',
              'focus:outline-none focus:border-[#E91E8C]',
              'transition-all duration-200'
            )}
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              'px-6 py-3 rounded-xl',
              'bg-gradient-to-r from-[#E91E8C] to-[#8b5cf6]',
              'text-white text-base font-medium',
              'transition-all duration-200',
              'hover:shadow-lg hover:scale-105',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <SkyraAssistantPage />
    </ProtectedRoute>
  );
}
