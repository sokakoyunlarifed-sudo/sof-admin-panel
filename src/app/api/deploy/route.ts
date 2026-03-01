import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

// Simple cooldown to prevent abuse
let lastDeploy = 0;
const COOLDOWN = 30000; // 30 seconds

export async function POST(req: NextRequest) {
    const now = Date.now();
    if (now - lastDeploy < COOLDOWN) {
        return NextResponse.json({
            error: 'Cooldown',
            remaining: Math.ceil((COOLDOWN - (now - lastDeploy)) / 1000)
        }, { status: 429 });
    }

    try {
        // We trigger the fetchContent script in the production website directory
        const scriptPath = path.resolve(process.cwd(), '../sof-website-production/scripts/fetchContent.mjs');
        const cmd = `node ${scriptPath}`;

        // Run in background so we don't block the request
        exec(cmd, (error, stdout, stderr) => {
            if (error) console.error(`Deploy error: ${error.message}`);
            if (stderr) console.error(`Deploy stderr: ${stderr}`);
            console.log(`Deploy stdout: ${stdout}`);
        });

        lastDeploy = now;
        return NextResponse.json({ success: true, message: 'Deployment started' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
