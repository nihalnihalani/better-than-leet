export interface TestCase {
  input: any[];
  expected: any;
  description: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  signature: string;
  testCases: TestCase[];
  defaultCode: string;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  description: string;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: number;
  source: 'system' | 'user' | 'ai' | 'tool';
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}