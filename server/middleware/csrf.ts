/**
 * CSRF Protection Middleware
 * 
 * This module provides CSRF protection for non-API routes
 * to prevent cross-site request forgery attacks.
 */

import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

// Create CSRF protection middleware
const csrfProtection = csrf({ 
  cookie: {
    key: '_csrf',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

/**
 * Apply CSRF protection to routes
 * Skips API routes and OPTIONS requests
 */
export const applyCsrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for API routes and OPTIONS requests
  if (req.path.startsWith('/api/') || req.method === 'OPTIONS') {
    next();
  } else {
    csrfProtection(req, res, next);
  }
};

/**
 * Setup middleware required for CSRF protection
 * @param app Express application
 */
export const setupCsrfProtection = (app: any) => {
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Apply CSRF protection
  app.use(applyCsrfProtection);
  
  // Add CSRF token to all rendered views
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.csrfToken) {
      res.locals.csrfToken = req.csrfToken();
    }
    next();
  });
};
