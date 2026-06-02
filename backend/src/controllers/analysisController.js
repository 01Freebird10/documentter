import * as analysisService from '../services/analysisService.js';
import ApiResponse from '../utils/apiResponse.js';

export const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await analysisService.getProjectAnalysis(req.params.projectId, req.user._id);
    return ApiResponse.success(res, 'Active project compilation status retrieved!', analysis, 200);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await analysisService.getAnalysisHistory(req.user._id);
    return ApiResponse.success(res, 'User compilation history retrieved successfully!', history, 200);
  } catch (error) {
    next(error);
  }
};
