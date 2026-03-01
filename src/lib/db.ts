import { Client, Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgres://homserver:P0stGre5_h0m3s3rv3r_2025!@127.0.0.1:5432/homesofdb';

// Export a function that returns a new connected client
export async function getClient() {
    const client = new Client({ connectionString });
    await client.connect();
    return client;
}

export const pool = new Pool({
    connectionString
});

