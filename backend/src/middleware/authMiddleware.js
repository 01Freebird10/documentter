import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Read header token bearer credentials
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access denied. Authentication token not supplied in headers.', 401));
  }

  try {
    // Verify accessToken signature
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'sk_repomind_access_secret_signature_code_2026');

    // Fetch matching user from database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user associated with this credentials token no longer exists.', 401));
    }

    // Attach active user session key to request object
    req.user = currentUser;
    next();
  } catch (error) {
    return next(error); // Express centralized handler will parse JWT errors automatically
  }
};

// Admin route restricts
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // If we want plans role verification (e.g. restrict to team plans)
    if (req.user && req.user.plan === 'free') {
      return next(new AppError('Access denied. This service requires a Pro or Team workspace plan.', 403));
    }
    next();
  };
};
