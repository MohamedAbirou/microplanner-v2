import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern opacity-20" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        {children}
      </div>

      {/* Footer */}
      <div className="relative z-10 py-6 text-center text-white/80 text-sm">
        <p>
          © 2025 MicroPlanner AI. All rights reserved.{' '}
          <a href="/legal/privacy" className="hover:text-white underline">
            Privacy
          </a>{' '}
          ·{' '}
          <a href="/legal/terms" className="hover:text-white underline">
            Terms
          </a>
        </p>
      </div>
    </div>
  );
}
