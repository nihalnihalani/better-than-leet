import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/Logo";
import { Mic, Sparkles, Lock, GraduationCap, ListChecks, MessageSquare, BarChart3, ArrowRight, Layers } from "lucide-react";
import Image from "next/image";
import { StartInterviewButton } from "@/components/interview/StartInterviewButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-purple-100 dark:selection:bg-purple-900/50">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 md:-top-[20%] left-[20%] w-[500px] h-[500px] bg-purple-100 dark:bg-purple-900 rounded-full blur-[120px] opacity-60 dark:opacity-20" />
        <div className="absolute bottom-0 md:-bottom-[20%] right-[20%] w-[500px] h-[500px] bg-blue-100 dark:bg-blue-900 rounded-full blur-[120px] opacity-60 dark:opacity-20" />
      </div>

      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2">
            <Logo size={32} />
            BetterThanLeet
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <StartInterviewButton size="default" showIcon={false} />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-12 relative z-10">

        {/* Hero Section */}
        <div className="space-y-6 flex flex-col items-center max-w-4xl mx-auto">
          {/* Disruptive Tagline */}
          <div className="animate-slide-up-fade opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <p className="text-lg md:text-xl text-red-500 dark:text-red-400 font-semibold tracking-wide">
              Traditional Interviews Are Dead.
            </p>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight flex flex-col items-center gap-2 pb-2">
            <span className="animate-slide-up-fade" style={{ animationDelay: '200ms' }}>Meet <span className="animate-color-wave font-extrabold tracking-tight">BetterThanLeet</span></span>
            <span className="animate-slide-up-fade delay-200 text-4xl md:text-6xl text-muted-foreground dark:text-foreground/70 font-normal" style={{ animationDelay: '400ms' }}>
              Your AI Technical Interviewer, Alexis
            </span>
          </h1>

          <p className="text-xl text-muted-foreground dark:text-foreground/60 max-w-2xl animate-slide-up-fade leading-relaxed" style={{ animationDelay: '400ms' }}>
            LeetCode can't ask follow-up questions. Alexis can. Experience voice-first technical interviews
            powered by Gemini 3 Pro with real-time coding and instant feedback.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-slide-up-fade" style={{ animationDelay: '600ms' }}>
            <StartInterviewButton size="lg" className="h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full" />
            <Link href="/practice">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full transition-all duration-300">
                <GraduationCap className="mr-2 w-5 h-5" />
                Practice Mode
              </Button>
            </Link>
            <Link href="/system-design">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full transition-all duration-300">
                <Layers className="mr-2 w-5 h-5" />
                System Design
              </Button>
            </Link>
            <Link href="https://github.com/daytonaio/sdk" target="_blank">
              <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full transition-all duration-300">
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-20 text-left">
          <Card className="hover:shadow-lg transition-all duration-300 group border-muted/60 dark:border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Voice-First AI</CardTitle>
              <CardDescription className="text-base">
                Converse naturally with Alexis using Gemini Live's native voice synthesis. No typing required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 group border-muted/60 dark:border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-6 h-6 text-green-500 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Secure Sandbox</CardTitle>
              <CardDescription className="text-base">
                Execute code safely in isolated Daytona containers. Full terminal access with zero risk.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 group border-muted/60 dark:border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Gemini 3 Pro Analysis</CardTitle>
              <CardDescription className="text-base">
                Receive comprehensive feedback on code quality, complexity, and security instantly.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="w-full max-w-4xl mt-24">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { step: 1, icon: ListChecks, title: "Choose Your Challenge", desc: "Select from curated problems or import your own from LeetCode." },
              { step: 2, icon: MessageSquare, title: "Talk to Alexis", desc: "Have a real-time voice conversation while you code your solution." },
              { step: 3, icon: BarChart3, title: "Get Your Report", desc: "Receive detailed performance analysis and actionable feedback." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center md:items-start gap-3 text-center md:text-left relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-5 top-5 w-5 h-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Built With */}
        <div className="w-full max-w-4xl mt-24 mb-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-8">Built With</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-70">
            {[
              { src: "/icons/gemini.png", alt: "Gemini", w: 100 },
              { src: "/icons/daytona.png", alt: "Daytona", w: 100 },
              { src: "/icons/coderabbit.png", alt: "CodeRabbit", w: 110 },
              { src: "/icons/nextjs.png", alt: "Next.js", w: 80 },
            ].map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={logo.w}
                height={40}
                className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 dark:invert dark:hover:invert-0"
              />
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t py-12 bg-muted/20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Daytona, Gemini Live, and CodeRabbit.
          </p>
        </div>
      </footer>
    </div>
  );
}
