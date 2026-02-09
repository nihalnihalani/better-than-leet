'use client';

import React, { useState } from 'react';
import { Link2, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInterviewStore, CustomProblem } from '@/lib/store';

interface AddCustomProblemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportedProblemData {
  examples?: { input: string; output: string; explanation?: string }[];
  constraints?: string[];
}

export function AddCustomProblemDialog({ open, onOpenChange }: AddCustomProblemDialogProps) {
  const [mode, setMode] = useState<'url' | 'manual'>('url');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<ImportedProblemData | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    description: '',
    starterCode: `def solution():\n    # Write your solution here\n    pass`,
    functionName: 'solution',
    testCasesJson: '[\n  { "inputs": [], "expected": null }\n]',
    tags: '',
    hints: '',
  });

  const { addCustomProblem } = useInterviewStore();

  const handleImport = async () => {
    if (!leetcodeUrl.trim()) {
      setError('Please enter a LeetCode URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/leetcode/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: leetcodeUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to import problem');
        return;
      }

      const { problem } = data;

      // Pre-fill the form with imported data
      setFormData({
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.description || '',
        starterCode: problem.starterCode,
        functionName: problem.functionName,
        testCasesJson: JSON.stringify(problem.testCases, null, 2),
        tags: problem.tags?.join(', ') || '',
        hints: problem.hints?.join('\n') || '',
      });

      // Store imported examples and constraints for later use
      setImportedData({
        examples: problem.examples,
        constraints: problem.constraints,
      });

      // Switch to manual mode to review/complete the form
      setMode('manual');
      setError(null);

      // Show appropriate message based on whether we got full data
      if (problem.requiresManualEntry) {
        setError(problem.message);
        setSuccessMessage(null);
      } else {
        setSuccessMessage(problem.message || 'Problem imported successfully! Review the details below and click "Add Problem" to save.');
        setError(null);
      }
    } catch {
      setError('Failed to connect to the server. Please try again.');
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      setError('Please enter a problem title');
      return;
    }

    let testCases;
    try {
      testCases = JSON.parse(formData.testCasesJson);
    } catch {
      setError('Invalid test cases JSON format');
      return;
    }

    const problem: CustomProblem = {
      id: `custom-${formData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: formData.title,
      difficulty: formData.difficulty,
      description: formData.description,
      examples: importedData?.examples && importedData.examples.length > 0
        ? importedData.examples
        : [{ input: '', output: '' }],
      constraints: importedData?.constraints || [],
      starterCode: formData.starterCode,
      functionName: formData.functionName,
      testCases,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      hints: formData.hints.split('\n').filter(Boolean),
      leetcodeUrl: leetcodeUrl || undefined,
      addedAt: Date.now(),
    };

    addCustomProblem(problem);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setLeetcodeUrl('');
    setError(null);
    setSuccessMessage(null);
    setImportedData(null);
    setMode('url');
    setFormData({
      title: '',
      difficulty: 'Medium',
      description: '',
      starterCode: `def solution():\n    # Write your solution here\n    pass`,
      functionName: 'solution',
      testCasesJson: '[\n  { "inputs": [], "expected": null }\n]',
      tags: '',
      hints: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Problem</DialogTitle>
          <DialogDescription>
            Import a problem from LeetCode or add one manually
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v: string) => setMode(v as 'url' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" />
              Import from URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <FileText className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="leetcode-url">LeetCode Problem URL</Label>
              <Input
                id="leetcode-url"
                placeholder="https://leetcode.com/problems/two-sum"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a LeetCode problem URL to import basic details. You may need to complete the description manually.
              </p>
            </div>

            {error && (
              <Alert variant={error.includes('imported') ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleImport} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Problem
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            {successMessage && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Problem Title *</Label>
                <Input
                  id="title"
                  placeholder="Two Sum"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v: string) => setFormData({ ...formData, difficulty: v as 'Easy' | 'Medium' | 'Hard' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Problem Description</Label>
              <Textarea
                id="description"
                placeholder="Given an array of integers nums and an integer target..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="functionName">Function Name</Label>
                <Input
                  id="functionName"
                  placeholder="twoSum"
                  value={formData.functionName}
                  onChange={(e) => setFormData({ ...formData, functionName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="Array, Hash Table"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="starterCode">Starter Code</Label>
              <Textarea
                id="starterCode"
                className="font-mono text-sm"
                value={formData.starterCode}
                onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testCases">Test Cases (JSON)</Label>
              <Textarea
                id="testCases"
                className="font-mono text-sm"
                placeholder='[{ "inputs": [[2,7,11,15], 9], "expected": [0,1] }]'
                value={formData.testCasesJson}
                onChange={(e) => setFormData({ ...formData, testCasesJson: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Format: Array of objects with &ldquo;inputs&rdquo; (array) and &ldquo;expected&rdquo; (any) fields
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hints">Hints (one per line)</Label>
              <Textarea
                id="hints"
                placeholder="Use a hash map for O(1) lookup..."
                value={formData.hints}
                onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Add Problem
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
