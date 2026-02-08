'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useInterviewStore } from '@/lib/store';
import { ArrowRight } from 'lucide-react';
import { PROBLEMS } from '@/data/problems';

interface StartInterviewButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showIcon?: boolean;
}

export function StartInterviewButton({ size = 'lg', className, variant = 'default', showIcon = true }: StartInterviewButtonProps) {
  const router = useRouter();
  const { setInterviewMode, setSelectedCompanyId, setCurrentProblemId, setCode } = useInterviewStore();

  const handleStartInterview = () => {
    // Reset to real interview mode
    setInterviewMode('real');
    setSelectedCompanyId(null);

    // Always start with Two Sum problem (first problem in PROBLEMS array)
    const twoSumProblem = PROBLEMS[0]; // Two Sum is always first
    setCurrentProblemId(twoSumProblem.id);
    setCode(twoSumProblem.starterCode);

    // Navigate to interview page
    router.push('/interview');
  };

  return (
    <Button size={size} className={className} variant={variant} onClick={handleStartInterview}>
      Start Interview {showIcon && <ArrowRight className="ml-2 w-5 h-5" />}
    </Button>
  );
}
