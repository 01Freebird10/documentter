import GitHubAccount from '../models/GitHubAccount.js';
import Repository from '../models/Repository.js';
import RepositorySync from '../models/RepositorySync.js';
import RepositoryVersion from '../models/RepositoryVersion.js';
import Project from '../models/Project.js';
import { githubService, encryptToken, decryptToken } from '../services/githubService.js';
import { getQueue } from '../queues/queueManager.js';
import AppError from '../utils/appError.js';

/**
 * GitHub Deep Integration REST Controller
 */

// 1. Start OAuth connection redirection
export const startGitHubOAuthAuth = async (req, res, next) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID || 'mock_client_id';
    const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/github/callback';
    const scopes = 'repo,user';

    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
    
    res.status(200).json({
      success: true,
      message: 'GitHub OAuth redirection URL generated.',
      data: { oauthUrl }
    });
  } catch (err) {
    next(err);
  }
};

// 2. Handle OAuth Callback links exchange code for token
export const handleOAuthCallback = async (req, res, next) => {
  const { code } = req.query;
  const userId = req.user._id;

  if (!code && !req.body.code) {
    return next(new AppError('Authorization code parameter is required.', 400));
  }

  try {
    const authCode = code || req.body.code;
    const exchanged = await githubService.exchangeOAuthCode(authCode);

    // Save or update GitHubAccount
    const account = await GitHubAccount.findOneAndUpdate(
      { userId },
      {
        githubId: exchanged.githubId,
        username: exchanged.username,
        avatarUrl: exchanged.avatarUrl || 'https://github.com/identicons/octocat.png',
        accessToken: exchanged.accessToken, // already encrypted in exchangeOAuthCode
        refreshToken: exchanged.refreshToken || '',
        scopes: exchanged.scopes || ['repo', 'user']
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'GitHub account linked and authorized successfully.',
      data: {
        username: account.username,
        githubId: account.githubId,
        avatarUrl: account.avatarUrl,
        scopes: account.scopes
      }
    });
  } catch (err) {
    next(err);
  }
};

// 3. Disconnect linked GitHub account
export const disconnectGitHubAccount = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const account = await GitHubAccount.findOneAndDelete({ userId });
    if (!account) {
      return next(new AppError('No connected GitHub account found for this user.', 404));
    }

    // Also deactivate sync flags on all user's linked repos
    await Repository.updateMany({ userId }, { isSyncActive: false });

    res.status(200).json({
      success: true,
      message: 'GitHub account disconnected successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// 4. List user's GitHub repositories (Public, Private, Org)
export const listGitHubRepositories = async (req, res, next) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const visibility = req.query.visibility || 'all';

  try {
    const account = await GitHubAccount.findOne({ userId });
    if (!account) {
      return next(new AppError('GitHub account not connected. Please connect your GitHub profile first.', 401));
    }

    const decryptedToken = decryptToken(account.accessToken);
    const reposData = await githubService.listUserRepositories(decryptedToken, page, limit, visibility);

    res.status(200).json({
      success: true,
      message: 'GitHub repositories successfully fetched.',
      data: reposData
    });
  } catch (err) {
    next(err);
  }
};

// 5. Trigger manual Repository sync & AST scanner compilation
export const triggerRepositoryManualSync = async (req, res, next) => {
  const { repoFullName, branch = 'main' } = req.body;
  const userId = req.user._id;

  try {
    const account = await GitHubAccount.findOne({ userId });
    if (!account) {
      return next(new AppError('GitHub account connection required.', 401));
    }

    // Find or link Repository
    let repository = await Repository.findOne({ fullName: repoFullName, userId });
    if (!repository) {
      // Create new Repo tracking document
      const repoDetails = repoFullName.split('/');
      repository = await Repository.create({
        userId,
        githubAccountId: account._id,
        repoId: `repo_${Math.floor(Math.random() * 1e6)}`,
        name: repoDetails[1] || 'repo-core',
        fullName: repoFullName,
        visibility: 'private',
        defaultBranch: branch
      });
    }

    // Upsert a matching project record inside DB
    let project = await Project.findOne({ projectName: repository.name, userId });
    if (!project) {
      project = await Project.create({
        userId,
        projectName: repository.name,
        sourceType: 'github',
        githubUrl: `https://github.com/${repoFullName}`
      });
      repository.projectId = project._id;
      await repository.save();
    }

    // Record sync log as in-progress
    const sync = await RepositorySync.create({
      repositoryId: repository._id,
      userId,
      syncType: 'manual',
      status: 'in-progress',
      triggeredBy: req.user.name,
      commitHash: `manual_rev_${Math.random().toString(36).substr(2, 6)}`
    });

    // Dispatch background analysis job
    const decryptedToken = decryptToken(account.accessToken);
    const analysisQueue = getQueue('analysisQueue');

    await analysisQueue.add('Analyze-Manual-Repo', {
      projectId: project._id,
      repoFullName,
      branch,
      token: decryptedToken,
      commitHash: sync.commitHash,
      syncId: sync._id,
      repositoryId: repository._id
    });

    res.status(202).json({
      success: true,
      message: 'Repository synchronization job successfully dispatched to background worker pools.',
      data: {
        syncId: sync._id,
        projectId: project._id,
        status: sync.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// 6. View Repository Sync History and parsed Versions list
export const listRepositoryHistoryLogs = async (req, res, next) => {
  const { repoFullName } = req.query;
  const userId = req.user._id;

  try {
    const repository = await Repository.findOne({ fullName: repoFullName, userId });
    if (!repository) {
      return next(new AppError('Target repository not found or linked under this account.', 404));
    }

    const syncLogs = await RepositorySync.find({ repositoryId: repository._id }).sort({ createdAt: -1 }).limit(30);
    const versions = await RepositoryVersion.find({ repositoryId: repository._id }).populate('snapshotId').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Repository sync history fetched successfully.',
      data: {
        syncLogs,
        versions
      }
    });
  } catch (err) {
    next(err);
  }
};
