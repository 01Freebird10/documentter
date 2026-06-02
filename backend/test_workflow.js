import { startWorkflow, resumeWorkflowPipeline, executePipeline } from './src/services/workflowService.js';
import Workflow from './src/models/Workflow.js';
import Project from './src/models/Project.js';
import workflowEmitter from './src/utils/workflowEmitter.js';
import connectDB from './src/config/db.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Initialize environmental vars and DB connection
connectDB();

const testWorkflowOrchestrator = async () => {
  console.log('[TEST WORKFLOW HARNESS] Commencing Pipeline Orchestrator validation...');

  // 1. Setup mock user and project registry inside DB
  const mockUserId = new mongoose.Types.ObjectId();
  const uploadDir = './src/uploads';
  const workspacePath = path.resolve(`${uploadDir}/orchestrator-test-project_extracted`);

  const mockProject = await Project.create({
    projectName: 'orchestrator-test-project',
    userId: mockUserId,
    sourceType: 'zip',
    extractedPath: workspacePath,
    status: 'pending',
    techStack: ['Node.js', 'Express.js', 'React', 'MongoDB'],
    analysisContext: {
      projectName: 'orchestrator-test-project',
      category: 'Task Manager / AI SaaS',
      technologies: ['Node.js', 'Express.js', 'React', 'MongoDB'],
      features: [{ name: 'Authentication', evidence: 'jwt sign' }],
      apiMap: [{ method: 'POST', path: '/api/v1/auth/login', authRequired: false }],
      databaseOverview: { dialect: 'MongoDB (Mongoose)', models: ['User', 'Task'] },
      strengths: ['Modular MVC directories.'],
      weaknesses: ['Missing Jest testing frameworks.'],
      recommendations: ['Install Jest.'],
      complexityScore: 82,
      maintainabilityScore: 86
    },
    aiContext: {
      reportContent: {
        title: 'orchestrator-test-project — Technical Specification Brief',
        abstract: 'Mock specification abstract blueprint.',
        conclusion: 'Analysis complete.'
      }
    }
  });

  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
    // Write mock package.json manifest for technology scanning
    fs.writeFileSync(path.join(workspacePath, 'package.json'), JSON.stringify({ dependencies: { express: '^4.18.2' } }));
  }

  try {
    // 2. Audit Event Emitter subscriptions
    let emittedEvents = [];
    workflowEmitter.on('ProjectUploaded', () => emittedEvents.push('ProjectUploaded'));
    workflowEmitter.on('AnalysisStarted', () => emittedEvents.push('AnalysisStarted'));
    workflowEmitter.on('AnalysisCompleted', () => emittedEvents.push('AnalysisCompleted'));
    workflowEmitter.on('DocumentsGenerated', () => emittedEvents.push('DocumentsGenerated'));
    workflowEmitter.on('DiagramsGenerated', () => emittedEvents.push('DiagramsGenerated'));
    workflowEmitter.on('WorkflowCompleted', () => emittedEvents.push('WorkflowCompleted'));

    // 3. START COMPLETE AUTOMATED PIPELINE RUN
    console.log('[TEST WORKFLOW HARNESS] Triggering workflow start...');
    const workflow = await startWorkflow(mockProject._id, mockUserId, workspacePath, mockProject.projectName);
    console.log(`Workflow spawned. ID: ${workflow._id}, Status: ${workflow.status}`);

    // Poll status until complete or failed
    let maxPolls = 15;
    let poll = 0;
    let finishedWorkflow = null;

    while (poll < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      finishedWorkflow = await Workflow.findById(workflow._id);
      
      console.log(`[POLLING STATUS] Progress: ${finishedWorkflow.progress}%, Current Stage: ${finishedWorkflow.currentStage}, Status: ${finishedWorkflow.status}`);
      
      if (finishedWorkflow.status === 'COMPLETED' || finishedWorkflow.status === 'FAILED') {
        break;
      }
      poll++;
    }

    // Assert Success Run outcomes
    if (finishedWorkflow.status === 'COMPLETED') {
      console.log('\n==================================================');
      console.log('[TEST SUCCESS] Pipeline successfully completed!');
      console.log('==================================================');
      console.log(`Duration: ${(finishedWorkflow.durationMs / 1000).toFixed(2)} seconds`);
      console.log(`Generated Assets: ${finishedWorkflow.generatedAssets.join(', ')}`);
      console.log(`Emitted Events Audited: ${emittedEvents.join(', ')}`);
      console.log('==================================================\n');
    } else {
      throw new Error(`Pipeline halted unexpectedly in state: ${finishedWorkflow.status}`);
    }

    // 4. TEST CHECKPOINT ERROR RECOVERY & CHECKPOINT RESUMPTION
    console.log('[TEST WORKFLOW HARNESS] Simulating a pipeline failure and checkpoint recovery...');
    
    // Create a new failed workflow manually
    const failedWorkflow = await Workflow.create({
      projectId: mockProject._id,
      userId: mockUserId,
      status: 'FAILED',
      progress: 50,
      currentStage: 'KNOWLEDGE_GRAPH',
      steps: [
        { name: 'Validate & Register', status: 'completed', completedAt: new Date() },
        { name: 'Ingestion & Tree Index', status: 'completed', completedAt: new Date() },
        { name: 'Static AST Scanners', status: 'completed', completedAt: new Date() },
        { name: 'Knowledge Graph Compiler', status: 'completed', completedAt: new Date() },
        { name: 'AI Cognitive Compilation', status: 'failed', errorMessage: 'Mock network timeout exception' },
        { name: 'PDF / Docx / PPTX Publisher', status: 'pending' },
        { name: 'UML Visuals Renderer', status: 'pending' },
        { name: 'Seeder Asset catalog', status: 'pending' },
        { name: 'Live Success alerts', status: 'pending' }
      ]
    });

    console.log(`Failed Checkpoint Workflow spawned. ID: ${failedWorkflow._id}, Last Failed Step: "AI Cognitive Compilation"`);
    
    // Trigger resume pipeline
    console.log('[TEST WORKFLOW HARNESS] Invoking recovery checkpoint resumption...');
    await resumeWorkflowPipeline(failedWorkflow._id, workspacePath, mockProject.projectName);

    // Poll status of the recovery workflow
    poll = 0;
    let recoveredWorkflow = null;

    while (poll < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      recoveredWorkflow = await Workflow.findById(failedWorkflow._id);
      
      console.log(`[POLLING RECOVERY] Progress: ${recoveredWorkflow.progress}%, Current Stage: ${recoveredWorkflow.currentStage}, Status: ${recoveredWorkflow.status}`);
      
      if (recoveredWorkflow.status === 'COMPLETED' || recoveredWorkflow.status === 'FAILED') {
        break;
      }
      poll++;
    }

    if (recoveredWorkflow.status === 'COMPLETED') {
      console.log('\n==================================================');
      console.log('[TEST SUCCESS] Pipeline successfully recovered and completed from checkpoint!');
      console.log('==================================================');
      console.log(`Checkpointed steps successfully completed: ${recoveredWorkflow.steps.filter(s => s.status === 'completed').length}/9 steps`);
      console.log('==================================================\n');
    } else {
      throw new Error(`Recovery pipeline failed to resume in state: ${recoveredWorkflow.status}`);
    }

    // Cleanup mock database documents
    console.log('[TEST CLEANUP] Purging mock DB records...');
    await Project.findByIdAndDelete(mockProject._id);
    await Workflow.findByIdAndDelete(workflow._id);
    await Workflow.findByIdAndDelete(failedWorkflow._id);
    
    // Remove mock temp files
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }

    console.log('[TEST COMPLETION] All validators completed cleanly! Exiting.');
    process.exit(0);

  } catch (error) {
    console.error(`[TEST HARNESS FAILED] Exception thrown: ${error.stack}`);
    process.exit(1);
  }
};

testWorkflowOrchestrator();
