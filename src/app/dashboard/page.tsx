'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard';
import { ArrowLeft } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-white/90 dark:bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-xl flex items-center gap-2">
              <Logo size={32} />
              BetterThanLeet
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your interview readiness across coding, system design, and behavioral skills.
          </p>
        </div>

        <StatsCards />

        <ProgressDashboard />
      </main>
    </div>
  );
}
