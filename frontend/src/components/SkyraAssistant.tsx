'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';

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

export function SkyraAssistant() {
  const [isOpen, setIsOpen] = useState(false);
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

      // Limit conversation history to last 20 messages to prevent size issues
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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full',
          'bg-[#0d0d1f] border-2 border-[#E91E8C]',
          'shadow-[0_0_20px_rgba(233,30,140,0.4)]',
          'flex items-center justify-center',
          'transition-all duration-300',
          'hover:scale-110 hover:shadow-[0_0_30px_rgba(233,30,140,0.6)]',
          'pulse',
          isOpen && 'rotate-45'
        )}
        style={{ width: '52px', height: '52px' }}
      >
        <img
          src="/skyra-logo.png"
          alt="SKYRA"
          className="w-8 h-8 object-contain"
        />
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50',
            'w-[380px] h-[520px]',
            'bg-[#0d0d1f] border border-[rgba(139,92,246,0.3)]',
            'rounded-[20px]',
            'shadow-2xl',
            'flex flex-col',
            'animate-in fade-in slide-in-from-bottom-4 duration-300',
            'glass-strong'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(139,92,246,0.2)]">
            <div className="flex items-center gap-3">
              <img
                src="/skyra-logo.png"
                alt="SKYRA"
                className="w-8 h-8 object-contain"
              />
              <span className="text-white font-semibold">SKYRA Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: 'calc(100% - 140px)' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-white/60 text-sm mb-3">What can I help you with?</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className={cn(
                        'px-3 py-1.5 text-xs',
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
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && (
                      <img
                        src="/skyra-logo.png"
                        alt="SKYRA"
                        className="w-6 h-6 object-contain mt-1"
                      />
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5',
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#E91E8C] to-[#8b5cf6] text-white'
                          : 'glass border border-[rgba(139,92,246,0.2)] text-white/90'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-[10px] mt-1 opacity-60">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <img
                      src="/skyra-logo.png"
                      alt="SKYRA"
                      className="w-6 h-6 object-contain mt-1"
                    />
                    <div className="glass border border-[rgba(139,92,246,0.2)] rounded-2xl px-4 py-2.5">
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
          <div className="p-4 border-t border-[rgba(139,92,246,0.2)]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                placeholder="Ask me anything..."
                className={cn(
                  'flex-1 px-4 py-2.5',
                  'bg-[rgba(255,255,255,0.05)] border border-[rgba(139,92,246,0.2)]',
                  'rounded-xl text-white text-sm',
                  'placeholder:text-white/40',
                  'focus:outline-none focus:border-[#E91E8C]',
                  'transition-all duration-200'
                )}
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  'px-4 py-2.5 rounded-xl',
                  'bg-gradient-to-r from-[#E91E8C] to-[#8b5cf6]',
                  'text-white text-sm font-medium',
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
      )}
    </>
  );
}
