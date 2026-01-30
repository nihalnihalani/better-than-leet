/**
 * Zod Schema Definitions
 *
 * Centralized validation schemas for all API requests and data structures.
 * Provides both runtime validation and TypeScript type inference.
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

export const VALID_LANGUAGES = ['python', 'typescript', 'javascript'] as const;
export const VALID_MANAGERS = ['pip', 'npm'] as const;
export const MAX_CODE_SIZE = 100 * 1024; // 100KB
export const MAX_TTS_LENGTH = 5000;
export const MIN_TIMEOUT = 1000;
export const MAX_TIMEOUT = 300000;

// ============================================================================
// Base Schemas
// ============================================================================

export const LanguageSchema = z.enum(VALID_LANGUAGES);

export const ManagerSchema = z.enum(VALID_MANAGERS);

export const WorkspaceIdSchema = z.string()
    .min(1, 'Workspace ID is required')
    .max(255, 'Workspace ID too long');

export const CodeSchema = z.string()
    .min(1, 'Code cannot be empty')
    .refine(
        (code) => new TextEncoder().encode(code).length <= MAX_CODE_SIZE,
        `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024}KB`
    );

export const PathSchema = z.string()
    .min(1, 'Path cannot be empty')
    .refine(
        (path) => !path.includes('..'),
        'Path cannot contain directory traversal sequences'
    )
    .refine(
        (path) => !path.includes('\0'),
        'Path cannot contain null bytes'
    )
    .refine(
        (path) => /^[a-zA-Z0-9_\-./]+$/.test(path),
        'Path contains invalid characters'
    );

export const PackageNameSchema = z.string()
    .min(1, 'Package name is required')
    .max(100, 'Package name too long')
    .regex(
        /^[a-zA-Z0-9@/_\-.]+$/,
        'Package name contains invalid characters'
    );

export const TimeoutSchema = z.number()
    .min(MIN_TIMEOUT, `Timeout must be at least ${MIN_TIMEOUT}ms`)
    .max(MAX_TIMEOUT, `Timeout cannot exceed ${MAX_TIMEOUT}ms`);

export const TTSTextSchema = z.string()
    .min(1, 'Text cannot be empty')
    .max(MAX_TTS_LENGTH, `Text exceeds maximum length of ${MAX_TTS_LENGTH} characters`);

export const LabelsSchema = z.record(z.string(), z.string().max(255, 'Label value too long'));

export const WorkspaceNameSchema = z.string()
    .regex(
        /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]?$/,
        'Workspace name must be DNS-compatible (lowercase alphanumeric and hyphens)'
    );

// ============================================================================
// API Request Schemas
// ============================================================================

export const ExecuteCodeRequestSchema = z.object({
    workspaceId: WorkspaceIdSchema,
    code: CodeSchema,
    language: LanguageSchema.optional().default('python'),
    timeout: TimeoutSchema.optional(),
    useFile: z.boolean().optional(),
});

export const AutoFixRequestSchema = z.object({
    code: CodeSchema,
    error: z.string().min(1, 'Error message is required'),
    language: LanguageSchema.optional().default('python'),
    workspaceId: WorkspaceIdSchema.optional(),
});

export const AnalysisReviewRequestSchema = z.object({
    code: CodeSchema,
    language: LanguageSchema.optional().default('python'),
});

export const CodeRabbitRequestSchema = z.object({
    code: CodeSchema,
    language: LanguageSchema.optional().default('python'),
    workspaceId: WorkspaceIdSchema.optional(),
});

export const InstallPackageRequestSchema = z.object({
    workspaceId: WorkspaceIdSchema,
    packageName: PackageNameSchema,
    manager: ManagerSchema,
});

export const CreateWorkspaceRequestSchema = z.object({
    language: LanguageSchema,
    networkAllowList: z.string().optional(),
    autoStopInterval: z.number().positive().optional(),
    autoArchiveInterval: z.number().positive().optional(),
    labels: LabelsSchema.optional(),
    envVars: z.record(z.string(), z.string()).optional(),
    installCodeRabbit: z.boolean().optional(),
    timeout: TimeoutSchema.optional(),
});

export const ReadFileRequestSchema = z.object({
    workspaceId: WorkspaceIdSchema,
    path: PathSchema,
});

export const SaveFileRequestSchema = z.object({
    workspaceId: WorkspaceIdSchema,
    path: PathSchema,
    content: z.string(),
});

export const TestCodeRequestSchema = z.object({
    workspaceId: WorkspaceIdSchema,
    testCode: z.string().min(1, 'Test code is required'),
    language: LanguageSchema.optional().default('python'),
    timeout: TimeoutSchema.optional(),
});

export const TTSRequestSchema = z.object({
    text: TTSTextSchema,
    voiceId: z.string().optional(),
});

export const ListFilesQuerySchema = z.object({
    workspaceId: WorkspaceIdSchema,
    path: PathSchema.optional().default('.'),
});

export const FileOperationRequestSchema = z.object({
    workspaceId: WorkspaceIdSchema,
    path: PathSchema,
    operation: z.enum(['createDirectory', 'delete']).optional().default('createDirectory'),
    mode: z.string().regex(/^[0-7]{3}$/, 'Mode must be 3 octal digits').optional().default('755'),
    recursive: z.boolean().optional().default(false),
});

// ============================================================================
// Response Schemas (for validation of external API responses)
// ============================================================================

export const MiniMaxAnalysisResponseSchema = z.object({
    score: z.number().min(0).max(10),
    security_score: z.number().min(0).max(10),
    complexity: z.string(),
    issues: z.array(z.string()),
    security_issues: z.array(z.string()),
    reasoning_trace: z.string(),
});

export const AutoFixResponseSchema = z.object({
    fixedCode: z.string(),
    dependencies: z.array(z.string()),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type Language = z.infer<typeof LanguageSchema>;
export type Manager = z.infer<typeof ManagerSchema>;
export type ExecuteCodeRequest = z.infer<typeof ExecuteCodeRequestSchema>;
export type AutoFixRequest = z.infer<typeof AutoFixRequestSchema>;
export type AnalysisReviewRequest = z.infer<typeof AnalysisReviewRequestSchema>;
export type CodeRabbitRequest = z.infer<typeof CodeRabbitRequestSchema>;
export type InstallPackageRequest = z.infer<typeof InstallPackageRequestSchema>;
export type CreateWorkspaceRequest = z.infer<typeof CreateWorkspaceRequestSchema>;
export type ReadFileRequest = z.infer<typeof ReadFileRequestSchema>;
export type SaveFileRequest = z.infer<typeof SaveFileRequestSchema>;
export type TestCodeRequest = z.infer<typeof TestCodeRequestSchema>;
export type TTSRequest = z.infer<typeof TTSRequestSchema>;
export type ListFilesQuery = z.infer<typeof ListFilesQuerySchema>;
export type FileOperationRequest = z.infer<typeof FileOperationRequestSchema>;
export type MiniMaxAnalysisResponse = z.infer<typeof MiniMaxAnalysisResponseSchema>;
export type AutoFixResponse = z.infer<typeof AutoFixResponseSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: Array<{ path: string; message: string }>;
}

/**
 * Validate request data against a schema
 * Returns a strongly-typed result with detailed error messages
 */
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.') || 'root',
        message: issue.message
    }));

    const errorMessage = errors
        .map((e) => e.path !== 'root' ? `${e.path}: ${e.message}` : e.message)
        .join(', ');

    return {
        success: false,
        error: errorMessage,
        errors
    };
}

/**
 * Validate and return data or throw an error
 * Useful for server-side validation where you want to fail fast
 */
export function parseRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Create a validation middleware function for API routes
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
    return (data: unknown): ValidationResult<T> => validateRequest(schema, data);
}
