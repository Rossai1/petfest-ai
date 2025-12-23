'use client';

import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  // Não mostrar header em páginas de auth
  if (pathname?.includes('/sign-in') || pathname?.includes('/sign-up')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
        {/* Logo */}
        <Link href="/app" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-primary/10 text-primary p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
            <Logo size={28} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">PetFest</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <SignedIn>
            {/* User Button */}
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">
                Entrar
              </Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}

