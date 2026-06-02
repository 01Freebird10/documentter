import * as authService from '../services/authService.js';
import ApiResponse from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    
    return ApiResponse.success(res, 'User registered successfully!', result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    
    return ApiResponse.success(res, 'User authenticated successfully!', result, 200);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshSessionToken(refreshToken);
    
    return ApiResponse.success(res, 'Session token refreshed successfully!', result, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUserSession(refreshToken);
    
    return ApiResponse.success(res, 'User session terminated successfully!', null, 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user has already been populated by protect middleware
    const userProfile = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      plan: req.user.plan,
      createdAt: req.user.createdAt
    };
    
    return ApiResponse.success(res, 'Current user profile fetched successfully!', userProfile, 200);
  } catch (error) {
    next(error);
  }
};
