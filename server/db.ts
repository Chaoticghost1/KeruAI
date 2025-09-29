import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with better error handling and connection management
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections in the pool
  maxUses: Infinity, // No limit on connection reuse
  allowExitOnIdle: false, // Don't allow exit when pool is idle
  idleTimeoutMillis: 30000 // Close idle connections after 30 seconds
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

pool.on('connect', () => {
  console.log('Database connection established');
});

export const db = drizzle({ client: pool, schema });