import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending'
  },
  startedAt: Date,
  completedAt: Date,
  retries: {
    type: Number,
    default: 0
  },
  errorMessage: String
});

const workflowSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'ANALYZING', 'GENERATING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentStage: {
      type: String,
      enum: ['INTAKE', 'PROCESSING', 'ANALYSIS', 'KNOWLEDGE_GRAPH', 'AI_INTELLIGENCE', 'DOC_GENERATION', 'DIAGRAM_GENERATION', 'STORAGE', 'NOTIFICATION', 'COMPLETED'],
      default: 'INTAKE'
    },
    steps: [workflowStepSchema],
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    durationMs: Number,
    generatedAssets: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Workflow = mongoose.model('Workflow', workflowSchema);
export default Workflow;
