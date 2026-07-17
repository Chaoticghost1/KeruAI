import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isNeon = /neon\.tech/i.test(process.env.DATABASE_URL);

// Local/non-Neon Postgres connects over plain TCP using the `pg` driver.
// Neon endpoints require the @neondatabase/serverless WebSocket driver.
let pool: Pool;
if (isNeon) {
  const { neonConfig } = await import("@neondatabase/serverless");
  const ws = (await import("ws")).default;
  const { Pool: NeonPool } = await import("@neondatabase/serverless");
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    allowExitOnIdle: false,
    idleTimeoutMillis: 30000,
  });
}

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

pool.on("connect", () => {
  console.log("Database connection established");
});

export const db = drizzle({ client: pool, schema });
