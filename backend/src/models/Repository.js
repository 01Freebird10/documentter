import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    githubAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GitHubAccount',
      required: true,
      index: true
    },
    repoId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    primaryLanguage: {
      type: String,
      default: 'javascript'
    },
    starsCount: {
      type: Number,
      default: 0
    },
    forksCount: {
      type: Number,
      default: 0
    },
    lastUpdated: Date,
    visibility: {
      type: String,
      required: true,
      enum: ['public', 'private'],
      default: 'public',
      index: true
    },
    defaultBranch: {
      type: String,
      required: true,
      default: 'main'
    },
    webhookId: {
      type: String,
      default: ''
    },
    isSyncActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Repository = mongoose.model('Repository', repositorySchema);

export default Repository;
