'use client';

import { Card, CardContent } from '@/components/ui/card';
import { INTERVIEWER_PERSONAS, type InterviewerPersona } from '@/data/interviewer-personas';
import { Smile, ShieldAlert, Timer, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Smile,
  ShieldAlert,
  Timer,
  Search,
};

interface PersonaSelectorProps {
  selectedPersonaId: string | null;
  onSelect: (personaId: string) => void;
}

export function PersonaSelector({ selectedPersonaId, onSelect }: PersonaSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Interviewer Style</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INTERVIEWER_PERSONAS.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            selected={selectedPersonaId === persona.id}
            onSelect={() => onSelect(persona.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PersonaCard({
  persona,
  selected,
  onSelect,
}: {
  persona: InterviewerPersona;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = ICON_MAP[persona.icon] ?? Smile;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50',
        selected && 'border-primary ring-1 ring-primary/30 bg-primary/5',
      )}
      onClick={onSelect}
    >
      <CardContent className="pt-4 pb-3 px-3 text-center space-y-2">
        <Icon className={cn('w-6 h-6 mx-auto', selected ? 'text-primary' : 'text-muted-foreground')} />
        <div className="text-sm font-medium">{persona.name}</div>
        <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
          {persona.description}
        </p>
      </CardContent>
    </Card>
  );
}

export function PersonaBadge({ personaId }: { personaId: string | null }) {
  if (!personaId) return null;
  const persona = INTERVIEWER_PERSONAS.find((p) => p.id === personaId);
  if (!persona) return null;
  const Icon = ICON_MAP[persona.icon] ?? Smile;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      <Icon className="w-3 h-3" />
      {persona.name}
    </div>
  );
}
