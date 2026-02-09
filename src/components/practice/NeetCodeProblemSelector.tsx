'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronRight, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NEETCODE_CATEGORIES } from '@/data/neetcode-problems';
import { cn } from '@/lib/utils';

interface NeetCodeProblemSelectorProps {
  selectedProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
  onBack: () => void;
  onStartInterview: () => void;
}

const difficultyColors = {
  Easy: 'bg-green-500/10 text-green-500 border-green-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Hard: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function NeetCodeProblemSelector({
  selectedProblemId,
  onSelectProblem,
  onBack,
  onStartInterview,
}: NeetCodeProblemSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['arrays-hashing']));
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Find the selected problem
  const selectedProblem = useMemo(() => {
    if (!selectedProblemId) return null;
    for (const category of NEETCODE_CATEGORIES) {
      const problem = category.problems.find(p => p.id === selectedProblemId);
      if (problem) return problem;
    }
    return null;
  }, [selectedProblemId]);

  // Filter problems based on search and difficulty
  const filteredCategories = useMemo(() => {
    return NEETCODE_CATEGORIES.map(category => ({
      ...category,
      problems: category.problems.filter(problem => {
        const matchesSearch = searchQuery === '' ||
          problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
      }),
    })).filter(category => category.problems.length > 0);
  }, [searchQuery, difficultyFilter]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const totalProblems = NEETCODE_CATEGORIES.reduce((sum, cat) => sum + cat.problems.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
        <div className="text-sm text-muted-foreground">
          {totalProblems} Problems in 18 Categories
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search problems or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={(v: string) => setDifficultyFilter(v as 'all' | 'Easy' | 'Medium' | 'Hard')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Categories Accordion */}
        <div className="lg:col-span-2">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {filteredCategories.map(category => (
                <Collapsible
                  key={category.id}
                  open={expandedCategories.has(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <CardTitle className="text-base">{category.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {category.problems.length} problems
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {['Easy', 'Medium', 'Hard'].map(diff => {
                              const count = category.problems.filter(p => p.difficulty === diff).length;
                              if (count === 0) return null;
                              return (
                                <Badge
                                  key={diff}
                                  variant="outline"
                                  className={cn('text-xs', difficultyColors[diff as keyof typeof difficultyColors])}
                                >
                                  {count}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-4">
                      {category.problems.map(problem => (
                        <div
                          key={problem.id}
                          onClick={() => onSelectProblem(problem.id)}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all',
                            'hover:bg-accent/50',
                            selectedProblemId === problem.id && 'bg-primary/10 ring-1 ring-primary'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {selectedProblemId === problem.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-sm font-medium">{problem.title}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', difficultyColors[problem.difficulty])}
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Problem Details (sticky) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            {selectedProblem ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(difficultyColors[selectedProblem.difficulty])}
                    >
                      {selectedProblem.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{selectedProblem.title}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedProblem.tags.slice(0, 4).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="prose prose-sm dark:prose-invert">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedProblem.description.substring(0, 500)}
                        {selectedProblem.description.length > 500 && '...'}
                      </p>
                      {selectedProblem.examples.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Example:</h4>
                          <div className="bg-muted p-2 rounded text-xs font-mono">
                            <div><strong>Input:</strong> {selectedProblem.examples[0].input}</div>
                            <div><strong>Output:</strong> {selectedProblem.examples[0].output}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={onStartInterview}
                  >
                    <Play className="h-4 w-4" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>Select a problem to see details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Start Button */}
      <div className="lg:hidden">
        {selectedProblem && (
          <Button
            className="w-full gap-2"
            onClick={onStartInterview}
          >
            <Play className="h-4 w-4" />
            Start Practice with {selectedProblem.title}
          </Button>
        )}
      </div>
    </div>
  );
}
