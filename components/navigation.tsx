'use client'

import Link from 'next/link';
import { Users, Calendar, Coins, LogOut, LogIn, List, HandCoins } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavigationProps = {
  className?: string;
};

export function Navigation({ className }: NavigationProps) {
  const { user, signOut, loading } = useAuth();

  return (
    <nav className={cn("border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10", className)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Smash dept
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
            <Link
              href="/sessions"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Sessions</span>
            </Link>
            <Link
              href="/users"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </Link>
            <Link
              href="/debt"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">Debt</span>
            </Link>
            <Link
              href="/my-debt"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <HandCoins className="w-4 h-4" />
              <span className="hidden sm:inline">My Debt</span>
            </Link>

            {/* Auth section */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4 pl-4 border-l border-zinc-200 dark:border-zinc-700">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:inline">
                      {user.email}
                    </span>
                    <Button
                      onClick={signOut}
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
