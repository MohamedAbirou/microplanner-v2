import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-brand relative overflow-hidden">
      {/* Gradient Hero Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        {children}
      </div>

      {/* Footer */}
      <div className="relative z-10 py-6 text-center text-white/80 text-sm">
        <p>
          © 2025 MicroPlanner AI. All rights reserved.{' '}
          <a href="/legal/privacy" className="hover:text-white underline transition-colors duration-150">
            Privacy
          </a>{' '}
          ·{' '}
          <a href="/legal/terms" className="hover:text-white underline transition-colors duration-150">
            Terms
          </a>
        </p>
      </div>
    </div>
  );
}
