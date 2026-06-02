import mongoose from 'mongoose';

const repositorySyncSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    syncType: {
      type: String,
      required: true,
      enum: ['manual', 'webhook', 'scheduled'],
      default: 'manual',
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failed', 'in-progress'],
      default: 'in-progress',
      index: true
    },
    triggeredBy: {
      type: String,
      default: 'user' // 'webhook', 'cron', or username
    },
    commitHash: {
      type: String,
      default: ''
    },
    filesModifiedCount: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: ''
    },
    durationMs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const RepositorySync = mongoose.model('RepositorySync', repositorySyncSchema);

export default RepositorySync;
