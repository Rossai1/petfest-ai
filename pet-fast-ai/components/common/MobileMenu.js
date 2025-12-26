'use client';

import { useState, useEffect } from 'react';
import { X, Menu, User, Sparkles, CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUserData } from '@/contexts/UserDataContext';
import { ADMIN_EMAIL } from '@/config/config';
import { createClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export default function MobileMenu({ isOpen, onClose }) {
  const { user, credits } = useUserData();
  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setIsAdmin(user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    }
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

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
            {!user ? (
              <div className="space-y-4 mb-6">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça login para acessar todas as funcionalidades
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link href="/login" onClick={onClose}>
                      <Button className="btn-outline w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/register" onClick={onClose}>
                      <Button className="btn-primary w-full">
                        Cadastrar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* User Info */}
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {user?.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-secondary rounded-full px-4 py-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-bold text-lg text-primary">{credits}</span>
                    <span className="text-sm text-muted-foreground">créditos restantes</span>
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
              </>
            )}
          </div>

          {/* Footer */}
          {user && (
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-[16px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={async () => {
                  await handleSignOut();
                  onClose();
                }}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

