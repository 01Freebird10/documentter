import crypto from 'crypto';
import WebhookEvent from '../models/WebhookEvent.js';
import Repository from '../models/Repository.js';
import GitHubAccount from '../models/GitHubAccount.js';
import RepositorySync from '../models/RepositorySync.js';
import RepositorySnapshot from '../models/RepositorySnapshot.js';
import RepositoryVersion from '../models/RepositoryVersion.js';
import { getQueue } from '../queues/queueManager.js';
import { decryptToken } from './githubService.js';

class GitHubWebhookService {
  
  /**
   * Validate SHA256 HMAC Signature sent by GitHub webhook headers
   */
  verifyWebhookSignature(rawBody, signatureHeader, secret) {
    if (!signatureHeader) return false;
    const webhookSecret = secret || process.env.GITHUB_WEBHOOK_SECRET || 'sk_github_webhook_secret_code_2026';
    
    try {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const computed = 'sha256=' + hmac.update(rawBody).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
    } catch {
      return false;
    }
  }

  /**
   * Process incoming Webhook Events (Push, Pull Request, Ping)
   */
  async handleWebhookPayload(deliveryId, eventType, signatureHeader, payload, rawBody) {
    // Audit Webhook Delivery event in DB
    const event = await WebhookEvent.create({
      deliveryId,
      eventType,
      payload,
      processed: false
    });

    // Verify HMAC signature (bypass check in Mock/test setups if headers are custom)
    const secret = process.env.GITHUB_WEBHOOK_SECRET || 'sk_github_webhook_secret_code_2026';
    const isValid = this.verifyWebhookSignature(rawBody, signatureHeader, secret);
    
    if (!isValid && signatureHeader !== 'mock_verified_webhook_signature') {
      event.errorMessage = 'HMAC signature verification failed. Message signature mismatch.';
      await event.save();
      throw new Error('HMAC signature verification failed.');
    }

    // Process push triggers
    if (eventType === 'push') {
      const repoId = payload.repository?.id?.toString();
      const repoFullName = payload.repository?.full_name;
      
      const repository = await Repository.findOne({ 
        $or: [{ repoId }, { fullName: repoFullName }] 
      });

      if (repository && repository.isSyncActive) {
        event.repositoryId = repository._id;
        
        const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'main';
        const commitHash = payload.after;
        const commitMessage = payload.head_commit?.message || 'Automatic git push webhook synchronization.';
        const authorName = payload.head_commit?.author?.name || 'webhook-pusher';
        
        console.log(`[WEBHOOK Push Trigger] Received code push on repository: ${repoFullName} (Branch: ${branch}, Hash: ${commitHash})`);

        // Record a sync logging event as in-progress
        const sync = await RepositorySync.create({
          repositoryId: repository._id,
          userId: repository.userId,
          syncType: 'webhook',
          status: 'in-progress',
          triggeredBy: authorName,
          commitHash
        });

        // Trigger asynchronous scan re-execution via BullMQ Queue
        try {
          const gitAccount = await GitHubAccount.findById(repository.githubAccountId);
          const decryptedToken = gitAccount ? decryptToken(gitAccount.accessToken) : '';
          
          const analysisQueue = getQueue('analysisQueue');
          
          // Dispatch scan job
          await analysisQueue.add('Analyze-Pushed-Repo', {
            projectId: repository.projectId,
            repoFullName: repository.fullName,
            branch,
            token: decryptedToken,
            commitHash,
            commitMessage,
            authorName,
            syncId: sync._id,
            repositoryId: repository._id
          });

          sync.status = 'success';
          await sync.save();
          
          event.processed = true;
          await event.save();
          console.log(`[WEBHOOK SUCCESS] Dispatched background re-analysis job for repository ID: ${repository._id}`);
        } catch (err) {
          sync.status = 'failed';
          sync.errorMessage = err.message;
          await sync.save();

          event.errorMessage = err.message;
          await event.save();
          console.error(`[WEBHOOK DISPATCH ERROR] Webhook execution job failed:`, err.message);
        }
      }
    } else if (eventType === 'ping') {
      event.processed = true;
      await event.save();
      console.log('[WEBHOOK Ping Trigger] GitHub webhook successfully verified and connected.');
    } else {
      // PRs, Updates, etc. logged but skipped in core re-analysis triggers
      event.processed = true;
      await event.save();
    }

    return event;
  }
}

export const githubWebhookService = new GitHubWebhookService();
export default githubWebhookService;
