import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Twitter, Linkedin, Github, MessageCircle } from 'lucide-react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="MicroPlanner"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-gradient">Micro</span>Planner
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/story"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Story
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/roadmap"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Roadmap
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="flex items-center gap-3">
              <Link
                href="/waitlist"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:scale-105"
              >
                Join Waitlist
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Simplified Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Product */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Product</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/story" className="text-muted-foreground hover:text-foreground transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact/support" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Resources</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="text-muted-foreground hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/security" className="text-muted-foreground hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social & Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/microplanner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/mohamed-abirou"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/MohamedAbirou"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://discord.gg/microplanner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} MicroPlanner. Building in public.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
