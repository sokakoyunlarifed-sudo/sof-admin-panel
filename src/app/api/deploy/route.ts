import { NextRequest, NextResponse } from 'next/server';
import { triggerSync } from '@/lib/utils/deploy';

// Simple cooldown to prevent abuse
let lastDeploy = 0;
const COOLDOWN = 10000; // 10 seconds

export async function POST(req: NextRequest) {
    const now = Date.now();
    if (now - lastDeploy < COOLDOWN) {
        return NextResponse.json({
            error: 'Cooldown',
            remaining: Math.ceil((COOLDOWN - (now - lastDeploy)) / 1000)
        }, { status: 429 });
    }

    try {
        await triggerSync();
        lastDeploy = now;
        return NextResponse.json({ success: true, message: 'Deployment started' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
