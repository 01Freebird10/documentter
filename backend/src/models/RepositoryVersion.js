import mongoose from 'mongoose';

const repositoryVersionSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true
    },
    snapshotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RepositorySnapshot',
      required: true,
      index: true
    },
    versionTag: {
      type: String,
      required: true,
      default: 'REV-1',
      index: true
    },
    commitHash: {
      type: String,
      required: true
    },
    generatedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GeneratedDocument'
      }
    ],
    changeSummary: {
      type: String,
      default: 'Automated codebase revision parse.'
    },
    isReleased: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Add unique version tag index per repository
repositoryVersionSchema.index({ repositoryId: 1, versionTag: 1 }, { unique: true });

const RepositoryVersion = mongoose.model('RepositoryVersion', repositoryVersionSchema);

export default RepositoryVersion;
