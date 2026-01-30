'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  GraduationCap,
  Target,
  Code,
  MessageSquare,
  Zap,
  TrendingUp,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Star,
} from "lucide-react";
import { useInterviewStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { COMPANIES } from "@/data/company-problems";
import {
  CoachingFeedback,
  DEFAULT_COACHING_FEEDBACK,
  SkillLevel,
  getSkillLevelColor,
  getSkillLevelEmoji,
  getPriorityColor,
} from "@/lib/coaching";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PracticeReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SkillLevelBadge({ level, size = 'md' }: { level: SkillLevel; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      getSkillLevelColor(level),
      sizeClasses[size]
    )}>
      {getSkillLevelEmoji(level)} {level}
    </span>
  );
}

function CategoryCard({
  icon: Icon,
  title,
  level,
  score,
  description,
}: {
  icon: React.ElementType;
  title: string;
  level: SkillLevel;
  score: number;
  description: string;
}) {
  return (
    <Card className="border-l-4 border-l-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </span>
          <SkillLevelBadge level={level} size="sm" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl font-bold">{score}/10</div>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${score * 10}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function PracticeReportDialog({ open, onOpenChange }: PracticeReportDialogProps) {
  const {
    integrity,
    latestReview,
    coderabbitReview,
    code,
    language,
    transcript,
    testResults,
    currentProblemId,
    selectedCompanyId,
  } = useInterviewStore();

  const [feedback, setFeedback] = useState<CoachingFeedback | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const company = selectedCompanyId ? COMPANIES.find(c => c.id === selectedCompanyId) : null;

  // Generate coaching feedback when dialog opens
  useEffect(() => {
    if (open && !feedback && !isGenerating) {
      generateFeedback();
    }
  }, [open]);

  const generateFeedback = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/practice/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          code,
          language,
          testResults,
          integrity,
          codeAnalysis: latestReview ? {
            score: latestReview.score,
            security_score: latestReview.security_score,
            complexity: latestReview.complexity,
            issues: latestReview.issues,
            security_issues: latestReview.security_issues || []
          } : undefined,
          coderabbitReview: coderabbitReview ? {
            summary: coderabbitReview.summary,
            issues: coderabbitReview.issues || []
          } : undefined,
          problemId: currentProblemId || 'Coding Challenge',
          companyId: selectedCompanyId,
          companyName: company?.name,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate coaching feedback');
      }

      setFeedback(data.feedback);
    } catch (err) {
      console.error('Failed to generate coaching feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate feedback');
      // Use default feedback as fallback
      setFeedback(DEFAULT_COACHING_FEEDBACK);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Practice Session Complete
            {feedback && <SkillLevelBadge level={feedback.overallLevel} size="lg" />}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {company && (
              <>
                <span
                  className="p-1 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${company.color}20` }}
                >
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </span>
                <span>{company.name} Style Interview</span>
                <span className="text-muted-foreground">•</span>
              </>
            )}
            <span>Your personalized coaching feedback</span>
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your coaching feedback...</p>
            <p className="text-sm text-muted-foreground">Analyzing your approach, code, and communication...</p>
          </div>
        ) : error && !feedback ? (
          <Card className="border-yellow-500">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={generateFeedback} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : feedback ? (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Overall Performance</h3>
                    <p className="text-muted-foreground text-sm">
                      You're on the path to becoming a stronger coder!
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">{feedback.overallScore}/10</div>
                    <SkillLevelBadge level={feedback.overallLevel} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Skill Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoryCard
                  icon={Lightbulb}
                  title="Problem Solving"
                  level={feedback.categories.problemSolving.level}
                  score={feedback.categories.problemSolving.score}
                  description={feedback.categories.problemSolving.description}
                />
                <CategoryCard
                  icon={Code}
                  title="Code Quality"
                  level={feedback.categories.codeQuality.level}
                  score={feedback.categories.codeQuality.score}
                  description={feedback.categories.codeQuality.description}
                />
                <CategoryCard
                  icon={MessageSquare}
                  title="Communication"
                  level={feedback.categories.communication.level}
                  score={feedback.categories.communication.score}
                  description={feedback.categories.communication.description}
                />
                <CategoryCard
                  icon={Zap}
                  title="Optimization"
                  level={feedback.categories.optimization.level}
                  score={feedback.categories.optimization.score}
                  description={feedback.categories.optimization.description}
                />
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                What You Did Well
              </h3>
              <Card>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Plan */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Focus Areas for Growth
              </h3>
              <div className="space-y-3">
                {feedback.improvementPlan.map((action, index) => (
                  <Card key={index} className={cn('border-l-4', getPriorityColor(action.priority))}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{action.area}</h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          getPriorityColor(action.priority)
                        )}>
                          {action.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{action.suggestion}</p>
                      {action.resources && action.resources.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {action.resources.map((resource, i) => (
                            <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">
                              📚 {resource}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recommended Problems */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Practice These Next
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {feedback.recommendedProblems.map((problem, index) => (
                  <Card key={index} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{problem.title}</h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          problem.difficulty === 'Easy' ? 'text-green-500 bg-green-500/10' :
                          problem.difficulty === 'Medium' ? 'text-yellow-500 bg-yellow-500/10' :
                          'text-red-500 bg-red-500/10'
                        )}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{problem.reason}</p>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Encouragement */}
            <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-lg italic">{feedback.encouragement}</p>
              </CardContent>
            </Card>

            {/* Test Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="w-4 h-4" /> Tests Passed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {testResults.length > 0
                      ? `${testResults[testResults.length - 1].testsPassed}/${testResults[testResults.length - 1].testsTotal}`
                      : "0/0"
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Code Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestReview ? `${latestReview.score}/10` : "N/A"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Exchanges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{transcript.length}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        <div className="flex justify-between gap-2 mt-6 pt-4 border-t">
          <Link href="/practice">
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 mr-2" />
              Practice Another
            </Button>
          </Link>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
