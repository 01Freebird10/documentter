import Project from '../models/Project.js';
import Workflow from '../models/Workflow.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import ApiResponse from '../utils/apiResponse.js';
import * as workflowService from '../services/workflowService.js';
import path from 'path';

/**
 * Trigger starting the 9-stage asynchronous orchestration pipeline
 */
export const startWorkflowRun = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findOne({ _id: projectId, userId: req.user._id });
    
    if (!project) {
      return ApiResponse.error(res, 'The project associated with this workflow was not found.', 404);
    }

    const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
    const workspacePath = path.resolve(`./src/uploads/${formattedName}_extracted`);

    // Spawn orchestrator service
    const workflow = await workflowService.startWorkflow(project._id, req.user._id, workspacePath, project.projectName);

    return ApiResponse.success(res, 'Automated workflow orchestration pipeline successfully started!', {
      workflowId: workflow._id,
      status: workflow.status,
      progress: workflow.progress,
      currentStage: workflow.currentStage,
      startedAt: workflow.startedAt
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve progress details, durational logs, and step statuses
 */
export const getWorkflowStatus = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) {
      return ApiResponse.error(res, 'Workflow execution log not found.', 404);
    }

    return ApiResponse.success(res, 'Workflow pipeline progress retrieved successfully!', {
      workflowId: workflow._id,
      status: workflow.status,
      progress: workflow.progress,
      currentStage: workflow.currentStage,
      steps: workflow.steps,
      startedAt: workflow.startedAt,
      completedAt: workflow.completedAt,
      durationMs: workflow.durationMs
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch past historical logs list of all project runs
 */
export const getWorkflowHistory = async (req, res, next) => {
  try {
    const history = await Workflow.find({ userId: req.user._id })
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 'Workflows orchestration history logs retrieved successfully!', history, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch download links and metadata assets list on compile success
 */
export const getWorkflowResults = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) {
      return ApiResponse.error(res, 'Workflow execution log not found.', 404);
    }

    if (workflow.status !== 'COMPLETED') {
      return ApiResponse.error(res, 'The workflow run has not completed successfully yet.', 400);
    }

    // Retrieve generated documents links
    const docs = await GeneratedDocument.find({ projectId: workflow.projectId });

    return ApiResponse.success(res, 'Generated visual assets and files retrieved successfully!', {
      workflowId: workflow._id,
      status: workflow.status,
      progress: workflow.progress,
      completedAt: workflow.completedAt,
      generatedAssets: docs.map(d => ({
        type: d.documentType,
        downloadUrl: d.fileUrl,
        previewUrl: d.documentType === 'pdf' ? `/api/documents/preview/${d._id}` : d.fileUrl
      }))
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Retries and resumes failed pipelines from check-pointed stages
 */
export const retryWorkflowRun = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) {
      return ApiResponse.error(res, 'Workflow execution log not found.', 404);
    }

    if (workflow.status !== 'FAILED') {
      return ApiResponse.error(res, 'Only failed workflow runs can be retried.', 400);
    }

    const project = await Project.findById(workflow.projectId);
    if (!project) {
      return ApiResponse.error(res, 'Associated project registry not found.', 404);
    }

    const formattedName = project.projectName.toLowerCase().replace(/[\s\.]+/g, '-');
    const workspacePath = path.resolve(`./src/uploads/${formattedName}_extracted`);

    // Spawn resume pipeline
    const updatedWorkflow = await workflowService.resumeWorkflowPipeline(workflow._id, workspacePath, project.projectName);

    return ApiResponse.success(res, 'Workflow pipeline successfully reloaded and resumed!', {
      workflowId: updatedWorkflow._id,
      status: updatedWorkflow.status,
      progress: updatedWorkflow.progress,
      currentStage: updatedWorkflow.currentStage
    }, 200);
  } catch (error) {
    next(error);
  }
};
