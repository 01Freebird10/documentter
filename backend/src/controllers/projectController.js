import * as projectService from '../services/projectService.js';
import ApiResponse from '../utils/apiResponse.js';
import AppError from '../utils/appError.js';

export const uploadProjectFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No project zip archive file was uploaded.', 400));
    }

    const projectName = req.body.projectName || req.file.originalname.replace('.zip', '');
    const project = await projectService.createZipProject(req.user._id, req.file, projectName);

    return ApiResponse.success(res, 'Project ZIP uploaded and initialized successfully!', project, 201);
  } catch (error) {
    next(error);
  }
};

export const analyzeGithubProject = async (req, res, next) => {
  try {
    const { githubUrl, projectName } = req.body;
    const project = await projectService.createGithubProject(req.user._id, { githubUrl, projectName });

    return ApiResponse.success(res, 'GitHub repository linked and initialized successfully!', project, 201);
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjectsByUser(req.user._id);
    return ApiResponse.success(res, 'User workspaces retrieved successfully!', projects, 200);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectDetails(req.params.id, req.user._id);
    return ApiResponse.success(res, 'Project blueprint specifications retrieved successfully!', project, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProjectData(req.params.id, req.user._id);
    return ApiResponse.success(res, 'Project and associated artifacts deleted successfully!', result, 200);
  } catch (error) {
    next(error);
  }
};
