import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider, Toast } from "@/components/toast";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";
import Link from "next/link";
import { CalendarPlus, Calendar, Coins, List, Users, HandCoins } from "lucide-react";
import { CreateSessionDialog } from "@/components/create-session-dialog";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smash Debt - Track Activities & Split Costs",
  description: "Track group activities, manage participants, and settle up on who owes what.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-black pb-24 sm:pb-0">
              <Navigation className="hidden sm:block" />
              {children}
            </div>
            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
              <div className="mx-auto grid max-w-5xl grid-cols-6 gap-2 px-2 py-2">
                <Link
                  href="/admin"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Calendar</span>
                </Link>
                <Link
                  href="/sessions"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <List className="h-5 w-5" />
                  <span>Sessions</span>
                </Link>
                <CreateSessionDialog
                  trigger={
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-zinc-900 px-1.5 py-2 text-[10px] font-semibold text-white shadow-lg shadow-zinc-900/20 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
                    >
                      <CalendarPlus className="h-5 w-5" />
                      <span>Create</span>
                    </button>
                  }
                />
                <Link
                  href="/users"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </Link>
                <Link
                  href="/debt"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <Coins className="h-5 w-5" />
                  <span>Debt</span>
                </Link>
                <Link
                  href="/my-debt"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <HandCoins className="h-5 w-5" />
                  <span>My Debt</span>
                </Link>
              </div>
            </nav>
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
