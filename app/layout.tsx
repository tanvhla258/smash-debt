import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider, Toast } from "@/components/toast";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

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
            <MobileBottomNav />
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
