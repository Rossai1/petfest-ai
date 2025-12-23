'use client';

import { useState, useEffect } from 'react';
import { X, Menu, User, Sparkles, CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserData } from '@/contexts/UserDataContext';

export default function MobileMenu({ isOpen, onClose }) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress;
      const adminEmail = process.env.ADMIN_EMAIL || 'wesleykrzyzanovski@gmail.com';
      setIsAdmin(email === adminEmail);
    }
  }, [user]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-card shadow-xl lg:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-11 w-11"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <SignedOut>
              <div className="space-y-4 mb-6">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça login para acessar todas as funcionalidades
                  </p>
                  <div className="flex flex-col gap-3">
                    <SignInButton mode="modal">
                      <Button className="btn-outline w-full" onClick={onClose}>
                        Entrar
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="btn-primary w-full" onClick={onClose}>
                        Cadastrar
                      </Button>
                    </SignUpButton>
                  </div>
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              {/* User Info */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {user?.firstName || 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start h-12 rounded-[16px]"
                  onClick={onClose}
                >
                  <Link href="/app">
                    <Sparkles className="h-5 w-5 mr-3" />
                    Gerar Imagens
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start h-12 rounded-[16px]"
                  onClick={onClose}
                >
                  <Link href="/">
                    <Sparkles className="h-5 w-5 mr-3" />
                    Landing Page
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start h-12 rounded-[16px]"
                  onClick={onClose}
                >
                  <Link href="/dashboard">
                    <User className="h-5 w-5 mr-3" />
                    Meu Dashboard
                  </Link>
                </Button>


                {isAdmin && (
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start h-12 rounded-[16px]"
                    onClick={onClose}
                  >
                    <Link href="/admin/prompts">
                      <span className="mr-3">📝</span>
                      Admin Prompts
                    </Link>
                  </Button>
                )}
              </nav>
            </SignedIn>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <SignedIn>
              <div className="flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </>
  );
}

