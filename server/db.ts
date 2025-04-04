import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for WebSocket support
neonConfig.webSocketConstructor = ws;

// Validate database connection string
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with retry logic
let connectionAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

/**
 * Create a database connection pool with retry logic
 */
export const createPool = async (): Promise<Pool> => {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Test the connection
    await pool.query('SELECT 1');
    console.log('Database connection established successfully');
    return pool;
  } catch (error: any) {
    connectionAttempts++;
    console.error(`Database connection attempt ${connectionAttempts} failed: ${error.message}`);

    if (connectionAttempts >= MAX_RETRIES) {
      console.error('Maximum connection retry attempts reached. Giving up.');
      throw new Error(`Failed to connect to database after ${MAX_RETRIES} attempts: ${error.message}`);
    }

    console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return createPool();
  }
};

// Initialize pool and Drizzle ORM
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Handle unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // In a production environment, you might want to implement reconnection logic here
});
