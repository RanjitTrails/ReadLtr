import { Request, Response } from 'express';
import { db } from './db';
import { supabase } from './supabase';
import { sql } from 'drizzle-orm';

/**
 * Health check endpoint to verify database connectivity
 * Tests both Supabase and direct PostgreSQL connections
 */
export async function healthCheck(req: Request, res: Response) {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: { status: 'unknown' },
      database: { status: 'unknown' }
    }
  };

  try {
    // Test Supabase connection
    const { data: supabaseData, error: supabaseError } = await supabase.from('profiles').select('count(*)').limit(1);
    
    if (supabaseError) {
      healthStatus.services.supabase = { 
        status: 'error', 
        message: supabaseError.message 
      };
      healthStatus.status = 'degraded';
    } else {
      healthStatus.services.supabase = { 
        status: 'ok', 
        message: 'Connection successful' 
      };
    }
  } catch (error: any) {
    healthStatus.services.supabase = { 
      status: 'error', 
      message: error.message || 'Unknown error' 
    };
    healthStatus.status = 'degraded';
  }

  try {
    // Test direct database connection
    const result = await db.execute(sql`SELECT 1 as health_check`);
    
    if (result && result.length > 0) {
      healthStatus.services.database = { 
        status: 'ok', 
        message: 'Connection successful' 
      };
    } else {
      healthStatus.services.database = { 
        status: 'error', 
        message: 'No result returned' 
      };
      healthStatus.status = 'degraded';
    }
  } catch (error: any) {
    healthStatus.services.database = { 
      status: 'error', 
      message: error.message || 'Unknown error' 
    };
    healthStatus.status = 'degraded';
  }

  // If any service is down, return 503 Service Unavailable
  if (healthStatus.status !== 'ok') {
    return res.status(503).json(healthStatus);
  }

  return res.status(200).json(healthStatus);
}
