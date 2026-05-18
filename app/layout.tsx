import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider, Toast } from "@/components/toast";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";
import { MobileHeader } from "@/components/mobile-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans' });

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
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-black pt-14 pb-24 sm:pt-0 sm:pb-0">
              <MobileHeader />
              <Navigation className="hidden sm:block" />
              {children}
            </div>
            <MobileBottomNav />
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
