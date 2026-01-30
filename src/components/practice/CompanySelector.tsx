'use client';

import Image from 'next/image';
import { COMPANIES } from '@/data/company-problems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CompanySelectorProps {
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
}

export function CompanySelector({ selectedCompanyId, onSelectCompany }: CompanySelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select a Company</h2>
        <p className="text-muted-foreground">
          Practice with interview questions commonly asked at top tech companies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {COMPANIES.map((company) => (
          <Card
            key={company.id}
            className={cn(
              'cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
              selectedCompanyId === company.id
                ? 'ring-2 ring-primary shadow-lg'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelectCompany(company.id)}
          >
            <CardHeader className="text-center pb-2">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center p-3"
                style={{ backgroundColor: `${company.color}20` }}
              >
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <CardTitle className="text-xl">{company.name}</CardTitle>
              <CardDescription className="text-sm">
                {company.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                <span className="bg-secondary px-2 py-1 rounded">
                  {company.problems.length} problems
                </span>
                <span className="bg-secondary px-2 py-1 rounded">
                  {company.problems.filter(p => p.frequency === 'High').length} frequently asked
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
