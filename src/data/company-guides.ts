export interface InterviewRound {
  name: string;
  duration: string;
  description: string;
}

export interface CompanyGuide {
  id: string;
  name: string;
  color: string;
  rounds: InterviewRound[];
  focusAreas: string[];
  tips: string[];
  commonTopics: string[];
}

export const COMPANY_GUIDES: CompanyGuide[] = [
  {
    id: 'google',
    name: 'Google',
    color: '#4285F4',
    rounds: [
      { name: 'Phone Screen', duration: '45 min', description: 'One coding problem in Google Docs or a shared editor. Expect medium-hard difficulty.' },
      { name: 'Onsite Round 1-2', duration: '45 min each', description: 'Two coding/algorithm rounds. Emphasis on optimal time/space complexity.' },
      { name: 'System Design', duration: '45 min', description: 'Design a large-scale distributed system. Expected for L5+ roles.' },
      { name: 'Behavioral (Googleyness)', duration: '45 min', description: 'Culture fit, leadership, and collaboration questions.' },
    ],
    focusAreas: ['Algorithms & Data Structures', 'System Design', 'Googleyness & Leadership', 'General Cognitive Ability'],
    tips: [
      'Think out loud -- Google values your thought process as much as the answer.',
      'Always discuss time and space complexity before and after coding.',
      'Ask clarifying questions early to show thoroughness.',
      'Practice graph problems, dynamic programming, and string manipulation.',
    ],
    commonTopics: ['Graphs (BFS/DFS)', 'Dynamic Programming', 'Trees', 'Sliding Window', 'System Design at Scale'],
  },
  {
    id: 'meta',
    name: 'Meta',
    color: '#0668E1',
    rounds: [
      { name: 'Phone Screen', duration: '45 min', description: 'Two coding problems (one easy, one medium). Speed matters.' },
      { name: 'Onsite Coding 1-2', duration: '45 min each', description: 'Two rounds of coding, typically two problems per round.' },
      { name: 'System Design', duration: '45 min', description: 'Design a product feature (e.g., News Feed, Messenger). Product-oriented.' },
      { name: 'Behavioral', duration: '45 min', description: 'Focus on "Move Fast" culture and past project impact.' },
    ],
    focusAreas: ['Speed & Correctness', 'Product-Oriented Design', 'Impact & Ownership', 'Graph/Tree Algorithms'],
    tips: [
      'Meta interviews value speed -- practice writing clean code quickly.',
      'For system design, think about the product first and user experience.',
      'Prepare concrete examples of projects with measurable impact.',
      'Expect follow-up questions that modify the original problem constraints.',
    ],
    commonTopics: ['Arrays & Strings', 'Trees & Graphs', 'Hash Maps', 'Backtracking', 'News Feed Design'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    color: '#FF9900',
    rounds: [
      { name: 'Online Assessment', duration: '90 min', description: 'Two coding problems plus a work simulation questionnaire.' },
      { name: 'Phone Screen', duration: '60 min', description: 'One coding problem + Leadership Principles behavioral questions.' },
      { name: 'Onsite Loop (4-5 rounds)', duration: '45-60 min each', description: 'Mix of coding, system design, and LP-heavy behavioral rounds.' },
      { name: 'Bar Raiser', duration: '60 min', description: 'Senior interviewer from another team. Combines technical and LP questions.' },
    ],
    focusAreas: ['Leadership Principles', 'Scalable System Design', 'Object-Oriented Design', 'Behavioral (STAR Method)'],
    tips: [
      'Learn all 16 Leadership Principles and prepare 2-3 stories for each.',
      'Use the STAR method for every behavioral answer.',
      'Amazon values "Customer Obsession" -- frame answers around customer impact.',
      'For coding, focus on arrays, strings, trees, and BFS/DFS.',
    ],
    commonTopics: ['BFS/DFS', 'Stacks & Queues', 'OOP Design', 'Priority Queues', 'Distributed Systems'],
  },
  {
    id: 'apple',
    name: 'Apple',
    color: '#A2AAAD',
    rounds: [
      { name: 'Phone Screen', duration: '45-60 min', description: 'Technical discussion and one coding problem. Focus on fundamentals.' },
      { name: 'Onsite Coding', duration: '45 min', description: 'Whiteboard or laptop coding. Clean, readable code is essential.' },
      { name: 'Domain Deep Dive', duration: '60 min', description: 'Deep technical questions related to the specific team and domain.' },
      { name: 'Manager Round', duration: '30 min', description: 'Cultural fit, collaboration style, and career goals.' },
    ],
    focusAreas: ['Clean Code & Attention to Detail', 'Domain Expertise', 'Privacy & Security Awareness', 'Cross-Team Collaboration'],
    tips: [
      'Apple values craftsmanship -- write clean, well-structured code.',
      'Be prepared to discuss privacy and security implications of your designs.',
      'Show passion for the product area you are applying to.',
      'Research the specific team and their recent product launches.',
    ],
    commonTopics: ['Arrays & Strings', 'Linked Lists', 'Concurrency', 'Memory Management', 'API Design'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    color: '#00A4EF',
    rounds: [
      { name: 'Phone Screen', duration: '45 min', description: 'One or two coding problems. Collaborative tone.' },
      { name: 'Onsite Coding (2 rounds)', duration: '45 min each', description: 'Coding problems with increasing difficulty. Discussion-based.' },
      { name: 'System Design', duration: '45 min', description: 'Design a real-world system. Focus on Azure/cloud concepts for senior roles.' },
      { name: 'As Appropriate (AA)', duration: '30-45 min', description: 'Senior interviewer assessing overall candidacy and team fit.' },
    ],
    focusAreas: ['Balanced Technical Skills', 'Collaborative Problem Solving', 'Growth Mindset', 'System Design'],
    tips: [
      'Microsoft interviews are conversational -- engage in dialogue with the interviewer.',
      'Show a growth mindset: discuss how you have learned from failures.',
      'For system design, consider Azure services as building blocks.',
      'Practice trees, graphs, and dynamic programming problems.',
    ],
    commonTopics: ['Trees & BSTs', 'Dynamic Programming', 'Sorting & Searching', 'Linked Lists', 'Cloud Architecture'],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    color: '#E50914',
    rounds: [
      { name: 'Phone Screen', duration: '45-60 min', description: 'Technical discussion and coding. Strong focus on your past work.' },
      { name: 'Onsite Technical', duration: '60 min', description: 'Deep technical problem-solving relevant to the team domain.' },
      { name: 'System Design', duration: '60 min', description: 'Design large-scale systems (video streaming, recommendation, etc.).' },
      { name: 'Culture Fit', duration: '45 min', description: 'Netflix culture memo values: judgment, communication, courage, impact.' },
    ],
    focusAreas: ['Senior-Level Depth', 'Distributed Systems', 'Culture Values', 'Independent Decision Making'],
    tips: [
      'Netflix hires senior-level -- demonstrate depth over breadth.',
      'Read the Netflix Culture Memo thoroughly and align your stories to it.',
      'Emphasize independent judgment and high-impact decisions.',
      'Be ready to discuss tradeoffs in distributed systems.',
    ],
    commonTopics: ['Distributed Systems', 'Caching Strategies', 'Microservices', 'Streaming Architecture', 'Fault Tolerance'],
  },
  {
    id: 'uber',
    name: 'Uber',
    color: '#000000',
    rounds: [
      { name: 'Phone Screen', duration: '45 min', description: 'One coding problem focused on data structures and algorithms.' },
      { name: 'Onsite Coding (2 rounds)', duration: '45 min each', description: 'Two coding rounds with medium-hard problems.' },
      { name: 'System Design', duration: '45 min', description: 'Design ride-matching, pricing, or mapping systems.' },
      { name: 'Behavioral', duration: '45 min', description: 'Focus on collaboration, urgency, and problem ownership.' },
    ],
    focusAreas: ['Real-Time Systems', 'Geospatial Algorithms', 'Scalable APIs', 'Data-Driven Decisions'],
    tips: [
      'Think about real-time, location-based systems in your design answers.',
      'Uber values speed of execution -- be decisive in your approach.',
      'Prepare for questions involving geospatial data and matching algorithms.',
      'Show experience with high-throughput, low-latency systems.',
    ],
    commonTopics: ['Graphs & Shortest Path', 'Real-Time Systems', 'Rate Limiting', 'Geospatial Indexing', 'Event-Driven Architecture'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    color: '#635BFF',
    rounds: [
      { name: 'Phone Screen', duration: '60 min', description: 'Practical coding problem, often involving APIs or data processing.' },
      { name: 'Onsite Coding (2 rounds)', duration: '60 min each', description: 'Practical programming. Emphasis on code quality and real-world applicability.' },
      { name: 'System Design / Architecture', duration: '60 min', description: 'Design payment systems, APIs, or financial infrastructure.' },
      { name: 'Collaboration & Communication', duration: '45 min', description: 'Pair-programming style. How you collaborate and communicate.' },
    ],
    focusAreas: ['Practical Coding', 'API Design', 'Code Quality & Testing', 'Financial Systems'],
    tips: [
      'Stripe values code that works and is well-tested over clever shortcuts.',
      'Practice building small, working programs rather than just algorithm puzzles.',
      'Understand REST API design, idempotency, and error handling.',
      'Think about edge cases in payment flows: retries, failures, partial charges.',
    ],
    commonTopics: ['API Design', 'String Parsing', 'State Machines', 'Idempotency', 'Webhook Systems'],
  },
];

export function getCompanyGuide(companyId: string): CompanyGuide | undefined {
  return COMPANY_GUIDES.find((g) => g.id === companyId);
}
