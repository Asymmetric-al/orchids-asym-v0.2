import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-24 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white text-slate-950 rounded-lg flex items-center justify-center font-bold text-sm">GH</div>
              <span className="font-bold text-lg tracking-tight">GIVE<span className="font-light opacity-60">HOPE</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Bridging the gap between compassion and action. Supporting verified field partners in the world's most fractured regions.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-white/40">Organization</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-300">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Mission</Link></li>
              <li><Link href="/financials" className="hover:text-white transition-colors">Financial Integrity</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-white/40">Giving</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-300">
              <li><Link href="/workers" className="hover:text-white transition-colors">Missionary Directory</Link></li>
              <li><Link href="/ways-to-give" className="hover:text-white transition-colors">Ways to Give</Link></li>
              <li><Link href="/checkout" className="hover:text-white transition-colors">Make a Donation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Donor Portal</Link></li>
            </ul>
          </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-white/40">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-300">
                <li><Link href="/admin" className="hover:text-white transition-colors flex items-center gap-2">Mission Control (Admin Dashboard) <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">Admin</span></Link></li>
                <li><Link href="/my" className="hover:text-white transition-colors flex items-center gap-2">Missionary Dashboard <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">Field</span></Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">Donor Portal <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">Partner</span></Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-white/40">Connect</h4>
            <div className="flex gap-4 mb-8">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} GiveHope. <br />
              Registered 501(c)(3) nonprofit.
            </p>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <a 
            href="https://asymmetric.al/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
          >
            Made with <Heart className="h-3 w-3 text-rose-500 fill-current" /> by Asymmetric.al
          </a>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
