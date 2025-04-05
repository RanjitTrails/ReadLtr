/**
 * Rate Limiting Middleware
 * 
 * This module provides rate limiting functionality to protect API endpoints
 * from abuse and ensure fair usage.
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create different rate limiters for different types of endpoints
const apiLimiter = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 60 * 15, // Per 15 minutes
});

const authLimiter = new RateLimiterMemory({
  points: 10, // Number of points
  duration: 60 * 15, // Per 15 minutes
});

const parserLimiter = new RateLimiterMemory({
  points: 30, // Number of points
  duration: 60 * 15, // Per 15 minutes
});

/**
 * Generic rate limiting middleware factory
 * @param limiter The rate limiter to use
 * @returns Express middleware function
 */
const createRateLimitMiddleware = (limiter: RateLimiterMemory) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use IP as key, or user ID if authenticated
      const userId = req.body?.userId || 'anonymous';
      const key = `${req.ip}-${userId}`;
      
      await limiter.consume(key);
      next();
    } catch (error) {
      res.status(429).json({
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((error as any).msBeforeNext / 1000) || 60
      });
    }
  };
};

// Export middleware for different endpoint types
export const apiRateLimit = createRateLimitMiddleware(apiLimiter);
export const authRateLimit = createRateLimitMiddleware(authLimiter);
export const parserRateLimit = createRateLimitMiddleware(parserLimiter);
