import Link from "next/link";
import { Users, Calendar, DollarSign, LayoutDashboard } from "lucide-react";
import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Welcome to Badminton Tracker
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Track your badminton sessions, manage participants, and keep tabs on who owes what.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            href="/users"
            className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Manage Users
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Add and manage badminton participants. Keep track of who's active.
            </p>
          </Link>

          <Link
            href="/sessions"
            className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Track Sessions
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Record badminton sessions with participants and automatically calculate costs.
            </p>
          </Link>

          <Link
            href="/debt"
            className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg mb-4 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Track Debt
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              View unpaid amounts and manage payment status for all participants.
            </p>
          </Link>

          <Link
            href="/admin"
            className="group p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Admin Dashboard
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              View statistics, top debtors, and recent sessions at a glance.
            </p>
          </Link>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-100 dark:border-blue-900/30">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Getting Started
          </h3>
          <ol className="space-y-3 text-zinc-700 dark:text-zinc-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </span>
              <span>Add users who participate in your badminton sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </span>
              <span>Create sessions by selecting participants and entering the total cost</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </span>
              <span>Track payments and view debt summaries</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                4
              </span>
              <span>Check the Admin Dashboard for statistics and insights</span>
            </li>
          </ol>
        </div>

        {/* Setup Reminder */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Setup required:</strong> Before using the app, make sure to run the SQL migration
            file located at <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded text-xs">supabase/migration.sql</code> in your Supabase project
            and configure your environment variables in <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded text-xs">.env.local</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
