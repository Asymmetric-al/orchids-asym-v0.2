'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Mission', href: '/about' },
  { label: 'Deployments', href: '/workers' },
  { label: 'Transparency', href: '/financials' },
  { label: 'Ways to Give', href: '/ways-to-give' }
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-2 sm:py-3" 
        : "bg-transparent py-4 sm:py-6"
    )}>
      <div className="container-responsive flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group relative z-50">
          <div className="h-8 w-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            GH
          </div>
          <span className={cn(
            "font-bold text-lg tracking-tight transition-colors",
            isScrolled || isMobileMenuOpen ? "text-slate-900" : "text-white"
          )}>
            GIVE<span className="font-light opacity-60">HOPE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity touch-target flex items-center",
                isScrolled ? "text-slate-600" : "text-white/90"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button 
            asChild 
            className={cn(
              "rounded-full px-5 lg:px-6 font-bold uppercase tracking-widest text-[10px] h-10 shadow-lg",
              isScrolled 
                ? "bg-slate-900 text-white" 
                : "bg-white text-slate-900 hover:bg-slate-100"
            )}
          >
            <Link href="/workers">Give Now</Link>
          </Button>
        </div>

        <button 
          className={cn(
            "md:hidden p-2 touch-target flex items-center justify-center relative z-50 -mr-2",
            isScrolled || isMobileMenuOpen ? "text-slate-900" : "text-white"
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div 
        className={cn(
          "md:hidden fixed inset-0 bg-white z-40 transition-all duration-300 ease-out",
          isMobileMenuOpen 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        <div className="container-responsive pt-20 pb-8 flex flex-col h-full">
          <div className="flex flex-col gap-2 flex-1">
            {navLinks.map((link, index) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-xl font-bold text-slate-900 py-4 border-b border-slate-100 touch-target flex items-center",
                  "transition-all duration-300 delay-[var(--delay)]",
                  isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ '--delay': `${(index + 1) * 50}ms` } as React.CSSProperties}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="pt-6 safe-area-bottom">
            <Button 
              asChild 
              className="w-full h-14 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-xs shadow-lg"
            >
              <Link href="/workers" onClick={() => setIsMobileMenuOpen(false)}>
                Give Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
