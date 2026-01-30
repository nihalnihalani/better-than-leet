import { NextRequest, NextResponse } from 'next/server';
import { daytonaService } from '@/lib/daytona';

export async function POST(req: NextRequest) {
    try {
        const { workspaceId } = await req.json();

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'workspaceId is required' },
                { status: 400 }
            );
        }

        console.log(`🗑️ Deleting workspace: ${workspaceId}`);

        await daytonaService.cleanupWorkspace(workspaceId);

        console.log(`✅ Workspace ${workspaceId} deleted successfully`);

        return NextResponse.json({
            success: true,
            message: 'Workspace deleted successfully'
        });
    } catch (error) {
        console.error('❌ Failed to delete workspace:', error);

        return NextResponse.json(
            {
                error: 'Failed to delete workspace',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
