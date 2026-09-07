import jwt from 'jsonwebtoken';
import { findUserById } from '../utils/authStorage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 * Adds user info to req.user
 */
export function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user to ensure they still exist and get latest role
    const user = findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request (include hasAdminAccess from token or user object)
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      hasAdminAccess: decoded.hasAdminAccess !== undefined ? decoded.hasAdminAccess : (user.hasAdminAccess || false),
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to check if user is admin
 * Must be used after authMiddleware
 */
export function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }

  next();
}

/**
 * Middleware to check if user is admin or owner of resource
 * Must be used after authMiddleware
 * Expects resource to have createdBy field with userId
 */
export function adminOrOwner(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin can access anything
  if (req.user.role === 'admin') {
    return next();
  }

  // For non-admin users, check if they own the resource
  // This will be checked in the controller after fetching the resource
  next();
}

