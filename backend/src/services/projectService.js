import Project from '../models/Project.js';
import Analysis from '../models/Analysis.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import AppError from '../utils/appError.js';
import * as parserService from './parserService.js';
import * as cloneService from './cloneService.js';
import { runBackgroundAnalysis } from './analysisService.js';
import fs from 'fs';

export const createZipProject = async (userId, file, projectName) => {
  // 1. Unzip uploaded package to local extracted folder
  let extractedPath = '';
  try {
    extractedPath = await parserService.extractZipArchive(file.path);
  } catch (error) {
    throw new AppError(`Archive extraction failed: ${error.message}`, 400);
  }

  // 2. Create Project record
  const project = await Project.create({
    userId,
    projectName,
    sourceType: 'zip',
    zipFile: file.path,
    extractedPath,
    status: 'pending',
    techStack: ['Evaluating...']
  });

  // 3. Initialize Analysis record
  await Analysis.create({
    projectId: project._id,
    progress: 0,
    status: 'pending'
  });

  // 4. Trigger asynchronous static analysis engine in background (non-blocking)
  runBackgroundAnalysis(project._id, extractedPath, projectName).catch(err => {
    console.error(`[BACKGROUND JOB FAILED] Project: ${project._id}. Error: ${err.message}`);
  });

  return project;
};

export const createGithubProject = async (userId, { githubUrl, projectName }) => {
  // 1. Clone repository to temp workspace folder
  let clonedPath = '';
  try {
    const cloneResult = await cloneService.cloneGithubRepo(githubUrl);
    clonedPath = cloneResult.path;
  } catch (error) {
    throw new AppError(`Repository clone failed: ${error.message}`, 400);
  }

  // 2. Create Project record
  const project = await Project.create({
    userId,
    projectName,
    sourceType: 'github',
    githubUrl,
    extractedPath: clonedPath, // Workspace folder
    status: 'pending',
    techStack: ['Cloned. Analysing...']
  });

  // 3. Initialize Analysis record
  await Analysis.create({
    projectId: project._id,
    progress: 0,
    status: 'pending'
  });

  // 4. Trigger asynchronous static analysis engine in background (non-blocking)
  runBackgroundAnalysis(project._id, clonedPath, projectName).catch(err => {
    console.error(`[BACKGROUND JOB FAILED] Project: ${project._id}. Error: ${err.message}`);
  });

  return project;
};

export const getProjectsByUser = async (userId) => {
  return await Project.find({ userId }).sort({ createdAt: -1 });
};

export const getProjectDetails = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw new AppError('Requested project was not found.', 404);
  }
  return project;
};

export const deleteProjectData = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw new AppError('Requested project was not found.', 404);
  }

  // 1. Purge local ZIP file if it exists
  if (project.zipFile && fs.existsSync(project.zipFile)) {
    try {
      fs.unlinkSync(project.zipFile);
    } catch (e) {}
  }

  // 2. Purge extracted directories
  if (project.extractedPath && fs.existsSync(project.extractedPath)) {
    try {
      fs.rmSync(project.extractedPath, { recursive: true, force: true });
    } catch (e) {}
  }

  // 3. Clear Mongoose references
  await Project.deleteOne({ _id: projectId });
  await Analysis.deleteOne({ projectId });
  await GeneratedDocument.deleteMany({ projectId });

  return { id: projectId };
};
