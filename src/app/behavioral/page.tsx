'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useInterviewStore } from '@/lib/store';
import { useBehavioralStore } from '@/lib/behavioral-store';
import { BEHAVIORAL_TOPICS } from '@/data/behavioral-topics';
import {
  ArrowLeft,
  Users,
  ArrowRight,
  Crown,
  Handshake,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Flag,
  Heart,
  Clock,
} from 'lucide-react';
import { PersonaSelector } from '@/components/interview/PersonaSelector';

const ICON_MAP: Record<string, React.ReactNode> = {
  Crown: <Crown className="w-5 h-5" />,
  Handshake: <Handshake className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  RefreshCw: <RefreshCw className="w-5 h-5" />,
  Flag: <Flag className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
};

export default function BehavioralPage() {
  const router = useRouter();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const { setInterviewMode, selectedPersonaId, setSelectedPersonaId } = useInterviewStore();
  const {
    setSelectedTopicId: setBehavioralTopicId,
    clearTranscript,
  } = useBehavioralStore();

  const handleStart = () => {
    if (!selectedTopicId) return;

    setInterviewMode('behavioral');
    setBehavioralTopicId(selectedTopicId);
    clearTranscript();

    router.push('/interview');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <Logo size={32} />
            Alexis
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">Behavioral</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Behavioral Interview</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Practice answering behavioral questions using the STAR method. Alexis will guide you through real interview scenarios via voice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BEHAVIORAL_TOPICS.map((topic) => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <Card
                  key={topic.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? 'ring-2 ring-primary border-primary'
                      : 'border-muted/60 hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {ICON_MAP[topic.icon] || <Users className="w-5 h-5" />}
                        </div>
                        <CardTitle className="text-base">{topic.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-xs leading-relaxed mt-2">
                      {topic.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.sampleQuestions.slice(0, 2).map((q, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded"
                        >
                          {q.length > 50 ? q.substring(0, 50) + '...' : q}
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Persona Selector */}
          <div className="mt-8">
            <PersonaSelector
              selectedPersonaId={selectedPersonaId}
              onSelect={setSelectedPersonaId}
            />
          </div>

          <div className="flex justify-center mt-10">
            <Button
              size="lg"
              className="h-14 px-10 text-lg rounded-full"
              disabled={!selectedTopicId}
              onClick={handleStart}
            >
              Start Behavioral Interview
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Users className="w-4 h-4" />
          <span>Practice STAR method responses with Alexis via voice</span>
        </div>
      </footer>
    </div>
  );
}
