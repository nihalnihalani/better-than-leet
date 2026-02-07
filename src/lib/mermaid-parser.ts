/**
 * Utilities for extracting and validating Mermaid diagram syntax from text
 */

/**
 * Extracts all Mermaid code blocks from text
 * @param text - Raw text containing potential Mermaid blocks
 * @returns Array of Mermaid diagram strings
 */
export function extractMermaidBlocks(text: string): string[] {
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  const blocks: string[] = [];
  let match;

  while ((match = mermaidRegex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

/**
 * Gets the most recent Mermaid diagram from a transcript
 * @param transcript - Array of transcript messages
 * @returns Latest diagram or null if none found
 */
export function getLatestDiagram(
  transcript: Array<{ role: string; content: string }>
): string | null {
  // Iterate backwards to find most recent diagram
  for (let i = transcript.length - 1; i >= 0; i--) {
    const message = transcript[i];
    if (message.role === 'agent') {
      const blocks = extractMermaidBlocks(message.content);
      if (blocks.length > 0) {
        return blocks[blocks.length - 1];
      }
    }
  }
  return null;
}

/**
 * Validates Mermaid syntax (basic validation)
 * @param diagram - Mermaid diagram string
 * @returns Validation result with error message if invalid
 */
export function validateMermaidSyntax(diagram: string): {
  valid: boolean;
  error?: string;
} {
  if (!diagram || diagram.trim().length === 0) {
    return { valid: false, error: 'Empty diagram' };
  }

  // Check for valid diagram type
  const validTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram'];
  const hasValidType = validTypes.some(type => diagram.trim().startsWith(type));

  if (!hasValidType) {
    return { valid: false, error: 'Invalid diagram type. Expected: graph, flowchart, etc.' };
  }

  // Check for basic structure (at least one node or connection)
  const hasContent = diagram.includes('[') || diagram.includes('-->') || diagram.includes('---');
  if (!hasContent) {
    return { valid: false, error: 'Diagram has no nodes or connections' };
  }

  return { valid: true };
}

/**
 * Counts components in a Mermaid diagram
 * @param diagram - Mermaid diagram string
 * @returns Object with component counts
 */
export function countMermaidComponents(diagram: string): {
  nodes: number;
  edges: number;
} {
  if (!diagram) return { nodes: 0, edges: 0 };

  // Count nodes (various bracket types)
  const nodePatterns = [
    /\w+\[.*?\]/g,      // Standard nodes [text]
    /\w+\(.*?\)/g,      // Round nodes (text)
    /\w+\{.*?\}/g,      // Diamond nodes {text}
    /\w+\[\[.*?\]\]/g,  // Subroutine nodes [[text]]
    /\w+\[\(.*?\)\]/g,  // Cylindrical nodes [(text)]
    /\w+>\[.*?\]>/g,    // Asymmetric nodes >[text]>
    /\w+\{\{.*?\}\}/g,  // Hexagon nodes {{text}}
  ];

  const nodeMatches = new Set<string>();
  nodePatterns.forEach(pattern => {
    const matches = diagram.match(pattern);
    if (matches) {
      matches.forEach(m => nodeMatches.add(m));
    }
  });

  // Count edges (arrows and connections)
  const edgePatterns = [
    /-->/g,   // Arrow
    /---/g,   // Line
    /-\.->/g, // Dotted arrow
    /-\.-/g,  // Dotted line
    /==>/g,   // Thick arrow
    /===/g,   // Thick line
  ];

  let edgeCount = 0;
  edgePatterns.forEach(pattern => {
    const matches = diagram.match(pattern);
    if (matches) {
      edgeCount += matches.length;
    }
  });

  return {
    nodes: nodeMatches.size,
    edges: edgeCount,
  };
}
