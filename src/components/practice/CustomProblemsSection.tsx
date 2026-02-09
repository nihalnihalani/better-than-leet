'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Play, FileQuestion, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useInterviewStore } from '@/lib/store';
import { AddCustomProblemDialog } from './AddCustomProblemDialog';
import { cn } from '@/lib/utils';

interface CustomProblemsSectionProps {
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

export function CustomProblemsSection({
  selectedProblemId,
  onSelectProblem,
  onBack,
  onStartInterview,
}: CustomProblemsSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { customProblems, removeCustomProblem } = useInterviewStore();

  const selectedProblem = customProblems.find(p => p.id === selectedProblemId);

  const handleDelete = () => {
    if (deleteId) {
      removeCustomProblem(deleteId);
      if (selectedProblemId === deleteId) {
        onSelectProblem('');
      }
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Problem
        </Button>
      </div>

      {customProblems.length === 0 ? (
        /* Empty State */
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No custom problems yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Import problems from LeetCode or add them manually to practice with your own curated list.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Problem
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Problems Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Problems List */}
          <div className="lg:col-span-2">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {customProblems.map(problem => (
                  <Card
                    key={problem.id}
                    onClick={() => onSelectProblem(problem.id)}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selectedProblemId === problem.id && 'ring-2 ring-primary'
                    )}
                  >
                    <CardHeader className="py-4 px-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{problem.title}</CardTitle>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', difficultyColors[problem.difficulty])}
                            >
                              {problem.difficulty}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            Added {new Date(problem.addedAt).toLocaleDateString()}
                            {problem.leetcodeUrl && (
                              <a
                                href={problem.leetcodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                                LeetCode
                              </a>
                            )}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(problem.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {problem.tags.slice(0, 4).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {problem.tags.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{problem.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Problem Details */}
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
                        {selectedProblem.description ? (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedProblem.description.substring(0, 500)}
                            {selectedProblem.description.length > 500 && '...'}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No description provided.
                          </p>
                        )}
                        {selectedProblem.hints.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2">Hints Available:</h4>
                            <p className="text-xs text-muted-foreground">
                              {selectedProblem.hints.length} hint{selectedProblem.hints.length !== 1 ? 's' : ''} available during practice
                            </p>
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
      )}

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

      {/* Add Problem Dialog */}
      <AddCustomProblemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Problem</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom problem? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
