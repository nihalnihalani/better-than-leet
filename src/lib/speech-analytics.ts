/**
 * Speech Analytics - analyzes candidate speech patterns from transcript data
 */

interface TranscriptMessage {
  timestamp: number;
  speaker: 'agent' | 'user';
  message: string;
  type?: 'text' | 'audio';
}

export interface FillerWordBreakdown {
  word: string;
  count: number;
}

export interface SpeechAnalytics {
  fillerWords: {
    total: number;
    breakdown: FillerWordBreakdown[];
    rate: number; // fillers per 100 words
  };
  pace: {
    overallWPM: number;
    segments: { timestamp: number; wpm: number }[];
  };
  talkRatio: {
    candidateWords: number;
    interviewerWords: number;
    candidatePercent: number;
    interviewerPercent: number;
  };
  pauses: {
    count: number;
    avgDurationMs: number;
    longPauses: number; // pauses > 10 seconds
  };
  vocabulary: {
    uniqueWords: number;
    totalWords: number;
    diversityScore: number; // unique / total (0-1)
  };
  confidenceScore: number; // 0-100
}

const FILLER_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bum+\b/gi, label: 'um' },
  { pattern: /\buh+\b/gi, label: 'uh' },
  { pattern: /\byou know\b/gi, label: 'you know' },
  { pattern: /\bbasically\b/gi, label: 'basically' },
  { pattern: /\bactually\b/gi, label: 'actually' },
  { pattern: /\bi mean\b/gi, label: 'I mean' },
  { pattern: /\bkind of\b/gi, label: 'kind of' },
  { pattern: /\bsort of\b/gi, label: 'sort of' },
  { pattern: /\bliterally\b/gi, label: 'literally' },
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countFillerWords(text: string): { total: number; breakdown: FillerWordBreakdown[] } {
  const breakdown: FillerWordBreakdown[] = [];
  let total = 0;

  for (const { pattern, label } of FILLER_PATTERNS) {
    const matches = text.match(pattern);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      breakdown.push({ word: label, count });
      total += count;
    }
  }

  breakdown.sort((a, b) => b.count - a.count);
  return { total, breakdown };
}

function calculateWPM(messages: TranscriptMessage[]): { overallWPM: number; segments: { timestamp: number; wpm: number }[] } {
  if (messages.length < 2) {
    const words = messages.reduce((sum, m) => sum + countWords(m.message), 0);
    return { overallWPM: words > 0 ? 120 : 0, segments: [] };
  }

  const totalWords = messages.reduce((sum, m) => sum + countWords(m.message), 0);
  const firstTimestamp = messages[0].timestamp;
  const lastTimestamp = messages[messages.length - 1].timestamp;
  const durationMinutes = (lastTimestamp - firstTimestamp) / 60000;

  const overallWPM = durationMinutes > 0 ? Math.round(totalWords / durationMinutes) : 0;

  // Calculate WPM in 2-minute sliding windows
  const segments: { timestamp: number; wpm: number }[] = [];
  const windowMs = 120000; // 2 minutes
  const stepMs = 60000; // 1 minute step

  for (let start = firstTimestamp; start < lastTimestamp; start += stepMs) {
    const end = start + windowMs;
    const windowMessages = messages.filter((m) => m.timestamp >= start && m.timestamp < end);
    const windowWords = windowMessages.reduce((sum, m) => sum + countWords(m.message), 0);
    const windowDuration = Math.min(windowMs, lastTimestamp - start) / 60000;

    if (windowDuration > 0 && windowWords > 0) {
      segments.push({
        timestamp: start,
        wpm: Math.round(windowWords / windowDuration),
      });
    }
  }

  return { overallWPM, segments };
}

function detectPauses(fullTranscript: TranscriptMessage[]): { count: number; avgDurationMs: number; longPauses: number } {
  if (fullTranscript.length < 2) return { count: 0, avgDurationMs: 0, longPauses: 0 };

  const pauses: number[] = [];

  // Measure candidate thinking time: gap between an agent message and the next user message
  for (let i = 1; i < fullTranscript.length; i++) {
    if (fullTranscript[i].speaker === 'user' && fullTranscript[i - 1].speaker === 'agent') {
      const gap = fullTranscript[i].timestamp - fullTranscript[i - 1].timestamp;
      if (gap > 5000) {
        pauses.push(gap);
      }
    }
  }

  const count = pauses.length;
  const avgDurationMs = count > 0 ? Math.round(pauses.reduce((a, b) => a + b, 0) / count) : 0;
  const longPauses = pauses.filter((p) => p > 10000).length;

  return { count, avgDurationMs, longPauses };
}

function calculateVocabulary(text: string): { uniqueWords: number; totalWords: number; diversityScore: number } {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const uniqueWords = new Set(words).size;
  const diversityScore = totalWords > 0 ? Math.round((uniqueWords / totalWords) * 100) / 100 : 0;

  return { uniqueWords, totalWords, diversityScore };
}

function calculateConfidenceScore(analytics: Omit<SpeechAnalytics, 'confidenceScore'>): number {
  let score = 70; // Base

  // Filler word rate penalty (lower is better)
  if (analytics.fillerWords.rate < 2) score += 15;
  else if (analytics.fillerWords.rate < 5) score += 5;
  else if (analytics.fillerWords.rate > 10) score -= 15;
  else if (analytics.fillerWords.rate > 7) score -= 10;

  // WPM score (120-160 is ideal for interviews)
  const wpm = analytics.pace.overallWPM;
  if (wpm >= 120 && wpm <= 160) score += 10;
  else if (wpm >= 100 && wpm <= 180) score += 5;
  else if (wpm < 80 || wpm > 200) score -= 10;

  // Talk ratio (candidate should talk 60-75%)
  const ratio = analytics.talkRatio.candidatePercent;
  if (ratio >= 55 && ratio <= 75) score += 10;
  else if (ratio >= 45 && ratio <= 80) score += 5;
  else score -= 5;

  // Long pauses penalty
  if (analytics.pauses.longPauses === 0) score += 5;
  else if (analytics.pauses.longPauses > 3) score -= 10;

  // Vocabulary diversity bonus
  if (analytics.vocabulary.diversityScore > 0.6) score += 5;
  else if (analytics.vocabulary.diversityScore > 0.4) score += 2;

  return Math.max(0, Math.min(100, score));
}

export function analyzeSpeech(transcript: TranscriptMessage[]): SpeechAnalytics {
  const userMessages = transcript.filter((m) => m.speaker === 'user');
  const agentMessages = transcript.filter((m) => m.speaker === 'agent');

  const userText = userMessages.map((m) => m.message).join(' ');
  const agentText = agentMessages.map((m) => m.message).join(' ');

  const candidateWords = countWords(userText);
  const interviewerWords = countWords(agentText);
  const totalWords = candidateWords + interviewerWords;

  const fillerResult = countFillerWords(userText);
  const fillerRate = candidateWords > 0 ? Math.round((fillerResult.total / candidateWords) * 1000) / 10 : 0;

  const pace = calculateWPM(userMessages);
  const pauses = detectPauses(transcript);
  const vocabulary = calculateVocabulary(userText);

  const partial = {
    fillerWords: {
      ...fillerResult,
      rate: fillerRate,
    },
    pace,
    talkRatio: {
      candidateWords,
      interviewerWords,
      candidatePercent: totalWords > 0 ? Math.round((candidateWords / totalWords) * 100) : 0,
      interviewerPercent: totalWords > 0 ? Math.round((interviewerWords / totalWords) * 100) : 0,
    },
    pauses,
    vocabulary,
  };

  return {
    ...partial,
    confidenceScore: calculateConfidenceScore(partial),
  };
}
