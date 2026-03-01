import { Client } from 'pg';

// Export a function that returns a new connected client
// Remember to await client.end() when done!
export async function getClient() {
    const connectionString = 'postgres://homserver:P0stGre5_h0m3s3rv3r_2025!@127.0.0.1:5432/homesofdb';
    const client = new Client({ connectionString });
    await client.connect();
    return client;
}

// Or an easier generic query helper using a single pool
import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: 'postgres://homserver:P0stGre5_h0m3s3rv3r_2025!@127.0.0.1:5432/homesofdb'
});
