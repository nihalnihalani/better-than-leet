/**
 * Tests for Mermaid parser utilities
 */

import { describe, it, expect } from 'vitest';
import { extractMermaidBlocks, validateMermaidSyntax, countMermaidComponents } from '../mermaid-parser';

describe('Mermaid Parser', () => {
  describe('extractMermaidBlocks', () => {
    it('should extract a single Mermaid block', () => {
      const text = `
Here's the architecture:

\`\`\`mermaid
graph LR
    Client[Web Client] --> API[API Server]
\`\`\`

Does this make sense?
      `;

      const blocks = extractMermaidBlocks(text);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toContain('graph LR');
      expect(blocks[0]).toContain('Client[Web Client]');
    });

    it('should extract multiple Mermaid blocks', () => {
      const text = `
First diagram:
\`\`\`mermaid
graph LR
    A --> B
\`\`\`

Updated diagram:
\`\`\`mermaid
graph LR
    A --> B
    B --> C
\`\`\`
      `;

      const blocks = extractMermaidBlocks(text);
      expect(blocks).toHaveLength(2);
    });

    it('should return empty array when no Mermaid blocks found', () => {
      const text = 'Just regular text without any diagrams';
      const blocks = extractMermaidBlocks(text);
      expect(blocks).toHaveLength(0);
    });

    it('should handle agent speech with Mermaid', () => {
      const agentMessage = `Okay, let's start designing the system. I'll show you the basic architecture.

\`\`\`mermaid
graph LR
    Client[Web Client] -->|HTTPS| LB{Load Balancer}
    LB --> API[API Server]
    API --> DB[(PostgreSQL)]
\`\`\`

So we have a client making requests through a load balancer to our API server, which connects to the database.`;

      const blocks = extractMermaidBlocks(agentMessage);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toContain('Load Balancer');
      expect(blocks[0]).toContain('PostgreSQL');
    });
  });

  describe('validateMermaidSyntax', () => {
    it('should validate correct graph syntax', () => {
      const diagram = `graph LR
    A[Node A] --> B[Node B]`;

      const result = validateMermaidSyntax(diagram);
      expect(result.valid).toBe(true);
    });

    it('should reject empty diagram', () => {
      const result = validateMermaidSyntax('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Empty');
    });

    it('should reject invalid diagram type', () => {
      const diagram = 'invalid syntax here';
      const result = validateMermaidSyntax(diagram);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid diagram type');
    });

    it('should reject diagram with no content', () => {
      const diagram = 'graph LR';
      const result = validateMermaidSyntax(diagram);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no nodes or connections');
    });
  });

  describe('countMermaidComponents', () => {
    it('should count nodes and edges correctly', () => {
      const diagram = `graph LR
    Client[Web Client] --> API[API Server]
    API --> DB[(PostgreSQL)]
    API --> Cache{{Redis}}`;

      const counts = countMermaidComponents(diagram);
      expect(counts.nodes).toBeGreaterThan(0);
      expect(counts.edges).toBe(3);
    });

    it('should return zeros for empty diagram', () => {
      const counts = countMermaidComponents('');
      expect(counts.nodes).toBe(0);
      expect(counts.edges).toBe(0);
    });

    it('should handle complex diagrams', () => {
      const diagram = `graph LR
    Client[Web Client] -->|HTTPS| LB{Load Balancer}
    LB --> API1[API Server 1]
    LB --> API2[API Server 2]
    API1 --> Cache{{Redis}}
    API2 --> Cache
    API1 --> DB[(PostgreSQL)]
    API2 --> DB`;

      const counts = countMermaidComponents(diagram);
      expect(counts.nodes).toBeGreaterThan(4);
      expect(counts.edges).toBeGreaterThan(5);
    });
  });
});
