import AppError from '../utils/appError.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError('Full name is required', 400));
  }

  if (!email || !email.trim()) {
    return next(new AppError('Email address is required', 400));
  }

  const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailReg.test(email)) {
    return next(new AppError('Please provide a valid email format', 400));
  }

  if (!password || password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return next(new AppError('Email address is required for logging in', 400));
  }

  if (!password) {
    return next(new AppError('Password is required for logging in', 400));
  }

  next();
};
