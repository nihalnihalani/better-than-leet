'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CompanySelector } from '@/components/practice/CompanySelector';
import { ProblemSelector } from '@/components/practice/ProblemSelector';
import { NeetCodeProblemSelector } from '@/components/practice/NeetCodeProblemSelector';
import { CustomProblemsSection } from '@/components/practice/CustomProblemsSection';
import { useInterviewStore } from '@/lib/store';
import { COMPANIES, NEETCODE_CATEGORIES } from '@/data/company-problems';
import { ArrowLeft, GraduationCap } from 'lucide-react';

type Step = 'company' | 'problem';

export default function PracticePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('company');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  const {
    setInterviewMode,
    setSelectedCompanyId: setStoreCompanyId,
    setCurrentProblemId,
    setCode,
    setLanguage,
    customProblems,
  } = useInterviewStore();

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedProblemId(null);
    setStep('problem');
  };

  const handleProblemSelect = (problemId: string) => {
    setSelectedProblemId(problemId);
  };

  const handleBack = () => {
    setStep('company');
    setSelectedProblemId(null);
  };

  const handleStartInterview = () => {
    if (!selectedCompanyId || !selectedProblemId) return;

    let problem;

    // Handle custom problems
    if (selectedCompanyId === 'custom') {
      problem = customProblems.find(p => p.id === selectedProblemId);
    }
    // Handle NeetCode 150 problems
    else if (selectedCompanyId === 'neetcode-150') {
      problem = NEETCODE_CATEGORIES
        .flatMap(cat => cat.problems)
        .find(p => p.id === selectedProblemId);
    }
    // Handle regular company problems
    else {
      const company = COMPANIES.find(c => c.id === selectedCompanyId);
      problem = company?.problems.find(p => p.id === selectedProblemId);
    }

    if (!problem) return;

    // Set up the interview state
    setInterviewMode('practice');
    setStoreCompanyId(selectedCompanyId);
    setCurrentProblemId(selectedProblemId);

    // Set the starter code
    setCode(problem.starterCode);
    setLanguage('python');

    // Navigate to the interview page
    router.push('/interview');
  };

  // Get step label based on selected company
  const getStepLabel = () => {
    if (selectedCompanyId === 'neetcode-150') return 'Select from NeetCode 150';
    if (selectedCompanyId === 'custom') return 'Your Custom Problems';
    return 'Select Problem';
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
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">Practice Mode</span>
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
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === 'company' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'company' ? 'bg-primary text-primary-foreground' : selectedCompanyId ? 'bg-primary/20 text-primary' : 'bg-secondary'
              }`}>
                1
              </div>
              <span className="hidden sm:inline">Select Category</span>
            </div>
            <div className="w-12 h-0.5 bg-secondary" />
            <div className={`flex items-center gap-2 ${step === 'problem' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'problem' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}>
                2
              </div>
              <span className="hidden sm:inline">{step === 'problem' ? getStepLabel() : 'Select Problem'}</span>
            </div>
          </div>

          {/* Content */}
          {step === 'company' && (
            <CompanySelector
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={handleCompanySelect}
            />
          )}

          {/* NeetCode 150 Problem Selector */}
          {step === 'problem' && selectedCompanyId === 'neetcode-150' && (
            <NeetCodeProblemSelector
              selectedProblemId={selectedProblemId}
              onSelectProblem={handleProblemSelect}
              onBack={handleBack}
              onStartInterview={handleStartInterview}
            />
          )}

          {/* Custom Problems Section */}
          {step === 'problem' && selectedCompanyId === 'custom' && (
            <CustomProblemsSection
              selectedProblemId={selectedProblemId}
              onSelectProblem={handleProblemSelect}
              onBack={handleBack}
              onStartInterview={handleStartInterview}
            />
          )}

          {/* Regular Company Problem Selector */}
          {step === 'problem' && selectedCompanyId && !['neetcode-150', 'custom'].includes(selectedCompanyId) && (
            <ProblemSelector
              companyId={selectedCompanyId}
              selectedProblemId={selectedProblemId}
              onSelectProblem={handleProblemSelect}
              onBack={handleBack}
              onStartInterview={handleStartInterview}
            />
          )}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <GraduationCap className="w-4 h-4" />
          <span>Practice mode provides coaching feedback instead of hiring decisions</span>
        </div>
      </footer>
    </div>
  );
}
