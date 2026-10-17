'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[20px] p-6 md:p-8"
        style={{
          background: 'rgba(13,13,31,0.95)',
          border: '0.5px solid rgba(139,92,246,0.2)',
          backdropFilter: 'blur(20px)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="modal-title"
            className="text-2xl font-semibold text-white"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-white/90">
          {children}
        </div>
      </div>
    </div>
  );
}
