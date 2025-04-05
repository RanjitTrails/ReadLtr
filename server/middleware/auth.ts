/**
 * Authentication Middleware
 * 
 * This module provides JWT validation and authentication middleware
 * for securing API endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set. Using default secret. This is insecure for production!');
}

interface JwtPayload {
  id: string;
  type?: string;
  exp?: number;
  iat?: number;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Check token type and expiration
    if (decoded.type === 'api_key') {
      // API keys have longer expiration but stricter rate limits
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ error: "API key expired" });
      }
    }
    
    // Add user ID to request body
    req.body.userId = decoded.id;
    next();
  } catch (err) {
    if ((err as Error).name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

/**
 * Middleware to authenticate admin users
 * Requires authenticateToken to be called first
 */
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user has admin role
  // This would typically check against a database
  const userId = req.body.userId;
  
  // For now, we'll just use a hardcoded list of admin IDs
  const adminIds = process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(',') : [];
  
  if (adminIds.includes(userId)) {
    next();
  } else {
    res.status(403).json({ error: "Admin access required" });
  }
};
