/**
 * Code History Management for Undo/Redo
 *
 * Implements a snapshot-based history system that allows users to
 * undo and redo code changes, especially useful for auto-fix operations.
 */

export interface CodeSnapshot {
    code: string;
    timestamp: number;
    source: 'user' | 'autofix' | 'initial';
    metadata?: {
        fixReason?: string;
        dependencies?: string[];
        error?: string;
    };
}

export interface CodeHistoryState {
    history: CodeSnapshot[];
    currentIndex: number;
    maxHistory: number;
}

export class CodeHistory {
    private state: CodeHistoryState = {
        history: [],
        currentIndex: -1,
        maxHistory: 50, // Keep last 50 snapshots
    };

    /**
     * Push a new code snapshot to history
     * If we're not at the end, truncates future history
     */
    push(snapshot: Omit<CodeSnapshot, 'timestamp'>): void {
        const fullSnapshot: CodeSnapshot = {
            ...snapshot,
            timestamp: Date.now(),
        };

        // Skip if code is identical to current
        const current = this.getCurrent();
        if (current && current.code === fullSnapshot.code) {
            return;
        }

        // If we're not at the end, truncate future history
        if (this.state.currentIndex < this.state.history.length - 1) {
            this.state.history = this.state.history.slice(0, this.state.currentIndex + 1);
        }

        this.state.history.push(fullSnapshot);
        this.state.currentIndex = this.state.history.length - 1;

        // Trim old history if needed
        if (this.state.history.length > this.state.maxHistory) {
            this.state.history.shift();
            this.state.currentIndex--;
        }
    }

    /**
     * Check if undo is available
     */
    canUndo(): boolean {
        return this.state.currentIndex > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo(): boolean {
        return this.state.currentIndex < this.state.history.length - 1;
    }

    /**
     * Undo to previous snapshot
     * Returns the previous code state or null if can't undo
     */
    undo(): CodeSnapshot | null {
        if (!this.canUndo()) return null;
        this.state.currentIndex--;
        return this.state.history[this.state.currentIndex];
    }

    /**
     * Redo to next snapshot
     * Returns the next code state or null if can't redo
     */
    redo(): CodeSnapshot | null {
        if (!this.canRedo()) return null;
        this.state.currentIndex++;
        return this.state.history[this.state.currentIndex];
    }

    /**
     * Get current snapshot
     */
    getCurrent(): CodeSnapshot | null {
        if (this.state.currentIndex < 0 || this.state.currentIndex >= this.state.history.length) {
            return null;
        }
        return this.state.history[this.state.currentIndex];
    }

    /**
     * Get the previous snapshot (for diff display)
     */
    getPrevious(): CodeSnapshot | null {
        if (this.state.currentIndex <= 0) {
            return null;
        }
        return this.state.history[this.state.currentIndex - 1];
    }

    /**
     * Get all history (readonly)
     */
    getHistory(): readonly CodeSnapshot[] {
        return this.state.history;
    }

    /**
     * Get current history length
     */
    getLength(): number {
        return this.state.history.length;
    }

    /**
     * Get current position in history
     */
    getCurrentIndex(): number {
        return this.state.currentIndex;
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.state.history = [];
        this.state.currentIndex = -1;
    }

    /**
     * Initialize with code (doesn't add to history if already initialized)
     */
    initialize(code: string): void {
        if (this.state.history.length === 0) {
            this.push({ code, source: 'initial' });
        }
    }

    /**
     * Get statistics about history
     */
    getStats(): {
        totalSnapshots: number;
        autofixCount: number;
        userEditCount: number;
        canUndo: boolean;
        canRedo: boolean;
    } {
        const autofixCount = this.state.history.filter(s => s.source === 'autofix').length;
        const userEditCount = this.state.history.filter(s => s.source === 'user').length;

        return {
            totalSnapshots: this.state.history.length,
            autofixCount,
            userEditCount,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
        };
    }

    /**
     * Find the last autofix snapshot (for "undo last autofix" feature)
     */
    findLastAutofix(): { snapshot: CodeSnapshot; index: number } | null {
        for (let i = this.state.currentIndex; i >= 0; i--) {
            if (this.state.history[i].source === 'autofix') {
                return { snapshot: this.state.history[i], index: i };
            }
        }
        return null;
    }

    /**
     * Undo back to before the last autofix
     * Returns the code state before the autofix, or null if no autofix found
     */
    undoLastAutofix(): CodeSnapshot | null {
        const lastAutofix = this.findLastAutofix();
        if (!lastAutofix || lastAutofix.index === 0) {
            return null;
        }

        // Go back to the snapshot before the autofix
        this.state.currentIndex = lastAutofix.index - 1;
        return this.state.history[this.state.currentIndex];
    }
}

// Singleton instance for global use
export const codeHistory = new CodeHistory();

// ============================================================================
// Integration helpers for store.ts
// ============================================================================

export interface CodeHistoryActions {
    pushCodeSnapshot: (code: string, source: 'user' | 'autofix' | 'initial', metadata?: CodeSnapshot['metadata']) => void;
    undoCode: () => string | null;
    redoCode: () => string | null;
    undoLastAutofix: () => string | null;
    canUndo: () => boolean;
    canRedo: () => boolean;
    initializeHistory: (code: string) => void;
}

/**
 * Create history actions bound to a specific CodeHistory instance
 * Useful for testing or multiple history instances
 */
export function createHistoryActions(history: CodeHistory = codeHistory): CodeHistoryActions {
    return {
        pushCodeSnapshot: (code, source, metadata) => {
            history.push({ code, source, metadata });
        },
        undoCode: () => {
            const snapshot = history.undo();
            return snapshot?.code ?? null;
        },
        redoCode: () => {
            const snapshot = history.redo();
            return snapshot?.code ?? null;
        },
        undoLastAutofix: () => {
            const snapshot = history.undoLastAutofix();
            return snapshot?.code ?? null;
        },
        canUndo: () => history.canUndo(),
        canRedo: () => history.canRedo(),
        initializeHistory: (code) => history.initialize(code),
    };
}
