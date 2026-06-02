import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Enforce standard encryption key, using 32 bytes fallback key if not set in .env
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.GITHUB_ENCRYPTION_KEY 
  ? crypto.scryptSync(process.env.GITHUB_ENCRYPTION_KEY, 'salt', 32)
  : crypto.scryptSync('default_sk_repomind_encryption_key_2026', 'salt', 32);
const IV_LENGTH = 16;

/**
 * Encrypt access token
 */
export const encryptToken = (token) => {
  if (!token) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt access token
 */
export const decryptToken = (encryptedToken) => {
  if (!encryptedToken) return '';
  try {
    const [ivHex, encrypted] = encryptedToken.split(':');
    if (!ivHex || !encrypted) return '';
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[GITHUB SECURE DECRYPT ERROR] Decryption signature mismatch:', err.message);
    return '';
  }
};

/**
 * Deep GitHub API Integrations Service
 */
class GitHubService {
  
  /**
   * Exchanges authorization code for access tokens
   */
  async exchangeOAuthCode(code) {
    // Standard OAuth token request template (falls back to mock token during test/offline)
    const clientId = process.env.GITHUB_CLIENT_ID || 'mock_client_id';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'mock_client_secret';
    
    if (clientId === 'mock_client_id' || !code) {
      console.log('[GITHUB] Exchanging Mock OAuth authorization code...');
      return {
        accessToken: encryptToken('mock_access_token_token_12345'),
        refreshToken: encryptToken('mock_refresh_token_token_12345'),
        scopes: ['repo', 'user'],
        githubId: `git_${Math.floor(Math.random() * 1e6)}`,
        username: 'octocat_dev'
      };
    }

    // Concrete OAuth execution will utilize axios post:
    // https://github.com/login/oauth/access_token
    return null;
  }

  /**
   * Lists repositories for connected user
   */
  async listUserRepositories(decryptedToken, page = 1, limit = 10, visibility = 'all') {
    console.log(`[GITHUB API] Fetching repository listings. Page: ${page}, Limit: ${limit}`);
    
    // High-fidelity Mock repository datasets returned in offline test modes
    if (decryptedToken.startsWith('mock_access_token') || !process.env.GITHUB_CLIENT_ID) {
      const mockRepos = [
        { repoId: '38192839', name: 'repomind-app', fullName: 'octocat_dev/repomind-app', description: 'Core RepoMind SaaS platform repository.', starsCount: 45, forksCount: 12, visibility: 'public', primaryLanguage: 'javascript', defaultBranch: 'main', lastUpdated: new Date() },
        { repoId: '84920492', name: 'payment-microservice', fullName: 'octocat_dev/payment-microservice', description: 'Private secure billing card gateways orchestrator.', starsCount: 8, forksCount: 1, visibility: 'private', primaryLanguage: 'javascript', defaultBranch: 'master', lastUpdated: new Date() },
        { repoId: '92049204', name: 'ml-recommendation-engine', fullName: 'org-enterprise/ml-recommendation-engine', description: 'Big data cognitive recommendation and profiling loops.', starsCount: 154, forksCount: 48, visibility: 'private', primaryLanguage: 'python', defaultBranch: 'develop', lastUpdated: new Date() }
      ];
      
      const filtered = visibility === 'all' 
        ? mockRepos 
        : mockRepos.filter(r => r.visibility === visibility);

      return {
        repositories: filtered.slice((page - 1) * limit, page * limit),
        totalCount: filtered.length
      };
    }

    // Concrete execution: calls Octokit or standard REST APIs (e.g. GET https://api.github.com/user/repos)
    return { repositories: [], totalCount: 0 };
  }

  /**
   * Fetch branch choices for a repository
   */
  async listRepositoryBranches(decryptedToken, repoFullName) {
    if (decryptedToken.startsWith('mock_access_token') || !process.env.GITHUB_CLIENT_ID) {
      return ['main', 'master', 'develop', 'feature/payments', 'feature/oauth'];
    }
    return ['main'];
  }

  /**
   * Audit .github/workflows/ to detect GitHub Actions, CI/CD, and deployment pipelines
   */
  async scanGitHubActionsWorkflows(workspacePath) {
    const workflowsDir = path.join(workspacePath, '.github', 'workflows');
    const pipelines = [];

    try {
      if (fs.existsSync(workflowsDir)) {
        const files = fs.readdirSync(workflowsDir);
        for (const file of files) {
          if (file.endsWith('.yml') || file.endsWith('.yaml')) {
            pipelines.push({
              fileName: file,
              name: file.replace(/\.ya?ml$/, '').toUpperCase(),
              type: 'github_actions',
              path: path.join('.github', 'workflows', file)
            });
          }
        }
        console.log(`[CI/CD SCANNER] Discovered ${pipelines.length} active GitHub Actions pipelines.`);
      }
    } catch (err) {
      console.warn('[CI/CD SCANNER WARNING] Failed to read workflows directory:', err.message);
    }

    return pipelines;
  }
}

import fs from 'fs';
import path from 'path';

export const githubService = new GitHubService();
export default githubService;
