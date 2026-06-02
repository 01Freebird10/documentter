import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || 'sk_repomind_access_secret_signature_code_2026';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'sk_repomind_refresh_secret_signature_code_2026';

// Signs an access token (expires in 15 minutes)
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, plan: user.plan },
    getAccessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

// Signs a refresh token (expires in 7 days)
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    getRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

export const registerUser = async ({ name, email, password }) => {
  // DB index check (handles duplicate checks explicitly, but pre-save/mongoose indexes also do)
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email address is already registered. Please login.', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    plan: 'free'
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Cache refresh token
  user.refreshTokens.push(refreshToken);
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email, plan: user.plan },
    accessToken,
    refreshToken
  };
};

export const loginUser = async ({ email, password }) => {
  // Query user and select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password credentials.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password credentials.', 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Cache refresh token
  user.refreshTokens.push(refreshToken);
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email, plan: user.plan },
    accessToken,
    refreshToken
  };
};

export const refreshSessionToken = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw new AppError('Refresh token credentials are required.', 400);
  }

  try {
    // Decode old refresh token
    const decoded = jwt.verify(oldRefreshToken, getRefreshSecret());

    // Fetch user
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(oldRefreshToken)) {
      throw new AppError('Refresh session not found. Please re-authenticate.', 401);
    }

    // Sign new access and refresh pair (token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Swap tokens in DB cache
    user.refreshTokens = user.refreshTokens.filter(t => t !== oldRefreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new AppError('Session validation failed. Please login again.', 401);
  }
};

export const logoutUserSession = async (activeRefreshToken) => {
  if (!activeRefreshToken) return;

  try {
    const decoded = jwt.verify(activeRefreshToken, getRefreshSecret());
    const user = await User.findById(decoded.id);
    if (user) {
      // Purge token from DB cache
      user.refreshTokens = user.refreshTokens.filter(t => t !== activeRefreshToken);
      await user.save();
    }
  } catch (error) {
    // Fail silently on logouts
  }
};
