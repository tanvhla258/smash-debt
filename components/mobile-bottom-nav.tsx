'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarPlus, Coins, List } from 'lucide-react';
import { CreateSessionDialog } from '@/components/create-session-dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const leftNavItem = { href: '/debt', icon: Coins, label: 'Debt' };
const rightNavItem = { href: '/sessions', icon: List, label: 'Sessions' };

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-1 py-1.5">
        <NavLink
          href={leftNavItem.href}
          icon={leftNavItem.icon}
          label={leftNavItem.label}
          active={pathname === leftNavItem.href || pathname.startsWith(leftNavItem.href + '/')}
        />

        {/* Center create button - only for authenticated users */}
        {user ? (
          <div className="relative -mt-5">
            <CreateSessionDialog
              trigger={
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg shadow-zinc-900/30 transition-transform hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  <CalendarPlus className="h-6 w-6" />
                </button>
              }
            />
          </div>
        ) : (
          <div className="w-14" />
        )}

        <NavLink
          href={rightNavItem.href}
          icon={rightNavItem.icon}
          label={rightNavItem.label}
          active={pathname === rightNavItem.href || pathname.startsWith(rightNavItem.href + '/')}
        />
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors min-w-14',
        active
          ? 'text-zinc-900 dark:text-zinc-50'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
