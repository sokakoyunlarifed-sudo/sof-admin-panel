import { exec } from 'child_process';
import path from 'path';

/**
 * Triggers the fetchContent script in the website project
 * to sync data from Supabase to staticData.js.
 */
export async function triggerSync() {
    try {
        // Resolve path to the fetchContent script in the website project
        const scriptPath = path.resolve(process.cwd(), '../sof-website-production/scripts/fetchContent.mjs');
        const cmd = `node ${scriptPath}`;
        
        console.log(`Triggering sync: ${cmd}`);
        
        // Run in background but log errors
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Sync Error]: ${error.message}`);
                return;
            }
            if (stderr) {
                console.warn(`[Sync Warning]: ${stderr}`);
            }
            console.log(`[Sync Success]: Content refreshed.`);
        });
        
        return true;
    } catch (err) {
        console.error('[Sync Failed to start]:', err);
        return false;
    }
}
