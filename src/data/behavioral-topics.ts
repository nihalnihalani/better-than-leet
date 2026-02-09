export interface BehavioralTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  sampleQuestions: string[];
  starFramework: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export const BEHAVIORAL_TOPICS: BehavioralTopic[] = [
  {
    id: 'leadership',
    title: 'Leadership',
    description: 'Demonstrate how you lead teams, make decisions under pressure, and drive results.',
    icon: 'Crown',
    sampleQuestions: [
      'Tell me about a time you led a team through a difficult project.',
      'Describe a situation where you had to make a tough decision without enough data.',
      'Give an example of how you motivated a struggling team member.',
      'Tell me about a time you had to lead a project with ambiguous requirements.',
    ],
    starFramework: {
      situation: 'Set the scene: what team, project, or organization were you in?',
      task: 'What was your specific leadership responsibility or challenge?',
      action: 'What leadership actions did you take? How did you delegate, decide, or motivate?',
      result: 'What was the outcome? Quantify impact on the team or business.',
    },
  },
  {
    id: 'conflict-resolution',
    title: 'Conflict Resolution',
    description: 'Show how you handle disagreements, navigate interpersonal tension, and find solutions.',
    icon: 'Handshake',
    sampleQuestions: [
      'Tell me about a time you had a disagreement with a coworker.',
      'Describe a conflict between team members that you helped resolve.',
      'Give an example of when you had to push back on a manager\'s decision.',
      'Tell me about a time you had to work with someone difficult.',
    ],
    starFramework: {
      situation: 'What was the conflict? Who was involved?',
      task: 'What was your role in resolving it? Why was resolution important?',
      action: 'How did you approach the conversation? What steps did you take to de-escalate?',
      result: 'What was the resolution? How did the relationship improve afterward?',
    },
  },
  {
    id: 'teamwork',
    title: 'Teamwork & Collaboration',
    description: 'Illustrate how you collaborate effectively, support teammates, and contribute to group success.',
    icon: 'Users',
    sampleQuestions: [
      'Describe a successful team project you contributed to.',
      'Tell me about a time you helped a teammate who was struggling.',
      'Give an example of when you had to collaborate across departments.',
      'Tell me about a time when your team disagreed on an approach.',
    ],
    starFramework: {
      situation: 'What was the team, project, or collaboration context?',
      task: 'What was your specific role and what did the team need to achieve?',
      action: 'How did you collaborate? What did you do to support the team?',
      result: 'What was the team\'s outcome? How did your contribution matter?',
    },
  },
  {
    id: 'problem-solving',
    title: 'Problem Solving',
    description: 'Demonstrate analytical thinking, creative solutions, and systematic approaches to challenges.',
    icon: 'Lightbulb',
    sampleQuestions: [
      'Tell me about the most complex problem you\'ve solved at work.',
      'Describe a time when you had to find a creative solution to a constraint.',
      'Give an example of when you identified a problem before anyone else did.',
      'Tell me about a time you had to debug a critical production issue.',
    ],
    starFramework: {
      situation: 'What was the problem? What made it complex or challenging?',
      task: 'What was your goal? What constraints did you face?',
      action: 'What was your approach? How did you break down the problem?',
      result: 'What was the solution? What was the measurable impact?',
    },
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Show how you convey ideas clearly, adapt messaging for audiences, and influence stakeholders.',
    icon: 'MessageCircle',
    sampleQuestions: [
      'Tell me about a time you had to explain a complex technical concept to a non-technical audience.',
      'Describe a situation where miscommunication led to a problem and how you fixed it.',
      'Give an example of when you had to deliver bad news to a stakeholder.',
      'Tell me about a time you had to persuade someone to change their mind.',
    ],
    starFramework: {
      situation: 'What was the communication context? Who was the audience?',
      task: 'What message did you need to convey and why was it important?',
      action: 'How did you tailor your communication? What techniques did you use?',
      result: 'Was the message received well? What was the outcome?',
    },
  },
  {
    id: 'adaptability',
    title: 'Adaptability & Growth',
    description: 'Demonstrate how you handle change, learn from failures, and grow from challenges.',
    icon: 'RefreshCw',
    sampleQuestions: [
      'Tell me about a time you had to adapt to a major change at work.',
      'Describe a project where the requirements changed significantly midway.',
      'Give an example of a failure and what you learned from it.',
      'Tell me about a time you had to quickly learn a new technology or skill.',
    ],
    starFramework: {
      situation: 'What changed? What was the initial plan or expectation?',
      task: 'What did you need to adapt to? What was at stake?',
      action: 'How did you pivot? What new skills or approaches did you develop?',
      result: 'What was the outcome? How did you grow from the experience?',
    },
  },
  {
    id: 'ownership',
    title: 'Ownership & Initiative',
    description: 'Show how you take responsibility, go beyond your role, and drive improvements proactively.',
    icon: 'Flag',
    sampleQuestions: [
      'Tell me about a time you took ownership of something outside your job description.',
      'Describe a process or system you improved without being asked.',
      'Give an example of when you identified and fixed a gap in your team.',
      'Tell me about a time you went above and beyond for a customer or stakeholder.',
    ],
    starFramework: {
      situation: 'What was the gap, opportunity, or problem you noticed?',
      task: 'Why did you feel ownership? What motivated you to act?',
      action: 'What initiative did you take? How did you drive the improvement?',
      result: 'What was the impact? How was your initiative received?',
    },
  },
  {
    id: 'customer-focus',
    title: 'Customer Focus',
    description: 'Illustrate how you prioritize user needs, gather feedback, and deliver customer value.',
    icon: 'Heart',
    sampleQuestions: [
      'Tell me about a time you went above and beyond for a customer.',
      'Describe how you used customer feedback to improve a product.',
      'Give an example of when you had to balance customer needs with business constraints.',
      'Tell me about a time you disagreed with a product decision based on user impact.',
    ],
    starFramework: {
      situation: 'Who was the customer? What was their need or problem?',
      task: 'What was your goal in serving the customer?',
      action: 'What did you do to understand and address their needs?',
      result: 'How did the customer benefit? What was the business impact?',
    },
  },
  {
    id: 'time-management',
    title: 'Time Management & Prioritization',
    description: 'Demonstrate how you manage competing priorities, meet deadlines, and make trade-off decisions.',
    icon: 'Clock',
    sampleQuestions: [
      'Tell me about a time you had to manage multiple competing deadlines.',
      'Describe how you prioritized tasks when everything seemed urgent.',
      'Give an example of when you had to say no to a request to meet a deadline.',
      'Tell me about a time you had to deliver a project under a tight timeline.',
    ],
    starFramework: {
      situation: 'What were the competing priorities or constraints?',
      task: 'What needed to be delivered and by when?',
      action: 'How did you prioritize? What trade-offs did you make?',
      result: 'Did you meet the deadlines? What did you learn about prioritization?',
    },
  },
];

export function getBehavioralTopic(topicId: string): BehavioralTopic | undefined {
  return BEHAVIORAL_TOPICS.find((t) => t.id === topicId);
}
