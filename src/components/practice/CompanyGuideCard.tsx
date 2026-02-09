'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Clock, Target, Lightbulb, BookOpen } from 'lucide-react';
import type { CompanyGuide } from '@/data/company-guides';

interface CompanyGuideCardProps {
  guide: CompanyGuide;
}

export function CompanyGuideCard({ guide }: CompanyGuideCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="bg-card cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={() => setExpanded((v) => !v)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: guide.color }}
            />
            {guide.name}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CardTitle>
        {!expanded && (
          <p className="text-xs text-muted-foreground mt-1">
            {guide.rounds.length} rounds &middot; {guide.focusAreas.slice(0, 2).join(', ')}
          </p>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 text-sm" onClick={(e) => e.stopPropagation()}>
          {/* Interview Rounds */}
          <div>
            <h4 className="flex items-center gap-1.5 font-semibold text-foreground mb-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Interview Rounds
            </h4>
            <div className="space-y-2">
              {guide.rounds.map((round) => (
                <div key={round.name} className="pl-4 border-l-2 border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{round.name}</span>
                    <span className="text-xs text-muted-foreground">{round.duration}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{round.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <h4 className="flex items-center gap-1.5 font-semibold text-foreground mb-2">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {guide.focusAreas.map((area) => (
                <span
                  key={area}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h4 className="flex items-center gap-1.5 font-semibold text-foreground mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              Tips
            </h4>
            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              {guide.tips.map((tip, i) => (
                <li key={i} className="text-xs">{tip}</li>
              ))}
            </ul>
          </div>

          {/* Common Topics */}
          <div>
            <h4 className="flex items-center gap-1.5 font-semibold text-foreground mb-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Common Topics
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {guide.commonTopics.map((topic) => (
                <span
                  key={topic}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
