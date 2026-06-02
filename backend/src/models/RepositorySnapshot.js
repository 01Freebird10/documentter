import mongoose from 'mongoose';

const repositorySnapshotSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true
    },
    commitHash: {
      type: String,
      required: true,
      index: true
    },
    commitMessage: {
      type: String,
      default: ''
    },
    authorName: {
      type: String,
      default: ''
    },
    branch: {
      type: String,
      required: true,
      default: 'main'
    },
    // Captures the complete analysis context at this exact commit point
    analysisContext: {
      type: Object,
      required: true
    },
    aiContext: {
      type: Object,
      required: true
    },
    techStack: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index to speed up retrieval of branch-specific commit hashes
repositorySnapshotSchema.index({ repositoryId: 1, commitHash: 1 }, { unique: true });

const RepositorySnapshot = mongoose.model('RepositorySnapshot', repositorySnapshotSchema);

export default RepositorySnapshot;
