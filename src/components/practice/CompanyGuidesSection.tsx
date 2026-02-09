'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { COMPANY_GUIDES } from '@/data/company-guides';
import { CompanyGuideCard } from './CompanyGuideCard';

export function CompanyGuidesSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        className="w-full justify-between text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Company Interview Guides ({COMPANY_GUIDES.length} companies)
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {COMPANY_GUIDES.map((guide) => (
            <CompanyGuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
