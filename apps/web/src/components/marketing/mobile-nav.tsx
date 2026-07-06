'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/story', label: 'Story' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/help', label: 'Help' },
];

export function MarketingMobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-14 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <nav className="fixed inset-x-0 top-14 z-50 border-b border-border/40 bg-background p-4 shadow-lg">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-gradient-primary px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Get Started Free
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
