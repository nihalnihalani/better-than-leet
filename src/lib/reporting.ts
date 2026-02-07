/**
 * Interview Report Generation System
 * Creates comprehensive post-interview reports with code quality, integrity, and recommendations
 *
 * Improved integrity monitoring with:
 * - Dynamic code originality calculation (not hardcoded)
 * - Typing pattern analysis
 * - Code growth pattern detection
 */

import { useInterviewStore } from './store';
import { agentReasoning } from './agent-reasoning';

export interface InterviewReport {
  candidateName: string;
  position: string;
  date: string;
  duration: number;
  overallRecommendation: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE';
  confidence: number;
  codeQuality: CodeQualityScore;
  integrityScore: IntegrityScore;
  agentEvaluation: string;
}

export interface CodeQualityScore {
  overall: number;
  correctness: number;
  efficiency: number;
  codeStyle: number;
  edgeCases: number;
  breakdown: string[];
}

export interface IntegrityScore {
  overall: number;
  tabSwitches: number;
  pasteEvents: number;
  largePastes: number;
  codeOriginality: number;
  typingPattern: 'natural' | 'suspicious' | 'unknown';
  flags: string[];
}

export interface IntegrityData {
  blurCount: number;
  pasteCount: number;
  largePasteEvents: { timestamp: number; length: number }[];
  // Optional enhanced metrics (for future implementation)
  typingMetrics?: {
    totalKeystrokes?: number;
    averageTypingSpeed?: number;
    pauseEvents?: number;
    deletionRatio?: number;
    burstTyping?: number;
  };
  codeSnapshots?: {
    timestamp: number;
    codeLength: number;
    changeSize?: number;
  }[];
}

export class ReportGenerator {
  /**
   * Generate a complete interview report
   * Now async to support async agent evaluation
   */
  async generateReport(duration?: number): Promise<InterviewReport> {
    const state = useInterviewStore.getState();
    const { code, language, integrity, interviewStartTime } = state;

    // Use actual elapsed time if available, otherwise fall back to provided duration or 0
    if (duration === undefined) {
      duration = interviewStartTime
        ? Math.round((Date.now() - interviewStartTime) / 60000)
        : 0;
    }

    const codeQuality = this.analyzeCodeQuality(code, language);
    const integrityScore = this.calculateIntegrityScore(integrity, code);
    const recommendation = this.determineRecommendation(codeQuality, integrityScore);

    // Get async agent evaluation
    const agentEvaluation = await agentReasoning.getEvaluation();

    return {
      candidateName: 'Candidate',
      position: 'Software Engineer',
      date: new Date().toISOString().split('T')[0],
      duration,
      overallRecommendation: recommendation.decision,
      confidence: recommendation.confidence,
      codeQuality,
      integrityScore,
      agentEvaluation,
    };
  }

  private analyzeCodeQuality(code: string, language: string): CodeQualityScore {
    const scores = { correctness: 9, efficiency: 0, codeStyle: 0, edgeCases: 0 };
    const breakdown: string[] = [];

    const hasNestedLoops = /for\s+.*:\s*\n\s+for\s+/.test(code);
    const hasHashMap = /dict\(|{}/.test(code);

    if (hasNestedLoops && !hasHashMap) {
      scores.efficiency = 7;
      breakdown.push('O(n²) solution - could be optimized');
    } else if (hasHashMap) {
      scores.efficiency = 9;
      breakdown.push('Optimal O(n) time complexity');
    } else {
      scores.efficiency = 8;
      breakdown.push('Efficient solution');
    }

    const hasComments = /#+\s+/.test(code);
    const hasDocstrings = /"""/.test(code);
    scores.codeStyle = 7 + (hasComments ? 1 : 0) + (hasDocstrings ? 2 : 0);
    breakdown.push(hasComments ? 'Well-documented' : 'Could use more comments');

    const hasNullCheck = /if not|is None/.test(code);
    const hasEmptyCheck = /len\(.*\)\s*==\s*0/.test(code);
    scores.edgeCases = 5 + (hasNullCheck ? 2 : 0) + (hasEmptyCheck ? 3 : 0);
    breakdown.push(hasNullCheck && hasEmptyCheck ? 'Handles edge cases well' : 'Missing edge case handling');

    const overall = (scores.correctness + scores.efficiency + scores.codeStyle + scores.edgeCases) / 4;

    return { overall: Math.round(overall * 10) / 10, ...scores, breakdown };
  }

  /**
   * Calculate integrity score with dynamic originality calculation
   * Replaces hardcoded codeOriginality: 98 with actual analysis
   */
  private calculateIntegrityScore(data: IntegrityData, code: string): IntegrityScore {
    let score = 100;
    const flags: string[] = [];

    const blurCount = data?.blurCount || 0;
    const pasteCount = data?.pasteCount || 0;
    const largePastes = data?.largePasteEvents?.length || 0;

    // Tab switch penalty
    if (blurCount > 5) {
      score -= Math.min(20, blurCount * 2);
      flags.push(`${blurCount} tab switches (suspicious)`);
    }

    // Large paste penalty
    if (largePastes > 0) {
      score -= Math.min(30, largePastes * 10);
      flags.push(`${largePastes} large paste events (high concern)`);
    }

    // Calculate code originality based on multiple factors
    const codeOriginality = this.calculateCodeOriginality(data, code);

    // Analyze typing pattern
    const typingPattern = this.analyzeTypingPattern(data);

    // Additional penalty for suspicious typing
    if (typingPattern === 'suspicious') {
      score -= 15;
      flags.push('Unusual typing pattern detected');
    }

    // Penalty for low originality
    if (codeOriginality < 70) {
      score -= Math.min(20, (70 - codeOriginality));
      flags.push(`Code originality score: ${codeOriginality}%`);
    }

    return {
      overall: Math.max(0, score),
      tabSwitches: blurCount,
      pasteEvents: pasteCount,
      largePastes,
      codeOriginality,
      typingPattern,
      flags,
    };
  }

  /**
   * Calculate code originality score based on typing and paste behavior
   * Replaces the hardcoded 98 value
   */
  private calculateCodeOriginality(data: IntegrityData, code: string): number {
    let originality = 100;
    const codeLength = code.length;

    // If no data, return default high score
    if (!data) return 95;

    const { pasteCount = 0, largePasteEvents = [] } = data;

    // Calculate total pasted characters
    const totalPastedChars = largePasteEvents.reduce((sum, e) => sum + e.length, 0);

    // If most of the code came from pastes, reduce originality
    if (codeLength > 0) {
      const pasteRatio = totalPastedChars / codeLength;
      if (pasteRatio > 0.7) {
        originality -= 40; // Heavy paste usage
      } else if (pasteRatio > 0.5) {
        originality -= 25;
      } else if (pasteRatio > 0.3) {
        originality -= 15;
      } else if (pasteRatio > 0.1) {
        originality -= 5;
      }
    }

    // Penalty for many paste events
    if (pasteCount > 10) {
      originality -= Math.min(15, (pasteCount - 10) * 2);
    }

    // Analyze code snapshots for suspicious growth patterns
    if (data.codeSnapshots && data.codeSnapshots.length > 2) {
      const growthPattern = this.analyzeCodeGrowth(data.codeSnapshots);
      if (growthPattern === 'suspicious_jump') {
        originality -= 20;
      }
    }

    // Use typing metrics if available
    if (data.typingMetrics) {
      const { totalKeystrokes = 0, deletionRatio = 0.1, burstTyping = 0 } = data.typingMetrics;

      // Very low deletion ratio suggests pre-written code
      if (totalKeystrokes > 100 && deletionRatio < 0.05) {
        originality -= 10;
      }

      // Excessive burst typing (copy-paste-like behavior)
      if (burstTyping > 5) {
        originality -= burstTyping * 2;
      }
    }

    return Math.max(0, Math.min(100, Math.round(originality)));
  }

  /**
   * Analyze typing patterns to detect suspicious behavior
   */
  private analyzeTypingPattern(data: IntegrityData): 'natural' | 'suspicious' | 'unknown' {
    if (!data) return 'unknown';

    const { largePasteEvents = [], typingMetrics } = data;

    // If we have typing metrics, use them for analysis
    if (typingMetrics) {
      const { totalKeystrokes = 0, averageTypingSpeed = 0, burstTyping = 0, deletionRatio = 0 } = typingMetrics;

      // Not enough data
      if (totalKeystrokes < 50) {
        return 'unknown';
      }

      // Check for suspiciously fast typing (> 150 WPM consistently = ~750 chars/min)
      if (averageTypingSpeed > 750) {
        return 'suspicious';
      }

      // Check for burst patterns (copy-paste-like behavior)
      if (burstTyping > 5) {
        return 'suspicious';
      }

      // Very low deletion ratio suggests pre-written code
      if (deletionRatio < 0.05 && totalKeystrokes > 200) {
        return 'suspicious';
      }

      return 'natural';
    }

    // Fallback to basic large paste analysis
    if (largePasteEvents.length > 2) {
      return 'suspicious';
    }

    return largePasteEvents.length > 0 ? 'unknown' : 'natural';
  }

  /**
   * Analyze code growth pattern from snapshots
   */
  private analyzeCodeGrowth(snapshots: { timestamp: number; codeLength: number }[]): 'normal' | 'suspicious_jump' {
    for (let i = 1; i < snapshots.length; i++) {
      const jump = snapshots[i].codeLength - snapshots[i - 1].codeLength;
      // Large sudden increase (> 200 chars at once) is suspicious
      if (jump > 200) {
        return 'suspicious_jump';
      }
    }
    return 'normal';
  }

  private determineRecommendation(
    codeQuality: CodeQualityScore,
    integrityScore: IntegrityScore
  ): { decision: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE'; confidence: number } {
    if (integrityScore.overall < 70) {
      return { decision: 'NO_HIRE', confidence: 95 };
    }

    if (codeQuality.overall >= 8.5 && integrityScore.overall >= 90) {
      return { decision: 'STRONG_HIRE', confidence: 92 };
    } else if (codeQuality.overall >= 7.0 && integrityScore.overall >= 80) {
      return { decision: 'HIRE', confidence: 85 };
    } else if (codeQuality.overall >= 5.5) {
      return { decision: 'MAYBE', confidence: 70 };
    } else {
      return { decision: 'NO_HIRE', confidence: 80 };
    }
  }

  generateMarkdown(report: InterviewReport): string {
    const { codeQuality, integrityScore } = report;

    let md = `# Interview Report: ${report.candidateName}\n\n`;
    md += `**Date**: ${report.date} | **Position**: ${report.position} | **Duration**: ${report.duration} minutes\n\n`;
    md += `---\n\n`;

    const emoji = { STRONG_HIRE: '🎯', HIRE: '✅', MAYBE: '⚠️', NO_HIRE: '❌' }[report.overallRecommendation];
    md += `## ${emoji} Overall Recommendation: **${report.overallRecommendation.replace('_', ' ')}** (Confidence: ${report.confidence}%)\n\n`;

    md += `## 📊 Code Quality Score: ${codeQuality.overall}/10\n\n`;
    md += `| Dimension | Score |\n|-----------|-------|\n`;
    md += `| Correctness | ${codeQuality.correctness}/10 |\n`;
    md += `| Efficiency | ${codeQuality.efficiency}/10 |\n`;
    md += `| Code Style | ${codeQuality.codeStyle}/10 |\n`;
    md += `| Edge Cases | ${codeQuality.edgeCases}/10 |\n\n`;

    codeQuality.breakdown.forEach(item => md += `- ${item}\n`);
    md += `\n`;

    const integrityEmoji = integrityScore.overall >= 90 ? '✅' : integrityScore.overall >= 70 ? '⚠️' : '❌';
    md += `## ${integrityEmoji} Integrity Score: ${integrityScore.overall}/100\n\n`;
    md += `- Tab Switches: ${integrityScore.tabSwitches}\n`;
    md += `- Paste Events: ${integrityScore.pasteEvents} (${integrityScore.largePastes} large)\n`;
    md += `- Code Originality: ${integrityScore.codeOriginality}%\n`;
    md += `- Typing Pattern: ${integrityScore.typingPattern}\n\n`;

    if (integrityScore.flags.length > 0) {
      md += `### Flags:\n`;
      integrityScore.flags.forEach(flag => md += `- ⚠️ ${flag}\n`);
      md += `\n`;
    }

    md += `## 🤖 AI Agent Evaluation\n\n${report.agentEvaluation}\n\n`;
    md += `---\n*Generated by Alexis AI*\n`;

    return md;
  }

  downloadReport(report: InterviewReport) {
    const content = this.generateMarkdown(report);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_report_${report.date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const reportGenerator = new ReportGenerator();

// Legacy function for backward compatibility (now async)
export async function generateInterviewReport(): Promise<string> {
  const report = await reportGenerator.generateReport();
  return reportGenerator.generateMarkdown(report);
}
