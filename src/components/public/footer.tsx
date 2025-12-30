import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Heart } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Organization',
    links: [
      { label: 'Our Mission', href: '/about' },
      { label: 'Financial Integrity', href: '/financials' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Giving',
    links: [
      { label: 'Missionary Directory', href: '/workers' },
      { label: 'Ways to Give', href: '/ways-to-give' },
      { label: 'Make a Donation', href: '/checkout' },
      { label: 'Donor Portal', href: '#' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Mission Control', href: '/mc', badge: 'Admin' },
      { label: 'Missionary Dashboard', href: '/missionary-dashboard', badge: 'Field' },
      { label: 'Donor Portal', href: '/donor-dashboard', badge: 'Partner' },
    ],
  },
];

const socialLinks = [
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Twitter, href: '#', label: 'Twitter' },
  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-12 sm:py-16 lg:py-24 border-t border-white/5">
      <div className="container-responsive">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 lg:mb-16">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4 sm:space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white text-slate-950 rounded-lg flex items-center justify-center font-bold text-sm">
                GH
              </div>
              <span className="font-bold text-lg tracking-tight">
                GIVE<span className="font-light opacity-60">HOPE</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Bridging the gap between compassion and action. Supporting verified field partners in the world&apos;s most fractured regions.
            </p>
          </div>
          
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 lg:mb-8 text-white/40">
                {section.title}
              </h4>
              <ul className="space-y-3 sm:space-y-4 text-sm font-medium text-slate-300">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link 
                      href={link.href} 
                      className="hover:text-white transition-colors touch-target inline-flex items-center gap-2"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 lg:mb-8 text-white/40">
              Connect
            </h4>
            <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
              {socialLinks.map(({ Icon, href, label }) => (
                <a 
                  key={label}
                  href={href} 
                  aria-label={label}
                  className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all touch-target"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} GiveHope. <br className="sm:hidden" />
              Registered 501(c)(3) nonprofit.
            </p>
          </div>
        </div>
        
        <div className="pt-8 sm:pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <a 
            href="https://asymmetric.al/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors touch-target"
          >
            Made with <Heart className="h-3 w-3 text-rose-500 fill-current" /> by Asymmetric.al
          </a>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {legalLinks.map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="hover:text-white transition-colors touch-target"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
