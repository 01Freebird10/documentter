import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Resolve plan tier from request headers to make rate limiting efficient and zero-latency
const getPlanFromRequest = async (req) => {
  if (req.user) {
    return req.user.plan;
  }

  // If protect middleware has not run yet, extract token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'sk_repomind_access_secret_signature_code_2026');
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user; // Attach to avoid double queries
        return user.plan;
      }
    } catch {
      // Ignore token failure and treat as guest
    }
  }
  
  return 'guest';
};

// Dynamic rate limiter config
export const dynamicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    const plan = await getPlanFromRequest(req);
    switch (plan) {
      case 'enterprise':
        return 10000; // 10,000 requests per 15 mins for Enterprise
      case 'team':
        return 5000;  // 5,000 requests per 15 mins for Team
      case 'pro':
        return 2000;  // 2,000 requests per 15 mins for Pro
      case 'free':
        return 200;   // 200 requests per 15 mins for Free users
      case 'guest':
      default:
        return 30;    // 30 requests per 15 mins for Guests
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Separate limits by user ID if authenticated, else by IP
    return req.user ? req.user._id.toString() : req.ip;
  },
  message: {
    success: false,
    message: 'Too many requests. You have exceeded your tier rate limits. Upgrade to Pro/Team for higher concurrency.',
    data: null
  }
});

// Burst protection rate limiter specifically for heavy upload or analyze triggers
export const burstLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: async (req) => {
    const plan = await getPlanFromRequest(req);
    switch (plan) {
      case 'enterprise': return 60; // 1 call/sec
      case 'team': return 30;
      case 'pro': return 15;
      case 'free': return 3; // Max 3 heavy files upload/trigger per minute
      case 'guest':
      default:
        return 1; // Max 1 per minute
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Heavy operation burst limit reached. Please wait 60 seconds between scanner/generation triggers.',
    data: null
  }
});

export default dynamicRateLimiter;
