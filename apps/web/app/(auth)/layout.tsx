import Link from 'next/link';
import { Sparkles } from 'lucide-react';

/**
 * Auth Layout
 * Clean layout for sign-in and sign-up pages
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-glow-brand group-hover:shadow-glow-blue transition-shadow duration-250">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient">MicroPlanner</span>
        </Link>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
