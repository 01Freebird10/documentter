import { EventEmitter } from 'events';

class WorkflowEmitter extends EventEmitter {
  constructor() {
    super();
    
    // Wire standardized logging hooks for developer diagnostics
    this.on('ProjectUploaded', (data) => {
      console.log(`[EVENT] ProjectUploaded emitted for Project ID: ${data.projectId}`);
    });
    
    this.on('AnalysisStarted', (data) => {
      console.log(`[EVENT] AnalysisStarted emitted for Project ID: ${data.projectId}`);
    });
    
    this.on('AnalysisCompleted', (data) => {
      console.log(`[EVENT] AnalysisCompleted emitted for Project ID: ${data.projectId}`);
    });
    
    this.on('DocumentsGenerated', (data) => {
      console.log(`[EVENT] DocumentsGenerated emitted for Project ID: ${data.projectId}`);
    });
    
    this.on('DiagramsGenerated', (data) => {
      console.log(`[EVENT] DiagramsGenerated emitted for Project ID: ${data.projectId}`);
    });
    
    this.on('WorkflowCompleted', (data) => {
      console.log(`[EVENT SUCCESS] WorkflowCompleted emitted. Workflow ID: ${data.workflowId}`);
    });
    
    this.on('WorkflowFailed', (data) => {
      console.error(`[EVENT ALERT] WorkflowFailed emitted. Workflow ID: ${data.workflowId}. Error: ${data.error}`);
    });
  }
}

const workflowEmitter = new WorkflowEmitter();
export default workflowEmitter;
