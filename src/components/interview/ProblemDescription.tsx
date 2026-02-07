'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { Problem } from '@/data/problems';
import { COMPANIES, CompanyProblem, getAllCompanyProblems, NEETCODE_CATEGORIES } from '@/data/company-problems';
import { useInterviewStore, CustomProblem } from '@/lib/store';
import { RefreshCw, Lightbulb, GraduationCap, Flame } from "lucide-react";

export function ProblemDescription() {
    const [showHints, setShowHints] = useState<number[]>([]);
    const {
        setCode,
        setCurrentProblemId,
        currentProblemId,
        interviewMode,
        selectedCompanyId,
        customProblems,
    } = useInterviewStore();

    // Get the appropriate problem based on mode
    const isPracticeMode = interviewMode === 'practice';
    const company = isPracticeMode && selectedCompanyId && !['custom', 'neetcode-150'].includes(selectedCompanyId)
        ? COMPANIES.find(c => c.id === selectedCompanyId)
        : undefined;

    // Get all company problems for finding the current one
    const allCompanyProblems = getAllCompanyProblems();

    // Find the problem based on the selected company type
    let practiceProblem: Problem | CompanyProblem | CustomProblem | undefined = undefined;

    if (isPracticeMode && currentProblemId) {
        if (selectedCompanyId === 'custom') {
            // Custom problems from user's library
            practiceProblem = customProblems.find(p => p.id === currentProblemId);
        } else if (selectedCompanyId === 'neetcode-150') {
            // NeetCode 150 problems
            practiceProblem = NEETCODE_CATEGORIES
                .flatMap(cat => cat.problems)
                .find(p => p.id === currentProblemId);
        } else if (company) {
            // Regular company problems
            practiceProblem = company.problems.find(p => p.id === currentProblemId);
        }
    }

    // In real interview mode, find the problem from all company problems
    const interviewProblem = !isPracticeMode && currentProblemId
        ? allCompanyProblems.find(p => p.id === currentProblemId)
        : undefined;

    // Current problem (either practice or interview)
    const problem: Problem | CompanyProblem | CustomProblem | undefined = practiceProblem || interviewProblem;

    // Initialize problem on mount for regular mode
    useEffect(() => {
        if (!isPracticeMode && !currentProblemId && allCompanyProblems.length > 0) {
            // No persisted problem, set a random one
            const randomIndex = Math.floor(Math.random() * allCompanyProblems.length);
            const randomProblem = allCompanyProblems[randomIndex];
            setCode(randomProblem.starterCode);
            setCurrentProblemId(randomProblem.id);
        }
    }, [isPracticeMode, currentProblemId]);

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

    // Show loading state if no problem yet
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
        // For regular mode, this shouldn't happen, but fallback
        return (
            <Card className="h-full border-0 rounded-none overflow-hidden flex flex-col items-center justify-center">
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">Loading problem...</p>
                </CardContent>
            </Card>
        );
    }

    // Type guard to check if problem is a CompanyProblem (includes NeetCode)
    const isCompanyProblem = (p: Problem | CompanyProblem | CustomProblem): p is CompanyProblem => {
        return 'company' in p && 'hints' in p;
    };

    // Type guard to check if problem is a CustomProblem
    const isCustomProblem = (p: Problem | CompanyProblem | CustomProblem): p is CustomProblem => {
        return 'addedAt' in p;
    };

    // Get company info for the problem (works for both modes)
    const problemCompany = isCompanyProblem(problem)
        ? COMPANIES.find(c => c.id === problem.company)
        : undefined;

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
                </div>
                <CardDescription className="flex items-center justify-between">
                    {problemCompany ? (
                        <span className="flex items-center gap-2">
                            <span style={{ backgroundColor: `${problemCompany.color}20` }} className="p-1 rounded flex items-center justify-center">
                                <Image
                                    src={problemCompany.logo}
                                    alt={`${problemCompany.name} logo`}
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                />
                            </span>
                            <span>{problemCompany.name} Style</span>
                            {isCompanyProblem(problem) && problem.frequency === 'High' && (
                                <span className="flex items-center gap-1 text-orange-500 text-xs">
                                    <Flame className="w-3 h-3" /> Frequently Asked
                                </span>
                            )}
                        </span>
                    ) : (
                        <span>Coding Challenge</span>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs gap-1">
                        <RefreshCw className="w-3 h-3" /> Reset Code
                    </Button>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto prose dark:prose-invert prose-sm max-w-none p-4">
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
                {isPracticeMode && (isCompanyProblem(problem) || isCustomProblem(problem)) && problem.hints && problem.hints.length > 0 && (
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

                {/* Tags for company/custom problems */}
                {(isCompanyProblem(problem) || isCustomProblem(problem)) && problem.tags && problem.tags.length > 0 && (
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
