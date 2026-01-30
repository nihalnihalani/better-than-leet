'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { PROBLEMS, Problem } from '@/data/problems';
import { COMPANIES, CompanyProblem } from '@/data/company-problems';
import { useInterviewStore } from '@/lib/store';
import { ChevronRight, ChevronLeft, RefreshCw, Lightbulb, GraduationCap, Flame } from "lucide-react";

export function ProblemDescription() {
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [showHints, setShowHints] = useState<number[]>([]);
    const {
        setCode,
        setCurrentProblemId,
        currentProblemId,
        interviewMode,
        selectedCompanyId,
    } = useInterviewStore();

    // Get the appropriate problem based on mode
    const isPracticeMode = interviewMode === 'practice';
    const company = isPracticeMode && selectedCompanyId
        ? COMPANIES.find(c => c.id === selectedCompanyId)
        : undefined;

    // In practice mode, find the problem from the company's problems
    const practiceProblem = isPracticeMode && company && currentProblemId
        ? company.problems.find(p => p.id === currentProblemId)
        : undefined;

    // Regular mode problem - always show a problem (default to first if index is out of bounds)
    const regularProblem = !isPracticeMode ? (PROBLEMS[currentProblemIndex] || PROBLEMS[0]) : undefined;

    // Current problem (either practice or regular)
    const problem: Problem | CompanyProblem | undefined = practiceProblem || regularProblem;

    // Initialize problem on mount for regular mode, and sync index with store's currentProblemId
    useEffect(() => {
        if (!isPracticeMode) {
            // If there's a persisted currentProblemId, sync the index
            if (currentProblemId) {
                const index = PROBLEMS.findIndex(p => p.id === currentProblemId);
                if (index !== -1 && index !== currentProblemIndex) {
                    setCurrentProblemIndex(index);
                }
            } else {
                // No persisted problem, set the first one
                setCode(PROBLEMS[0].starterCode);
                setCurrentProblemId(PROBLEMS[0].id);
            }
        }
    }, [isPracticeMode]); // Only run when mode changes or on mount

    const handleNextProblem = () => {
        if (isPracticeMode) return; // Disabled in practice mode
        const nextIndex = (currentProblemIndex + 1) % PROBLEMS.length;
        setCurrentProblemIndex(nextIndex);
        setCode(PROBLEMS[nextIndex].starterCode);
        setCurrentProblemId(PROBLEMS[nextIndex].id);
    };

    const handlePrevProblem = () => {
        if (isPracticeMode) return; // Disabled in practice mode
        const prevIndex = (currentProblemIndex - 1 + PROBLEMS.length) % PROBLEMS.length;
        setCurrentProblemIndex(prevIndex);
        setCode(PROBLEMS[prevIndex].starterCode);
        setCurrentProblemId(PROBLEMS[prevIndex].id);
    };

    const handleReset = () => {
        if (problem) {
            setCode(problem.starterCode);
        }
    };

    const handleShowHint = (hintIndex: number) => {
        if (!showHints.includes(hintIndex)) {
            setShowHints([...showHints, hintIndex]);
        }
    };

    // In regular mode, we should always have a problem
    // In practice mode, show a message if no problem is selected (user needs to go through /practice)
    if (!problem) {
        if (isPracticeMode) {
            return (
                <Card className="h-full border-0 rounded-none overflow-hidden flex flex-col items-center justify-center">
                    <CardContent className="text-center space-y-4">
                        <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">No practice problem selected</p>
                        <p className="text-sm text-muted-foreground">
                            Go to <a href="/practice" className="text-primary underline">Practice Mode</a> to select a company and problem.
                        </p>
                    </CardContent>
                </Card>
            );
        }
        // For regular mode, this shouldn't happen, but fallback to first problem
        const fallbackProblem = PROBLEMS[0];
        setCode(fallbackProblem.starterCode);
        setCurrentProblemId(fallbackProblem.id);
        return null; // Will re-render with the problem
    }

    // Type guard to check if problem is a CompanyProblem
    const isCompanyProblem = (p: Problem | CompanyProblem): p is CompanyProblem => {
        return 'company' in p && 'hints' in p;
    };

    return (
        <Card className="h-full border-0 rounded-none overflow-hidden flex flex-col">
            <CardHeader className="bg-muted/30 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        {problem.title}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                    'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                            {problem.difficulty}
                        </span>
                    </CardTitle>
                    {!isPracticeMode && (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={handlePrevProblem} className="h-8 w-8">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground w-12 text-center">
                                {currentProblemIndex + 1} / {PROBLEMS.length}
                            </span>
                            <Button variant="ghost" size="icon" onClick={handleNextProblem} className="h-8 w-8">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <CardDescription className="flex items-center justify-between">
                    {isPracticeMode && company ? (
                        <span className="flex items-center gap-2">
                            <span style={{ backgroundColor: `${company.color}20` }} className="p-1 rounded flex items-center justify-center">
                                <Image
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                />
                            </span>
                            <span>{company.name} Style</span>
                            {isCompanyProblem(problem) && problem.frequency === 'High' && (
                                <span className="flex items-center gap-1 text-orange-500 text-xs">
                                    <Flame className="w-3 h-3" /> Frequently Asked
                                </span>
                            )}
                        </span>
                    ) : (
                        <span>Select a problem to start.</span>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs gap-1">
                        <RefreshCw className="w-3 h-3" /> Reset Code
                    </Button>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto prose prose-invert prose-sm max-w-none p-4">
                <ReactMarkdown>{problem.description}</ReactMarkdown>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Examples</h3>
                    {problem.examples.map((ex, i) => (
                        <div key={i} className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <p className="font-mono text-xs mb-1"><span className="text-muted-foreground">Input:</span> {ex.input}</p>
                            <p className="font-mono text-xs"><span className="text-muted-foreground">Output:</span> {ex.output}</p>
                            {ex.explanation && (
                                <p className="text-xs mt-2 text-muted-foreground"><span className="font-semibold">Explanation:</span> {ex.explanation}</p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        {problem.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>
                </div>

                {/* Hints section for practice mode */}
                {isPracticeMode && isCompanyProblem(problem) && problem.hints.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary" />
                            Practice Hints
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Stuck? Reveal hints progressively to help guide your thinking.
                        </p>
                        <div className="space-y-3">
                            {problem.hints.map((hint, index) => (
                                <div key={index}>
                                    {showHints.includes(index) ? (
                                        <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                                            <p className="text-xs font-medium text-primary mb-1">Hint {index + 1}:</p>
                                            <p className="text-sm">{hint}</p>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start gap-2"
                                            onClick={() => handleShowHint(index)}
                                            disabled={index > 0 && !showHints.includes(index - 1)}
                                        >
                                            <Lightbulb className="w-4 h-4" />
                                            {index === 0 ? 'Show First Hint' : `Show Hint ${index + 1}`}
                                            {index > 0 && !showHints.includes(index - 1) && (
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    (Reveal previous hint first)
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags for company problems */}
                {isPracticeMode && isCompanyProblem(problem) && problem.tags.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h3 className="text-lg font-semibold mb-2">Topics</h3>
                        <div className="flex flex-wrap gap-2">
                            {problem.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-xs bg-secondary px-2 py-1 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
