'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreVertical, Calendar, Users, UtensilsCrossed, HandCoins, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const overflowNavItems = [
  { href: '/admin', icon: Calendar, label: 'Calendar' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/breakfast', icon: UtensilsCrossed, label: 'Breakfast' },
];

export function MobileHeader() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const handleLogout = () => {
    setOpen(false);
    signOut();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Smash dept
        </Link>

        {/* Sheet drawer menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-700 dark:text-zinc-300"
            >
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px] sm:w-[300px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 py-6">
              {overflowNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    (pathname === item.href || pathname.startsWith(item.href + '/'))
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}

              {user && (
                <>
                  <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />
                  <Link
                    href="/my-debt"
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                      pathname === '/my-debt'
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                    )}
                  >
                    <HandCoins className="h-5 w-5" />
                    My Debt
                  </Link>
                </>
              )}

              <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />
              {!loading && (
                <>
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                      <LogIn className="h-5 w-5" />
                      Login
                    </Link>
                  )}
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
