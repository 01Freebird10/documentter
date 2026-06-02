import mongoose from 'mongoose';

const gitHubAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    // Tokens are AES-256 encrypted using standard helper utilities in githubService
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      default: ''
    },
    scopes: {
      type: [String],
      default: ['repo', 'user']
    },
    tokenExpiry: Date
  },
  {
    timestamps: true
  }
);

const GitHubAccount = mongoose.model('GitHubAccount', gitHubAccountSchema);

export default GitHubAccount;
