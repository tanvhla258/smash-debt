'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarPlus, Calendar, Coins, List, Users } from 'lucide-react';
import { CreateSessionDialog } from '@/components/create-session-dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/admin', icon: Calendar, label: 'Calendar' },
  { href: '/sessions', icon: List, label: 'Sessions' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/debt', icon: Coins, label: 'Debt' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-1 py-1.5">
        {navItems.slice(0, 2).map(item => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
        ))}

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

        {navItems.slice(2).map(item => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} />
        ))}
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
        'flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[56px]',
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
