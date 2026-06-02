import Project from '../models/Project.js';
import Workflow from '../models/Workflow.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import workflowEmitter from '../utils/workflowEmitter.js';
import { analyzeWorkspace } from './intelligenceService.js';
import { generateAIBlueprints } from './aiService.js';
import { compileDocxReport } from './docxService.js';
import { compilePptxPresentation } from './pptxService.js';
import { compilePdfReport } from './pdfService.js';
import { compileProjectDiagrams } from './diagramService.js';
import path from 'path';
import fs from 'fs';

// Orchestration progress values per stage
const PROGRESS_MAP = {
  INTAKE: 5,
  PROCESSING: 15,
  ANALYSIS: 35,
  KNOWLEDGE_GRAPH: 50,
  AI_INTELLIGENCE: 65,
  DOC_GENERATION: 80,
  DIAGRAM_GENERATION: 92,
  STORAGE: 96,
  NOTIFICATION: 100
};

// Orchestrator helper wrapping steps in retry blocks
const executeStepWithRetry = async (stepName, stepFn, workflow, maxRetries = 2) => {
  const step = workflow.steps.find(s => s.name === stepName);
  if (step) {
    step.status = 'in-progress';
    step.startedAt = new Date();
    await workflow.save();
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const result = await stepFn();
      if (step) {
        step.status = 'completed';
        step.completedAt = new Date();
        await workflow.save();
      }
      return result;
    } catch (err) {
      attempt++;
      console.warn(`[ORCHESTRATOR RETRY WARNING] Step "${stepName}" failed (Attempt ${attempt}/${maxRetries + 1}): ${err.message}`);
      if (step) {
        step.retries = attempt;
        step.errorMessage = err.message;
        await workflow.save();
      }
      if (attempt > maxRetries) {
        if (step) {
          step.status = 'failed';
          await workflow.save();
        }
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay between retries
    }
  }
};

/**
 * Initialize a new workflow ledger and kick off the async background process
 */
export const startWorkflow = async (projectId, userId, workspacePath, projectName) => {
  // Define the steps checklist for the orchestration run
  const stepNames = [
    'Validate & Register',
    'Ingestion & Tree Index',
    'Static AST Scanners',
    'Knowledge Graph Compiler',
    'AI Cognitive Compilation',
    'PDF / Docx / PPTX Publisher',
    'UML Visuals Renderer',
    'Seeder Asset catalog',
    'Live Success alerts'
  ];

  const steps = stepNames.map(name => ({
    name,
    status: 'pending'
  }));

  const workflow = await Workflow.create({
    projectId,
    userId,
    status: 'PENDING',
    progress: 0,
    currentStage: 'INTAKE',
    steps
  });

  // Spawn asynchronous pipeline loop
  executePipeline(workflow._id, workspacePath, projectName).catch(err => {
    console.error(`[WORKFLOW PIPELINE FAULT] Workflow: ${workflow._id} failed completely. ${err.stack}`);
  });

  return workflow;
};

/**
 * Main 9-stage pipeline orchestrator executing compilers sequentially
 */
export const executePipeline = async (workflowId, workspacePath, projectName, startFromStage = 'INTAKE') => {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) return;

  const project = await Project.findById(workflow.projectId);
  if (!project) {
    workflow.status = 'FAILED';
    await workflow.save();
    return;
  }

  const formattedName = projectName.toLowerCase().replace(/[\s\.]+/g, '-');
  const uploadDir = './src/uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const docxPath = path.join(uploadDir, `${formattedName}_blueprint.docx`);
  const pptxPath = path.join(uploadDir, `${formattedName}_blueprint.pptx`);
  const pdfPath = path.join(uploadDir, `${formattedName}_blueprint.pdf`);
  const thumbnailPath = path.join(uploadDir, `${formattedName}_thumbnail.png`);

  try {
    // ------------------------------------------
    // STAGE 1: INTAKE (5%)
    // ------------------------------------------
    if (shouldRunStage('INTAKE', startFromStage)) {
      workflow.status = 'PROCESSING';
      workflow.currentStage = 'INTAKE';
      workflow.progress = PROGRESS_MAP.INTAKE;
      await workflow.save();

      await executeStepWithRetry('Validate & Register', async () => {
        // Assert schema files directory exists
        if (!workspacePath) throw new Error('Ingestion path is blank or undefined.');
        workflowEmitter.emit('ProjectUploaded', { projectId: project._id });
      }, workflow);
    }

    // ------------------------------------------
    // STAGE 2: PROCESSING (15%)
    // ------------------------------------------
    if (shouldRunStage('PROCESSING', startFromStage)) {
      workflow.currentStage = 'PROCESSING';
      workflow.progress = PROGRESS_MAP.PROCESSING;
      await workflow.save();

      await executeStepWithRetry('Ingestion & Tree Index', async () => {
        // Safe extraction has already occurred inside projectController.
        // We verify that the workspace directory is visible on disk.
        if (!fs.existsSync(workspacePath)) {
          throw new Error(`Target codebase folder not found on disk at: ${workspacePath}`);
        }
      }, workflow);
    }

    // ------------------------------------------
    // STAGE 3: ANALYSIS (35%)
    // ------------------------------------------
    let masterContext = project.analysisContext;
    if (shouldRunStage('ANALYSIS', startFromStage)) {
      workflow.status = 'ANALYZING';
      workflow.currentStage = 'ANALYSIS';
      workflow.progress = PROGRESS_MAP.ANALYSIS;
      await workflow.save();

      masterContext = await executeStepWithRetry('Static AST Scanners', async () => {
        workflowEmitter.emit('AnalysisStarted', { projectId: project._id });
        return await analyzeWorkspace(workspacePath, projectName);
      }, workflow);

      project.analysisContext = masterContext;
      project.techStack = masterContext.technologies;
      await project.save();
    }

    // ------------------------------------------
    // STAGE 4: KNOWLEDGE GRAPH (50%)
    // ------------------------------------------
    if (shouldRunStage('KNOWLEDGE_GRAPH', startFromStage)) {
      workflow.currentStage = 'KNOWLEDGE_GRAPH';
      workflow.progress = PROGRESS_MAP.KNOWLEDGE_GRAPH;
      await workflow.save();

      await executeStepWithRetry('Knowledge Graph Compiler', async () => {
        // Traced node configurations are assembled in analyzeWorkspace
        if (!masterContext || !masterContext.knowledgeGraph) {
          throw new Error('Knowledge graph nodes failed to compile.');
        }
      }, workflow);
    }

    // ------------------------------------------
    // STAGE 5: AI INTELLIGENCE (65%)
    // ------------------------------------------
    let aiContext = project.aiContext;
    if (shouldRunStage('AI_INTELLIGENCE', startFromStage)) {
      workflow.currentStage = 'AI_INTELLIGENCE';
      workflow.progress = PROGRESS_MAP.AI_INTELLIGENCE;
      await workflow.save();

      aiContext = await executeStepWithRetry('AI Cognitive Compilation', async () => {
        const compiledAi = await generateAIBlueprints(project._id, masterContext);
        workflowEmitter.emit('AnalysisCompleted', { projectId: project._id });
        return compiledAi;
      }, workflow);

      project.aiContext = aiContext;
      await project.save();
    }

    // ------------------------------------------
    // STAGE 6: DOC GENERATION (80%)
    // ------------------------------------------
    if (shouldRunStage('DOC_GENERATION', startFromStage)) {
      workflow.status = 'GENERATING';
      workflow.currentStage = 'DOC_GENERATION';
      workflow.progress = PROGRESS_MAP.DOC_GENERATION;
      await workflow.save();

      await executeStepWithRetry('PDF / Docx / PPTX Publisher', async () => {
        // Run DOCX packager
        await compileDocxReport(project, docxPath);
        // Run PPTX builder
        await compilePptxPresentation(project, pptxPath, 'developer');
        // Run A4 PDF generator + screenshot PNG cover
        await compilePdfReport(project, pdfPath, thumbnailPath, 'academic');
        
        workflowEmitter.emit('DocumentsGenerated', { projectId: project._id });
      }, workflow);
    }

    // ------------------------------------------
    // STAGE 7: DIAGRAM GENERATION (92%)
    // ------------------------------------------
    if (shouldRunStage('DIAGRAM_GENERATION', startFromStage)) {
      workflow.currentStage = 'DIAGRAM_GENERATION';
      workflow.progress = PROGRESS_MAP.DIAGRAM_GENERATION;
      await workflow.save();

      await executeStepWithRetry('UML Visuals Renderer', async () => {
        await compileProjectDiagrams(project);
        workflowEmitter.emit('DiagramsGenerated', { projectId: project._id });
      }, workflow);
    }

    // ------------------------------------------
    // STAGE 8: STORAGE (96%)
    // ------------------------------------------
    if (shouldRunStage('STORAGE', startFromStage)) {
      workflow.currentStage = 'STORAGE';
      workflow.progress = PROGRESS_MAP.STORAGE;
      await workflow.save();

      await executeStepWithRetry('Seeder Asset catalog', async () => {
        // Register catalog index seeds
        const docTypes = ['docx', 'pdf', 'pptx', 'viva', 'resume', 'tech'];
        const existing = await GeneratedDocument.find({ projectId: project._id });
        
        if (existing.length === 0) {
          const docs = docTypes.map(type => ({
            projectId: project._id,
            documentType: type,
            fileUrl: `/api/documents/download/${type}_blueprint`
          }));
          await GeneratedDocument.insertMany(docs);
        }
      }, workflow);
    }

    // ------------------------------------------
    // STAGE 9: NOTIFICATION (100%)
    // ------------------------------------------
    if (shouldRunStage('NOTIFICATION', startFromStage)) {
      workflow.currentStage = 'NOTIFICATION';
      workflow.progress = PROGRESS_MAP.NOTIFICATION;
      await workflow.save();

      await executeStepWithRetry('Live Success alerts', async () => {
        project.status = 'completed';
        await project.save();
      }, workflow);
    }

    // FINALIZE PIPELINE
    const duration = Date.now() - new Date(workflow.startedAt).getTime();
    
    workflow.status = 'COMPLETED';
    workflow.currentStage = 'COMPLETED';
    workflow.progress = 100;
    workflow.completedAt = new Date();
    workflow.durationMs = duration;
    workflow.generatedAssets = [
      `/api/documents/download/docx_blueprint`,
      `/api/documents/download/pdf_blueprint`,
      `/api/documents/download/pptx_blueprint`
    ];
    await workflow.save();

    workflowEmitter.emit('WorkflowCompleted', { workflowId: workflow._id });

  } catch (error) {
    console.error(`[ORCHESTRATOR FAULT RECOVERY] Workflow run interrupted. Error: ${error.message}`);
    
    workflow.status = 'FAILED';
    await workflow.save();

    workflowEmitter.emit('WorkflowFailed', { workflowId: workflow._id, error: error.message });
  }
};

/**
 * Recovery resumes failed workflows from last active checkpoint
 */
export const resumeWorkflowPipeline = async (workflowId, workspacePath, projectName) => {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) return null;

  // Determine last completed or failed stage
  let lastFailedStep = workflow.steps.find(s => s.status === 'failed');
  let resumeStage = 'INTAKE';

  if (lastFailedStep) {
    const stepName = lastFailedStep.name;
    if (stepName === 'Ingestion & Tree Index') resumeStage = 'PROCESSING';
    else if (stepName === 'Static AST Scanners') resumeStage = 'ANALYSIS';
    else if (stepName === 'Knowledge Graph Compiler') resumeStage = 'KNOWLEDGE_GRAPH';
    else if (stepName === 'AI Cognitive Compilation') resumeStage = 'AI_INTELLIGENCE';
    else if (stepName === 'PDF / Docx / PPTX Publisher') resumeStage = 'DOC_GENERATION';
    else if (stepName === 'UML Visuals Renderer') resumeStage = 'DIAGRAM_GENERATION';
    else if (stepName === 'Seeder Asset catalog') resumeStage = 'STORAGE';
    else if (stepName === 'Live Success alerts') resumeStage = 'NOTIFICATION';
  }

  console.log(`[ORCHESTRATOR RECOVERY] Resuming failed Workflow: ${workflowId} starting from checkpoint: ${resumeStage}`);

  // Reset failed steps status to pending for retry run
  workflow.steps.forEach(step => {
    if (step.status === 'failed' || step.status === 'in-progress') {
      step.status = 'pending';
      step.startedAt = undefined;
      step.completedAt = undefined;
      step.errorMessage = undefined;
    }
  });
  
  workflow.status = 'PENDING';
  await workflow.save();

  // Re-trigger async pipeline runner
  executePipeline(workflow._id, workspacePath, projectName, resumeStage).catch(err => {
    console.error(`[WORKFLOW RECOVERY FAIL] Pipeline failed again on resume. ${err.stack}`);
  });

  return workflow;
};

// Helper checking if stage should run on retry resumes
const shouldRunStage = (currentStage, startFromStage) => {
  const stagesOrder = ['INTAKE', 'PROCESSING', 'ANALYSIS', 'KNOWLEDGE_GRAPH', 'AI_INTELLIGENCE', 'DOC_GENERATION', 'DIAGRAM_GENERATION', 'STORAGE', 'NOTIFICATION'];
  const currentIndex = stagesOrder.indexOf(currentStage);
  const startIndex = stagesOrder.indexOf(startFromStage);
  return currentIndex >= startIndex;
};
