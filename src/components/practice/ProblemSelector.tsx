'use client';

import Image from 'next/image';
import { COMPANIES, CompanyProblem } from '@/data/company-problems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Flame, Clock, Tag } from 'lucide-react';

interface ProblemSelectorProps {
  companyId: string;
  selectedProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
  onBack: () => void;
  onStartInterview: () => void;
}

const difficultyColors: Record<string, string> = {
  Easy: 'text-green-500 bg-green-500/10',
  Medium: 'text-yellow-500 bg-yellow-500/10',
  Hard: 'text-red-500 bg-red-500/10',
};

const frequencyIcons: Record<string, React.ReactNode> = {
  High: <Flame className="w-3 h-3 text-orange-500" />,
  Medium: <Clock className="w-3 h-3 text-blue-500" />,
  Low: <Clock className="w-3 h-3 text-gray-500" />,
};

export function ProblemSelector({
  companyId,
  selectedProblemId,
  onSelectProblem,
  onBack,
  onStartInterview,
}: ProblemSelectorProps) {
  const company = COMPANIES.find((c) => c.id === companyId);

  if (!company) {
    return <div>Company not found</div>;
  }

  const selectedProblem = company.problems.find((p) => p.id === selectedProblemId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center p-2"
            style={{ backgroundColor: `${company.color}20` }}
          >
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{company.name} Interview Questions</h2>
            <p className="text-sm text-muted-foreground">
              Select a problem to practice
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {company.problems.map((problem) => (
            <Card
              key={problem.id}
              className={cn(
                'cursor-pointer transition-all',
                selectedProblemId === problem.id
                  ? 'ring-2 ring-primary shadow-md'
                  : 'hover:border-primary/50 hover:shadow-sm'
              )}
              onClick={() => onSelectProblem(problem.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded',
                      difficultyColors[problem.difficulty]
                    )}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <CardDescription className="text-sm line-clamp-2">
                  {problem.description.split('\n')[0]}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {frequencyIcons[problem.frequency]}
                    {problem.frequency === 'High' ? 'Frequently asked' : problem.frequency}
                  </span>
                  {problem.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedProblem && (
          <div className="lg:sticky lg:top-4 space-y-4">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedProblem.title}
                  <span
                    className={cn(
                      'text-sm font-medium px-2 py-1 rounded',
                      difficultyColors[selectedProblem.difficulty]
                    )}
                  >
                    {selectedProblem.difficulty}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                    {selectedProblem.description}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {selectedProblem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    {selectedProblem.hints.length} hints available during practice
                  </p>
                  <Button className="w-full" size="lg" onClick={onStartInterview}>
                    Start Practice Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
