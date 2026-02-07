export interface SystemDesignTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Medium' | 'Hard';
  expectedComponents: string[];
  discussionPoints: string[];
}

export const SYSTEM_DESIGN_TOPICS: SystemDesignTopic[] = [
  {
    id: 'demo-simple-api',
    title: '🎯 Demo: Simple REST API',
    description: 'A quick 2-minute demo showing how Alexis builds architecture diagrams in real-time as you discuss the design. Perfect for first-time users!',
    difficulty: 'Medium',
    expectedComponents: ['client', 'loadbalancer', 'service', 'cache', 'database'],
    discussionPoints: [
      'Basic client-server architecture',
      'Load balancer for distributing traffic',
      'Caching layer for performance',
      'Database for persistent storage',
      'RESTful API design patterns',
    ],
  },
  {
    id: 'image-hosting',
    title: 'Image Hosting Service',
    description: 'Design a simple image hosting service like Imgur where users can upload, store, and view images at scale with fast global delivery.',
    difficulty: 'Medium',
    expectedComponents: ['client', 'cdn', 'loadbalancer', 'service', 'cache', 'database', 'storage', 'worker'],
    discussionPoints: [
      'Upload flow vs. view/read flow separation',
      'CDN for serving images globally with low latency',
      'Thumbnail generation with background workers',
      'Caching image metadata and hot images',
      'Object storage (S3) vs. database for image blobs',
    ],
  },
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    description: 'Design a URL shortening service like TinyURL or bit.ly that generates short aliases for long URLs.',
    difficulty: 'Medium',
    expectedComponents: ['client', 'loadbalancer', 'service', 'cache', 'database'],
    discussionPoints: [
      'How to generate unique short URLs',
      'Read-heavy vs write-heavy traffic patterns',
      'Caching strategy for popular URLs',
      'Database schema and partitioning',
      'Analytics and click tracking',
    ],
  },
  {
    id: 'chat-application',
    title: 'Chat Application',
    description: 'Design a real-time chat application like WhatsApp or Slack supporting 1:1 and group messaging.',
    difficulty: 'Hard',
    expectedComponents: ['client', 'loadbalancer', 'service', 'queue', 'database', 'cache', 'storage'],
    discussionPoints: [
      'WebSocket vs long polling for real-time delivery',
      'Message ordering and delivery guarantees',
      'Group chat fan-out strategies',
      'Media storage and CDN delivery',
      'Online presence and read receipts',
    ],
  },
  {
    id: 'twitter-feed',
    title: 'Twitter / News Feed',
    description: 'Design a social media news feed system like Twitter that displays posts from followed users.',
    difficulty: 'Hard',
    expectedComponents: ['client', 'loadbalancer', 'service', 'queue', 'database', 'cache', 'cdn'],
    discussionPoints: [
      'Fan-out on write vs fan-out on read',
      'Feed ranking and personalization',
      'Celebrity/hot user problem',
      'Caching strategies for timeline',
      'Real-time updates and notifications',
    ],
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    description: 'Design a distributed rate limiting system that controls the rate of requests a client can send.',
    difficulty: 'Medium',
    expectedComponents: ['client', 'loadbalancer', 'service', 'cache'],
    discussionPoints: [
      'Token bucket vs sliding window algorithms',
      'Distributed rate limiting with Redis',
      'Race conditions in concurrent environments',
      'Rate limit headers and client communication',
      'Different limits per user tier',
    ],
  },
  {
    id: 'notification-system',
    title: 'Notification System',
    description: 'Design a notification system that sends push, SMS, and email notifications at scale.',
    difficulty: 'Medium',
    expectedComponents: ['client', 'loadbalancer', 'service', 'queue', 'worker', 'database', 'cache'],
    discussionPoints: [
      'Multiple delivery channels (push, SMS, email)',
      'Priority queues and rate limiting',
      'Template management and personalization',
      'Delivery tracking and retry logic',
      'User preference management',
    ],
  },
  {
    id: 'file-storage',
    title: 'Cloud File Storage',
    description: 'Design a cloud file storage service like Google Drive or Dropbox with sync across devices.',
    difficulty: 'Hard',
    expectedComponents: ['client', 'loadbalancer', 'service', 'storage', 'database', 'cache', 'queue', 'cdn'],
    discussionPoints: [
      'File chunking and deduplication',
      'Sync conflict resolution',
      'Metadata vs file content storage',
      'Resumable uploads for large files',
      'Sharing and permission management',
    ],
  },
  {
    id: 'web-crawler',
    title: 'Web Crawler',
    description: 'Design a web crawler that systematically browses the web to index content for a search engine.',
    difficulty: 'Medium',
    expectedComponents: ['service', 'queue', 'worker', 'database', 'storage', 'cache'],
    discussionPoints: [
      'URL frontier and politeness policies',
      'Distributed crawling with worker pools',
      'Deduplication of visited URLs',
      'Content parsing and storage',
      'Handling dynamic/JavaScript-rendered pages',
    ],
  },
  {
    id: 'video-streaming',
    title: 'Video Streaming Platform',
    description: 'Design a video streaming platform like YouTube or Netflix that serves video content at scale.',
    difficulty: 'Hard',
    expectedComponents: ['client', 'loadbalancer', 'service', 'storage', 'cdn', 'queue', 'worker', 'database', 'cache'],
    discussionPoints: [
      'Video encoding and adaptive bitrate streaming',
      'CDN placement and content distribution',
      'Upload pipeline and processing workflow',
      'Recommendation engine architecture',
      'Live streaming vs on-demand differences',
    ],
  },
  {
    id: 'search-autocomplete',
    title: 'Search Autocomplete',
    description: 'Design a real-time search autocomplete system like Google search suggestions.',
    difficulty: 'Medium',
    expectedComponents: ['client', 'loadbalancer', 'service', 'cache', 'database'],
    discussionPoints: [
      'Trie data structure for prefix matching',
      'Ranking suggestions by frequency/recency',
      'Caching hot queries at multiple levels',
      'Handling typos and fuzzy matching',
      'Data collection and aggregation pipeline',
    ],
  },
  {
    id: 'payment-system',
    title: 'Payment System',
    description: 'Design a payment processing system like Stripe that handles transactions reliably.',
    difficulty: 'Hard',
    expectedComponents: ['client', 'loadbalancer', 'service', 'database', 'queue', 'worker', 'cache'],
    discussionPoints: [
      'ACID transactions and idempotency',
      'Double-spend prevention',
      'Payment gateway integration',
      'Ledger and reconciliation',
      'Fraud detection and security',
    ],
  },
];

export function getSystemDesignTopic(topicId: string): SystemDesignTopic | undefined {
  return SYSTEM_DESIGN_TOPICS.find(t => t.id === topicId);
}
