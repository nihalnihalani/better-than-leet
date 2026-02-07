'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useInterviewStore } from '@/lib/store';
import { useSystemDesignStore } from '@/lib/system-design-store';
import { SYSTEM_DESIGN_TOPICS } from '@/data/system-design-topics';
import { ArrowLeft, Layers, ArrowRight } from 'lucide-react';

export default function SystemDesignPage() {
  const router = useRouter();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const { setInterviewMode, setSelectedTopicId: setMainStoreTopicId } = useInterviewStore();
  const { setSelectedTopicId: setSDStoreTopicId, clearDiagram } = useSystemDesignStore();

  const handleStart = () => {
    if (!selectedTopicId) return;

    // Set routing state in main store
    setInterviewMode('system-design');
    setMainStoreTopicId(selectedTopicId);
    
    // Set topic and clear diagram in system design store
    setSDStoreTopicId(selectedTopicId);
    clearDiagram();

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
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">System Design</span>
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
            <h1 className="text-3xl font-bold mb-2">System Design Interview</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discuss system design topics with Alexis via voice. A live architecture diagram is built as you talk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEM_DESIGN_TOPICS.map((topic) => {
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
                      <CardTitle className="text-base">{topic.title}</CardTitle>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          topic.difficulty === 'Hard'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      {topic.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.expectedComponents.slice(0, 4).map((comp) => (
                        <span
                          key={comp}
                          className="text-[10px] bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded capitalize"
                        >
                          {comp}
                        </span>
                      ))}
                      {topic.expectedComponents.length > 4 && (
                        <span className="text-[10px] text-muted-foreground/60">
                          +{topic.expectedComponents.length - 4} more
                        </span>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center mt-10">
            <Button
              size="lg"
              className="h-14 px-10 text-lg rounded-full"
              disabled={!selectedTopicId}
              onClick={handleStart}
            >
              Start System Design Interview
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Layers className="w-4 h-4" />
          <span>Discuss architecture with Alexis and build diagrams in real-time</span>
        </div>
      </footer>
    </div>
  );
}
