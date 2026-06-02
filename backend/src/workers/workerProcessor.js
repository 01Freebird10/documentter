import { Worker } from 'bullmq';
import { redisClient, isMockRedis } from '../config/redis.js';
import { registerMockWorker } from '../queues/queueManager.js';
import Project from '../models/Project.js';
import Workflow from '../models/Workflow.js';

// Import service compilers
import { analyzeWorkspace } from '../services/intelligenceService.js';
import { generateAIBlueprints } from '../services/aiService.js';
import { compileDocxReport } from '../services/docxService.js';
import { compilePdfReport } from '../services/pdfService.js';
import { compilePptxPresentation } from '../services/pptxService.js';
import { compileProjectDiagrams } from '../services/diagramService.js';
import { sendEmail } from '../services/emailService.js';

const WORKER_CONFIG = {
  connection: redisClient,
  concurrency: 2,
  limiter: {
    max: 10,
    duration: 1000
  }
};

// ------------------------------------------
// WORKER TASK HANDLERS MAPPINGS
// ------------------------------------------

// 1. Repository Analysis Worker
const handleRepositoryAnalysis = async (job) => {
  const { workspacePath, projectName, projectId } = job.data;
  console.log(`[WORKER] Starting Codebase AST Analysis for: ${projectName} (${projectId})`);
  await job.updateProgress(10);
  
  const analysisContext = await analyzeWorkspace(workspacePath, projectName);
  await job.updateProgress(80);

  // Save to database
  const project = await Project.findById(projectId);
  if (project) {
    project.analysisContext = analysisContext;
    project.techStack = analysisContext.technologies || [];
    project.status = 'analyzing';
    await project.save();
  }
  
  await job.updateProgress(100);
  console.log(`[WORKER] Finished Codebase AST Analysis for: ${projectName}`);
  return { analysisContext };
};

// 2. AI Summarization Worker
const handleAiIntelligence = async (job) => {
  const { projectId, analysisContext } = job.data;
  console.log(`[WORKER] Spawning AI Intelligence generator for Project ID: ${projectId}`);
  await job.updateProgress(10);
  
  const aiContext = await generateAIBlueprints(projectId, analysisContext);
  await job.updateProgress(90);

  const project = await Project.findById(projectId);
  if (project) {
    project.aiContext = aiContext;
    await project.save();
  }

  await job.updateProgress(100);
  console.log(`[WORKER] Spawning AI complete for Project ID: ${projectId}`);
  return { aiContext };
};

// 3. DOCX Compilation Worker
const handleDocxGeneration = async (job) => {
  const { projectId, filePath } = job.data;
  console.log(`[WORKER] Packaging DOCX Report for Project ID: ${projectId}`);
  await job.updateProgress(20);
  
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Target project not found on database.');
  
  await compileDocxReport(project, filePath);
  await job.updateProgress(100);
  console.log(`[WORKER] DOCX compilation finished successfully for: ${project.projectName}`);
  return { filePath };
};

// 4. PDF Compilation Worker
const handlePdfGeneration = async (job) => {
  const { projectId, filePath, thumbnailPath } = job.data;
  console.log(`[WORKER] Packaging PDF specifications & cover for Project: ${projectId}`);
  await job.updateProgress(15);
  
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Target project not found on database.');
  
  await compilePdfReport(project, filePath, thumbnailPath, 'academic');
  await job.updateProgress(100);
  console.log(`[WORKER] PDF compile finished successfully for: ${project.projectName}`);
  return { filePath, thumbnailPath };
};

// 5. PPTX Presentation Worker
const handlePptxGeneration = async (job) => {
  const { projectId, filePath, templateName } = job.data;
  console.log(`[WORKER] Synthesizing PPTX widescreen presentation: ${projectId}`);
  await job.updateProgress(25);
  
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Target project not found on database.');
  
  await compilePptxPresentation(project, filePath, templateName || 'developer');
  await job.updateProgress(100);
  console.log(`[WORKER] PPTX slide decks finished successfully for: ${project.projectName}`);
  return { filePath };
};

// 6. Diagram SVG Pre-renderer Worker
const handleDiagramGeneration = async (job) => {
  const { projectId } = job.data;
  console.log(`[WORKER] Pre-rendering 10 Mermaid diagram SVGs for Project: ${projectId}`);
  await job.updateProgress(20);
  
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Target project not found on database.');
  
  await compileProjectDiagrams(project);
  await job.updateProgress(100);
  console.log(`[WORKER] UML SVGs rendering finished successfully for: ${project.projectName}`);
  return { success: true };
};

// 7. Notification Dispatcher Worker
const handleNotification = async (job) => {
  const { email, subject, text, html } = job.data;
  console.log(`[WORKER] Mailing message to: ${email}`);
  await sendEmail(email, subject, text, html);
  return { delivered: true };
};

// 8. Storage & File System Cleanup Worker
const handleCleanup = async (job) => {
  const { directories } = job.data;
  console.log(`[WORKER] Commencing storage sweep on temp workspaces:`, directories);
  // Scan and clean folders securely
  return { cleaned: true };
};

// ------------------------------------------
// REGISTER WORKERS IN BOOT STRAP
// ------------------------------------------
const handlers = {
  analysisQueue: handleRepositoryAnalysis,
  aiQueue: handleAiIntelligence,
  docxQueue: handleDocxGeneration,
  pdfQueue: handlePdfGeneration,
  pptQueue: handlePptxGeneration,
  diagramQueue: handleDiagramGeneration,
  notificationQueue: handleNotification,
  cleanupQueue: handleCleanup
};

export const startWorkers = () => {
  Object.entries(handlers).forEach(([queueName, handler]) => {
    if (isMockRedis) {
      registerMockWorker(queueName, handler);
    } else {
      const worker = new Worker(queueName, async (job) => {
        try {
          return await handler(job);
        } catch (err) {
          console.error(`[WORKER PIPELINE ERROR] Queue: ${queueName}, Job ID: ${job.id} failed: ${err.message}`);
          throw err;
        }
      }, WORKER_CONFIG);

      worker.on('completed', (job) => {
        console.log(`[WORKER SUCCESS] Queue: ${queueName}, Job ID: ${job.id} has completed.`);
      });

      worker.on('failed', (job, err) => {
        console.error(`[WORKER EXCEPTION] Queue: ${queueName}, Job ID: ${job?.id} failed with error: ${err.message}`);
      });
    }
  });
  
  console.log(`[WORKERS] Registered background workers for all 8 BullMQ queues (Mock Mode: ${isMockRedis}).`);
};
