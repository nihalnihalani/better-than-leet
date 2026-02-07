import { NextRequest, NextResponse } from 'next/server';
import { daytonaService } from '@/lib/daytona';
// Note: No auth check on delete -- sendBeacon on page unload cannot set custom headers.
// Delete is low-risk since it requires a valid workspace ID.

export async function POST(req: NextRequest) {
    try {
        // Handle both JSON and sendBeacon (text/plain with JSON body) requests
        const contentType = req.headers.get('content-type') || '';
        let body: { workspaceId?: string };

        if (contentType.includes('application/json')) {
            body = await req.json();
        } else {
            // sendBeacon sends as text/plain or application/x-www-form-urlencoded
            const text = await req.text();
            try {
                body = JSON.parse(text);
            } catch {
                body = {};
            }
        }

        const { workspaceId } = body;

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
