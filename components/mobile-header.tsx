'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreVertical, Calendar, Users, UtensilsCrossed, HandCoins, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const overflowNavItems = [
  { href: '/admin', icon: Calendar, label: 'Calendar' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/breakfast', icon: UtensilsCrossed, label: 'Breakfast' },
];

export function MobileHeader() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Smash dept
        </Link>

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-700 dark:text-zinc-300"
            >
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {overflowNavItems.map(item => (
              <DropdownMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex w-full items-center gap-2 text-sm',
                    (pathname === item.href || pathname.startsWith(item.href + '/'))
                      ? 'text-zinc-900 dark:text-zinc-50 font-medium'
                      : 'text-zinc-700 dark:text-zinc-300'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}

            {user && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href="/my-debt"
                    className={cn(
                      'flex w-full items-center gap-2 text-sm',
                      pathname === '/my-debt'
                        ? 'text-zinc-900 dark:text-zinc-50 font-medium'
                        : 'text-zinc-700 dark:text-zinc-300'
                    )}
                  >
                    <HandCoins className="h-4 w-4" />
                    My Debt
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            {!loading && (
              <>
                {user ? (
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <Link
                      href="/login"
                      className="flex w-full items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
