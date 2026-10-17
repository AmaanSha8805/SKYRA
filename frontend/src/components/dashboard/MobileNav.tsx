'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems, NavItem } from '@/types/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#050508]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 z-50 h-full w-64 border-r border-white/10 bg-[#0a0a12] animate-in slide-in-from-left duration-300">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Image
                src="/skyra-logo.png"
                alt="SKYRA Logo"
                width={32}
                height={32}
                className="drop-shadow-[0_0_10px_rgba(233,30,140,0.5)]"
              />
              <span className="text-lg text-white">SKYRA</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#12121c] rounded-lg transition-colors text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <MobileNavItem
                    item={item}
                    isActive={pathname === item.href}
                    onClick={onClose}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

interface MobileNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function MobileNavItem({ item, isActive, onClick }: MobileNavItemProps) {
  const Icon = item.icon;
  
  const content = (
    <>
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-sm font-medium">{item.label}</span>
      {item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full gradient-pink px-1.5 text-xs text-white">
          {item.badge}
        </span>
      )}
    </>
  );

  if (item.disabled) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/60 opacity-50 cursor-not-allowed">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200',
        'hover:bg-[#12121c] hover:text-white',
        isActive && 'gradient-pink text-white glow-pink',
        !isActive && 'text-white/60'
      )}
    >
      {content}
    </Link>
  );
}
