// Coaching system for practice interview mode
// Provides skill assessment and improvement suggestions instead of hire/no-hire decisions

export type SkillLevel = 'Beginner' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert';

export interface SkillCategory {
  level: SkillLevel;
  score: number; // 1-10
  description: string;
}

export interface ImprovementAction {
  priority: 'High' | 'Medium' | 'Low';
  area: string;
  suggestion: string;
  resources?: string[];
}

export interface CoachingFeedback {
  overallLevel: SkillLevel;
  overallScore: number;
  categories: {
    problemSolving: SkillCategory;
    codeQuality: SkillCategory;
    communication: SkillCategory;
    optimization: SkillCategory;
  };
  strengths: string[];
  improvementPlan: ImprovementAction[];
  recommendedProblems: RecommendedProblem[];
  encouragement: string;
}

export interface RecommendedProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reason: string;
  tags: string[];
}

/**
 * Calculate skill level from a numeric score (1-10)
 */
export function calculateSkillLevel(score: number): SkillLevel {
  if (score >= 9) return 'Expert';
  if (score >= 7) return 'Advanced';
  if (score >= 5) return 'Proficient';
  if (score >= 3) return 'Developing';
  return 'Beginner';
}

/**
 * Get color class for skill level (for UI display)
 */
export function getSkillLevelColor(level: SkillLevel): string {
  switch (level) {
    case 'Expert':
      return 'text-purple-500 bg-purple-500/10';
    case 'Advanced':
      return 'text-blue-500 bg-blue-500/10';
    case 'Proficient':
      return 'text-green-500 bg-green-500/10';
    case 'Developing':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'Beginner':
      return 'text-orange-500 bg-orange-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
}

/**
 * Get emoji for skill level
 */
export function getSkillLevelEmoji(level: SkillLevel): string {
  switch (level) {
    case 'Expert': return '🏆';
    case 'Advanced': return '⭐';
    case 'Proficient': return '✅';
    case 'Developing': return '📈';
    case 'Beginner': return '🌱';
    default: return '📊';
  }
}

/**
 * Get priority color for improvement actions
 */
export function getPriorityColor(priority: 'High' | 'Medium' | 'Low'): string {
  switch (priority) {
    case 'High':
      return 'text-red-500 bg-red-500/10 border-red-500/30';
    case 'Medium':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    case 'Low':
      return 'text-green-500 bg-green-500/10 border-green-500/30';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
  }
}

/**
 * Default coaching feedback when parsing fails
 */
export const DEFAULT_COACHING_FEEDBACK: CoachingFeedback = {
  overallLevel: 'Developing',
  overallScore: 5,
  categories: {
    problemSolving: {
      level: 'Developing',
      score: 5,
      description: 'Shows potential in breaking down problems.'
    },
    codeQuality: {
      level: 'Developing',
      score: 5,
      description: 'Code is functional with room for improvement.'
    },
    communication: {
      level: 'Developing',
      score: 5,
      description: 'Communicates ideas but could be clearer.'
    },
    optimization: {
      level: 'Developing',
      score: 5,
      description: 'Considers efficiency with opportunities to improve.'
    }
  },
  strengths: [
    'Attempted the problem with a clear approach',
    'Showed willingness to learn and improve',
    'Engaged with the problem throughout the session'
  ],
  improvementPlan: [
    {
      priority: 'High',
      area: 'Problem Solving',
      suggestion: 'Practice breaking down problems into smaller steps before coding.',
      resources: ['LeetCode Easy problems', 'HackerRank Problem Solving track']
    },
    {
      priority: 'Medium',
      area: 'Code Quality',
      suggestion: 'Focus on writing clean, readable code with meaningful variable names.',
      resources: ['Clean Code by Robert Martin', 'Code Review best practices']
    }
  ],
  recommendedProblems: [
    {
      title: 'Two Sum',
      difficulty: 'Easy',
      reason: 'Great for practicing hash map usage and problem-solving fundamentals.',
      tags: ['Array', 'Hash Table']
    }
  ],
  encouragement: 'Keep practicing! Every coding session is a step forward in your journey.'
};
