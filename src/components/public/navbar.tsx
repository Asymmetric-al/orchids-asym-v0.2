'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoSvg from '@/assets/svg/logo';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-3" : "bg-transparent py-6"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">GH</div>
          <span className={cn(
            "font-bold text-lg tracking-tight transition-colors",
            isScrolled ? "text-slate-900" : "text-white"
          )}>GIVE<span className="font-light opacity-60">HOPE</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Mission', href: '/about' },
            { label: 'Deployments', href: '/workers' },
            { label: 'Transparency', href: '/financials' },
            { label: 'Ways to Give', href: '/ways-to-give' }
          ].map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity",
                isScrolled ? "text-slate-600" : "text-white/90"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button 
            asChild 
            className={cn(
              "rounded-full px-6 font-bold uppercase tracking-widest text-[10px] h-10 shadow-lg",
              isScrolled ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-100"
            )}
          >
            <Link href="/workers">Give Now</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={cn("md:hidden p-2", isScrolled ? "text-slate-900" : "text-white")}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
          {[
            { label: 'Mission', href: '/about' },
            { label: 'Deployments', href: '/workers' },
            { label: 'Transparency', href: '/financials' },
            { label: 'Ways to Give', href: '/ways-to-give' }
          ].map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-bold text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-xs">
            <Link href="/workers">Give Now</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
